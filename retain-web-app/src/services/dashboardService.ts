import type { AdminOverview, DashboardData } from '../types';
import { api } from './apiClient';

// the logged-in user's Overview for one month ('YYYY-MM'), all worked out by the API
export function getDashboard(month: string): Promise<DashboardData> {
  return api<DashboardData>('/api/dashboard', { query: { month } });
}

// admin only: how everyone is using Retain
export function getAdminOverview(): Promise<AdminOverview> {
  return api<AdminOverview>('/api/admin/overview');
}
