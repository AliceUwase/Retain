import { z } from 'zod';
import { isRealMonth } from '../utils/dates';
import { optionalFilter } from './common';

// GET /api/dashboard?month=2026-10 (without a month, the current one)
export const dashboardQuerySchema = z.object({
  month: optionalFilter(z.string().refine(isRealMonth, 'Month must look like 2026-10.')),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
