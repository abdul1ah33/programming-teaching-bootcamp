'use client';

import { CheckCheck, NotebookPen } from 'lucide-react';
import { daysBetween, formatDate } from '@/lib/derive/dates';
import { useToday } from '../use-today';
import { Tile } from './tiles';

export interface HomeworkItem {
  sessionSlug: string;
  description: string;
  dueDate: string | null;
}

function due(date: string, today: string | null): { text: string; late: boolean } {
  if (!today) return { text: `Due ${formatDate(date, 'day-month')}`, late: false };
  const d = daysBetween(today, date);
  if (d < 0) return { text: 'Overdue', late: true };
  if (d === 0) return { text: 'Due today', late: false };
  if (d === 1) return { text: 'Due tomorrow', late: false };
  return { text: `Due in ${d} days`, late: false };
}

/** Homework still to do, soonest first; a calm "all done" when there's nothing. */
export function HomeworkTile({ items }: { items: HomeworkItem[] }) {
  const today = useToday();
  const first = items[0];

  if (!first) {
    return (
      <Tile href="/sessions" label="Homework" icon={<NotebookPen className="size-4" aria-hidden="true" />}>
        <span className="mt-auto flex items-end justify-between gap-4 pt-8">
          <span className="font-serif text-4xl font-medium leading-none">All done</span>
          <span className="grid size-12 place-items-center rounded-full bg-primary-tint text-primary">
            <CheckCheck className="size-6" aria-hidden="true" />
          </span>
        </span>
      </Tile>
    );
  }

  const d = first.dueDate ? due(first.dueDate, today) : { text: 'To do', late: false };
  return (
    <Tile href={`/sessions/${first.sessionSlug}`} label="Homework" icon={<NotebookPen className="size-4" aria-hidden="true" />}>
      <span className="mt-auto block pt-8">
        <span className={`block font-serif text-4xl font-medium leading-none ${d.late ? 'text-danger' : ''}`}>{d.text}</span>
        <span className="mt-3 line-clamp-2 block text-muted">{first.description}</span>
        {items.length > 1 && (
          <span className="mt-2 inline-block rounded-full bg-primary-tint px-2.5 py-0.5 text-sm font-medium text-primary-hover dark:text-primary">
            +{items.length - 1} more
          </span>
        )}
      </span>
    </Tile>
  );
}
