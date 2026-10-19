import type { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import type { BudgetAmountInput } from '../schemas/budgetSchemas';
import { isRealMonth } from '../utils/dates';
import { HttpError } from '../utils/HttpError';

type MonthRequest = Request<{ month: string }>;

function monthFrom(req: MonthRequest): string {
  const { month } = req.params;
  if (!isRealMonth(month)) throw new HttpError(400, 'Month must look like 2026-10.');
  return month;
}

// GET /api/budgets: every budget the user has set, latest month first
export async function listBudgets(req: Request, res: Response) {
  const budgets = await Budget.find({ userId: req.user!.id }).sort({ month: -1 });
  res.json(budgets);
}

// GET /api/budgets/:month
export async function getBudget(req: MonthRequest, res: Response) {
  const budget = await Budget.findOne({ userId: req.user!.id, month: monthFrom(req) });
  if (!budget) throw new HttpError(404, 'No budget set for this month.');
  res.json(budget);
}

// PUT /api/budgets/:month: sets the month's budget, whether or not one existed before
export async function setBudget(req: MonthRequest, res: Response) {
  const { amount } = req.body as BudgetAmountInput;
  const budget = await Budget.findOneAndUpdate(
    { userId: req.user!.id, month: monthFrom(req) },
    { amount },
    // upsert: update the existing budget, or create it when there's none yet
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
  res.json(budget);
}
