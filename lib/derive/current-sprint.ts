import type { IsoMonth, Sprint } from '@/lib/model/types';
import { endOfMonth } from './dates';

const byNumber = (a: Sprint, b: Sprint) => a.number - b.number;

/**
 * The sprint being worked on now: the first In progress sprint, else the first Upcoming one,
 * else the last sprint (the journey is complete). Undefined only when there are no sprints.
 */
export function currentSprint(sprints: readonly Sprint[]): Sprint | undefined {
  const sorted = [...sprints].sort(byNumber);
  return (
    sorted.find((s) => s.status === 'in-progress') ??
    sorted.find((s) => s.status === 'upcoming') ??
    sorted[sorted.length - 1]
  );
}

/** True when every sprint is Done. */
export function journeyComplete(sprints: readonly Sprint[]): boolean {
  return sprints.length > 0 && sprints.every((s) => s.status === 'done');
}

/**
 * The sprint that was current at the end of a past month: the first sprint (by number) that
 * wasn't completed by then. Sprints marked Done without a date count as completed.
 * Returns undefined when every sprint was complete by the end of that month.
 */
export function sprintAtEndOfMonth(sprints: readonly Sprint[], month: IsoMonth): Sprint | undefined {
  const last = endOfMonth(month);
  return [...sprints].sort(byNumber).find((s) => {
    if (s.status !== 'done') return true;
    return s.completedOn !== null && s.completedOn > last;
  });
}

/** Previous and next sprint by number, for sprint-page navigation. */
export function neighbours(sprints: readonly Sprint[], slug: string): { previous?: Sprint; next?: Sprint } {
  const sorted = [...sprints].sort(byNumber);
  const i = sorted.findIndex((s) => s.slug === slug);
  if (i === -1) return {};
  return { previous: sorted[i - 1], next: sorted[i + 1] };
}
