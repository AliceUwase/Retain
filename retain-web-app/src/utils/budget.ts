import dayjs from 'dayjs';
import type { Expense } from '../types';

export type BudgetStatus = 'within' | 'approaching' | 'over';

// within: under 80%, approaching: 80–100%, over: above 100%
export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  const percent = percentUsed(spent, budget);
  if (percent > 100) return 'over';
  if (percent >= 80) return 'approaching';
  return 'within';
}

export function percentUsed(spent: number, budget: number): number {
  return budget > 0 ? (spent / budget) * 100 : 0;
}

// MUI colour for each status (bars, chips, numbers)
export const statusColor: Record<BudgetStatus, 'success' | 'warning' | 'error'> = {
  within: 'success',
  approaching: 'warning',
  over: 'error',
};

export function currentMonth(): string {
  return dayjs().format('YYYY-MM');
}

// shiftMonth('2026-01', -1) -> '2025-12'
export function shiftMonth(month: string, by: number): string {
  return dayjs(`${month}-01`).add(by, 'month').format('YYYY-MM');
}

// the expenses dated in a month ('YYYY-MM')
export function expensesIn(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(month));
}

export function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
