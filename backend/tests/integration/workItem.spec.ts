import request from 'supertest';
import app from '../../src/app';
import { query } from '../../src/config/db';
import { setupTestDatabase, teardownTestDatabase, TEST_TENANT_ID, TEST_API_KEY, TEST_USER_ID } from '../setup';

describe('Work Items API Integration Tests (Zero-Mock Policy)', () => {
  beforeAll(async () => {
    // Chuẩn bị DB thật (Docker Postgres) trước khi test
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Làm sạch và đóng kết nối sau khi test
    await teardownTestDatabase();
  });

  describe('POST /api/v1/work-items', () => {
    it('should return 400 Bad Request if X-Nextflow-Tenant-ID header is missing', async () => {
      const res = await request(app)
        .post('/api/v1/work-items')
        .send({ title: 'Test Item' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MISSING_TENANT_ID');
    });

    it('should return 401 Unauthorized if no auth credentials are provided', async () => {
      const res = await request(app)
        .post('/api/v1/work-items')
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .send({ title: 'Test Item' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 422 Unprocessable Entity if title is missing', async () => {
      const res = await request(app)
        .post('/api/v1/work-items')
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({ priority: 'HIGH' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.details[0].field).toBe('title');
    });

    it('should return 422 if due_date is in the past', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/work-items')
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({ title: 'Past Due Item', due_date: pastDate });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.details[0].field).toBe('due_date');
    });

    it('should create a Work Item successfully and insert it into the real Database', async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const payload = {
        title: 'Xử lý hồ sơ kiểm toán VAT',
        description: 'Kiểm tra chứng từ hóa đơn VAT quý 1',
        priority: 'HIGH',
        due_date: futureDate,
        category: 'FINANCE',
        source: 'JEST_TEST',
        external_id: 'ext_test_9988'
      };

      const res = await request(app)
        .post('/api/v1/work-items')
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(payload.title);
      expect(res.body.status).toBe('UNASSIGNED');
      expect(res.body.priority).toBe('HIGH');

      // VERIFY: Đọc trực tiếp Database thật xem bản ghi đã được ghi xuống chưa
      const dbCheck = await query(
        'SELECT * FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2',
        [res.body.id, TEST_TENANT_ID]
      );
      expect(dbCheck.rowCount).toBe(1);
      expect(dbCheck.rows[0].title).toBe(payload.title);
      expect(dbCheck.rows[0].source).toBe('JEST_TEST');
    });
  });

  describe('PATCH /api/v1/work-items/:id/status', () => {
    let createdItemId: string;

    beforeEach(async () => {
      // Tạo sẵn một item trong DB để test status update
      const dbRes = await query(
        `INSERT INTO nf_core.work_items (tenant_id, title, status, priority, source) 
         VALUES ($1, 'Task to update', 'UNASSIGNED', 'MEDIUM', 'JEST_SETUP') RETURNING id`,
        [TEST_TENANT_ID]
      );
      createdItemId = dbRes.rows[0].id;
    });

    it('should return 404 if trying to update status for a non-existent task', async () => {
      const randomUuid = 'd290f1ee-6c54-4b01-90e6-d701748f0859';
      const res = await request(app)
        .patch(`/api/v1/work-items/${randomUuid}/status`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 / 404 (Tenant Isolation) if user tries to update task of another tenant', async () => {
      const otherTenantId = 'e290f1ee-6c54-4b01-90e6-d701748f0852';
      // Tạo tenant phụ
      await query(
        `INSERT INTO nf_core.tenants (id, company_name, domain, status) 
         VALUES ($1, 'Other Corp', 'other.com', 'ACTIVE')`,
        [otherTenantId]
      );

      // Cố tình gửi request với Header tenant khác để sửa Task hiện tại
      const res = await request(app)
        .patch(`/api/v1/work-items/${createdItemId}/status`)
        .set('X-Nextflow-Tenant-ID', otherTenantId)
        .set('X-Nextflow-API-Key', `nf_live_test_${otherTenantId}`)
        .send({ status: 'IN_PROGRESS' });

      // Phải trả về 404 vì query lọc theo Tenant ID không tìm thấy Task
      expect(res.status).toBe(404);
    });

    it('should update task status and assignee successfully in DB', async () => {
      // Dùng auth Bearer Token (User ID) để gán assignee tự động
      const res = await request(app)
        .patch(`/api/v1/work-items/${createdItemId}/status`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('Authorization', `Bearer ${TEST_USER_ID}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('IN_PROGRESS');
      expect(res.body.version).toBe(2);

      // VERIFY DB: Kiểm tra xem assignee_id có được tự động điền bằng user_id của token và started_at được ghi nhận
      const dbCheck = await query(
        'SELECT * FROM nf_core.work_items WHERE id = $1',
        [createdItemId]
      );
      expect(dbCheck.rows[0].status).toBe('IN_PROGRESS');
      expect(dbCheck.rows[0].assignee_id).toBe(TEST_USER_ID);
      expect(dbCheck.rows[0].started_at).not.toBeNull();
    });
  });
});
