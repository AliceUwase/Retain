import { Avatar, Box, Card, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { CalendarDays, Coins, ReceiptText, TrendingDown, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import CategoryBreakdown from '../components/CategoryBreakdown';
import CategoryIcon from '../components/CategoryIcon';
import LoadError from '../components/LoadError';
import StatCard from '../components/StatCard';
import { getUsers } from '../services/authService';
import { getCategories } from '../services/categoryService';
import { getAllExpenses } from '../services/expenseService';
import type { Category, Expense, PublicUser } from '../types';
import { currentMonth, expensesIn, sumAmounts } from '../utils/budget';
import { formatDate, formatMoney, formatMonth, formatShortDate, initials } from '../utils/format';

interface CategoryCount {
  id: string;
  name: string;
  count: number;
}

// a short ranked list of categories with their expense count
function RankedCategories({ title, icon: Icon, rows }: { title: string; icon: LucideIcon; rows: CategoryCount[] }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
        <Icon size={18} />
        <Typography variant="h2" sx={{ fontSize: '1.0625rem', color: 'text.primary' }}>
          {title}
        </Typography>
      </Stack>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {rows.map((row, i) => (
          <Stack key={row.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography sx={{ width: 16, fontSize: '0.8125rem', color: 'text.secondary' }}>{i + 1}</Typography>
            <CategoryIcon name={row.name} size={28} />
            <Typography sx={{ flex: 1, fontSize: '0.875rem' }}>{row.name}</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {row.count} {row.count === 1 ? 'expense' : 'expenses'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0); // bumping this loads the data again

  useEffect(() => {
    Promise.all([getUsers(), getAllExpenses(), getCategories()])
      .then(([userList, expenseList, categoryList]) => {
        setUsers(userList);
        setExpenses(expenseList);
        setCategories(categoryList);
        setLoading(false);
      })
      .catch(() => setLoadError(true));
  }, [attempt]);

  function retry() {
    setLoadError(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  if (loadError) return <LoadError onRetry={retry} />;
  if (loading) return <Typography color="text.secondary">Loading admin overview…</Typography>;

  const month = currentMonth();
  const normalUsers = users.filter((u) => u.role === 'user');
  const joinedThisMonth = normalUsers.filter((u) => u.createdAt.startsWith(month)).length;
  const thisMonth = expensesIn(expenses, month);
  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? 'Unknown user';
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  // every category with how many expenses use it, unused ones included
  const counts: CategoryCount[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: expenses.filter((e) => e.categoryId === c.id).length,
  }));
  const top5 = [...counts].sort((a, b) => b.count - a.count).slice(0, 5);
  const bottom5 = [...counts].sort((a, b) => a.count - b.count).slice(0, 5);

  const recentExpenses = [...expenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const newestUsers = [...normalUsers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <Box>
      <Typography variant="h1">Admin overview</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        How everyone is using Retain.
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        <StatCard title="Users" icon={<Users size={18} />} value={String(normalUsers.length)} caption={`${joinedThisMonth} joined this month`} />
        <StatCard title="Expenses" icon={<ReceiptText size={18} />} value={String(expenses.length)} caption="Recorded by all users" />
        <StatCard title="Total value" icon={<Coins size={18} />} value={formatMoney(sumAmounts(expenses))} caption="All expenses, all time" />
        <StatCard
          title="This month"
          icon={<CalendarDays size={18} />}
          value={String(thisMonth.length)}
          caption={`Expenses in ${formatMonth(month)} · ${formatMoney(sumAmounts(thisMonth))}`}
        />
      </Box>

      <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, alignItems: 'start' }}>
        <CategoryBreakdown title="Spending per category" expenses={expenses} categories={categories} />
        <RankedCategories title="Most used categories" icon={TrendingUp} rows={top5} />
        <RankedCategories title="Least used categories" icon={TrendingDown} rows={bottom5} />
      </Box>

      <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, alignItems: 'start' }}>
        <Card>
          <Typography variant="h2" sx={{ px: 2.5, py: 2 }}>
            Recent expenses
          </Typography>
          {/* scrolls sideways on small screens instead of squashing the columns */}
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 560 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Expense</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <CategoryIcon name={categoryName(e.categoryId)} size={32} />
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{e.title}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{userName(e.userId)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{categoryName(e.categoryId)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{formatShortDate(e.date)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatMoney(e.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h2">Recently registered</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {newestUsers.map((u) => (
              <Stack key={u.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.875rem', fontWeight: 600 }}>
                  {initials(u.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {u.name}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {u.email}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  Joined {formatDate(u.createdAt)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Box>
    </Box>
  );
}
