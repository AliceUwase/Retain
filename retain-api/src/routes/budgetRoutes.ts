import { Router } from 'express';
import { getBudget, listBudgets, setBudget } from '../controllers/budgetController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { budgetAmountSchema } from '../schemas/budgetSchemas';

const router = Router();

// budgets are personal, like expenses
router.use(requireAuth, requireRole('user'));

router.get('/', listBudgets);
router.get('/:month', getBudget);
router.put('/:month', validateBody(budgetAmountSchema), setBudget);

export default router;
