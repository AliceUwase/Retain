import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import type { ReactNode } from 'react';
import illustration from '../assets/Retain-illustration.png';

const rise = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// animations only run if the visitor hasn't asked their device to reduce motion
const motionOk = '@media (prefers-reduced-motion: no-preference)';

// fades and slides up into place; `delay` staggers the pieces so they arrive one after another
function riseIn(delay: number) {
  return { [motionOk]: { animation: `${rise} 0.6s ease-out ${delay}s both` } };
}

// brown panel on the left, form card on the right
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
        {/* the R mark with white text: the brown wordmark would be hard to read on this dark panel */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 6, ...riseIn(0) }}>
          <Box component="img" src="/retain-favicon.png" alt="" sx={{ width: 40, height: 40 }} />
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>Retain</Typography>
        </Stack>

        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, ...riseIn(0.1) }}>Everyday expenses, in perspective.</Typography>
        <Typography sx={{ mt: 1, fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.2, ...riseIn(0.2) }}>
          Track expenses.
          <br />
          Stay on budget.
        </Typography>
        <Box
          component="img"
          src={illustration}
          alt=""
          sx={{
            width: '100%',
            maxWidth: 480,
            m: 'auto',
            // rises in with the rest, then keeps floating gently
            [motionOk]: { animation: `${rise} 0.6s ease-out 0.3s both, ${float} 6s ease-in-out 0.9s infinite` },
          }}
        />
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
        {/* phones don't see the left panel, so the logo goes above the form instead */}
        <Box component="img" src="/retain-logo.png" alt="Retain" sx={{ display: { md: 'none' }, height: 32, mb: 3 }} />
        <Card sx={{ width: '100%', maxWidth: 440, ...riseIn(0.15) }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>{children}</CardContent>
        </Card>
      </Box>
    </Box>
  );
}
