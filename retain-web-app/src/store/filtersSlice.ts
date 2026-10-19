import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import type { PaymentMethod } from '../types';

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

export const PAGE_SIZE = 10; // sent to the API as `limit`

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
