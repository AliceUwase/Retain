export type Role = 'user' | 'admin';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // plain text for now, the backend will hash it
  role: Role;
  createdAt: string; // when they signed up (ISO)
}

// a user minus the password, what we keep after login
export type PublicUser = Omit<User, 'password'>;

export interface Category {
  id: string;
  name: string;
  isDefault?: boolean; // true only for "Uncategorized"; optional until the mock data is removed
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

// what the form sends, the service fills in id and timestamps
export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

export interface Budget {
  userId: string;
  month: string; // 'YYYY-MM'
  amount: number;
  updatedAt: string; // last time it was set (ISO)
}
