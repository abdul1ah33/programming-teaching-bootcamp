'use client';

import { Paperclip, Presentation } from 'lucide-react';
import { daysBetween, formatDate } from '@/lib/derive/dates';
import { currentSession } from '@/lib/derive/sessions';
import type { Session } from '@/lib/model/types';
import { useToday } from '../use-today';
import { Tile } from './tiles';

export type CurrentLessonItem = Pick<Session, 'slug' | 'number' | 'title' | 'date' | 'status' | 'sprint'> & {
  fileCount: number;
};

function when(date: string, today: string): string {
  const d = daysBetween(date, today);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

/** Today's lesson, or the last one that happened: tap to get its notes, files and homework. */
export function CurrentLessonTile({ lessons }: { lessons: CurrentLessonItem[] }) {
  const today = useToday();
  const slug = today
    ? currentSession(
        lessons.map((s): Session => ({ ...s, files: [], homework: null, links: [] })),
        today,
      )?.slug
    : undefined;
  const lesson = lessons.find((s) => s.slug === slug);

  return (
    <Tile
      href={lesson ? `/sessions/${lesson.slug}` : '/sessions'}
      label="Current lesson"
      icon={<Presentation className="size-4" aria-hidden="true" />}
      className="min-h-[13rem]"
    >
      <span className="mt-auto block pt-8" aria-live="polite">
        {today === null ? (
          <span className="block h-12 w-40 rounded-md bg-surface-2" aria-hidden="true" />
        ) : lesson ? (
          <>
            <span className="block font-serif text-5xl font-medium leading-none tracking-[-0.02em] sm:text-6xl">
              {when(lesson.date, today)}
            </span>
            <span className="mt-3 block text-lg font-medium">{formatDate(lesson.date, 'long').replace(/ \d{4}$/, '')}</span>
            <span className="mt-1 flex items-center gap-3">
              <span className="min-w-0 truncate text-muted">{lesson.title}</span>
              {lesson.fileCount > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-tint px-2.5 py-0.5 text-sm font-medium text-primary-hover dark:text-primary">
                  <Paperclip className="size-3.5" aria-hidden="true" />
                  {lesson.fileCount} {lesson.fileCount === 1 ? 'file' : 'files'}
                </span>
              )}
            </span>
          </>
        ) : (
          <>
            <span className="block font-serif text-4xl font-medium leading-none sm:text-5xl">No lessons yet</span>
            <span className="mt-3 block text-muted">Your first lesson will show here</span>
          </>
        )}
      </span>
    </Tile>
  );
}
