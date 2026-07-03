import { Router } from 'express';
import { createQueue, addQueueMember, getQueueMembers } from '../controllers/queueController';
import { tenantIsolationMiddleware } from '../middleware/tenantIsolation';

const router = Router();

// Áp dụng middleware tenant isolation
router.use(tenantIsolationMiddleware);

router.post('/', createQueue);
router.post('/:id/members', addQueueMember);
router.get('/:id/members', getQueueMembers);

export default router;
