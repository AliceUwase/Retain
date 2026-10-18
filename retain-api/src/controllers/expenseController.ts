import type { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import type { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expenseSchemas';
import { HttpError } from '../utils/HttpError';

// Every query below includes `userId: req.user.id`. Ownership is part of the search itself,
// so someone else's expense is simply "not found" and its existence is never revealed.

type IdRequest = Request<{ id: string }>;

async function assertCategoryExists(categoryId: string) {
  if (!(await Category.exists({ _id: categoryId }))) throw new HttpError(400, "That category doesn't exist.");
}

// GET /api/expenses: newest first (step 8 adds search, filters and pages)
export async function listExpenses(req: Request, res: Response) {
  const expenses = await Expense.find({ userId: req.user!.id }).sort({ date: -1, createdAt: -1 });
  res.json(expenses);
}

// GET /api/expenses/:id
export async function getExpense(req: IdRequest, res: Response) {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!expense) throw new HttpError(404, 'Expense not found.');
  res.json(expense);
}

// POST /api/expenses
export async function createExpense(req: Request, res: Response) {
  const input = req.body as CreateExpenseInput;
  await assertCategoryExists(input.categoryId);
  const expense = await Expense.create({ ...input, userId: req.user!.id }); // the owner always comes from the token
  res.status(201).json(expense);
}

// PATCH /api/expenses/:id
export async function updateExpense(req: IdRequest, res: Response) {
  const changes = req.body as UpdateExpenseInput;
  if (changes.categoryId) await assertCategoryExists(changes.categoryId);

  const expense = await Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, changes, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!expense) throw new HttpError(404, 'Expense not found.');
  res.json(expense);
}

// DELETE /api/expenses/:id: 204 means "done, nothing to send back"
export async function deleteExpense(req: IdRequest, res: Response) {
  const result = await Expense.deleteOne({ _id: req.params.id, userId: req.user!.id });
  if (result.deletedCount === 0) throw new HttpError(404, 'Expense not found.');
  res.status(204).end();
}
