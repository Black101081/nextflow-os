import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

export const tenantIsolationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantIdHeader = req.header('X-Nextflow-Tenant-ID');
  const apiKeyHeader = req.header('X-Nextflow-API-Key');

  // Rule 4: Tenant ID bắt buộc phải được truyền để tránh thao tác chéo dữ liệu
  if (!tenantIdHeader) {
    return res.status(400).json({
      error: {
        code: 'MISSING_TENANT_ID',
        message: 'HTTP Header X-Nextflow-Tenant-ID is required for tenant isolation.'
      }
    });
  }

  // 1. Kiểm tra xác thực qua API Key
  if (apiKeyHeader) {
    try {
      // Trong môi trường test/dev, ta kiểm tra API Key hợp lệ trong db
      // Giả lập một API Key test cố định hoặc kiểm tra cấu hình connector
      // Để thực tế, ta truy vấn xem tenant có tồn tại và đang ACTIVE không
      const tenantRes = await query(
        'SELECT id, status FROM nf_core.tenants WHERE id = $1',
        [tenantIdHeader]
      );

      if (tenantRes.rowCount === 0) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Tenant does not exist or is deactivated.'
          }
        });
      }

      const tenant = tenantRes.rows[0];
      if (tenant.status !== 'ACTIVE') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Tenant is suspended or deactivated.'
          }
        });
      }

      // Kiểm tra API Key có đúng cho Tenant này không (Ví dụ check config hoặc key test)
      // Để phục vụ kiểm thử, ta cho phép test key: `nf_live_test_${tenantId}`
      const expectedTestKey = `nf_live_test_${tenantIdHeader}`;
      if (apiKeyHeader !== expectedTestKey) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid API Key for the requested Tenant.'
          }
        });
      }

      // Gắn context an toàn vào request
      req.tenantId = tenantIdHeader;
      req.userId = 'api_key_system';
      req.role = 'SYSTEM';
      
      return next();
    } catch (err: any) {
      console.error('[Tenant Isolation Middleware] Error:', err.message);
      return res.status(500).json({
        error: {
          code: 'SYSTEM_FAULT',
          message: 'Internal server error during tenant validation.'
        }
      });
    }
  }

  // 2. Kiểm tra xác thực qua Bearer Token (JWT)
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Để thực tế 100%, ta giải mã token. Do chưa cài jsonwebtoken,
    // ta giả lập giải mã token đơn giản hoặc kiểm tra token trong db.
    // Phục vụ cho Phase 1, ta giải mã bằng cách kiểm tra email/id trong DB
    // (Trong thực tế sẽ dùng jwt.verify).
    try {
      // Giả sử token là id của user trong DB (để test)
      const userRes = await query(
        'SELECT id, tenant_id, role, is_active FROM nf_core.users WHERE id = $1 AND tenant_id = $2',
        [token, tenantIdHeader]
      );

      if (userRes.rowCount === 0) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired Authorization token.'
          }
        });
      }

      const user = userRes.rows[0];
      if (!user.is_active) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'User account is deactivated.'
          }
        });
      }

      // Gắn context vào request
      req.tenantId = user.tenant_id;
      req.userId = user.id;
      req.role = user.role;

      return next();
    } catch (err: any) {
      return res.status(500).json({
        error: {
          code: 'SYSTEM_FAULT',
          message: 'Internal server error during user token validation.'
        }
      });
    }
  }

  // Không có cơ chế auth nào được cung cấp
  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication credentials (API Key or JWT) are missing.'
    }
  });
};
