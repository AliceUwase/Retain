export type Role = 'user' | 'admin';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // only for fake data; backend will store a hashed password
  role: Role;
  createdAt: string; // when the user registered, ISO timestamp
}

export interface Category {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // day the money was spent, 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes?: string; // optional
  createdAt: string; // when the expense was added, ISO timestamp
  updatedAt: string; // when it was last edited, ISO timestamp
}

export interface Budget {
  userId: string;
  month: string; // 'YYYY-MM'
  amount: number;
  updatedAt: string; // when the budget was last set, ISO timestamp
}
