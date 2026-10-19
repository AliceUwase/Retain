import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Budget } from '../models/Budget';
import { Expense } from '../models/Expense';
import type { DashboardQuery } from '../schemas/dashboardSchemas';
import { spendingByCategory, sumExpenses } from '../services/expenseStats';
import { budgetStatus, round2 } from '../utils/budget';
import { currentMonth, daysInMonth, monthRange, shiftMonth } from '../utils/dates';

// one user's expenses dated in a month
function inMonth(userId: Types.ObjectId, month: string) {
  return { userId, date: monthRange(month) };
}

// '2026-10-19' → 19, read from characters 8–9 of the date text
const dayOfMonth = { $toInt: { $substrCP: ['$date', 8, 2] } };
// days 1–7 → week 0, 8–14 → 1, 15–21 → 2, and 22 to the end → 3 (the last "week" holds 7 to 10 days)
const weekIndex = { $min: [3, { $floor: { $divide: [{ $subtract: [dayOfMonth, 1] }, 7] } }] };

// totals for the four weeks, including weeks with no spending
async function weekly(userId: Types.ObjectId, month: string) {
  const rows = await Expense.aggregate<{ _id: number; total: number }>([
    { $match: inMonth(userId, month) },
    { $group: { _id: weekIndex, total: { $sum: '$amount' } } },
  ]);
  const lastDay = daysInMonth(month);
  const ranges = [[1, 7], [8, 14], [15, 21], [22, lastDay]];
  return ranges.map(([from, to], i) => ({
    label: `${from}–${to}`,
    total: round2(rows.find((r) => r._id === i)?.total ?? 0), // a week with no expenses has no row, so 0
  }));
}

// GET /api/dashboard: everything the Overview page shows for one month
export async function getDashboard(req: Request, res: Response) {
  const { month = currentMonth() } = res.locals.query as DashboardQuery;
  const userId = new Types.ObjectId(req.user!.id); // the aggregations need a real id, not text
  const previous = shiftMonth(month, -1);

  // six independent queries, run at the same time
  const [totals, previousTotals, categories, weeks, recent, budget] = await Promise.all([
    sumExpenses(inMonth(userId, month)),
    sumExpenses(inMonth(userId, previous)),
    spendingByCategory(inMonth(userId, month)),
    weekly(userId, month),
    Expense.find(inMonth(userId, month)).sort({ date: -1, createdAt: -1 }).limit(5),
    Budget.findOne({ userId, month }),
  ]);

  const percentUsed = budget ? round2((totals.total / budget.amount) * 100) : null;

  res.json({
    month,
    totalSpent: totals.total,
    expenseCount: totals.count,
    categoryCount: categories.length,
    previousMonth: { month: previous, totalSpent: previousTotals.total },
    // null when no budget was set, so the page can offer to set one
    budget:
      budget && percentUsed !== null
        ? {
            amount: budget.amount,
            remaining: round2(budget.amount - totals.total),
            percentUsed,
            status: budgetStatus(percentUsed),
          }
        : null,
    weekly: weeks,
    byCategory: categories,
    recent,
  });
}
