'use client';

import { formatMonth, monthOf } from '@/lib/derive/dates';
import { useToday } from './use-today';

/** Points earned in the current calendar month, worked out in the browser. */
export function PointsThisMonth({ entries }: { entries: { date: string; points: number }[] }) {
  const today = useToday();
  if (!today) return <span className="inline-block h-5 w-24 rounded bg-surface-2" aria-hidden="true" />;
  const month = monthOf(today);
  const sum = entries.filter((e) => monthOf(e.date) === month).reduce((s, e) => s + e.points, 0);
  return (
    <span>
      <span className="font-mono font-medium text-text tabular">+{sum}</span>{' '}
      <span className="text-muted">in {formatMonth(month)}</span>
    </span>
  );
}
