import type { Request, Response } from 'express';
import { User } from '../models/User';
import { categoryUsage, recentExpensesWithNames, spendingByCategory, sumExpenses } from '../services/expenseStats';
import { currentMonth, monthRange } from '../utils/dates';

// GET /api/admin/overview: how everyone is using Retain
export async function getOverview(_req: Request, res: Response) {
  const month = currentMonth();
  const monthStart = new Date(`${month}-01T00:00:00Z`); // createdAt is a real date, so it's compared as one

  const [userCount, joinedThisMonth, allTime, thisMonth, spending, usage, recentExpenses, recentUsers] =
    await Promise.all([
      User.countDocuments({ role: 'user' }), // the admin account isn't counted as a user of the app
      User.countDocuments({ role: 'user', createdAt: { $gte: monthStart } }),
      sumExpenses({}), // an empty filter matches every expense
      sumExpenses({ date: monthRange(month) }),
      spendingByCategory({}),
      categoryUsage(),
      recentExpensesWithNames(5),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5),
    ]);

  // ties are broken by name, so the lists don't reorder between page loads
  const mostUsed = [...usage].sort((a, b) => b.expenseCount - a.expenseCount || a.name.localeCompare(b.name));
  const leastUsed = [...usage].sort((a, b) => a.expenseCount - b.expenseCount || a.name.localeCompare(b.name));

  res.json({
    users: { total: userCount, joinedThisMonth },
    expenses: { count: allTime.count, totalAmount: allTime.total },
    thisMonth: { month, count: thisMonth.count, totalAmount: thisMonth.total },
    spendingByCategory: spending,
    mostUsedCategories: mostUsed.slice(0, 5),
    leastUsedCategories: leastUsed.slice(0, 5),
    recentExpenses,
    recentUsers,
  });
}

// GET /api/admin/users: every account, newest first
export async function listUsers(_req: Request, res: Response) {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
}

// GET /api/admin/categories: each category with how many expenses use it, for the Categories page
export async function listCategoryUsage(_req: Request, res: Response) {
  res.json(await categoryUsage());
}
