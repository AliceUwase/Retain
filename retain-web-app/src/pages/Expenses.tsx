import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ExpenseList from '../components/ExpenseList';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/categoryService';
import { getExpenses } from '../services/expenseService';
import { applyFilters, getPage } from '../store/filtersSlice';
import { useAppSelector } from '../store/store';
import type { Category, Expense } from '../types';
import { formatMoney } from '../utils/format';

export default function Expenses() {
  const { user } = useAuth();
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getCategories(), getExpenses(user.id)]).then(([categoryList, expenseList]) => {
      setCategories(categoryList);
      setExpenses(expenseList);
      setLoading(false);
    });
  }, [user]);

  const filtered = applyFilters(expenses, filters);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Box>
      <Typography variant="h1">Expenses</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The everyday expense details from a glance.
      </Typography>

      <FilterBar categories={categories} />

      <Card sx={{ mt: 3 }}>
        <Stack direction="row" sx={{ px: 2.5, py: 2, gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h2">Expenses</Typography>
          <Chip size="small" label={`${filtered.length} records`} />
          <Typography sx={{ ml: 'auto', fontSize: '0.8125rem', color: 'text.secondary' }}>
            Total for this view{' '}
            <Box component="span" sx={{ ml: 1, fontSize: '1.125rem', fontWeight: 600, color: 'text.primary' }}>
              {formatMoney(total)}
            </Box>
          </Typography>
        </Stack>

        {loading ? (
          <Typography sx={{ px: 2.5, py: 6, textAlign: 'center', color: 'text.secondary' }}>Loading expenses…</Typography>
        ) : (
          <ExpenseList expenses={getPage(filtered, filters.page)} categories={categories} />
        )}

        <Pagination totalItems={filtered.length} />
      </Card>
    </Box>
  );
}
