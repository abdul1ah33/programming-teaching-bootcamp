'use client';

import { NotebookPen } from 'lucide-react';
import Link from 'next/link';
import { daysBetween, formatDate } from '@/lib/derive/dates';
import { useToday } from './use-today';

export interface HomeworkItem {
  sessionSlug: string;
  sessionTitle: string;
  description: string;
  dueDate: string | null;
}

function dueText(due: string, today: string | null): { text: string; late: boolean } {
  const when = formatDate(due, 'long').replace(/ \d{4}$/, '');
  if (!today) return { text: `Due ${when}`, late: false };
  const d = daysBetween(today, due);
  if (d < 0) return { text: `Was due ${when}`, late: true };
  if (d === 0) return { text: 'Due today', late: false };
  if (d === 1) return { text: 'Due tomorrow', late: false };
  return { text: `Due ${when} (in ${d} days)`, late: false };
}

/** The homework that's still to do, soonest first. */
export function HomeworkCard({ items }: { items: HomeworkItem[] }) {
  const today = useToday();
  const first = items[0];
  return (
    <div className="flex h-full flex-col p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted">
        <NotebookPen className="size-4" aria-hidden="true" />
        Homework
      </p>
      {first ? (
        <Link href={`/sessions/${first.sessionSlug}`} className="group mt-3 block">
          {first.dueDate && (
            <p className={`text-lg font-semibold ${dueText(first.dueDate, today).late ? 'text-danger' : 'text-text'}`}>
              {dueText(first.dueDate, today).text}
            </p>
          )}
          <p className="mt-1 line-clamp-3 text-[0.95rem] leading-relaxed text-text group-hover:underline">{first.description}</p>
          <p className="mt-2 text-sm text-muted">From the lesson “{first.sessionTitle}”</p>
          {items.length > 1 && <p className="mt-2 text-sm font-medium text-primary">+ {items.length - 1} more to do</p>}
        </Link>
      ) : (
        <div className="mt-3">
          <p className="text-lg font-semibold text-text">Nothing to do right now.</p>
          <p className="mt-1 text-sm text-muted">New homework shows up here after a lesson.</p>
        </div>
      )}
    </div>
  );
}
