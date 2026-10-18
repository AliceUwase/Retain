import { z } from 'zod';
import { PAYMENT_METHODS } from '../models/Expense';
import { isRealDate } from '../utils/dates';
import { objectId } from './common';

// the same fields and rules as the expense form on the frontend; userId is never read from the body
export const createExpenseSchema = z.object({
  title: z.string({ error: 'Title is required.' }).trim().min(1, 'Title is required.').max(100, 'Title is too long.'),
  amount: z.number({ error: 'Amount must be a number.' }).positive('Amount must be above 0.'),
  categoryId: objectId('Pick a category.'),
  date: z.string({ error: 'Date is required.' }).refine(isRealDate, 'Enter a real date as YYYY-MM-DD.'),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: 'Pick a payment method.' }),
  notes: z.string().trim().max(500, 'Notes are too long.').optional(),
});

// editing sends only the fields that changed, so every field becomes optional
export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
