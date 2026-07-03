import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import workItemRoutes from './routes/workItemRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Kiểm tra trạng thái hoạt động của server
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Cấu hình các routes chính thức
app.use('/api/v1/work-items', workItemRoutes);

// Khởi chạy server nếu không chạy qua unit test
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[Nextflow Core] Server is running on port ${port} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

export default app;
