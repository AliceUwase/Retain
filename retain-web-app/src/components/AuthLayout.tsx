import { Box, Card, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import illustration from '../assets/Retain-illustration.png';

// green panel on the left, form card on the right
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* hidden on phones */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: '50%',
          bgcolor: 'primary.dark',
          color: '#FFFFFF',
          p: 6,
        }}
      >
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Everyday expenses, in perspective.</Typography>
        <Typography sx={{ mt: 1, fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.2 }}>
          Track expenses.
          <br />
          Stay on budget.
        </Typography>
        <Box component="img" src={illustration} alt="" sx={{ width: '100%', maxWidth: 480, m: 'auto' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 440 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>{children}</CardContent>
        </Card>
      </Box>
    </Box>
  );
}
