import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import type { Expense, PaymentMethod } from '../types';

export type SortBy = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface FiltersState {
  search: string;
  category: string; // category id, '' means all
  paymentMethod: PaymentMethod | ''; // '' means all
  startDate: string; // 'YYYY-MM-DD', '' means no limit
  endDate: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
}

export const PAGE_SIZE = 10;

// starts on the current month
const initialState: FiltersState = {
  search: '',
  category: '',
  paymentMethod: '',
  startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  sortBy: 'date',
  sortOrder: 'desc', // newest first
  page: 1,
};

// every change except setPage goes back to page 1, so you never land on an empty page
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload;
      state.page = 1;
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | ''>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setStartDate(state, action: PayloadAction<string>) {
      state.startDate = action.payload;
      state.page = 1;
    },
    setEndDate(state, action: PayloadAction<string>) {
      state.endDate = action.payload;
      state.page = 1;
    },
    setSortBy(state, action: PayloadAction<SortBy>) {
      state.sortBy = action.payload;
      state.page = 1;
    },
    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.sortOrder = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    // "Clear filters": removes every filter, month included, but keeps the sort
    clearFilters(state) {
      return { ...initialState, startDate: '', endDate: '', sortBy: state.sortBy, sortOrder: state.sortOrder };
    },
    // back to how it started (this month, newest first), used on sign out
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setStartDate,
  setEndDate,
  setSortBy,
  setSortOrder,
  setPage,
  clearFilters,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// the filtered, sorted list (not split into pages yet)
export function applyFilters(expenses: Expense[], filters: FiltersState): Expense[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = expenses.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search) && !e.notes?.toLowerCase().includes(search)) return false;
    if (filters.category && e.categoryId !== filters.category) return false;
    if (filters.paymentMethod && e.paymentMethod !== filters.paymentMethod) return false;
    // 'YYYY-MM-DD' strings compare correctly as text
    if (filters.startDate && e.date < filters.startDate) return false;
    if (filters.endDate && e.date > filters.endDate) return false;
    return true;
  });

  const direction = filters.sortOrder === 'asc' ? 1 : -1;
  return filtered.sort((a, b) => {
    const diff = filters.sortBy === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date);
    return diff * direction;
  });
}

// just the expenses for the current page
export function getPage(expenses: Expense[], page: number): Expense[] {
  const start = (page - 1) * PAGE_SIZE;
  return expenses.slice(start, start + PAGE_SIZE);
}
