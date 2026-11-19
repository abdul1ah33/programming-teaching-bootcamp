import type { HomeworkStatus, ProjectStatus, SessionStatus, SprintStatus } from '@/lib/model/enums';
import { Pill, type Tone } from './primitives';

type Status = SprintStatus | SessionStatus | HomeworkStatus | ProjectStatus;

/**
 * Plain words a student understands. Sprints and lessons share some status values ("done"),
 * so pass `kind` to pick the right wording.
 */
const SPRINT: Record<string, { label: string; tone: Tone }> = {
  upcoming: { label: 'Coming up', tone: 'muted' },
  'in-progress': { label: 'You’re here', tone: 'green' },
  done: { label: 'Finished', tone: 'solid' },
};
const OTHER: Record<Status, { label: string; tone: Tone }> = {
  upcoming: { label: 'Coming up', tone: 'muted' },
  'in-progress': { label: 'Working on it', tone: 'green' },
  done: { label: 'Done', tone: 'solid' },
  planned: { label: 'Coming up', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  assigned: { label: 'To do', tone: 'warn' },
  reviewed: { label: 'Checked', tone: 'green' },
  finished: { label: 'Finished', tone: 'solid' },
};

/** The one consistent way to show any status on the site. */
export function StatusPill({ status, className, kind }: { status: Status; className?: string; kind?: 'sprint' }) {
  const s = (kind === 'sprint' ? SPRINT[status] : undefined) ?? OTHER[status];
  return (
    <Pill tone={s.tone} className={className}>
      {s.label}
    </Pill>
  );
}
