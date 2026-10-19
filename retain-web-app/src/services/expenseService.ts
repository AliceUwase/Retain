import dayjs from 'dayjs';
import type { FiltersState } from '../store/filtersSlice';
import type { Expense, ExpenseInput, ExpensePage } from '../types';
import { api } from './apiClient';

// the Redux filter state uses the same names as the API's query, so it's sent as it is
export type ExpenseQuery = Partial<FiltersState> & { limit?: number };

// only the logged-in user's expenses; the API knows who that is from the token
export function listExpenses(query: ExpenseQuery = {}): Promise<ExpensePage> {
  return api<ExpensePage>('/api/expenses', { query });
}

// how much was spent in a month ('YYYY-MM') and on how many expenses; limit 1 because
// the totals cover the whole filtered month, so the list itself isn't needed
export async function getMonthSpending(month: string): Promise<{ spent: number; count: number }> {
  const start = dayjs(`${month}-01`);
  const { total, totalAmount } = await listExpenses({
    startDate: start.format('YYYY-MM-DD'),
    endDate: start.endOf('month').format('YYYY-MM-DD'),
    limit: 1,
  });
  return { spent: totalAmount, count: total };
}

export function getExpense(id: string): Promise<Expense> {
  return api<Expense>(`/api/expenses/${id}`);
}

export function addExpense(input: ExpenseInput): Promise<Expense> {
  return api<Expense>('/api/expenses', { method: 'POST', body: input });
}

export function updateExpense(id: string, changes: Partial<ExpenseInput>): Promise<Expense> {
  return api<Expense>(`/api/expenses/${id}`, { method: 'PATCH', body: changes });
}

export function deleteExpense(id: string): Promise<void> {
  return api<void>(`/api/expenses/${id}`, { method: 'DELETE' });
}
