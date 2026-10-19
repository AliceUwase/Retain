import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { CalendarCheck, Check, RotateCcw, X } from 'lucide-react';
import { useState, type SubmitEvent } from 'react';
import { addExpense, updateExpense } from '../services/expenseService';
import { PAYMENT_METHODS, type Category, type Expense, type ExpenseInput, type PaymentMethod } from '../types';
import FormField, { FieldLabel } from './FormField';

interface ExpenseFormProps {
  expense?: Expense; // set when editing, empty when adding
  categories: Category[];
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

type Errors = Partial<Record<'title' | 'amount' | 'date' | 'categoryId' | 'paymentMethod', string>>;

// one dialog for both adding and editing; the parent only renders it while it's open
export default function ExpenseForm({ expense, categories, onClose, onSaved }: ExpenseFormProps) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = expense !== undefined;

  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [date, setDate] = useState<Dayjs | null>(expense ? dayjs(expense.date) : dayjs());
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(expense?.paymentMethod ?? '');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const amountNumber = Number(amount.replace(/,/g, '')); // so "1,000" works too

  function validate(): Errors {
    const found: Errors = {};
    if (!title.trim()) found.title = 'Please enter a title.';
    if (!(amountNumber > 0)) found.amount = 'Enter an amount above 0.';
    if (!date || !date.isValid()) found.date = 'Please pick a date.';
    if (!categoryId) found.categoryId = 'Please pick a category.';
    if (!paymentMethod) found.paymentMethod = 'Please pick a payment method.';
    return found;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !date || !paymentMethod) return;

    const input: ExpenseInput = {
      title: title.trim(),
      amount: amountNumber,
      categoryId,
      date: date.format('YYYY-MM-DD'),
      paymentMethod,
      notes: notes.trim(), // an empty string clears the notes when editing; leaving it out would keep the old ones
    };

    setSaving(true);
    try {
      const saved = isEdit ? await updateExpense(expense.id, input) : await addExpense(input);
      onSaved(saved);
    } catch (err) {
      setServerError((err as Error).message);
      setSaving(false);
    }
  }

  const month = date && date.isValid() ? date.format('MMMM YYYY') : 'this month';

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" fullScreen={isPhone}>
      <Stack direction="row" sx={{ px: 3, pt: 3, pb: 2, alignItems: 'flex-start', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h2" component="h2">
            {isEdit ? 'Edit expense' : 'Add an expense'}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
            {isEdit ? 'Update your existing record.' : 'Add a new expense record from your day.'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close" size="small" sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <X size={18} />
        </IconButton>
      </Stack>

      <DialogContent>
        <Box component="form" id="expense-form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {serverError && <Typography color="error">{serverError}</Typography>}

            <FormField
              id="title"
              label="Title *"
              placeholder="e.g. Morning coffee"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
            />

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <FormField
                id="amount"
                label="Amount *"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={!!errors.amount}
                helperText={errors.amount ?? 'Rwandan franc (RWF)'}
                slotProps={{
                  htmlInput: { inputMode: 'decimal' },
                  input: { startAdornment: <InputAdornment position="start">RWF</InputAdornment> },
                }}
              />
              <Box>
                <FieldLabel htmlFor="date">Date *</FieldLabel>
                <DatePicker
                  value={date}
                  onChange={setDate}
                  format="MMM DD, YYYY"
                  slotProps={{
                    textField: { id: 'date', size: 'small', fullWidth: true, error: !!errors.date, helperText: errors.date },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <FormField
                id="category"
                label="Category *"
                select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                error={!!errors.categoryId}
                helperText={errors.categoryId}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="" disabled>
                  Pick a category
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </FormField>
              <FormField
                id="payment-method"
                label="Payment method *"
                select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                error={!!errors.paymentMethod}
                helperText={errors.paymentMethod}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value="" disabled>
                  Pick a method
                </MenuItem>
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </FormField>
            </Box>

            <FormField
              id="notes"
              label="Notes (optional)"
              placeholder="Add a detail you'd like to remember…"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Only visible to you."
            />

            {/* which month this lands in */}
            <Stack direction="row" spacing={1.5} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
              <Box sx={{ color: 'primary.main', mt: 0.25 }}>{isEdit ? <RotateCcw size={18} /> : <CalendarCheck size={18} />}</Box>
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {isEdit ? `Updates ${month}` : `Adds to ${month}`}
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {isEdit
                    ? 'Changes will update your spending summary. Your budget amount stays the same.'
                    : "This isn't counted in your spending until you save it. Your monthly totals update automatically."}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography sx={{ mr: 'auto', fontSize: '0.75rem', color: 'text.secondary' }}>* Required fields</Typography>
        <Button variant="outlined" onClick={onClose} sx={{ borderColor: 'divider', color: 'text.primary' }}>
          Cancel
        </Button>
        <Button type="submit" form="expense-form" variant="contained" startIcon={<Check size={16} />} loading={saving}>
          {isEdit ? 'Save changes' : 'Save expense'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
