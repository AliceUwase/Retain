import { Box, Button, Card, Chip, Snackbar, Stack, Typography } from '@mui/material';
import { Download, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FilterBar from '../components/FilterBar';
import LoadError from '../components/LoadError';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/categoryService';
import { getExpenses } from '../services/expenseService';
import { applyFilters, getPage } from '../store/filtersSlice';
import { useAppSelector } from '../store/store';
import type { Category, Expense } from '../types';
import { downloadExpensesCsv } from '../utils/csv';
import { formatMoney } from '../utils/format';

export default function Expenses() {
  const { user } = useAuth();
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState(''); // success message at the bottom
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumping this loads the data again

  useEffect(() => {
    if (!user) return;
    Promise.all([getCategories(), getExpenses(user.id)])
      .then(([categoryList, expenseList]) => {
        setCategories(categoryList);
        setExpenses(expenseList);
        setLoading(false);
      })
      .catch(() => setLoadError(true));
  }, [user, attempt]);

  function retry() {
    setLoadError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  const filtered = applyFilters(expenses, filters);
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  function handleSaved(expense: Expense) {
    setExpenses((current) => [...current, expense]);
    setFormOpen(false);
    setMessage(`"${expense.title}" was added.`);
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3, gap: 2, alignItems: { sm: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h1">Expenses</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            The everyday expense details from a glance.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {/* exports what's currently filtered, not just this page */}
          <Button
            variant="outlined"
            size="large"
            startIcon={<Download size={18} />}
            disabled={filtered.length === 0}
            onClick={() => downloadExpensesCsv(filtered, categories)}
            sx={{ borderColor: 'divider', color: 'text.primary', bgcolor: 'background.paper' }}
          >
            Export CSV
          </Button>
          <Button variant="contained" size="large" startIcon={<Plus size={18} />} onClick={() => setFormOpen(true)}>
            Add expense
          </Button>
        </Stack>
      </Stack>

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

        {loadError ? (
          <LoadError onRetry={retry} />
        ) : loading ? (
          <Typography sx={{ px: 2.5, py: 6, textAlign: 'center', color: 'text.secondary' }}>Loading expenses…</Typography>
        ) : (
          <ExpenseList expenses={getPage(filtered, filters.page)} categories={categories} />
        )}

        <Pagination totalItems={filtered.length} />
      </Card>

      {formOpen && <ExpenseForm categories={categories} onClose={() => setFormOpen(false)} onSaved={handleSaved} />}

      <Snackbar
        open={message !== ''}
        message={message}
        autoHideDuration={4000}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
