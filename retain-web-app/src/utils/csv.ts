import dayjs from 'dayjs';
import type { Category, Expense } from '../types';

// wraps a value in quotes when it has a comma, quote or line break
function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// downloads the given expenses as a .csv file that opens in Excel
export function downloadExpensesCsv(expenses: Expense[], categories: Category[]): void {
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  const header = ['Date', 'Title', 'Category', 'Payment method', 'Amount (RWF)', 'Notes'];
  // amount stays a plain number so Excel can add it up
  const rows = expenses.map((e) => [e.date, e.title, categoryName(e.categoryId), e.paymentMethod, e.amount, e.notes ?? '']);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');

  // the BOM at the start tells Excel the file is UTF-8, so accents show properly
  const BOM = String.fromCharCode(0xfeff);
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `retain-expenses-${dayjs().format('YYYY-MM-DD')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
