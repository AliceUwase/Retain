import { Box, Button, Typography } from '@mui/material';
import { CircleAlert, RotateCcw } from 'lucide-react';

// shown instead of a page when its data couldn't be loaded
export default function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
      <Box sx={{ color: 'error.main' }}>
        <CircleAlert size={32} />
      </Box>
      <Typography variant="h2" sx={{ mt: 1.5 }}>
        Something went wrong
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        We couldn't load this page. Please try again.
      </Typography>
      <Button variant="contained" startIcon={<RotateCcw size={16} />} onClick={onRetry}>
        Try again
      </Button>
    </Box>
  );
}
