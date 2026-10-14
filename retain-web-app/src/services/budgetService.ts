import { mockBudgets } from '../data/mockData';
import type { Budget } from '../types';
import { delay, loadList, now, saveList } from './storage';

const KEY = 'budgets';

function load(): Budget[] {
  return loadList(KEY, mockBudgets);
}

// All of a user's budgets, for the "few months in perspective" cards.
export async function getBudgets(userId: string): Promise<Budget[]> {
  await delay();
  return load().filter((b) => b.userId === userId);
}

// `month` is 'YYYY-MM'. Undefined if no budget was set for that month.
export async function getBudget(userId: string, month: string): Promise<Budget | undefined> {
  await delay();
  return load().find((b) => b.userId === userId && b.month === month);
}

// Creates the month's budget, or replaces it if one exists.
export async function setBudget(userId: string, month: string, amount: number): Promise<Budget> {
  await delay();
  const budget: Budget = { userId, month, amount, updatedAt: now() };
  const others = load().filter((b) => !(b.userId === userId && b.month === month));
  saveList(KEY, [...others, budget]);
  return budget;
}
