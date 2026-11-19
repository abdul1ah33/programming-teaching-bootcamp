'use client';

import { formatMonth, monthOf } from '@/lib/derive/dates';
import { useToday } from './use-today';

/** If a new month has started since the site was last updated, say when its report will appear. */
export function NewMonthHint({ lastMonth }: { lastMonth: string | undefined }) {
  const today = useToday();
  if (!today || !lastMonth) return null;
  const current = monthOf(today);
  if (current <= lastMonth) return null;
  return (
    <p className="mb-6 rounded-md border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
      The report for {formatMonth(current)} will appear here after the next update to the site.
    </p>
  );
}
