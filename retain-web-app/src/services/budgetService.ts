import { mockBudgets } from '../data/mockData';
import type { Budget } from '../types';
import { delay, loadList, now, saveList } from './storage';

const KEY = 'budgets';

function load(): Budget[] {
  return loadList(KEY, mockBudgets);
}

// for the month-by-month comparison
export async function getBudgets(userId: string): Promise<Budget[]> {
  await delay();
  return load().filter((b) => b.userId === userId);
}

// month is 'YYYY-MM', undefined if none was set
export async function getBudget(userId: string, month: string): Promise<Budget | undefined> {
  await delay();
  return load().find((b) => b.userId === userId && b.month === month);
}

// adds the month's budget or replaces the old one
export async function setBudget(userId: string, month: string, amount: number): Promise<Budget> {
  await delay();
  const budget: Budget = { userId, month, amount, updatedAt: now() };
  const others = load().filter((b) => !(b.userId === userId && b.month === month));
  saveList(KEY, [...others, budget]);
  return budget;
}
