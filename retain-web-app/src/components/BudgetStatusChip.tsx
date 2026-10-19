import { Chip } from '@mui/material';
import type { BudgetStatus } from '../types';
import { statusColor } from '../utils/budget';

const labels: Record<BudgetStatus, string> = {
  within: 'Within budget',
  approaching: 'Approaching budget',
  over: 'Over budget',
};

// 'none' = no budget set for that month
export default function BudgetStatusChip({ status }: { status: BudgetStatus | 'none' }) {
  if (status === 'none') {
    return <Chip size="small" label="No budget set" sx={{ bgcolor: '#EFEEE7', color: 'text.secondary', fontWeight: 500 }} />;
  }

  const color = statusColor[status];
  return <Chip size="small" label={labels[status]} sx={{ bgcolor: `${color}.light`, color: `${color}.main`, fontWeight: 500 }} />;
}
