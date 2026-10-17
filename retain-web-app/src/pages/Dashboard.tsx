import { Box, Button, Card, LinearProgress, Link, Snackbar, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, ChartPie, Plus, ReceiptText, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import StatCard from '../components/StatCard';
import WeeklySpendingChart from '../components/WeeklySpendingChart';
import { useAuth } from '../context/AuthContext';
import { getBudgets } from '../services/budgetService';
import { getCategories } from '../services/categoryService';
import { getExpenses } from '../services/expenseService';
import { setEndDate, setStartDate } from '../store/filtersSlice';
import { useAppDispatch } from '../store/store';
import type { Budget, Category, Expense } from '../types';
import { currentMonth, expensesIn, getBudgetStatus, percentUsed, shiftMonth, sumAmounts } from '../utils/budget';
import { formatMoney, formatPercent } from '../utils/format';

// bar colour on the dark banner, per status
const bannerBarColors = { within: '#A9D8B8', approaching: '#F2C77E', over: '#F4A79D' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [month, setMonth] = useState(currentMonth());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([getExpenses(user.id), getCategories(), getBudgets(user.id)]).then(([expenseList, categoryList, budgetList]) => {
      setExpenses(expenseList);
      setCategories(categoryList);
      setBudgets(budgetList);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <Typography color="text.secondary">Loading your overview…</Typography>;

  const monthName = dayjs(`${month}-01`).format('MMMM');
  const monthExpenses = expensesIn(expenses, month);
  const spent = sumAmounts(monthExpenses);
  const previousName = dayjs(`${shiftMonth(month, -1)}-01`).format('MMMM');
  const previousSpent = sumAmounts(expensesIn(expenses, shiftMonth(month, -1)));
  const budget = budgets.find((b) => b.month === month);
  const remaining = budget ? budget.amount - spent : 0;
  const percent = budget ? percentUsed(spent, budget.amount) : 0;
  const status = budget ? getBudgetStatus(spent, budget.amount) : null;
  const categoryCount = new Set(monthExpenses.map((e) => e.categoryId)).size;
  const recent = [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // "RWF 270.00 less than August · ↓ 12.7%"
  function comparedToLastMonth() {
    if (previousSpent === 0) return `Nothing recorded in ${previousName}`;
    const diff = spent - previousSpent;
    const Arrow = diff <= 0 ? ArrowDown : ArrowUp;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        {formatMoney(Math.abs(diff))} {diff <= 0 ? 'less' : 'more'} than {previousName} ·
        <Arrow size={12} />
        {formatPercent((Math.abs(diff) / previousSpent) * 100)}
      </Box>
    );
  }

  const banner = {
    none: { title: `No budget for ${monthName} yet`, text: 'Set one to see how your spending compares.' },
    within: { title: 'Still within your budget', text: `${formatPercent(100 - percent)} of your budget is still unspent.` },
    approaching: { title: 'Getting close to your budget', text: `Only ${formatPercent(100 - percent)} of your budget is left.` },
    over: { title: 'Over budget', text: `You're ${formatMoney(-remaining)} over your ${monthName} budget.` },
  }[status ?? 'none'];

  // "View all expenses" opens the Expenses page filtered to this month
  function viewAllExpenses() {
    const start = dayjs(`${month}-01`);
    dispatch(setStartDate(start.format('YYYY-MM-DD')));
    dispatch(setEndDate(start.endOf('month').format('YYYY-MM-DD')));
    navigate('/expenses');
  }

  function handleSaved(expense: Expense) {
    setExpenses((current) => [...current, expense]);
    setFormOpen(false);
    setMessage(`"${expense.title}" was added.`);
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ mb: 3, gap: 2, alignItems: { md: 'flex-start' } }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h1">Spending Overview</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Your {monthName} expense recap.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <DatePicker
            views={['year', 'month']}
            openTo="month"
            format="MMMM YYYY"
            value={dayjs(`${month}-01`)}
            onChange={(value) => value?.isValid() && setMonth(value.format('YYYY-MM'))}
            slotProps={{ textField: { size: 'small', sx: { width: 190, bgcolor: 'background.paper' } } }}
          />
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setFormOpen(true)} sx={{ whiteSpace: 'nowrap' }}>
            Add expense
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <StatCard title="Total spent" icon={<Wallet size={18} />} value={formatMoney(spent)} caption={comparedToLastMonth()} />
        <StatCard
          title="Remaining budget"
          icon={<ChartPie size={18} />}
          value={budget ? formatMoney(remaining) : '—'}
          caption={
            budget ? (
              `Of your ${formatMoney(budget.amount)} monthly budget`
            ) : (
              <Link component={RouterLink} to="/budget" underline="hover">
                Set a budget for {monthName}
              </Link>
            )
          }
        />
        <StatCard
          title="Expenses recorded"
          icon={<ReceiptText size={18} />}
          value={String(monthExpenses.length)}
          caption={`Across ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}`}
        />
      </Box>

      {/* dark budget banner */}
      <Card
        sx={{
          mt: 3,
          p: { xs: 2.5, md: 3 },
          border: 0,
          bgcolor: 'primary.dark',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: { md: 'center' },
        }}
      >
        <Box sx={{ minWidth: 240 }}>
          <Typography sx={{ fontWeight: 600 }}>{banner.title}</Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', opacity: 0.8 }}>{banner.text}</Typography>
        </Box>
        {budget && status && (
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', fontSize: '0.8125rem', opacity: 0.9 }}>
              <span>{formatMoney(spent)} spent</span>
              <span>
                {formatPercent(percent)} of {formatMoney(budget.amount)}
              </span>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(percent, 100)}
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: bannerBarColors[status] } }}
            />
          </Box>
        )}
        <Button
          variant="contained"
          component={RouterLink}
          to="/budget"
          startIcon={<ArrowUpRight size={16} />}
          sx={{ ml: { md: 'auto' }, alignSelf: { xs: 'flex-start', md: 'center' }, bgcolor: '#FFFFFF', color: 'primary.dark', '&:hover': { bgcolor: '#EFEEE7' } }}
        >
          {budget ? 'View budget' : 'Set a budget'}
        </Button>
      </Card>

      <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' }, alignItems: 'start' }}>
        <WeeklySpendingChart expenses={monthExpenses} month={month} />
        <CategoryBreakdown expenses={monthExpenses} categories={categories} />
      </Box>

      <Card sx={{ mt: 3 }}>
        <Stack direction="row" sx={{ px: 2.5, py: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h2">Recent expenses</Typography>
          <Button endIcon={<ArrowRight size={16} />} onClick={viewAllExpenses}>
            View all expenses
          </Button>
        </Stack>
        {recent.length === 0 ? (
          <Typography sx={{ px: 2.5, pb: 4, color: 'text.secondary' }}>No expenses recorded in {monthName} yet.</Typography>
        ) : (
          <ExpenseList expenses={recent} categories={categories} />
        )}
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
