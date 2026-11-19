import type { IsoDate, IsoMonth, PointsEntry, PointsRule } from '@/lib/model/types';
import { CUSTOM_ACTIVITY } from '@/lib/model/points-rules';
import { monthOf } from './dates';

/** Points for one entry: the stored value, else the rule's value, else 0. */
export function resolvePoints(entry: PointsEntry, rules: readonly PointsRule[]): number {
  if (entry.points !== null) return entry.points;
  if (entry.activity === CUSTOM_ACTIVITY) return 0;
  return rules.find((r) => r.key === entry.activity)?.points ?? 0;
}

export function totalPoints(entries: readonly PointsEntry[], rules: readonly PointsRule[]): number {
  return entries.reduce((sum, e) => sum + resolvePoints(e, rules), 0);
}

export function pointsInMonth(entries: readonly PointsEntry[], rules: readonly PointsRule[], month: IsoMonth): number {
  return totalPoints(
    entries.filter((e) => monthOf(e.date) === month),
    rules,
  );
}

export function pointsForSession(entries: readonly PointsEntry[], rules: readonly PointsRule[], session: string): number {
  return totalPoints(
    entries.filter((e) => e.session === session),
    rules,
  );
}

export function pointsForSprint(entries: readonly PointsEntry[], rules: readonly PointsRule[], sprint: string): number {
  return totalPoints(
    entries.filter((e) => e.sprint === sprint),
    rules,
  );
}

export interface PointsDay {
  date: IsoDate;
  /** Points earned that day. */
  points: number;
  /** Running total at the end of that day. */
  total: number;
}

/** One point per day with activity, oldest first, with a running total — for the chart. */
export function pointsSeries(entries: readonly PointsEntry[], rules: readonly PointsRule[]): PointsDay[] {
  const perDay = new Map<IsoDate, number>();
  for (const e of entries) perDay.set(e.date, (perDay.get(e.date) ?? 0) + resolvePoints(e, rules));
  let total = 0;
  return [...perDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, points]) => {
      total += points;
      return { date, points, total };
    });
}

/** The log, newest first, with resolved points. */
export function pointsLog(
  entries: readonly PointsEntry[],
  rules: readonly PointsRule[],
): (PointsEntry & { resolved: number })[] {
  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    .map((e) => ({ ...e, resolved: resolvePoints(e, rules) }));
}

/** Label for an activity key, using the settings rules. */
export function activityLabel(activity: string, rules: readonly PointsRule[]): string {
  if (activity === CUSTOM_ACTIVITY) return 'Other';
  return rules.find((r) => r.key === activity)?.label ?? activity;
}
