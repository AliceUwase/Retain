import { Card, Typography, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';
import type { Expense } from '../types';
import { formatMonth } from '../utils/format';

// splits a month into 1–7, 8–14, 15–21 and 22–end, with the total spent in each
function weeklyTotals(expenses: Expense[], month: string) {
  const start = dayjs(`${month}-01`);
  const lastDay = start.daysInMonth();
  const ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, lastDay],
  ];

  return ranges.map(([from, to]) => ({
    label: `${start.format('MMM')} ${from}–${to}`,
    total: expenses
      .filter((e) => {
        const day = dayjs(e.date).date();
        return day >= from && day <= to;
      })
      .reduce((sum, e) => sum + e.amount, 0),
  }));
}

// expenses should already be limited to `month`
export default function WeeklySpendingChart({ expenses, month }: { expenses: Expense[]; month: string }) {
  const theme = useTheme();
  const weeks = weeklyTotals(expenses, month);
  const biggest = Math.max(...weeks.map((w) => w.total));

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h2">Spending by week</Typography>
      <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>Weekly totals · {formatMonth(month)} · RWF</Typography>

      <BarChart
        height={260}
        borderRadius={4}
        margin={{ left: 0, right: 8 }}
        xAxis={[
          {
            scaleType: 'band',
            data: weeks.map((w) => w.label),
            // the busiest week stands out in dark green
            colorMap: {
              type: 'ordinal',
              values: weeks.map((w) => w.label),
              colors: weeks.map((w) => (w.total === biggest && biggest > 0 ? theme.palette.primary.main : '#6FA283')),
            },
          },
        ]}
        yAxis={[{ width: 48 }]}
        series={[
          {
            data: weeks.map((w) => w.total),
            barLabel: (item) => (item.value ? item.value.toFixed(2) : null),
            barLabelPlacement: 'outside',
            valueFormatter: (value) => `RWF ${(value ?? 0).toFixed(2)}`,
          },
        ]}
      />
    </Card>
  );
}
