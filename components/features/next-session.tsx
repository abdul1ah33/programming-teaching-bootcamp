'use client';

import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { formatDate, relativeDay } from '@/lib/derive/dates';
import { nextSession } from '@/lib/derive/sessions';
import type { Session } from '@/lib/model/types';
import { useToday } from './use-today';

export type NextSessionItem = Pick<Session, 'slug' | 'number' | 'title' | 'date' | 'status' | 'sprint'> & {
  sprintLabel: string;
};

/**
 * Works out the next session in the browser from today's date, so it is right even if the site
 * hasn't been rebuilt for a while.
 */
export function NextSession({ sessions, schedule }: { sessions: NextSessionItem[]; schedule: string }) {
  const today = useToday();
  const nextSlug = today
    ? nextSession(
        sessions.map((s): Session => ({ ...s, files: [], homework: null, links: [] })),
        today,
      )?.slug
    : undefined;
  const next = sessions.find((s) => s.slug === nextSlug);

  return (
    <div className="flex h-full flex-col p-5">
      <p className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        Next session
      </p>
      <div className="mt-3 min-h-[4.5rem]" aria-live="polite">
        {today === null ? (
          <div aria-hidden="true" className="space-y-2">
            <div className="h-5 w-32 rounded bg-surface-2" />
            <div className="h-4 w-48 rounded bg-surface-2" />
          </div>
        ) : next ? (
          <Link href={`/sessions/${next.slug}`} className="group block">
            <p className="font-mono text-lg font-medium text-text tabular">
              {formatDate(next.date, 'long')}
            </p>
            <p className="mt-0.5 text-sm text-primary-hover dark:text-primary">{capitalise(relativeDay(next.date, today))}</p>
            <p className="mt-2 text-sm text-text group-hover:underline">
              <span className="font-mono text-muted tabular">#{next.number}</span> {next.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{next.sprintLabel}</p>
          </Link>
        ) : (
          <div>
            <p className="text-sm font-medium text-text">Nothing booked yet.</p>
            <p className="mt-1 text-sm text-muted">The next session will appear here once it’s planned.</p>
          </div>
        )}
      </div>
      {schedule && <p className="mt-auto border-t border-border pt-3 text-xs text-muted">{schedule}</p>}
    </div>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
