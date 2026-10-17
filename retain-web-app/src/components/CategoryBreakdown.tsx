import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Category, Expense } from '../types';
import { formatMoney } from '../utils/format';

const SHOWN = 4; // the rest are summed up in one line at the bottom

// "a", "a & b", "a, b & c"
function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

interface CategoryBreakdownProps {
  expenses: Expense[];
  categories: Category[];
  title?: string;
}

// spending per category, biggest first
export default function CategoryBreakdown({ expenses, categories, title = 'Where it went' }: CategoryBreakdownProps) {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.categoryId, (totals.get(e.categoryId) ?? 0) + e.amount);

  const rows = [...totals.entries()]
    .map(([id, total]) => ({ name: categories.find((c) => c.id === id)?.name ?? 'Uncategorized', total }))
    .sort((a, b) => b.total - a.total);
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const shown = rows.slice(0, SHOWN);
  const rest = rows.slice(SHOWN);

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h2">{title}</Typography>

      {rows.length === 0 ? (
        <Typography sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>No spending recorded yet.</Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2.5 }}>
          {shown.map((row, i) => (
            <Box key={row.name}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <Typography sx={{ fontSize: 'inherit' }}>{row.name}</Typography>
                <Typography sx={{ fontSize: 'inherit' }}>{formatMoney(row.total)}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(row.total / grandTotal) * 100}
                sx={{
                  mt: 0.75,
                  height: 6,
                  // biggest category in the full colour, the rest lighter
                  '& .MuiLinearProgress-bar': { bgcolor: (theme) => (i === 0 ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.55)) },
                }}
              />
            </Box>
          ))}
          {rest.length > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {joinNames(rest.map((r, i) => (i === 0 ? r.name : r.name.toLowerCase())))} ·{' '}
              {formatMoney(rest.reduce((sum, r) => sum + r.total, 0))}
            </Typography>
          )}
        </Stack>
      )}
    </Card>
  );
}
