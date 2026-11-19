import type { HomeworkStatus, ProjectStatus, SessionStatus, SprintStatus } from '@/lib/model/enums';
import { Pill, type Tone } from './primitives';

type Status = SprintStatus | SessionStatus | HomeworkStatus | ProjectStatus;

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  upcoming: { label: 'Upcoming', tone: 'muted' },
  'in-progress': { label: 'In progress', tone: 'green' },
  done: { label: 'Done', tone: 'solid' },
  planned: { label: 'Planned', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  assigned: { label: 'To do', tone: 'warn' },
  reviewed: { label: 'Reviewed', tone: 'green' },
  finished: { label: 'Finished', tone: 'solid' },
};

/** The one consistent way to show any status on the site. */
export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const s = STATUS[status];
  return (
    <Pill tone={s.tone} className={className}>
      {s.label}
    </Pill>
  );
}
