import type { Budget, Category, Expense, PaymentMethod, User } from '../types';

// Returns the date `n` days before today as 'YYYY-MM-DD'.
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export const UNCATEGORIZED_ID = 'cat-uncategorized';

export const mockUsers: User[] = [
  { id: 'u-admin', name: 'Admin', email: 'admin@retain.com', password: 'admin123', role: 'admin', createdAt: daysAgo(90) },
  { id: 'u-demo', name: 'Demo User', email: 'demo@retain.com', password: 'demo123', role: 'user', createdAt: daysAgo(60) },
  { id: 'u-jane', name: 'Jane Doe', email: 'jane@retain.com', password: 'jane123', role: 'user', createdAt: daysAgo(5) },
];

export const mockCategories: Category[] = [
  { id: UNCATEGORIZED_ID, name: 'Uncategorized' },
  { id: 'cat-food', name: 'Food & Dining' },
  { id: 'cat-transport', name: 'Transport' },
  { id: 'cat-housing', name: 'Housing' },
  { id: 'cat-utilities', name: 'Utilities' },
  { id: 'cat-health', name: 'Health' },
  { id: 'cat-entertainment', name: 'Entertainment' },
  { id: 'cat-shopping', name: 'Shopping' },
  { id: 'cat-education', name: 'Education' },
];

// Small helper so each sample expense fits on one line.
function makeExpense(
  id: string,
  userId: string,
  title: string,
  amount: number,
  categoryId: string,
  daysBack: number,
  paymentMethod: PaymentMethod,
  notes?: string,
): Expense {
  const date = daysAgo(daysBack);
  return { id, userId, title, amount, categoryId, date, paymentMethod, notes, createdAt: date };
}

export const mockExpenses: Expense[] = [
  makeExpense('e1', 'u-demo', 'Monthly rent', 450, 'cat-housing', 1, 'Bank Transfer'),
  makeExpense('e2', 'u-demo', 'Groceries', 62.5, 'cat-food', 2, 'Card', 'Weekly shopping'),
  makeExpense('e3', 'u-demo', 'Bus pass', 25, 'cat-transport', 3, 'Mobile Money'),
  makeExpense('e4', 'u-demo', 'Electricity bill', 38.2, 'cat-utilities', 4, 'Mobile Money'),
  makeExpense('e5', 'u-demo', 'Cinema tickets', 18, 'cat-entertainment', 5, 'Card'),
  makeExpense('e6', 'u-demo', 'Lunch with friends', 22.75, 'cat-food', 6, 'Cash'),
  makeExpense('e7', 'u-demo', 'Pharmacy', 14.9, 'cat-health', 8, 'Cash'),
  makeExpense('e8', 'u-demo', 'New sneakers', 75, 'cat-shopping', 10, 'Card'),
  makeExpense('e9', 'u-demo', 'Taxi to airport', 30, 'cat-transport', 12, 'Mobile Money'),
  makeExpense('e10', 'u-demo', 'Online course', 120, 'cat-education', 15, 'Card'),
];

export const mockBudgets: Budget[] = [
  { userId: 'u-demo', month: daysAgo(0).slice(0, 7), amount: 900 },
];
