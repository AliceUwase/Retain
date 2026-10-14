import { mockCategories, mockExpenses, UNCATEGORIZED_ID } from '../data/mockData';
import type { Category, Expense } from '../types';
import { delay, loadList, newId, now, saveList } from './storage';

const KEY = 'categories';

function load(): Category[] {
  return loadList(KEY, mockCategories);
}

export async function getCategories(): Promise<Category[]> {
  await delay();
  return load();
}

export async function addCategory(name: string): Promise<Category> {
  await delay();
  const category: Category = { id: newId('cat'), name };
  saveList(KEY, [...load(), category]);
  return category;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  await delay();
  const updated: Category = { id, name };
  saveList(KEY, load().map((c) => (c.id === id ? updated : c)));
  return updated;
}

// Moves the category's expenses to "Uncategorized", then deletes it.
export async function deleteCategory(id: string): Promise<void> {
  await delay();
  if (id === UNCATEGORIZED_ID) throw new Error('"Uncategorized" can\'t be deleted.');

  const expenses = loadList<Expense>('expenses', mockExpenses);
  saveList(
    'expenses',
    expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: UNCATEGORIZED_ID, updatedAt: now() } : e)),
  );
  saveList(KEY, load().filter((c) => c.id !== id));
}
