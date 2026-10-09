export type Role = 'user' | 'admin';

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';

export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Only for the fake data. 
  role: Role;
  createdAt: string; // date the user registered, 'YYYY-MM-DD'
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
  date: string; // 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes?: string; // optional
  createdAt: string; // date the expense was added
}

export interface Budget {
  userId: string;
  month: string; // 'YYYY-MM'
  amount: number;
}
