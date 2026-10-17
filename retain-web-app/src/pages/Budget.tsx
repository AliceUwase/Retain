import { Box, Button, Card, Divider, InputAdornment, LinearProgress, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Check, CircleAlert, CircleCheck, Plus, TriangleAlert } from 'lucide-react';
import { useEffect, useState, type SubmitEvent } from 'react';
import BudgetCard from '../components/BudgetCard';
import BudgetStatusChip from '../components/BudgetStatusChip';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import { getBudgets, setBudget } from '../services/budgetService';
import { getExpenses } from '../services/expenseService';
import type { Budget as BudgetType, Expense } from '../types';
import { currentMonth, expensesIn, getBudgetStatus, percentUsed, shiftMonth, statusColor, sumAmounts } from '../utils/budget';
import { formatDateTime, formatMoney, formatMonth, formatPercent } from '../utils/format';

const statusIcons = { within: CircleCheck, approaching: TriangleAlert, over: CircleAlert };

// amount input + save/cancel, used for "Update monthly budget" and "Plan ahead"
function BudgetForm({
  id,
  label,
  initialAmount,
  saveLabel,
  inline = false,
  onSave,
}: {
  id: string;
  label: string;
  initialAmount?: number;
  saveLabel: string;
  inline?: boolean;
  onSave: (amount: number) => Promise<void>;
}) {
  const startValue = initialAmount ? String(initialAmount) : '';
  const [amount, setAmount] = useState(startValue);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount.replace(/,/g, ''));
    if (!(value > 0)) {
      setError('Enter an amount above 0.');
      return;
    }
    setError('');
    setSaving(true);
    await onSave(value);
    setSaving(false);
  }

  const buttons = (
    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        onClick={() => {
          setAmount(startValue);
          setError('');
        }}
        sx={{ borderColor: 'divider', color: 'text.primary' }}
      >
        Cancel
      </Button>
      <Button type="submit" variant="contained" startIcon={inline ? <Plus size={16} /> : <Check size={16} />} loading={saving}>
        {saveLabel}
      </Button>
    </Stack>
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={inline ? { display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap' } : undefined}
    >
      <FormField
        id={id}
        label={label}
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={!!error}
        helperText={error || undefined}
        sx={inline ? { width: 220 } : undefined}
        slotProps={{
          htmlInput: { inputMode: 'decimal' },
          input: { startAdornment: <InputAdornment position="start">RWF</InputAdornment> },
        }}
      />
      {inline ? buttons : <Box sx={{ mt: 2.5 }}>{buttons}</Box>}
    </Box>
  );
}

export default function Budget() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth()); // the month being looked at
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([getBudgets(user.id), getExpenses(user.id)]).then(([budgetList, expenseList]) => {
      setBudgets(budgetList);
      setExpenses(expenseList);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <Typography color="text.secondary">Loading budget…</Typography>;

  const budgetFor = (m: string) => budgets.find((b) => b.month === m);
  const spentIn = (m: string) => sumAmounts(expensesIn(expenses, m));

  const budget = budgetFor(month);
  const monthExpenses = expensesIn(expenses, month);
  const spent = sumAmounts(monthExpenses);
  const status = budget ? getBudgetStatus(spent, budget.amount) : 'none';
  const color = status === 'none' ? 'success' : statusColor[status];
  const remaining = budget ? budget.amount - spent : 0;
  const percent = budget ? percentUsed(spent, budget.amount) : 0;
  const monthName = dayjs(`${month}-01`).format('MMMM');
  const nextMonth = shiftMonth(currentMonth(), 1);

  // the sentence in the coloured box under the bar
  function summary(): string {
    if (!budget) return `No budget set for ${monthName} yet. Set one to see how you're doing.`;
    const isPast = month < currentMonth();
    let text: string;
    if (isPast) {
      text =
        remaining >= 0
          ? `You ended ${monthName} ${formatMoney(remaining)} under budget.`
          : `You ended ${monthName} ${formatMoney(-remaining)} over budget.`;
    } else {
      text =
        remaining >= 0
          ? `You have ${formatMoney(remaining)} left to spend in ${monthName}.`
          : `You're ${formatMoney(-remaining)} over your ${monthName} budget.`;
    }

    const previous = shiftMonth(month, -1);
    const previousSpent = spentIn(previous);
    if (previousSpent > 0) {
      const diff = spent - previousSpent;
      const previousName = dayjs(`${previous}-01`).format('MMMM');
      text += ` That's ${formatMoney(Math.abs(diff))} ${diff <= 0 ? 'less' : 'more'} spending than ${previousName}.`;
    }
    return text;
  }

  async function handleSave(forMonth: string, amount: number) {
    if (!user) return;
    const saved = await setBudget(user.id, forMonth, amount);
    setBudgets((current) => [...current.filter((b) => b.month !== forMonth), saved]);
    setMessage(`Budget for ${formatMonth(forMonth)} saved.`);
  }

  const StatusIcon = status === 'none' ? CircleAlert : statusIcons[status];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3, gap: 2, alignItems: { sm: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h1">Track your spending</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Set a monthly limit & See where you stand. 
          </Typography>
        </Box>
        <DatePicker
          views={['year', 'month']}
          openTo="month"
          format="MMMM YYYY"
          value={dayjs(`${month}-01`)}
          onChange={(value) => value?.isValid() && setMonth(value.format('YYYY-MM'))}
          slotProps={{ textField: { size: 'small', sx: { width: 200, bgcolor: 'background.paper' } } }}
        />
      </Stack>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, alignItems: 'start' }}>
        {/* the selected month in detail */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h2">{formatMonth(month)}</Typography>
            <BudgetStatusChip status={status} />
          </Stack>

          <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Total amount spent</Typography>
              <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' }, fontWeight: 600 }}>{formatMoney(spent)}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Remaining budget</Typography>
              <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' }, fontWeight: 600, color: budget ? `${color}.main` : 'text.secondary' }}>
                {budget ? formatMoney(remaining) : '—'}
              </Typography>
            </Box>
          </Box>

          {budget && (
            <>
              <LinearProgress variant="determinate" value={Math.min(percent, 100)} color={color} sx={{ mt: 2.5, height: 10, borderRadius: 5 }} />
              <Stack direction="row" sx={{ mt: 1.5, justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {formatPercent(percent)} used · {monthExpenses.length} expenses
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{formatMoney(budget.amount)} monthly budget</Typography>
              </Stack>
            </>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: budget ? `${color}.light` : 'background.default', color: budget ? `${color}.main` : 'text.secondary' }}
          >
            <Box sx={{ mt: 0.25 }}>
              <StatusIcon size={18} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem' }}>{summary()}</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h2" sx={{ mb: 2.5 }}>
            {budget ? 'Update monthly budget' : 'Set monthly budget'}
          </Typography>
          <TextField size="small" label="Month" value={formatMonth(month)} fullWidth disabled sx={{ mb: 2.5 }} />
          {/* key resets the input when you switch months or save a new amount */}
          <BudgetForm
            key={`${month}-${budget?.amount}`}
            id="budget-amount"
            label="Budget amount · RWF"
            initialAmount={budget?.amount}
            saveLabel="Save budget"
            onSave={(amount) => handleSave(month, amount)}
          />
          <Divider sx={{ my: 2.5 }} />
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Applies only to {monthName}. Your recorded expenses won't change.
            {budget && ` Last updated ${formatDateTime(budget.updatedAt)}.`}
          </Typography>
        </Card>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mt: 5, mb: 2, gap: 1, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <Typography variant="h2">A few months, in perspective</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Within &lt;80% · Approaching 80–100% · Over &gt;100%</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {[0, -1, -2].map((offset) => {
          const m = shiftMonth(month, offset);
          return <BudgetCard key={m} month={m} spent={spentIn(m)} budget={budgetFor(m)?.amount} />;
        })}
      </Box>

      {/* only while next month has no budget yet */}
      {!budgetFor(nextMonth) && (
        <Card sx={{ mt: 3, p: { xs: 2.5, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2.5, alignItems: { md: 'center' } }}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Typography variant="h2">Plan ahead for {dayjs(`${nextMonth}-01`).format('MMMM')}</Typography>
                <BudgetStatusChip status="none" />
              </Stack>
              <Typography sx={{ mt: 0.75, fontSize: '0.875rem', color: 'text.secondary' }}>
                Start a month with a new limit that works for you.
              </Typography>
            </Box>
            <BudgetForm
              id="next-budget"
              label={`${dayjs(`${nextMonth}-01`).format('MMMM')} budget · RWF`}
              initialAmount={budgetFor(currentMonth())?.amount}
              saveLabel="Set budget"
              inline
              onSave={(amount) => handleSave(nextMonth, amount)}
            />
          </Stack>
        </Card>
      )}

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
