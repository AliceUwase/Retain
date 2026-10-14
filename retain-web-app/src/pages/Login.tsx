import { Alert, Box, Button, Checkbox, FormControlLabel, Link, Stack, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation, type Location } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // once logged in (or already logged in), go where ProtectedRoute stopped them, or the dashboard
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signIn(email, password, remember);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h1" sx={{ fontSize: '1.75rem' }}>
        Welcome back!
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3, fontSize: '0.875rem' }}>
        Log in to keep track of your expenses and budget.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordField
            id="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormControlLabel
            control={<Checkbox size="small" checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
            label="Remember me"
            slotProps={{ typography: { fontSize: '0.875rem' } }}
          />

          <Button type="submit" variant="contained" size="large" fullWidth loading={loading}>
            Log in
          </Button>

          <Typography sx={{ textAlign: 'center', fontSize: '0.875rem' }} color="text.secondary">
            New to Retain?{' '}
            <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 600 }}>
              Sign up
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
