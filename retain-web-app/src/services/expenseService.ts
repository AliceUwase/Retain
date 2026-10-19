import type { FiltersState } from '../store/filtersSlice';
import type { Expense, ExpenseInput, ExpensePage } from '../types';
import { api } from './apiClient';

// the Redux filter state uses the same names as the API's query, so it's sent as it is
export type ExpenseQuery = Partial<FiltersState> & { limit?: number };

// only the logged-in user's expenses; the API knows who that is from the token
export function listExpenses(query: ExpenseQuery = {}): Promise<ExpensePage> {
  return api<ExpensePage>('/api/expenses', { query });
}

// every expense of the logged-in user (up to the API's 500 per request), for pages that still add things up themselves
export async function getMyExpenses(): Promise<Expense[]> {
  const { items } = await listExpenses({ limit: 500 });
  return items;
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

// no API gives every user's expenses; the admin overview switches to /api/admin/overview in the next step
export async function getAllExpenses(): Promise<Expense[]> {
  return [];
}
