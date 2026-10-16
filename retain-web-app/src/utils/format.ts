import dayjs from 'dayjs';

const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 1850 -> "RWF 1,850.00", -140 -> "−RWF 140.00"
export function formatMoney(amount: number): string {
  return `${amount < 0 ? '−' : ''}RWF ${money.format(Math.abs(amount))}`;
}

// '2026-09-28' -> "Sep 28"
export function formatShortDate(date: string): string {
  return dayjs(date).format('MMM D');
}

// '2026-09-28' -> "September 28, 2026"
export function formatLongDate(date: string): string {
  return dayjs(date).format('MMMM D, YYYY');
}

// ISO timestamp -> "Sep 28, 2026 · 8:42 PM"
export function formatDateTime(timestamp: string): string {
  return dayjs(timestamp).format('MMM D, YYYY · h:mm A');
}
