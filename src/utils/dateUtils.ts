import { BillFrequency } from '../types';

/**
 * Calculates the next due date based on the current due date and frequency.
 * Returns ISO YYYY-MM-DD format string.
 */
export function calculateNextDueDate(
  currentDueDateStr: string,
  frequency: BillFrequency,
  customIntervalDays: number = 30
): string {
  let baseDate = new Date(currentDueDateStr);

  // If baseDate is invalid (e.g. relative string like "Tomorrow"), fallback to today
  if (isNaN(baseDate.getTime())) {
    baseDate = new Date();
  }

  const nextDate = new Date(baseDate);

  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      nextDate.setDate(nextDate.getDate() + (customIntervalDays || 30));
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate.toISOString().split('T')[0];
}

/**
 * Formats a YYYY-MM-DD date string into a user-friendly format (e.g. "Mar 15, 2026").
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return 'No due date';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats a last_seen timestamp or ISO string into a human friendly string.
 * Examples:
 * - "online" (if isOnline is true)
 * - "last seen just now" (< 1 min)
 * - "last seen 5m ago" (< 1 hr)
 * - "last seen @ 4:15 PM" (today)
 * - "last seen yesterday @ 4:15 PM" (yesterday)
 * - "last seen Aug 24 @ 4:15 PM" (older)
 */
export function formatLastSeen(lastSeen?: string | number | Date, isOnline?: boolean): string {
  if (isOnline) return 'online';
  if (!lastSeen) return 'offline';

  const date = typeof lastSeen === 'object' && lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
  if (isNaN(date.getTime())) return 'offline';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'last seen just now';
  if (diffMinutes < 60) return `last seen ${diffMinutes}m ago`;

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  const isToday = now.toDateString() === date.toDateString();
  if (isToday) return `last seen @ ${timeStr}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = yesterday.toDateString() === date.toDateString();
  if (isYesterday) return `last seen yesterday @ ${timeStr}`;

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `last seen ${monthDay} @ ${timeStr}`;
}

