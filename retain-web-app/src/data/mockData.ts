import type { Budget, Category, Expense, PaymentMethod, User } from '../types';

// Returns the date `n` days before today as 'YYYY-MM-DD'.
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// Returns a full ISO timestamp for `n` days before today, at 6:30 PM.
function timestampDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(18, 30, 0, 0);
  return d.toISOString();
}

export const UNCATEGORIZED_ID = 'cat-uncategorized';

export const mockUsers: User[] = [
  { id: 'u-admin', name: 'Admin', email: 'admin@retain.com', password: 'admin123', role: 'admin', createdAt: timestampDaysAgo(120) },
  { id: 'u-demo', name: 'Demo User', email: 'demo@retain.com', password: 'demo123', role: 'user', createdAt: timestampDaysAgo(90) },
  { id: 'u-jane', name: 'Jane Doe', email: 'jane@retain.com', password: 'jane123', role: 'user', createdAt: timestampDaysAgo(5) },
];

export const mockCategories: Category[] = [
  { id: UNCATEGORIZED_ID, name: 'Uncategorized' },
  { id: 'cat-food', name: 'Food & drink' },
  { id: 'cat-transport', name: 'Transport' },
  { id: 'cat-housing', name: 'Housing' },
  { id: 'cat-utilities', name: 'Utilities' },
  { id: 'cat-health', name: 'Health' },
  { id: 'cat-entertainment', name: 'Entertainment' },
  { id: 'cat-shopping', name: 'Shopping' },
  { id: 'cat-education', name: 'Education' },
  { id: 'cat-subscriptions', name: 'Subscriptions' },
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
  const createdAt = timestampDaysAgo(daysBack);
  return { id, userId, title, amount, categoryId, date, paymentMethod, notes, createdAt, updatedAt: createdAt };
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
  makeExpense('e11', 'u-demo', 'Groceries', 54.3, 'cat-food', 17, 'Card'),
  makeExpense('e12', 'u-demo', 'Internet plan', 35, 'cat-utilities', 20, 'Bank Transfer'),
  makeExpense('e13', 'u-demo', 'Gym membership', 40, 'cat-health', 24, 'Mobile Money'),
  makeExpense('e14', 'u-demo', 'Concert tickets', 55, 'cat-entertainment', 27, 'Card', 'Front row with Maya'),
  makeExpense('e15', 'u-demo', 'Coffee catch-up', 8.4, 'cat-food', 29, 'Cash'),
  makeExpense('e16', 'u-demo', 'Monthly rent', 450, 'cat-housing', 31, 'Bank Transfer'),
  makeExpense('e17', 'u-demo', 'Moto rides', 12, 'cat-transport', 34, 'Cash'),
  makeExpense('e18', 'u-demo', 'Water bill', 16.5, 'cat-utilities', 38, 'Mobile Money'),
  makeExpense('e19', 'u-demo', 'Textbooks', 48, 'cat-education', 41, 'Card'),
  makeExpense('e20', 'u-demo', 'Groceries', 71.2, 'cat-food', 45, 'Card'),
  makeExpense('e21', 'u-demo', 'Phone airtime', 10, 'cat-utilities', 49, 'Mobile Money'),
  makeExpense('e22', 'u-demo', 'Birthday gift', 35, 'cat-shopping', 53, 'Card', 'For my sister'),
  makeExpense('e23', 'u-demo', 'Dentist check-up', 60, 'cat-health', 57, 'Bank Transfer'),
  makeExpense('e24', 'u-demo', 'Monthly rent', 450, 'cat-housing', 61, 'Bank Transfer'),
  makeExpense('e25', 'u-demo', 'Street market', 9.75, UNCATEGORIZED_ID, 66, 'Cash'),
  makeExpense('e26', 'u-demo', 'Streaming subscription', 12.99, 'cat-subscriptions', 72, 'Card'),
  makeExpense('e27', 'u-demo', 'Groceries', 66, 'cat-food', 80, 'Card'),
  // Jane registered 5 days ago, so her expenses are all recent.
  makeExpense('e28', 'u-jane', 'Lunch', 9.5, 'cat-food', 4, 'Mobile Money'),
  makeExpense('e29', 'u-jane', 'Bus fare', 3, 'cat-transport', 2, 'Cash'),
  makeExpense('e30', 'u-jane', 'Notebook and pens', 6.8, 'cat-education', 1, 'Cash'),
];

// Builds a budget for the month `monthsBack` months before this one,
// set on the 1st of that month.
function makeBudget(userId: string, monthsBack: number, amount: number): Budget {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1, 9, 0);
  const month = `${firstOfMonth.getFullYear()}-${String(firstOfMonth.getMonth() + 1).padStart(2, '0')}`;
  return { userId, month, amount, updatedAt: firstOfMonth.toISOString() };
}

export const mockBudgets: Budget[] = [
  makeBudget('u-demo', 0, 900),
  makeBudget('u-demo', 1, 800),
  makeBudget('u-demo', 2, 900),
  makeBudget('u-jane', 0, 200),
];
