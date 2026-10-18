import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, renameCategory } from '../controllers/categoryController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { categoryNameSchema } from '../schemas/categorySchemas';

const router = Router();

// both checks in one list, so each admin route reads as "admin only"
const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', requireAuth, listCategories); // users need the list for their expense form
router.post('/', adminOnly, validateBody(categoryNameSchema), createCategory);
router.patch('/:id', adminOnly, validateBody(categoryNameSchema), renameCategory);
router.delete('/:id', adminOnly, deleteCategory);

export default router;
