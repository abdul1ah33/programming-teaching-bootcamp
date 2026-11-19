import type { IsoDate, IsoMonth } from '@/lib/model/types';

/**
 * Timezone-safe helpers for "YYYY-MM-DD" date strings. ISO dates compare correctly as strings, so
 * nothing here goes through local-time Date parsing (which can shift a date by a day).
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

function parts(date: IsoDate): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y ?? 0, m ?? 1, d ?? 1];
}

/** Today's date in the viewer's local time zone, as YYYY-MM-DD. */
export function toIsoDate(now: Date): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function monthOf(date: IsoDate): IsoMonth {
  return date.slice(0, 7);
}

export function isInMonth(date: IsoDate | null, month: IsoMonth): date is IsoDate {
  return date !== null && monthOf(date) === month;
}

/** "2026-11" → "2026-12"; "2026-12" → "2027-01". */
export function nextMonth(month: IsoMonth): IsoMonth {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

export function previousMonth(month: IsoMonth): IsoMonth {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

/** Every month from `from` to `to` inclusive. Empty when `from` is after `to`. */
export function monthsBetween(from: IsoMonth, to: IsoMonth): IsoMonth[] {
  const months: IsoMonth[] = [];
  for (let m = from; m <= to; m = nextMonth(m)) months.push(m);
  return months;
}

/** Last day of a month as YYYY-MM-DD (handles leap years). */
export function endOfMonth(month: IsoMonth): IsoDate {
  const [y, m] = month.split('-').map(Number) as [number, number];
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${month}-${String(days).padStart(2, '0')}`;
}

/** "2026-11" → "November 2026". */
export function formatMonth(month: IsoMonth): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return `${MONTHS[m - 1]} ${y}`;
}

/** "2026-11-03" → "3 Nov 2026" (or "Tuesday 3 November 2026" with `long`). */
export function formatDate(date: IsoDate, style: 'short' | 'long' | 'day-month' = 'short'): string {
  const [y, m, d] = parts(date);
  const month = MONTHS[m - 1] ?? '';
  if (style === 'day-month') return `${d} ${month.slice(0, 3)}`;
  if (style === 'long') return `${weekdayOf(date)} ${d} ${month} ${y}`;
  return `${d} ${month.slice(0, 3)} ${y}`;
}

export function weekdayOf(date: IsoDate): string {
  const [y, m, d] = parts(date);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? '';
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const [y1, m1, d1] = parts(from);
  const [y2, m2, d2] = parts(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** "today", "tomorrow", "in 5 days", "yesterday", "3 days ago". */
export function relativeDay(date: IsoDate, today: IsoDate): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`;
}
