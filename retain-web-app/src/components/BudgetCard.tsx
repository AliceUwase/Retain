import { Box, Card, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import { getBudgetStatus, percentUsed, statusColor } from '../utils/budget';
import { formatMoney, formatMonth, formatPercent } from '../utils/format';
import BudgetStatusChip from './BudgetStatusChip';

interface BudgetCardProps {
  month: string; // 'YYYY-MM'
  spent: number;
  budget?: number; // undefined when no budget was set
}

// one month at a glance: spent, progress bar, remaining and status
export default function BudgetCard({ month, spent, budget }: BudgetCardProps) {
  const status = budget ? getBudgetStatus(spent, budget) : 'none';
  const color = status === 'none' ? undefined : statusColor[status];
  const percent = budget ? percentUsed(spent, budget) : 0;
  const remaining = budget ? budget - spent : 0;

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>{formatMonth(month)}</Typography>
        <BudgetStatusChip status={status} />
      </Stack>

      <Typography sx={{ mt: 2.5, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>Total spent</Typography>
      <Typography sx={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatMoney(spent)}</Typography>

      {budget && color ? (
        <>
          <LinearProgress variant="determinate" value={Math.min(percent, 100)} color={color} sx={{ my: 2 }} />
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Budget {formatMoney(budget)}</Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: `${color}.main` }}>{formatPercent(percent)} used</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Remaining budget</Typography>
            <Typography sx={{ fontWeight: 600, color: `${color}.main` }}>{formatMoney(remaining)}</Typography>
          </Stack>
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>No budget was set for this month.</Typography>
        </Box>
      )}
    </Card>
  );
}
