import { z } from 'zod';
import { PAYMENT_METHODS } from '../models/Expense';
import { isRealDate } from '../utils/dates';
import { objectId, optionalFilter } from './common';

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

const filterDate = z.string().refine(isRealDate, 'Dates must be real dates as YYYY-MM-DD.');

// GET /api/expenses?search=&category=&paymentMethod=&startDate=&endDate=&sortBy=&sortOrder=&page=&limit=
// the names match the frontend's Redux filter state, so the state can be sent as it is
export const expenseQuerySchema = z
  .object({
    search: optionalFilter(z.string().trim().max(100, 'Search is too long.')),
    category: optionalFilter(objectId('Unknown category filter.')),
    paymentMethod: optionalFilter(z.enum(PAYMENT_METHODS, { error: 'Unknown payment method filter.' })),
    startDate: optionalFilter(filterDate),
    endDate: optionalFilter(filterDate),
    sortBy: z.enum(['date', 'amount']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    // everything in a URL is text, so coerce turns "2" into the number 2
    page: z.coerce.number().int().min(1, 'Page starts at 1.').default(1),
    // up to 500 per request, enough for the CSV export to get a whole filtered list at once
    limit: z.coerce.number().int().min(1).max(500, 'At most 500 expenses per request.').default(10),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, "The start date can't be after the end date.");

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
