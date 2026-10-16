import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { PAGE_SIZE, setPage } from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

// totalItems = how many expenses are left after filtering
export default function Pagination({ totalItems }: { totalItems: number }) {
  const page = useAppSelector((state) => state.filters.page);
  const dispatch = useAppDispatch();
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // e.g. you delete the last expense on page 3, so page 3 no longer exists
  useEffect(() => {
    if (page > totalPages) dispatch(setPage(totalPages));
  }, [page, totalPages, dispatch]);

  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, totalItems);
  const summary =
    totalItems <= PAGE_SIZE
      ? `Showing all ${totalItems} expense${totalItems === 1 ? '' : 's'}`
      : `Showing ${first}–${last} of ${totalItems} expenses`;

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{summary}</Typography>

      <Typography sx={{ ml: 'auto', fontSize: '0.8125rem', color: 'text.secondary' }}>
        Page {Math.min(page, totalPages)} of {totalPages}
      </Typography>
      <IconButton size="small" aria-label="Previous page" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}>
        <ChevronLeft size={18} />
      </IconButton>
      <IconButton
        size="small"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => dispatch(setPage(page + 1))}
      >
        <ChevronRight size={18} />
      </IconButton>
    </Box>
  );
}
