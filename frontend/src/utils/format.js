import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr, fmt = 'MMM yyyy') {
  if (!dateStr) return '';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return isValid(d) ? format(d, fmt) : '';
  } catch {
    return '';
  }
}

export function truncate(str, n = 120) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n).trim() + '…' : str;
}
