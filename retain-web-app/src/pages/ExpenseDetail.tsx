import { Box, Button, Card, Divider, Link, Snackbar, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { ArrowLeft, Banknote, Calendar, CreditCard, Landmark, Pencil, Smartphone, Trash, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import CategoryIcon from '../components/CategoryIcon';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import LoadError from '../components/LoadError';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/categoryService';
import { deleteExpense, getExpenses } from '../services/expenseService';
import type { Category, Expense, PaymentMethod } from '../types';
import { formatDateTime, formatLongDate, formatMoney } from '../utils/format';

const paymentIcons: Record<PaymentMethod, LucideIcon> = {
  Cash: Banknote,
  Card: CreditCard,
  'Mobile Money': Smartphone,
  'Bank Transfer': Landmark,
};

// small caps label, used for "Amount · RWF" and "Notes"
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase' }}>
      {children}
    </Typography>
  );
}

function DetailItem({ label, icon, value }: { label: string; icon: ReactNode; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
        {icon}
        <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{value}</Typography>
      </Stack>
    </Box>
  );
}

export default function ExpenseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumping this loads the data again

  // all of the user's expenses, so we also get the "Also in" list
  useEffect(() => {
    if (!user) return;
    Promise.all([getExpenses(user.id), getCategories()])
      .then(([expenseList, categoryList]) => {
        setExpenses(expenseList);
        setCategories(categoryList);
        setLoading(false);
      })
      .catch(() => setLoadError(true));
  }, [user, attempt]);

  function retry() {
    setLoadError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  const backLink = (
    <Link component={RouterLink} to="/expenses" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3, fontWeight: 500 }}>
      <ArrowLeft size={16} /> Back to expenses
    </Link>
  );

  if (loadError) return <LoadError onRetry={retry} />;
  if (loading) return <Typography color="text.secondary">Loading expense…</Typography>;

  // also covers someone else's expense id, since we only loaded this user's
  const expense = expenses.find((e) => e.id === id);
  if (!expense) {
    return (
      <Box>
        {backLink}
        <Typography variant="h1">Expense not found</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          It may have been deleted.
        </Typography>
      </Box>
    );
  }

  const categoryName = categories.find((c) => c.id === expense.categoryId)?.name ?? 'Uncategorized';
  const month = dayjs(expense.date).format('MMMM YYYY');
  const PaymentIcon = paymentIcons[expense.paymentMethod];

  // same category, same month, newest first, up to 5
  const related = expenses
    .filter((e) => e.id !== expense.id && e.categoryId === expense.categoryId && e.date.slice(0, 7) === expense.date.slice(0, 7))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  function handleSaved(saved: Expense) {
    setExpenses((current) => current.map((e) => (e.id === saved.id ? saved : e)));
    setEditing(false);
    setMessage('Changes saved.');
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteExpense(expense!.id);
      navigate('/expenses');
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
      setMessage("Couldn't delete the expense. Please try again.");
    }
  }

  return (
    <Box>
      {backLink}

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3, gap: 2, alignItems: { sm: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h1">Expense details</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Recorded in your {month} expenses.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Trash size={16} />}
            onClick={() => setConfirmDelete(true)}
            sx={{ borderColor: 'divider', color: 'text.primary', bgcolor: 'background.paper' }}
          >
            Delete expense
          </Button>
          <Button variant="contained" startIcon={<Pencil size={16} />} onClick={() => setEditing(true)}>
            Edit expense
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3} sx={{ maxWidth: 680 }}>
        <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <CategoryIcon name={categoryName} size={52} />
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              {expense.title}
            </Typography>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <SectionLabel>Amount · RWF</SectionLabel>
            <Typography sx={{ mt: 1, fontSize: { xs: '2.25rem', sm: '3rem' }, fontWeight: 600, lineHeight: 1.1 }}>
              {formatMoney(expense.amount)}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <DetailItem label="Date" icon={<Calendar size={18} />} value={formatLongDate(expense.date)} />
            <DetailItem label="Category" icon={<CategoryIcon name={categoryName} size={24} />} value={categoryName} />
            <DetailItem label="Payment method" icon={<PaymentIcon size={18} />} value={expense.paymentMethod} />
          </Box>

          <Divider sx={{ my: 3 }} />

          <SectionLabel>Notes</SectionLabel>
          <Typography sx={{ mt: 1, color: expense.notes ? 'text.primary' : 'text.secondary' }}>
            {expense.notes || 'No notes.'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mt: 4, gap: 0.5, justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Added {formatDateTime(expense.createdAt)}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Last updated {formatDateTime(expense.updatedAt)}
            </Typography>
          </Stack>
        </Card>

        {related.length > 0 && (
          <Card>
            <Stack direction="row" sx={{ px: 2.5, py: 2, alignItems: 'center' }}>
              <Typography variant="h2" sx={{ fontSize: '1.0625rem', flex: 1 }}>
                Also in {categoryName.toLowerCase()}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{dayjs(expense.date).format('MMMM')}</Typography>
            </Stack>
            <ExpenseList expenses={related} categories={categories} />
          </Card>
        )}
      </Stack>

      {editing && (
        <ExpenseForm expense={expense} categories={categories} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this expense?"
        confirmLabel="Delete expense"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        "{expense.title}" ({formatMoney(expense.amount)}) will be removed for good. This can't be undone.
      </ConfirmDialog>

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
