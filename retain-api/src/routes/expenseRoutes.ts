import { Router } from 'express';
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from '../controllers/expenseController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import { createExpenseSchema, expenseQuerySchema, updateExpenseSchema } from '../schemas/expenseSchemas';

const router = Router();

// applies to every route below: expenses are personal, and the admin account doesn't track spending
router.use(requireAuth, requireRole('user'));

router.get('/', validateQuery(expenseQuerySchema), listExpenses);
router.post('/', validateBody(createExpenseSchema), createExpense);
router.get('/:id', getExpense);
router.patch('/:id', validateBody(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
