import { test, expect } from '@playwright/test';

const TEST_TENANT_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const TEST_API_KEY = 'nf_live_test_d290f1ee-6c54-4b01-90e6-d701748f0851';

test.describe('Nextflow OS - End-to-End Operational Flow & Sandbox Security', () => {
  
  test('should connect to Tenant, create task, claim it, and complete successfully', async ({ page }) => {
    // 1. Mở trang chủ cổng dev server
    await page.goto('/');

    // 2. Điền thông tin kết nối xác thực
    await page.fill('input[type="text"]', TEST_TENANT_ID);
    await page.fill('input[type="password"]', TEST_API_KEY);
    await page.click('button:has-text("Kết nối hệ thống")');

    // 3. Đợi hiển thị Dashboard
    await expect(page.locator('.brand-title')).toContainText('Nextflow OS');
    await expect(page.locator('.user-badge')).toContainText('Nguyen Van Test');

    // 4. Tạo mới Work Item thông qua Form nhập liệu UI
    const taskTitle = `Nhiệm vụ kiểm định Playwright E2E ${Date.now()}`;
    await page.fill('input[placeholder="Tạo nhanh Work Item (ví dụ: Xử lý chứng từ VAT)..."]', taskTitle);
    await page.selectOption('select >> nth=0', 'HIGH');
    await page.click('button[type="submit"]:has(svg)');

    // 5. Đợi card nhiệm vụ xuất hiện trên UI (Xác thực WebSocket live updates)
    const taskCard = page.locator(`.work-item-card:has-text("${taskTitle}")`);
    await expect(taskCard).toBeVisible({ timeout: 5000 });

    // 6. Thực thi thao tác điều khiển: Click chọn card để mở Side Panel
    await taskCard.click();
    await expect(page.locator('.detail-title')).toContainText(taskTitle);

    // 7. Nhận việc (Start Task) và kiểm tra đổi trạng thái sang IN_PROGRESS
    await page.click('button:has-text("Nhận việc")');
    await expect(page.locator('.detail-panel .badge-progress')).toBeVisible({ timeout: 3000 });

    // 8. Hoàn thành nhiệm vụ (Complete Task) và kiểm tra status chuyển thành COMPLETED
    await page.click('button:has-text("Hoàn thành")');
    // Task hoàn thành sẽ tự động bị đóng Side Panel hoặc thay đổi status trên danh sách
    const completedBadge = page.locator(`.work-item-card:has-text("${taskTitle}") .badge-completed`);
    await expect(completedBadge).toBeVisible({ timeout: 3000 });
  });

  test('should enforce Sandbox Security and isolate Tenant data', async ({ request }) => {
    // 1. Gửi request trực tiếp đến API với Tenant ID giả định sai lệch hoàn toàn
    const fakeTenantId = '00000000-0000-0000-0000-000000000000';
    const res = await request.get('http://localhost:8000/api/v1/analytics/kpis', {
      headers: {
        'X-Nextflow-Tenant-ID': fakeTenantId,
        'X-Nextflow-API-Key': TEST_API_KEY
      }
    });

    // 2. Phải trả về mã lỗi 401 Unauthorized do API Key không khớp với Tenant ID này
    expect(res.status()).toBe(401);

    // 3. Gửi request thiếu Tenant ID
    const resMissing = await request.get('http://localhost:8000/api/v1/analytics/kpis', {
      headers: {
        'X-Nextflow-API-Key': TEST_API_KEY
      }
    });
    // Phải trả về 400 Bad Request
    expect(resMissing.status()).toBe(400);
  });
});
