import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/categoryService';
import { getExpenses } from '../services/expenseService';
import { applyFilters } from '../store/filtersSlice';
import { useAppSelector } from '../store/store';
import type { Category, Expense } from '../types';

export default function Expenses() {
  const { user } = useAuth();
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
    if (user) getExpenses(user.id).then(setExpenses);
  }, [user]);

  const filtered = applyFilters(expenses, filters);

  return (
    <Box>
      <Typography variant="h1">Expenses</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The everyday expense details from a glance.
      </Typography>

      <FilterBar categories={categories} />

      <Card sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 2, alignItems: 'center' }}>
          <Typography variant="h2">Expenses</Typography>
          <Chip size="small" label={`${filtered.length} records`} />
        </Stack>

        {/* the table goes here in step 7 */}

        <Pagination totalItems={filtered.length} />
      </Card>
    </Box>
  );
}
