import { describe, expect, it } from 'vitest';
import { points, rules } from '@/tests/fixtures';
import {
  activityLabel,
  pointsForSession,
  pointsForSprint,
  pointsInMonth,
  pointsLog,
  pointsSeries,
  resolvePoints,
  totalPoints,
} from './points';

describe('resolvePoints', () => {
  it('uses the stored value when present (including 0 and overrides)', () => {
    expect(resolvePoints(points('2026-11-01', { activity: 'exercise', points: 8 }), rules)).toBe(8);
    expect(resolvePoints(points('2026-11-01', { activity: 'exercise', points: 0 }), rules)).toBe(0);
  });
  it('falls back to the rule value', () => {
    expect(resolvePoints(points('2026-11-01', { activity: 'independent' }), rules)).toBe(15);
    expect(resolvePoints(points('2026-11-01', { activity: 'project' }), rules)).toBe(30);
  });
  it('custom without a value is 0', () => {
    expect(resolvePoints(points('2026-11-01', { activity: 'custom' }), rules)).toBe(0);
  });
});

const log = [
  points('2026-11-03', { activity: 'exercise', session: '1', sprint: 'sprint-0' }), // 5
  points('2026-11-03', { activity: 'challenge', session: '1', sprint: 'sprint-0' }), // 10
  points('2026-11-20', { activity: 'bugfix', sprint: 'sprint-0' }), // 5
  points('2026-12-02', { activity: 'custom', points: 7, sprint: 'sprint-1' }), // 7
];

describe('totals', () => {
  it('totalPoints sums everything', () => {
    expect(totalPoints(log, rules)).toBe(27);
    expect(totalPoints([], rules)).toBe(0);
  });
  it('pointsInMonth only counts that month', () => {
    expect(pointsInMonth(log, rules, '2026-11')).toBe(20);
    expect(pointsInMonth(log, rules, '2026-12')).toBe(7);
    expect(pointsInMonth(log, rules, '2027-01')).toBe(0);
  });
  it('per session and per sprint', () => {
    expect(pointsForSession(log, rules, '1')).toBe(15);
    expect(pointsForSession(log, rules, '2')).toBe(0);
    expect(pointsForSprint(log, rules, 'sprint-0')).toBe(20);
  });
});

describe('pointsSeries', () => {
  it('groups by day, oldest first, with a running total', () => {
    expect(pointsSeries([...log].reverse(), rules)).toEqual([
      { date: '2026-11-03', points: 15, total: 15 },
      { date: '2026-11-20', points: 5, total: 20 },
      { date: '2026-12-02', points: 7, total: 27 },
    ]);
  });
  it('is empty with no entries', () => {
    expect(pointsSeries([], rules)).toEqual([]);
  });
});

describe('pointsLog and labels', () => {
  it('is newest first with resolved points', () => {
    const l = pointsLog(log, rules);
    expect(l.map((e) => e.date)).toEqual(['2026-12-02', '2026-11-20', '2026-11-03', '2026-11-03']);
    expect(l[0]?.resolved).toBe(7);
  });
  it('labels activities from the rules', () => {
    expect(activityLabel('bugfix', rules)).toBe('Bug found and fixed');
    expect(activityLabel('custom', rules)).toBe('Other');
    expect(activityLabel('unknown', rules)).toBe('unknown');
  });
});
