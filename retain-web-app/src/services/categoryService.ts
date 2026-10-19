import type { Category, CategoryUsage } from '../types';
import { api } from './apiClient';

export function getCategories(): Promise<Category[]> {
  return api<Category[]>('/api/categories');
}

// the changes below are admin only; the API answers 403 for anyone else

export function addCategory(name: string): Promise<Category> {
  return api<Category>('/api/categories', { method: 'POST', body: { name } });
}

export function updateCategory(id: string, name: string): Promise<Category> {
  return api<Category>(`/api/categories/${id}`, { method: 'PATCH', body: { name } });
}

// the API moves the category's expenses to Uncategorized and says how many moved
export function deleteCategory(id: string): Promise<{ movedExpenses: number }> {
  return api<{ movedExpenses: number }>(`/api/categories/${id}`, { method: 'DELETE' });
}

export function getCategoryUsage(): Promise<CategoryUsage[]> {
  return api<CategoryUsage[]>('/api/admin/categories');
}
