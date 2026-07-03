import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[Database Config] DATABASE_URL environment variable is missing.');
  process.exit(1);
}

// Khởi tạo Pool kết nối với cấu hình tối ưu cho OLTP Core DB
export const pool = new Pool({
  connectionString,
  max: 20,                  // Số lượng connection tối đa trong pool
  idleTimeoutMillis: 30000, // Thời gian timeout khi connection không hoạt động
  connectionTimeoutMillis: 2000, // Thời gian chờ kết nối tối đa
});

pool.on('connect', () => {
  console.log('[Database Config] Client connected to PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('[Database Config] Unexpected error on idle client:', err.message);
});

// Hàm helper để thực thi câu lệnh SQL thuận tiện
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log các câu truy vấn chậm (> 100ms) để theo dõi hiệu năng
    if (duration > 100) {
      console.warn(`[Database Query] Slow query detected: ${text} (${duration}ms)`);
    }
    return res;
  } catch (error: any) {
    console.error(`[Database Query] Error executing query: ${text}`, error.message);
    throw error;
  }
};
