import { PHASES } from '@/lib/model/enums';
import type {
  Badge,
  BadgeRule,
  IsoDate,
  PointsEntry,
  PointsRule,
  Project,
  Session,
  Sprint,
} from '@/lib/model/types';
import { daysBetween } from './dates';
import { activityLabel, resolvePoints } from './points';

export interface BadgeInputs {
  badges: readonly Badge[];
  sprints: readonly Sprint[];
  sessions: readonly Session[];
  projects: readonly Project[];
  points: readonly PointsEntry[];
  rules: readonly PointsRule[];
}

export interface BadgeStatus {
  badge: Badge;
  unlocked: boolean;
  /** When it was unlocked, derived from content. Null if locked, or unlocked but the date isn't known. */
  unlockedOn: IsoDate | null;
  /** For count-based rules: how far along. */
  progress: { current: number; target: number } | null;
  /** Plain sentence shown on a locked badge. */
  howToUnlock: string;
}

/** The date on which the n-th item (1-based) happened, given the items' dates. */
function nthDate(dates: readonly (IsoDate | null)[], n: number): IsoDate | null {
  const known = dates.filter((d): d is IsoDate => d !== null).sort();
  return known[n - 1] ?? null;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function evaluate(rule: BadgeRule, input: BadgeInputs): Omit<BadgeStatus, 'badge'> {
  switch (rule.kind) {
    case 'manual': {
      const unlocked = rule.earnedOn !== null;
      return {
        unlocked,
        unlockedOn: rule.earnedOn,
        progress: null,
        howToUnlock: rule.howToEarn.trim() || 'Awarded by your teacher.',
      };
    }

    case 'totalPoints': {
      const sorted = [...input.points].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug));
      let running = 0;
      let unlockedOn: IsoDate | null = null;
      for (const e of sorted) {
        running += resolvePoints(e, input.rules);
        if (unlockedOn === null && running >= rule.n) unlockedOn = e.date;
      }
      // A later negative correction can bring the total back under the target: then it's locked again.
      const unlocked = running >= rule.n;
      return {
        unlocked,
        unlockedOn: unlocked ? unlockedOn : null,
        progress: { current: Math.max(0, running), target: rule.n },
        howToUnlock: `Reach ${rule.n} points.`,
      };
    }

    case 'sessionsDone': {
      const done = input.sessions.filter((s) => s.status === 'done');
      const unlocked = done.length >= rule.n;
      return {
        unlocked,
        unlockedOn: unlocked ? nthDate(done.map((s) => s.date), rule.n) : null,
        progress: { current: done.length, target: rule.n },
        howToUnlock: `Complete ${plural(rule.n, 'session')}.`,
      };
    }

    case 'projectsFinished': {
      const finished = input.projects.filter((p) => p.status === 'finished');
      const unlocked = finished.length >= rule.n;
      return {
        unlocked,
        unlockedOn: unlocked ? nthDate(finished.map((p) => p.finishedOn), rule.n) : null,
        progress: { current: finished.length, target: rule.n },
        howToUnlock: `Finish ${plural(rule.n, 'project')}.`,
      };
    }

    case 'activityCount': {
      const matching = input.points.filter((e) => e.activity === rule.activity);
      const unlocked = matching.length >= rule.n;
      const label = activityLabel(rule.activity, input.rules);
      return {
        unlocked,
        unlockedOn: unlocked ? nthDate(matching.map((e) => e.date), rule.n) : null,
        progress: { current: matching.length, target: rule.n },
        howToUnlock: `Earn points for “${label}” ${plural(rule.n, 'time')}.`,
      };
    }

    case 'sprintCompleted': {
      const sprint = input.sprints.find((s) => s.number === rule.sprint);
      const unlocked = sprint?.status === 'done';
      return {
        unlocked,
        unlockedOn: unlocked ? (sprint?.completedOn ?? null) : null,
        progress: null,
        howToUnlock: sprint ? `Complete Sprint ${sprint.number}: ${sprint.title}.` : `Complete Sprint ${rule.sprint}.`,
      };
    }

    case 'phaseCompleted': {
      const inPhase = input.sprints.filter((s) => s.phase === rule.phase);
      const done = inPhase.filter((s) => s.status === 'done');
      const unlocked = inPhase.length > 0 && done.length === inPhase.length;
      const dates = done.map((s) => s.completedOn);
      const unlockedOn = unlocked && dates.every((d) => d !== null) ? ([...dates].sort().at(-1) ?? null) : null;
      const phaseLabel = PHASES.find((p) => p.value === rule.phase)?.label ?? rule.phase;
      return {
        unlocked,
        unlockedOn,
        progress: inPhase.length > 1 ? { current: done.length, target: inPhase.length } : null,
        howToUnlock:
          inPhase.length === 1
            ? `Complete the ${phaseLabel} phase.`
            : `Complete all ${inPhase.length} sprints in the ${phaseLabel} phase.`,
      };
    }
  }
}

/** Evaluates every badge against the content. Keeps the badges' order. */
export function evaluateBadges(input: BadgeInputs): BadgeStatus[] {
  return input.badges.map((badge) => ({ badge, ...evaluate(badge.rule, input) }));
}

/** Unlocked badges, most recently unlocked first (undated ones last, in wall order). */
export function unlockedBadges(statuses: readonly BadgeStatus[]): BadgeStatus[] {
  return statuses
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.unlocked)
    .sort((a, b) => {
      const da = a.s.unlockedOn;
      const db = b.s.unlockedOn;
      if (da && db) return db.localeCompare(da) || a.i - b.i;
      if (da) return -1;
      if (db) return 1;
      return a.i - b.i;
    })
    .map(({ s }) => s);
}

export function latestBadge(statuses: readonly BadgeStatus[]): BadgeStatus | undefined {
  return unlockedBadges(statuses)[0];
}

/** A badge counts as "new" for `days` days after it was unlocked (and not before). */
export function isNewBadge(status: BadgeStatus, today: IsoDate, days = 14): boolean {
  if (!status.unlocked || status.unlockedOn === null) return false;
  const age = daysBetween(status.unlockedOn, today);
  return age >= 0 && age < days;
}
