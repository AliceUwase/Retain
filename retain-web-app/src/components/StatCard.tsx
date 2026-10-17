import { Box, Card, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string;
  caption: ReactNode; // small line under the number
}

export default function StatCard({ title, icon, value, caption }: StatCardProps) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', color: 'text.secondary' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{title}</Typography>
        {icon}
      </Stack>
      <Typography sx={{ mt: 2, fontSize: { xs: '1.75rem', sm: '2rem' }, fontWeight: 600 }}>{value}</Typography>
      <Box sx={{ mt: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>{caption}</Box>
    </Card>
  );
}
