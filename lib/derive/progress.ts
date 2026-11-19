import type { Sprint } from '@/lib/model/types';

export interface SprintProgress {
  checksDone: number;
  checksTotal: number;
  /** 0–1. A sprint marked Done is always 1. */
  ratio: number;
}

export function sprintProgress(sprint: Sprint): SprintProgress {
  const checksTotal = sprint.readyChecks.length;
  const checksDone = sprint.readyChecks.filter((c) => c.done).length;
  if (sprint.status === 'done') return { checksDone, checksTotal, ratio: 1 };
  if (sprint.status === 'upcoming' || checksTotal === 0) return { checksDone, checksTotal, ratio: 0 };
  // An in-progress sprint never reaches 100% until it's marked Done.
  return { checksDone, checksTotal, ratio: Math.min(checksDone / checksTotal, 0.95) };
}

export interface OverallProgress {
  /** 0–100, whole number. */
  percent: number;
  sprintsDone: number;
  sprintsTotal: number;
  checksDone: number;
  checksTotal: number;
}

/**
 * Overall progress: every Done sprint counts fully; an in-progress sprint counts by the share of its
 * ready checks that are ticked. Mastery decides, so time spent doesn't count.
 */
export function overallProgress(sprints: readonly Sprint[]): OverallProgress {
  const sprintsTotal = sprints.length;
  if (sprintsTotal === 0) return { percent: 0, sprintsDone: 0, sprintsTotal: 0, checksDone: 0, checksTotal: 0 };
  let sum = 0;
  let checksDone = 0;
  let checksTotal = 0;
  for (const s of sprints) {
    const p = sprintProgress(s);
    sum += p.ratio;
    checksDone += p.checksDone;
    checksTotal += p.checksTotal;
  }
  const sprintsDone = sprints.filter((s) => s.status === 'done').length;
  const percent = sprintsDone === sprintsTotal ? 100 : Math.min(99, Math.floor((sum / sprintsTotal) * 100));
  return { percent, sprintsDone, sprintsTotal, checksDone, checksTotal };
}
