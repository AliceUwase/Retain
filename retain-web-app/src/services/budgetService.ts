import type { Budget } from '../types';
import { api, ApiError } from './apiClient';

// every budget the logged-in user has set, for the month-by-month comparison
export function getBudgets(): Promise<Budget[]> {
  return api<Budget[]>('/api/budgets');
}

// month is 'YYYY-MM'; the API answers 404 when none was set, which becomes undefined here
export async function getBudget(month: string): Promise<Budget | undefined> {
  try {
    return await api<Budget>(`/api/budgets/${month}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

// creates the month's budget or replaces the old one (PUT)
export function setBudget(month: string, amount: number): Promise<Budget> {
  return api<Budget>(`/api/budgets/${month}`, { method: 'PUT', body: { amount } });
}
