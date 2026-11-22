/**
 * Date utilities for local timezone handling.
 * Ensures consistent calendar dates across the app without UTC conversion shifts.
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + days);
  return getLocalDateString(dateObj);
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const today = getLocalDateString();
    const yesterday = addDaysToDateString(today, -1);
    const tomorrow = addDaysToDateString(today, 1);

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    if (dateStr === tomorrow) return 'Tomorrow';

    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatHeaderDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDMY(dateStr: string, withSpaces: boolean = true): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return withSpaces ? `${day} - ${month} - ${year}` : `${day}-${month}-${year}`;
}
