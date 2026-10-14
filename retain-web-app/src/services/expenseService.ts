import { mockExpenses } from '../data/mockData';
import type { Expense, ExpenseInput } from '../types';
import { delay, loadList, newId, now, saveList } from './storage';

const KEY = 'expenses'; // categoryService uses the same key

function load(): Expense[] {
  return loadList(KEY, mockExpenses);
}

export async function getExpenses(userId: string): Promise<Expense[]> {
  await delay();
  return load().filter((e) => e.userId === userId);
}

// For the admin dashboard.
export async function getAllExpenses(): Promise<Expense[]> {
  await delay();
  return load();
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  await delay();
  return load().find((e) => e.id === id);
}

export async function addExpense(input: ExpenseInput): Promise<Expense> {
  await delay();
  const timestamp = now();
  const expense: Expense = { ...input, id: newId('exp'), createdAt: timestamp, updatedAt: timestamp };
  saveList(KEY, [...load(), expense]);
  return expense;
}

export async function updateExpense(id: string, changes: Partial<ExpenseInput>): Promise<Expense> {
  await delay();
  const expenses = load();
  const existing = expenses.find((e) => e.id === id);
  if (!existing) throw new Error('Expense not found.');

  const updated: Expense = { ...existing, ...changes, updatedAt: now() };
  saveList(KEY, expenses.map((e) => (e.id === id ? updated : e)));
  return updated;
}

export async function deleteExpense(id: string): Promise<void> {
  await delay();
  saveList(KEY, load().filter((e) => e.id !== id));
}
