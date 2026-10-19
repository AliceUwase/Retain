// true for a 'YYYY-MM-DD' that exists on the calendar; a regex alone would also accept '2026-02-30'
export function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  // JavaScript rolls impossible dates over (Feb 30 becomes Mar 2), so a changed month or day means it wasn't real
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// true for a 'YYYY-MM' with a month from 01 to 12
export function isRealMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function toMonth(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

// the server's current month, used only when the client doesn't send one
export function currentMonth(): string {
  const now = new Date();
  return toMonth(now.getFullYear(), now.getMonth());
}

// shiftMonth('2026-01', -1) gives '2025-12'
export function shiftMonth(month: string, by: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + by, 1)); // Date handles moving past January or December
  return toMonth(date.getUTCFullYear(), date.getUTCMonth());
}

// a MongoDB condition for "dated in this month"; '-31' works for every month, because
// text like '2026-11-31' still sorts after the last real day and before the next month
export function monthRange(month: string) {
  return { $gte: `${month}-01`, $lte: `${month}-31` };
}

// 30 for '2026-11', 29 for '2024-02'
export function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate(); // day 0 of next month = last day of this one
}
