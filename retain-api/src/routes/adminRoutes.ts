import { Router } from 'express';
import { getOverview, listCategoryUsage, listUsers } from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// everything here is admin only
router.use(requireAuth, requireRole('admin'));

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.get('/categories', listCategoryUsage);

export default router;
