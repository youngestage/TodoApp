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
