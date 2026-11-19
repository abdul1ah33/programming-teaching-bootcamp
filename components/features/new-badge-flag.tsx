'use client';

import { daysBetween } from '@/lib/derive/dates';
import { useToday } from './use-today';

const NEW_FOR_DAYS = 14;

/**
 * A small "New" tag for a badge unlocked in the last two weeks. Worked out in the browser from
 * today's date so it disappears on its own; renders nothing on the server.
 */
export function NewBadgeFlag({ unlockedOn }: { unlockedOn: string | null }) {
  const today = useToday();
  if (!today || !unlockedOn) return null;
  const age = daysBetween(unlockedOn, today);
  if (age < 0 || age >= NEW_FOR_DAYS) return null;
  return (
    <span className="badge-new inline-flex items-center rounded-full bg-primary px-1.5 py-px font-mono text-[0.65rem] font-medium uppercase tracking-[0.08em] text-on-primary">
      New
    </span>
  );
}
