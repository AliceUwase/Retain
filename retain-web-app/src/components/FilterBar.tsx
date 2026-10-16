import { Box, Button, Card, CardContent, Chip, InputAdornment, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import {
  clearFilters,
  setCategory,
  setEndDate,
  setPaymentMethod,
  setSearch,
  setSortBy,
  setSortOrder,
  setStartDate,
  type SortBy,
} from '../store/filtersSlice';
import { useAppDispatch, useAppSelector } from '../store/store';
import { PAYMENT_METHODS, type Category, type PaymentMethod } from '../types';

// a picked date as 'YYYY-MM-DD', or '' when cleared
function toDateString(value: Dayjs | null): string {
  return value && value.isValid() ? value.format('YYYY-MM-DD') : '';
}

// "October 2026" for a whole month, otherwise "Oct 3 – Oct 12, 2026"
function dateRangeLabel(startDate: string, endDate: string): string {
  const start = startDate ? dayjs(startDate) : null;
  const end = endDate ? dayjs(endDate) : null;

  if (start && end) {
    const wholeMonth = start.isSame(start.startOf('month'), 'day') && end.isSame(start.endOf('month'), 'day');
    return wholeMonth ? start.format('MMMM YYYY') : `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
  }
  if (start) return `From ${start.format('MMM D, YYYY')}`;
  return `Until ${end!.format('MMM D, YYYY')}`;
}

export default function FilterBar({ categories }: { categories: Category[] }) {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  // one chip per active filter, each with its own ×
  const chips: { key: string; label: string; onDelete: () => void }[] = [];
  if (filters.search.trim()) {
    chips.push({ key: 'search', label: `"${filters.search.trim()}"`, onDelete: () => dispatch(setSearch('')) });
  }
  if (filters.category) {
    const name = categories.find((c) => c.id === filters.category)?.name ?? 'Category';
    chips.push({ key: 'category', label: name, onDelete: () => dispatch(setCategory('')) });
  }
  if (filters.paymentMethod) {
    chips.push({ key: 'payment', label: filters.paymentMethod, onDelete: () => dispatch(setPaymentMethod('')) });
  }
  if (filters.startDate || filters.endDate) {
    chips.push({
      key: 'dates',
      label: dateRangeLabel(filters.startDate, filters.endDate),
      onDelete: () => {
        dispatch(setStartDate(''));
        dispatch(setEndDate(''));
      },
    });
  }

  // clicking the active sort flips its direction, clicking the other one switches to it
  function handleSort(field: SortBy) {
    if (filters.sortBy === field) {
      dispatch(setSortOrder(filters.sortOrder === 'desc' ? 'asc' : 'desc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder('desc'));
    }
  }

  function sortLabel(field: SortBy): string {
    if (filters.sortBy !== field) return field === 'date' ? 'Date' : 'Amount';
    if (field === 'date') return filters.sortOrder === 'desc' ? 'Date · newest first' : 'Date · oldest first';
    return filters.sortOrder === 'desc' ? 'Amount · highest first' : 'Amount · lowest first';
  }

  function sortIcon(field: SortBy) {
    if (filters.sortBy !== field) return <ArrowUpDown size={14} />;
    return filters.sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />;
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        {/* search wraps onto its own row on smaller screens */}
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr 1fr 1fr' },
          }}
        >
          <TextField
            size="small"
            placeholder="Search title or notes"
            value={filters.search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            sx={{ gridColumn: { sm: '1 / -1', lg: 'auto' } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Category"
            value={filters.category}
            onChange={(e) => dispatch(setCategory(e.target.value))}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Payment method"
            value={filters.paymentMethod}
            onChange={(e) => dispatch(setPaymentMethod(e.target.value as PaymentMethod | ''))}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="">All methods</MenuItem>
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="From"
            format="MMM D, YYYY"
            value={filters.startDate ? dayjs(filters.startDate) : null}
            onChange={(value) => dispatch(setStartDate(toDateString(value)))}
            maxDate={filters.endDate ? dayjs(filters.endDate) : undefined}
            slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
          />
          <DatePicker
            label="To"
            format="MMM D, YYYY"
            value={filters.endDate ? dayjs(filters.endDate) : null}
            onChange={(value) => dispatch(setEndDate(toDateString(value)))}
            minDate={filters.startDate ? dayjs(filters.startDate) : undefined}
            slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
          />
        </Box>

        <Stack direction="row" sx={{ mt: 2, gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            {chips.length === 0 ? 'No filters' : `${chips.length} active filter${chips.length === 1 ? '' : 's'}`}
          </Typography>

          {chips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              onDelete={chip.onDelete}
              size="small"
              sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 500, '& .MuiChip-deleteIcon': { color: 'primary.main' } }}
            />
          ))}

          {chips.length > 0 && (
            <Link component="button" underline="hover" onClick={() => dispatch(clearFilters())} sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
              Clear filters
            </Link>
          )}

          <Stack direction="row" sx={{ ml: 'auto', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Sort by</Typography>
            {(['date', 'amount'] as SortBy[]).map((field) => {
              const active = filters.sortBy === field;
              return (
                <Button
                  key={field}
                  size="small"
                  variant="outlined"
                  endIcon={sortIcon(field)}
                  onClick={() => handleSort(field)}
                  sx={
                    active
                      ? { bgcolor: 'primary.light', borderColor: 'primary.light', color: 'primary.main' }
                      : { borderColor: 'divider', color: 'text.secondary' }
                  }
                >
                  {sortLabel(field)}
                </Button>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
