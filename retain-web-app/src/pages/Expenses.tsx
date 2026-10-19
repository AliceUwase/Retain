import { Box, Button, Card, Chip, Snackbar, Stack, Typography } from '@mui/material';
import { Download, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FilterBar from '../components/FilterBar';
import LoadError from '../components/LoadError';
import Pagination from '../components/Pagination';
import { getCategories } from '../services/categoryService';
import { listExpenses } from '../services/expenseService';
import { PAGE_SIZE } from '../store/filtersSlice';
import { useAppSelector } from '../store/store';
import type { Category, Expense, ExpensePage } from '../types';
import { downloadExpensesCsv } from '../utils/csv';
import { formatMoney } from '../utils/format';

const EXPORT_LIMIT = 500; // the most the API returns in one request

export default function Expenses() {
  const filters = useAppSelector((state) => state.filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<ExpensePage | null>(null); // null until the first page arrives
  const [formOpen, setFormOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(''); // success message at the bottom
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumping this loads the data again

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setLoadError(true));
  }, [attempt]);

  // asks the API for the current page whenever a filter, the sort or the page changes
  useEffect(() => {
    let cancelled = false;
    // waits 300ms, so typing "groceries" sends one request instead of nine;
    // a new change within that time cancels the waiting one
    const timer = setTimeout(() => {
      listExpenses({ ...filters, limit: PAGE_SIZE })
        .then((page) => {
          if (!cancelled) setResult(page); // ignores an answer that arrives after newer filters were set
        })
        .catch(() => {
          if (!cancelled) setLoadError(true);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, attempt]);

  function retry() {
    setLoadError(false);
    setResult(null);
    setAttempt((n) => n + 1);
  }

  // the new expense might land on another page or be hidden by a filter, so the page is loaded again
  function handleSaved(expense: Expense) {
    setFormOpen(false);
    setMessage(`"${expense.title}" was added.`);
    setAttempt((n) => n + 1);
  }

  // exports everything that matches the filters, not just this page, so it asks for up to 500 at once
  async function handleExport() {
    setExporting(true);
    try {
      const all = await listExpenses({ ...filters, page: 1, limit: EXPORT_LIMIT });
      downloadExpensesCsv(all.items, categories);
      if (all.total > EXPORT_LIMIT) setMessage(`Exported the first ${EXPORT_LIMIT} of ${all.total} expenses.`);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setExporting(false);
    }
  }

  const total = result?.total ?? 0;

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
          <Button
            variant="outlined"
            size="large"
            startIcon={<Download size={18} />}
            disabled={total === 0}
            loading={exporting}
            onClick={handleExport}
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
          <Chip size="small" label={`${total} records`} />
          <Typography sx={{ ml: 'auto', fontSize: '0.8125rem', color: 'text.secondary' }}>
            Total for this view{' '}
            <Box component="span" sx={{ ml: 1, fontSize: '1.125rem', fontWeight: 600, color: 'text.primary' }}>
              {formatMoney(result?.totalAmount ?? 0)}
            </Box>
          </Typography>
        </Stack>

        {loadError ? (
          <LoadError onRetry={retry} />
        ) : result === null ? (
          <Typography sx={{ px: 2.5, py: 6, textAlign: 'center', color: 'text.secondary' }}>Loading expenses…</Typography>
        ) : (
          <ExpenseList expenses={result.items} categories={categories} />
        )}

        {/* only once the real total is known: with 0 it would move you back to page 1 */}
        {result && <Pagination totalItems={total} />}
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
