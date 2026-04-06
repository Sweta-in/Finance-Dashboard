import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format ISO date string to "15 Mar 2025"
 */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format "2025-03" → "Mar 2025"
 */
export function formatMonth(monthStr: string): string {
  try {
    // Month strings may come as "2025-03" or "March 2025" etc.
    if (/^\d{4}-\d{2}$/.test(monthStr)) {
      return format(parseISO(`${monthStr}-01`), 'MMM yyyy');
    }
    // Try parsing directly
    return format(parseISO(monthStr), 'MMM yyyy');
  } catch {
    return monthStr;
  }
}

/**
 * Format ISO date string to relative form: "3 days ago"
 */
export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}
