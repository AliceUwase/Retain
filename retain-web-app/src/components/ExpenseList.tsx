import { Box, ButtonBase, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Category, Expense } from '../types';
import { formatMoney, formatShortDate } from '../utils/format';
import CategoryIcon from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
}

// table on large screens, cards on phones; each expense opens its detail page
export default function ExpenseList({ expenses, categories }: ExpenseListProps) {
  const navigate = useNavigate();
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  if (expenses.length === 0) {
    return (
      <Typography sx={{ px: 2.5, py: 6, textAlign: 'center', color: 'text.secondary' }}>
        No expenses match these filters.
      </Typography>
    );
  }

  return (
    <>
      <Table sx={{ display: { xs: 'none', md: 'table' } }}>
        <TableHead>
          <TableRow>
            <TableCell>Expense</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Payment method</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} hover onClick={() => navigate(`/expenses/${expense.id}`)} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CategoryIcon categoryId={expense.categoryId} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{expense.title}</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{categoryName(expense.categoryId)}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{expense.paymentMethod}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{formatShortDate(expense.date)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {formatMoney(expense.amount)}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>
                <ChevronRight size={16} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* phones */}
      <Box sx={{ display: { md: 'none' } }}>
        {expenses.map((expense) => (
          <ButtonBase
            key={expense.id}
            onClick={() => navigate(`/expenses/${expense.id}`)}
            sx={{ width: '100%', px: 2, py: 1.5, gap: 1.5, justifyContent: 'flex-start', textAlign: 'left', borderTop: 1, borderColor: 'divider' }}
          >
            <CategoryIcon categoryId={expense.categoryId} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {expense.title}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {categoryName(expense.categoryId)} · {formatShortDate(expense.date)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatMoney(expense.amount)}</Typography>
          </ButtonBase>
        ))}
      </Box>
    </>
  );
}
