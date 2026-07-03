import { Router } from 'express';
import { syncTenantUsers } from '../controllers/tenantController';
import { tenantIsolationMiddleware } from '../middleware/tenantIsolation';

const router = Router();

// Áp dụng middleware tenant isolation
router.use(tenantIsolationMiddleware);

router.post('/:tenant_id/users/sync', syncTenantUsers);

export default router;
