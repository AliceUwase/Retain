// the shapes the API sends and receives (see retain-api)

export type Role = 'user' | 'admin';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

// a user as the API returns them; the password hash never leaves the server
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string; // when they signed up (ISO)
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean; // true only for "Uncategorized"
}

// GET /api/admin/categories: a category with how many expenses (all users) use it
export interface CategoryUsage {
  categoryId: string;
  name: string;
  isDefault: boolean;
  expenseCount: number;
  total: number;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // day it was spent, 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string; // when it was added (ISO)
  updatedAt: string; // last edit (ISO)
}

// what the form sends; the API fills in the id, the timestamps, and the owner (from the login token)
export type ExpenseInput = Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// GET /api/expenses: one page of results, plus totals for the whole filtered list
export interface ExpensePage {
  items: Expense[];
  total: number;
  totalAmount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // 'YYYY-MM'
  amount: number;
  updatedAt: string; // last time it was set (ISO)
}

export type BudgetStatus = 'within' | 'approaching' | 'over';

// a category's total, used by "Where it went" and the admin's "Spending per category"
export interface CategoryTotal {
  categoryId: string;
  name: string;
  total: number;
}

// GET /api/dashboard?month=: everything the Overview page shows for one month
export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  categoryCount: number;
  previousMonth: { month: string; totalSpent: number };
  budget: { amount: number; remaining: number; percentUsed: number; status: BudgetStatus } | null;
  weekly: { label: string; total: number }[]; // always 4 weeks: '1–7', '8–14', '15–21', '22–31'
  byCategory: CategoryTotal[]; // biggest first
  recent: Expense[]; // the 5 newest of the month
}

// one of the latest expenses from any user, with names already joined in by the API
export interface AdminRecentExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  userName: string;
  categoryName: string;
}

// GET /api/admin/overview
export interface AdminOverview {
  users: { total: number; joinedThisMonth: number };
  expenses: { count: number; totalAmount: number };
  thisMonth: { month: string; count: number; totalAmount: number };
  spendingByCategory: CategoryTotal[];
  mostUsedCategories: CategoryUsage[];
  leastUsedCategories: CategoryUsage[];
  recentExpenses: AdminRecentExpense[];
  recentUsers: PublicUser[];
}
