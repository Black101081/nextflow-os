import { Router } from 'express';
import { createWorkItem, updateWorkItemStatus, getWorkItem } from '../controllers/workItemController';
import { routeWorkItem } from '../controllers/queueController';
import { tenantIsolationMiddleware } from '../middleware/tenantIsolation';

const router = Router();

// Áp dụng middleware tenant isolation cho tất cả các endpoints của Work Items
router.use(tenantIsolationMiddleware);

router.post('/', createWorkItem);
router.get('/:id', getWorkItem);
router.patch('/:id/status', updateWorkItemStatus);
router.post('/:id/route', routeWorkItem);

export default router;
