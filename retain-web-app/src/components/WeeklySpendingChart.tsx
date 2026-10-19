import { Card, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import dayjs from 'dayjs';
import { formatMonth } from '../utils/format';

interface WeeklySpendingChartProps {
  month: string; // 'YYYY-MM'
  weeks: { label: string; total: number }[]; // from the API: '1–7', '8–14', '15–21', '22–31'
}

export default function WeeklySpendingChart({ month, weeks }: WeeklySpendingChartProps) {
  const theme = useTheme();
  const monthShort = dayjs(`${month}-01`).format('MMM');
  const labels = weeks.map((w) => `${monthShort} ${w.label}`); // "Oct 1–7"
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
            data: labels,
            // the busiest week stands out in the full colour, the rest are lighter
            colorMap: {
              type: 'ordinal',
              values: labels,
              colors: weeks.map((w) =>
                w.total === biggest && biggest > 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.55),
              ),
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
