import { Request, Response } from 'express';
import { query } from '../config/db';
import bcrypt from 'bcryptjs';

// 1. POST /api/v1/tenants/{tenant_id}/users/sync (Đồng bộ người dùng)
export const syncTenantUsers = async (req: Request, res: Response) => {
  const { tenant_id } = req.params;
  const { users } = req.body;
  const authTenantId = req.tenantId;

  // Rule 4: Bảo vệ Tenant Isolation - Cấm đồng bộ tài khoản cho tenant khác
  if (tenant_id !== authTenantId) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Bạn không có quyền đồng bộ người dùng cho Tenant ID này.'
      }
    });
  }

  if (!users || !Array.isArray(users) || users.length === 0) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Mảng users không hợp lệ hoặc trống.',
        details: [{ field: 'users', issue: 'must_be_non_empty_array' }]
      }
    });
  }

  const results = [];
  let successCount = 0;
  let failedCount = 0;

  // Sử dụng mật khẩu mặc định được băm an toàn cho người dùng mới đồng bộ
  const defaultPasswordHash = await bcrypt.hash('Sme_Nextflow_2026!', 12);

  for (const user of users) {
    const { email, first_name, last_name, role, status } = user;

    if (!email || !first_name || !last_name) {
      failedCount++;
      results.push({
        email: email || 'N/A',
        status: 'FAILED',
        error: 'Thiếu thông tin bắt buộc (email, first_name, last_name).'
      });
      continue;
    }

    try {
      // Thực hiện UPSERT (chèn mới hoặc cập nhật thông tin)
      const upsertQuery = `
        INSERT INTO nf_core.users (tenant_id, email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (tenant_id, email) 
        DO UPDATE SET 
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;

      const isActive = status === 'ACTIVE' ? true : false;
      const dbRes = await query(upsertQuery, [
        authTenantId,
        email.toLowerCase().trim(),
        defaultPasswordHash,
        first_name,
        last_name,
        role || 'SME_OPS',
        isActive
      ]);

      successCount++;
      results.push({
        email: email,
        status: 'SYNCED',
        user_id: dbRes.rows[0].id
      });
    } catch (err: any) {
      console.error(`[Tenant Controller] User sync failed for ${email}:`, err.message);
      failedCount++;
      results.push({
        email: email,
        status: 'FAILED',
        error: 'Lỗi Database khi đồng bộ tài khoản.'
      });
    }
  }

  // Trả về mã HTTP 207 Multi-Status chuẩn RFC 4918
  return res.status(207).json({
    success_count: successCount,
    failed_count: failedCount,
    results
  });
};
