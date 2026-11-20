'use client';

import { CalendarDays } from 'lucide-react';
import { daysBetween, formatDate } from '@/lib/derive/dates';
import { nextSession } from '@/lib/derive/sessions';
import type { Session } from '@/lib/model/types';
import { useToday } from '../use-today';
import { Tile } from './tiles';

export type LessonItem = Pick<Session, 'slug' | 'number' | 'title' | 'date' | 'status' | 'sprint'>;

function when(date: string, today: string): string {
  const d = daysBetween(today, date);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  return `In ${d} days`;
}

/** The big green tile. Works out the next lesson in the browser so it's always current. */
export function NextLessonTile({ lessons }: { lessons: LessonItem[] }) {
  const today = useToday();
  const slug = today
    ? nextSession(
        lessons.map((s): Session => ({ ...s, files: [], homework: null, links: [] })),
        today,
      )?.slug
    : undefined;
  const next = lessons.find((s) => s.slug === slug);

  return (
    <Tile
      href={next ? `/sessions/${next.slug}` : '/sessions'}
      label="Next lesson"
      icon={<CalendarDays className="size-4" aria-hidden="true" />}
      variant="solid"
      className="min-h-[13rem]"
    >
      <span className="mt-auto block pt-8" aria-live="polite">
        {today === null ? (
          <span className="block h-12 w-40 rounded-md bg-on-primary/15" aria-hidden="true" />
        ) : next ? (
          <>
            <span className="block font-serif text-5xl font-medium leading-none tracking-[-0.02em] sm:text-6xl">
              {when(next.date, today)}
            </span>
            <span className="mt-3 block text-lg font-medium">{formatDate(next.date, 'long').replace(/ \d{4}$/, '')}</span>
            <span className="mt-1 block truncate text-on-primary">{next.title}</span>
          </>
        ) : (
          <>
            <span className="block font-serif text-4xl font-medium leading-none sm:text-5xl">Not booked yet</span>
            <span className="mt-3 block text-on-primary">See all lessons</span>
          </>
        )}
      </span>
    </Tile>
  );
}
