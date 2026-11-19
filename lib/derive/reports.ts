import type {
  IsoDate,
  IsoMonth,
  MonthlyNote,
  PointsEntry,
  PointsRule,
  Project,
  Session,
  Sprint,
} from '@/lib/model/types';
import type { BadgeStatus } from './badges';
import { currentSprint, sprintAtEndOfMonth } from './current-sprint';
import { isInMonth, monthOf, monthsBetween } from './dates';
import { resolvePoints } from './points';

/** Every month from the start date's month up to and including today's month. */
export function reportMonths(startDate: IsoDate, today: IsoDate): IsoMonth[] {
  return monthsBetween(monthOf(startDate), monthOf(today));
}

export interface ReportInputs {
  sprints: readonly Sprint[];
  sessions: readonly Session[];
  projects: readonly Project[];
  points: readonly PointsEntry[];
  rules: readonly PointsRule[];
  badges: readonly BadgeStatus[];
  notes: readonly MonthlyNote[];
}

export interface MonthReport {
  month: IsoMonth;
  /** True when the month hasn't finished yet (numbers can still change). */
  inProgress: boolean;
  sessions: {
    held: number;
    /** Everything scheduled in the month: held + still planned + cancelled. */
    planned: number;
    cancelled: number;
    list: Session[];
  };
  sprintsCompleted: Sprint[];
  /** The sprint being worked on at the end of the month (or now, for the current month). */
  currentSprint: Sprint | undefined;
  checksTicked: { sprint: Sprint; text: string; doneOn: IsoDate }[];
  projectsFinished: Project[];
  points: { earned: number; entries: number };
  badgesUnlocked: BadgeStatus[];
  note: MonthlyNote | null;
}

export function monthReport(month: IsoMonth, input: ReportInputs, today: IsoDate): MonthReport {
  const inMonth = input.sessions
    .filter((s) => isInMonth(s.date, month))
    .sort((a, b) => a.date.localeCompare(b.date) || a.number - b.number);

  const isCurrentMonth = monthOf(today) === month;

  const sprintsCompleted = input.sprints
    .filter((s) => s.status === 'done' && isInMonth(s.completedOn, month))
    .sort((a, b) => a.number - b.number);

  const checksTicked = input.sprints
    .flatMap((sprint) =>
      sprint.readyChecks
        .filter((c) => c.done && isInMonth(c.doneOn, month))
        .map((c) => ({ sprint, text: c.text, doneOn: c.doneOn as IsoDate })),
    )
    .sort((a, b) => a.doneOn.localeCompare(b.doneOn) || a.sprint.number - b.sprint.number);

  const projectsFinished = input.projects
    .filter((p) => p.status === 'finished' && isInMonth(p.finishedOn, month))
    .sort((a, b) => (a.finishedOn ?? '').localeCompare(b.finishedOn ?? ''));

  const monthPoints = input.points.filter((e) => isInMonth(e.date, month));

  return {
    month,
    inProgress: month >= monthOf(today),
    sessions: {
      held: inMonth.filter((s) => s.status === 'done').length,
      planned: inMonth.length,
      cancelled: inMonth.filter((s) => s.status === 'cancelled').length,
      list: inMonth,
    },
    sprintsCompleted,
    currentSprint: isCurrentMonth ? currentSprint(input.sprints) : sprintAtEndOfMonth(input.sprints, month),
    checksTicked,
    projectsFinished,
    points: {
      earned: monthPoints.reduce((sum, e) => sum + resolvePoints(e, input.rules), 0),
      entries: monthPoints.length,
    },
    badgesUnlocked: input.badges.filter((b) => b.unlocked && isInMonth(b.unlockedOn, month)),
    note: input.notes.find((n) => n.month === month) ?? null,
  };
}

/** True when the month has nothing to report at all (used for a gentle empty state). */
export function isEmptyReport(report: MonthReport): boolean {
  return (
    report.sessions.planned === 0 &&
    report.sprintsCompleted.length === 0 &&
    report.checksTicked.length === 0 &&
    report.projectsFinished.length === 0 &&
    report.points.entries === 0 &&
    report.badgesUnlocked.length === 0 &&
    report.note === null
  );
}
