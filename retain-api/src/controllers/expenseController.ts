import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import type { CreateExpenseInput, ExpenseQuery, UpdateExpenseInput } from '../schemas/expenseSchemas';
import { HttpError } from '../utils/HttpError';

// Every query below includes `userId: req.user.id`. Ownership is part of the search itself,
// so someone else's expense is simply "not found" and its existence is never revealed.

type IdRequest = Request<{ id: string }>;

async function assertCategoryExists(categoryId: string) {
  if (!(await Category.exists({ _id: categoryId }))) throw new HttpError(400, "That category doesn't exist.");
}

// a search for "a+b" should find the text "a+b": without escaping, + and other symbols would act as regex rules
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/expenses: one page of the user's filtered, sorted expenses, plus totals for the whole filtered list
export async function listExpenses(req: Request, res: Response) {
  const q = res.locals.query as ExpenseQuery;

  // the aggregate below doesn't convert text to ids by itself the way find() does, so the ids are converted here
  const filter: Record<string, unknown> = { userId: new Types.ObjectId(req.user!.id) };
  if (q.search) {
    const pattern = new RegExp(escapeRegex(q.search), 'i'); // 'i' ignores upper and lower case
    filter.$or = [{ title: pattern }, { notes: pattern }];
  }
  if (q.category) filter.categoryId = new Types.ObjectId(q.category);
  if (q.paymentMethod) filter.paymentMethod = q.paymentMethod;
  if (q.startDate || q.endDate) {
    // 'YYYY-MM-DD' text sorts in date order, so $gte / $lte (at least / at most) work on it directly
    filter.date = { ...(q.startDate && { $gte: q.startDate }), ...(q.endDate && { $lte: q.endDate }) };
  }

  const direction = q.sortOrder === 'asc' ? 1 : -1;
  // the second key settles ties: same amount → newest first, same day → the one added later first
  const sort: Record<string, 1 | -1> =
    q.sortBy === 'amount' ? { amount: direction, date: -1 } : { date: direction, createdAt: direction };

  // both queries run at the same time instead of one after the other
  const [items, [totals]] = await Promise.all([
    Expense.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.limit) // skip the earlier pages
      .limit(q.limit),
    Expense.aggregate<{ count: number; amount: number }>([
      { $match: filter },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } },
    ]),
  ]);

  const total = totals?.count ?? 0; // no matches means no group at all
  res.json({
    items,
    total,
    totalAmount: Math.round((totals?.amount ?? 0) * 100) / 100, // rounds away float noise like 0.30000000000000004
    page: q.page,
    limit: q.limit,
    totalPages: Math.max(1, Math.ceil(total / q.limit)),
  });
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
