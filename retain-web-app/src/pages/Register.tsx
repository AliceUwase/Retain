import { Alert, Box, Button, Checkbox, FormControlLabel, FormHelperText, Link, Stack, Typography } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'agreed', string>>;

export default function Register() {
  const { user, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // new accounts are logged in straight away, so this also handles the redirect after sign-up
  if (user) return <Navigate to="/dashboard" replace />;

  function validate(): Errors {
    const found: Errors = {};
    if (!name.trim()) found.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = 'Please enter a valid email.';
    if (password.length < 8) found.password = 'Use at least 8 characters.';
    if (confirm !== password) found.confirm = "Passwords don't match.";
    if (!agreed) found.agreed = 'Please agree to the terms to continue.';
    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (err) {
      setServerError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Typography variant="h1" sx={{ fontSize: '1.75rem' }}>
        Create your account
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3, fontSize: '0.875rem' }}>
        Start tracking your expenses and planning your budget.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <FormField
            id="name"
            label="Full name"
            placeholder="Enter your full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password ?? 'Use at least 8 characters.'}
          />
          <PasswordField
            id="confirm"
            label="Confirm password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={!!errors.confirm}
            helperText={errors.confirm}
          />

          <Box>
            <FormControlLabel
              control={<Checkbox size="small" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
              label={
                <>
                  I agree to the{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Terms of service
                  </Box>{' '}
                  and{' '}
                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Privacy policy
                  </Box>
                  .
                </>
              }
              slotProps={{ typography: { fontSize: '0.875rem' } }}
            />
            {errors.agreed && <FormHelperText error>{errors.agreed}</FormHelperText>}
          </Box>

          <Button type="submit" variant="contained" size="large" fullWidth loading={loading}>
            Create account
          </Button>

          <Typography sx={{ textAlign: 'center', fontSize: '0.875rem' }} color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
              Log in
            </Link>
          </Typography>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
