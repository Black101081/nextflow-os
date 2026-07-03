import { pool, query } from '../src/config/db';
import bcrypt from 'bcryptjs';

export const TEST_TENANT_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
export const TEST_USER_ID = '8f3b2a1a-4c54-4b01-90e6-d701748f0851';
export const TEST_API_KEY = `nf_live_test_${TEST_TENANT_ID}`;

// Hàm thiết lập dữ liệu thật phục vụ kiểm định (Zero-Mock)
export const setupTestDatabase = async () => {
  console.log('[Test Setup] Cleaning up test database...');
  // Làm sạch các bảng liên quan đến test
  await query('TRUNCATE nf_core.work_items, nf_core.users, nf_core.tenants, nf_core.queues CASCADE');

  console.log('[Test Setup] Seeding test Tenant...');
  // Tạo tenant test
  await query(
    `INSERT INTO nf_core.tenants (id, company_name, domain, status, subscription_tier) 
     VALUES ($1, 'SME Test Corporation', 'test-corp.com', 'ACTIVE', 'STANDARD')`,
    [TEST_TENANT_ID]
  );

  console.log('[Test Setup] Seeding test User...');
  // Tạo user test
  const passwordHash = await bcrypt.hash('test_password_123', 12);
  await query(
    `INSERT INTO nf_core.users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active) 
     VALUES ($1, $2, 'test.operator@test-corp.com', $3, 'Nguyen', 'Van Test', 'SME_OPS', true)`,
    [TEST_USER_ID, TEST_TENANT_ID, passwordHash]
  );

  console.log('[Test Setup] Seeding test Queue...');
  // Tạo queue test
  await query(
    `INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds) 
     VALUES ('q_test_queue', $1, 'Test Queue', 'GENERAL', 'FIFO', 3600)`,
    [TEST_TENANT_ID]
  );
};

export const teardownTestDatabase = async () => {
  console.log('[Test Teardown] Cleaning up test database...');
  await query('TRUNCATE nf_core.work_items, nf_core.users, nf_core.tenants, nf_core.queues CASCADE');
  console.log('[Test Teardown] Closing connection pool...');
  await pool.end();
};
