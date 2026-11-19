'use client';

import { ChipFilter, SelectFilter } from '@/components/ui/filter';
import { EmptyState } from '@/components/ui/primitives';
import { formatMonth, monthOf } from '@/lib/derive/dates';
import type { Session } from '@/lib/model/types';
import { SessionRow } from './session-row';
import { useQueryState } from './use-query-state';

export interface TimelineProps {
  sessions: Session[];
  sprints: { slug: string; label: string }[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Done' },
  { value: 'planned', label: 'Coming up' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** The list itself, grouped by month. Used both with and without filters. */
export function TimelineList({ sessions, sprintLabels }: { sessions: Session[]; sprintLabels: Record<string, string> }) {
  const groups: { month: string; items: Session[] }[] = [];
  for (const s of sessions) {
    const m = monthOf(s.date);
    const last = groups.at(-1);
    if (last?.month === m) last.items.push(s);
    else groups.push({ month: m, items: [s] });
  }
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.month} aria-labelledby={`m-${g.month}`}>
          <h2 id={`m-${g.month}`} className="mb-2 flex items-baseline gap-3 border-b border-border pb-2">
            <span className="font-serif text-xl font-medium">{formatMonth(g.month)}</span>
            <span className="font-mono text-xs text-muted tabular">{g.items.length}</span>
          </h2>
          <div className="divide-y divide-border">
            {g.items.map((s) => (
              <SessionRow key={s.slug} session={s} sprintLabel={sprintLabels[s.sprint]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function SessionsTimeline({ sessions, sprints }: TimelineProps) {
  const [sprint, setSprint] = useQueryState('sprint');
  const [status, setStatus] = useQueryState('status');
  const labels = Object.fromEntries(sprints.map((s) => [s.slug, s.label]));

  const bySprint = sessions.filter((s) => sprint === 'all' || s.sprint === sprint);
  const shown = bySprint.filter((s) => status === 'all' || s.status === status);
  const count = (st: string) => bySprint.filter((s) => st === 'all' || s.status === st).length;
  const usedSprints = sprints.filter((sp) => sessions.some((s) => s.sprint === sp.slug));

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end sm:justify-between">
        <SelectFilter
          id="sprint-filter"
          label="Sprint"
          value={sprint}
          onChange={setSprint}
          options={[{ value: 'all', label: 'All sprints' }, ...usedSprints.map((s) => ({ value: s.slug, label: s.label }))]}
        />
        <ChipFilter
          label="Show"
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS.map((o) => ({ ...o, count: count(o.value) }))}
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} lessons shown
      </p>
      {shown.length > 0 ? (
        <TimelineList sessions={shown} sprintLabels={labels} />
      ) : (
        <EmptyState title="No lessons match">
          <button type="button" className="font-medium text-primary underline underline-offset-2" onClick={() => { setSprint('all'); setStatus('all'); }}>
            Show all lessons
          </button>
        </EmptyState>
      )}
    </div>
  );
}
