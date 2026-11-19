import Link from 'next/link';
import { StatusPill } from '@/components/ui/status-pill';
import { formatDate } from '@/lib/derive/dates';
import type { Session } from '@/lib/model/types';

/** One session in a list: date, number, title, sprint and status. */
export function SessionRow({ session, sprintLabel }: { session: Session; sprintLabel?: string }) {
  const [day, month, year] = formatDate(session.date).split(' ');
  return (
    <Link
      href={`/sessions/${session.slug}`}
      className="group grid grid-cols-[3.25rem_1fr_auto] items-start gap-x-3 gap-y-1 rounded-md px-2 py-3 transition-colors duration-150 hover:bg-surface-2/70 sm:grid-cols-[4rem_1fr_auto]"
    >
      <span className="font-mono text-xs leading-tight text-muted tabular">
        <span className="block text-base font-medium text-text">{day}</span>
        {month} {year}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.95rem] font-medium text-text group-hover:underline">
          <span className="font-mono text-sm font-normal text-muted tabular">#{session.number}</span> {session.title}
        </span>
        {sprintLabel && <span className="mt-0.5 block text-xs text-muted">{sprintLabel}</span>}
      </span>
      <StatusPill status={session.status} className="mt-0.5" />
    </Link>
  );
}
