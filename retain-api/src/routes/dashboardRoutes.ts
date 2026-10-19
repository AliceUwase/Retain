import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { dashboardQuerySchema } from '../schemas/dashboardSchemas';

const router = Router();

router.get('/', requireAuth, requireRole('user'), validateQuery(dashboardQuerySchema), getDashboard);

export default router;
