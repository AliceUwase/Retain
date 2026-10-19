export type BudgetStatus = 'within' | 'approaching' | 'over';

// the same thresholds as the frontend: within is under 80% used, approaching is 80–100%, over is above 100%
export function budgetStatus(percentUsed: number): BudgetStatus {
  if (percentUsed > 100) return 'over';
  if (percentUsed >= 80) return 'approaching';
  return 'within';
}

// rounds away float noise like 0.30000000000000004
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
