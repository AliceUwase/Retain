import type { PAYMENT_METHODS } from '../models/Expense';

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const DEFAULT_CATEGORY = 'Uncategorized';

export const CATEGORY_NAMES = [
  DEFAULT_CATEGORY,
  'Food & drink',
  'Transport',
  'Housing',
  'Utilities',
  'Health',
  'Entertainment',
  'Shopping',
  'Education',
  'Subscriptions',
];

// [title, amount, category, days before today, payment method, notes?], one per line so the list stays readable
export type SampleExpense = [string, number, string, number, PaymentMethod, string?];

// about 3 months of spending, so the dashboard, budget comparison and pagination all have data
export const demoExpenses: SampleExpense[] = [
  ['Monthly rent', 450, 'Housing', 1, 'Bank Transfer'],
  ['Groceries', 62.5, 'Food & drink', 2, 'Card', 'Weekly shopping'],
  ['Bus pass', 25, 'Transport', 3, 'Mobile Money'],
  ['Electricity bill', 38.2, 'Utilities', 4, 'Mobile Money'],
  ['Cinema tickets', 18, 'Entertainment', 5, 'Card'],
  ['Lunch with friends', 22.75, 'Food & drink', 6, 'Cash'],
  ['Pharmacy', 14.9, 'Health', 8, 'Cash'],
  ['New sneakers', 75, 'Shopping', 10, 'Card'],
  ['Taxi to airport', 30, 'Transport', 12, 'Mobile Money'],
  ['Online course', 120, 'Education', 15, 'Card'],
  ['Groceries', 54.3, 'Food & drink', 17, 'Card'],
  ['Internet plan', 35, 'Utilities', 20, 'Bank Transfer'],
  ['Gym membership', 40, 'Health', 24, 'Mobile Money'],
  ['Concert tickets', 55, 'Entertainment', 27, 'Card', 'Front row with Maya'],
  ['Coffee catch-up', 8.4, 'Food & drink', 29, 'Cash'],
  ['Monthly rent', 450, 'Housing', 31, 'Bank Transfer'],
  ['Moto rides', 12, 'Transport', 34, 'Cash'],
  ['Water bill', 16.5, 'Utilities', 38, 'Mobile Money'],
  ['Textbooks', 48, 'Education', 41, 'Card'],
  ['Groceries', 71.2, 'Food & drink', 45, 'Card'],
  ['Phone airtime', 10, 'Utilities', 49, 'Mobile Money'],
  ['Birthday gift', 35, 'Shopping', 53, 'Card', 'For my sister'],
  ['Dentist check-up', 60, 'Health', 57, 'Bank Transfer'],
  ['Monthly rent', 450, 'Housing', 61, 'Bank Transfer'],
  ['Street market', 9.75, DEFAULT_CATEGORY, 66, 'Cash'],
  ['Streaming subscription', 12.99, 'Subscriptions', 72, 'Card'],
  ['Groceries', 66, 'Food & drink', 80, 'Card'],
];

// a second user, so the admin overview shows more than one person
export const janeExpenses: SampleExpense[] = [
  ['Lunch', 9.5, 'Food & drink', 4, 'Mobile Money'],
  ['Bus fare', 3, 'Transport', 2, 'Cash'],
  ['Notebook and pens', 6.8, 'Education', 1, 'Cash'],
];

// [months before this one, amount]
export const demoBudgets: [number, number][] = [
  [0, 900],
  [1, 800],
  [2, 900],
];

export const janeBudgets: [number, number][] = [[0, 200]];
