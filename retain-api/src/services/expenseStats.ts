// Aggregations shared by the user dashboard and the admin overview. Each takes a `match` filter,
// so the same code answers "this user's October" and "everyone, all time".
import type { Types } from 'mongoose';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { round2 } from '../utils/budget';

type Match = Record<string, unknown>;

// how many expenses match, and their total
export async function sumExpenses(match: Match) {
  const [result] = await Expense.aggregate<{ count: number; total: number }>([
    { $match: match },
    { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } },
  ]);
  return { count: result?.count ?? 0, total: round2(result?.total ?? 0) };
}

// spending per category, biggest first, with each category's name
export function spendingByCategory(match: Match) {
  return Expense.aggregate<{ categoryId: Types.ObjectId; name: string; total: number }>([
    { $match: match },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    // $lookup joins in the matching category document, like a JOIN in SQL
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        name: { $ifNull: [{ $first: '$category.name' }, 'Uncategorized'] }, // if the category no longer exists
        total: { $round: ['$total', 2] },
      },
    },
  ]);
}

// every category with how many expenses use it (all users), unused ones included with 0
export async function categoryUsage() {
  const [categories, rows] = await Promise.all([
    Category.find().sort({ isDefault: -1, name: 1 }).collation({ locale: 'en', strength: 2 }),
    Expense.aggregate<{ _id: Types.ObjectId; count: number; total: number }>([
      { $group: { _id: '$categoryId', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    ]),
  ]);

  // starting from the categories (not the expense groups) is what keeps unused ones in the list
  return categories.map((category) => {
    const row = rows.find((r) => r._id.equals(category._id)); // ids are objects, so == wouldn't compare their values
    return {
      categoryId: category.id,
      name: category.name,
      isDefault: category.isDefault,
      expenseCount: row?.count ?? 0,
      total: round2(row?.total ?? 0),
    };
  });
}

// the latest expenses from all users, with the user's and category's names joined in
export function recentExpensesWithNames(limit: number) {
  return Expense.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
    // $project picks the output fields, so nothing else from the joined user (like the password hash) leaves the server
    {
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        title: 1,
        amount: 1,
        date: 1,
        paymentMethod: 1,
        createdAt: 1,
        userName: { $ifNull: [{ $first: '$user.name' }, 'Deleted user'] },
        categoryName: { $ifNull: [{ $first: '$category.name' }, 'Uncategorized'] },
      },
    },
  ]);
}
