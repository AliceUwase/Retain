import { z } from 'zod';

// the month comes from the URL (PUT /api/budgets/2026-10), so the body only holds the amount
export const budgetAmountSchema = z.object({
  amount: z.number({ error: 'Amount must be a number.' }).positive('Enter an amount above 0.'),
});

export type BudgetAmountInput = z.infer<typeof budgetAmountSchema>;
