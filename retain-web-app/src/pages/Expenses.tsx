import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FilterBar from '../components/FilterBar';
import { getCategories } from '../services/categoryService';
import type { Category } from '../types';

export default function Expenses() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <Box>
      <Typography variant="h1">Expenses</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        The everyday expense details from a glance.
      </Typography>

      <FilterBar categories={categories} />
    </Box>
  );
}
