// true for a 'YYYY-MM-DD' that exists on the calendar; a regex alone would also accept '2026-02-30'
export function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [year, month, day] = match.slice(1).map(Number);
  // JavaScript rolls impossible dates over (Feb 30 becomes Mar 2), so a changed month or day means it wasn't real
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
