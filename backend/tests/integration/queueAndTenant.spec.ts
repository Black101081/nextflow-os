import request from 'supertest';
import app from '../../src/app';
import { query } from '../../src/config/db';
import { setupTestDatabase, teardownTestDatabase, TEST_TENANT_ID, TEST_API_KEY, TEST_USER_ID } from '../setup';

jest.setTimeout(30000);

describe('Queues, Routing, and Tenant Sync API Integration Tests (Zero-Mock)', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Queues and Members API', () => {
    const queueId = 'q_finance_ops_test';

    it('should create a new Queue in DB successfully', async () => {
      const res = await request(app)
        .post('/api/v1/queues')
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({
          id: queueId,
          name: 'Hàng đợi Tài chính - Kế toán Kỹ thuật',
          category: 'FINANCE',
          routing_algorithm: 'FIFO',
          sla_target_seconds: 7200
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(queueId);
      expect(res.body.category).toBe('FINANCE');

      // Verify DB
      const dbCheck = await query('SELECT * FROM nf_core.queues WHERE id = $1', [queueId]);
      expect(dbCheck.rowCount).toBe(1);
    });

    it('should add a member to the queue and retrieve queue members list', async () => {
      // 1. Thêm User TEST_USER_ID vào Queue vừa tạo
      const addRes = await request(app)
        .post(`/api/v1/queues/${queueId}/members`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({ user_id: TEST_USER_ID });

      expect(addRes.status).toBe(200);
      expect(addRes.body.status).toBe('ADDED');

      // 2. Lấy danh sách thành viên Queue
      const getRes = await request(app)
        .get(`/api/v1/queues/${queueId}/members`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY);

      expect(getRes.status).toBe(200);
      expect(getRes.body.queue_id).toBe(queueId);
      expect(getRes.body.members.length).toBe(1);
      expect(getRes.body.members[0].user_id).toBe(TEST_USER_ID);
    });
  });

  describe('Work Items Routing API', () => {
    let workItemId: string;
    const targetQueueId = 'q_test_queue';

    beforeEach(async () => {
      // Tạo sẵn một task trong DB
      const dbRes = await query(
        `INSERT INTO nf_core.work_items (tenant_id, title, status, priority, source) 
         VALUES ($1, 'Task to route', 'UNASSIGNED', 'MEDIUM', 'JEST_SETUP') RETURNING id`,
        [TEST_TENANT_ID]
      );
      workItemId = dbRes.rows[0].id;
    });

    it('should route work item to another queue and assign to user', async () => {
      const res = await request(app)
        .post(`/api/v1/work-items/${workItemId}/route`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({
          target_queue_id: targetQueueId,
          assignee_id: TEST_USER_ID,
          note: 'Bàn giao gấp nhiệm vụ test'
        });

      expect(res.status).toBe(200);
      expect(res.body.work_item_id).toBe(workItemId);
      expect(res.body.routed_to_queue).toBe(targetQueueId);
      expect(res.body.assigned_to).toBe(TEST_USER_ID);
      expect(res.body.status).toBe('IN_PROGRESS'); // Trạng thái chuyển sang IN_PROGRESS vì có assignee

      // Verify DB
      const dbCheck = await query('SELECT queue_id, assignee_id, status FROM nf_core.work_items WHERE id = $1', [workItemId]);
      expect(dbCheck.rows[0].queue_id).toBe(targetQueueId);
      expect(dbCheck.rows[0].assignee_id).toBe(TEST_USER_ID);
    });
  });

  describe('Tenant Identity Synchronization API', () => {
    it('should return 403 Forbidden if syncing for another tenant', async () => {
      const wrongTenantId = 'd290f1ee-6c54-4b01-90e6-d701748f0859';
      const res = await request(app)
        .post(`/api/v1/tenants/${wrongTenantId}/users/sync`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send({
          users: [
            {
              email: 'stranger@other.com',
              first_name: 'John',
              last_name: 'Doe'
            }
          ]
        });

      expect(res.status).toBe(403);
    });

    it('should sync users successfully and return 207 Multi-Status', async () => {
      const syncPayload = {
        users: [
          {
            email: 'le.van.c@smecompany.com',
            first_name: 'Le Van',
            last_name: 'C',
            role: 'FIELD_WORKER',
            status: 'ACTIVE'
          }
        ]
      };

      const res = await request(app)
        .post(`/api/v1/tenants/${TEST_TENANT_ID}/users/sync`)
        .set('X-Nextflow-Tenant-ID', TEST_TENANT_ID)
        .set('X-Nextflow-API-Key', TEST_API_KEY)
        .send(syncPayload);

      expect(res.status).toBe(207);
      expect(res.body.success_count).toBe(1);
      expect(res.body.failed_count).toBe(0);
      expect(res.body.results[0].email).toBe('le.van.c@smecompany.com');
      expect(res.body.results[0].status).toBe('SYNCED');

      // Verify DB thật: xem user 'le.van.c@smecompany.com' đã được UPSERT vào DB chưa
      const dbCheck = await query(
        'SELECT id, role, is_active FROM nf_core.users WHERE email = $1 AND tenant_id = $2',
        ['le.van.c@smecompany.com', TEST_TENANT_ID]
      );
      expect(dbCheck.rowCount).toBe(1);
      expect(dbCheck.rows[0].role).toBe('FIELD_WORKER');
      expect(dbCheck.rows[0].is_active).toBe(true);
    });
  });
});
