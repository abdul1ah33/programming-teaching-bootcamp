import { describe, expect, it } from 'vitest';
import { badge, points, project, rules, session, sprint } from '@/tests/fixtures';
import { evaluateBadges } from './badges';
import type { ReportInputs } from './reports';
import { isEmptyReport, monthReport, reportMonths } from './reports';

describe('reportMonths', () => {
  it('lists months from the start month to the current month inclusive', () => {
    expect(reportMonths('2026-11-02', '2027-02-14')).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
  });
  it('is just the start month when it is the current month', () => {
    expect(reportMonths('2026-11-02', '2026-11-19')).toEqual(['2026-11']);
  });
  it('is empty when the start date is in a future month', () => {
    expect(reportMonths('2027-01-05', '2026-11-19')).toEqual([]);
  });
});

function inputs(): ReportInputs {
  const sprints = [
    sprint(0, {
      status: 'done',
      completedOn: '2026-11-28',
      readyChecks: [
        { text: 'Explain an algorithm', done: true, doneOn: '2026-11-12' },
        { text: 'Trace steps', done: true, doneOn: '2026-11-28' },
        { text: 'Undated check', done: true, doneOn: null },
      ],
    }),
    sprint(1, {
      status: 'in-progress',
      readyChecks: [
        { text: 'Write a program', done: true, doneOn: '2026-12-03' },
        { text: 'Not yet', done: false, doneOn: null },
        // ticked date set but box unticked again: must not count
        { text: 'Unticked', done: false, doneOn: '2026-11-20' },
      ],
    }),
    sprint(2),
  ];
  const sessions = [
    session(1, { date: '2026-11-03', status: 'done' }),
    session(2, { date: '2026-11-07', status: 'done' }),
    session(3, { date: '2026-11-10', status: 'cancelled' }),
    session(4, { date: '2026-11-28', status: 'planned' }),
    session(5, { date: '2026-12-01', status: 'done' }),
  ];
  const projects = [
    project('sandwich', { status: 'finished', finishedOn: '2026-11-10' }),
    project('undated', { status: 'finished' }),
    project('calc', { status: 'in-progress', finishedOn: '2026-11-15' }),
  ];
  const log = [
    points('2026-11-03', { activity: 'exercise' }), // 5
    points('2026-11-05', { activity: 'bugfix' }), // 5
    points('2026-11-10', { activity: 'project' }), // 30
    points('2026-12-01', { activity: 'challenge' }), // 10
  ];
  const badges = evaluateBadges({
    badges: [
      badge('first-project', { kind: 'projectsFinished', n: 1 }),
      badge('thirty', { kind: 'totalPoints', n: 30 }),
      badge('fifty', { kind: 'totalPoints', n: 50 }),
      badge('sprint-0', { kind: 'sprintCompleted', sprint: 0 }),
    ],
    sprints,
    sessions,
    projects,
    points: log,
    rules,
  });
  const notes = [{ month: '2026-11', highlights: ['Good start'], focusNextMonth: ['Python'], messageToParents: null }];
  return { sprints, sessions, projects, points: log, rules, badges, notes };
}

describe('monthReport', () => {
  const data = inputs();

  it('counts sessions held vs planned (cancelled count as planned, not held)', () => {
    const r = monthReport('2026-11', data, '2026-12-05');
    expect(r.sessions).toMatchObject({ held: 2, planned: 4, cancelled: 1 });
    expect(r.sessions.list.map((s) => s.number)).toEqual([1, 2, 3, 4]);
  });

  it('lists sprints completed in the month and the sprint current at month end', () => {
    const r = monthReport('2026-11', data, '2026-12-05');
    expect(r.sprintsCompleted.map((s) => s.number)).toEqual([0]);
    expect(r.currentSprint?.number).toBe(1);
  });

  it('uses the live current sprint for the current month', () => {
    const r = monthReport('2026-12', data, '2026-12-05');
    expect(r.currentSprint?.number).toBe(1);
    expect(r.inProgress).toBe(true);
    expect(monthReport('2026-11', data, '2026-12-05').inProgress).toBe(false);
  });

  it('lists ready checks ticked in the month — dated, still ticked, in date order', () => {
    const r = monthReport('2026-11', data, '2026-12-05');
    expect(r.checksTicked.map((c) => c.text)).toEqual(['Explain an algorithm', 'Trace steps']);
    expect(monthReport('2026-12', data, '2026-12-05').checksTicked.map((c) => c.text)).toEqual(['Write a program']);
  });

  it('lists projects finished in the month (status Finished and dated)', () => {
    expect(monthReport('2026-11', data, '2026-12-05').projectsFinished.map((p) => p.slug)).toEqual(['sandwich']);
  });

  it('sums points earned in the month', () => {
    expect(monthReport('2026-11', data, '2026-12-05').points).toEqual({ earned: 40, entries: 3 });
    expect(monthReport('2026-12', data, '2026-12-05').points).toEqual({ earned: 10, entries: 1 });
  });

  it('lists badges unlocked in the month', () => {
    const nov = monthReport('2026-11', data, '2026-12-05').badgesUnlocked.map((b) => b.badge.slug);
    expect(nov.sort()).toEqual(['first-project', 'sprint-0', 'thirty']);
    // 40 points in November + 10 on 1 December = 50 → "fifty" unlocks in December.
    expect(monthReport('2026-12', data, '2026-12-05').badgesUnlocked.map((b) => b.badge.slug)).toEqual(['fifty']);
    expect(monthReport('2027-01', data, '2027-01-05').badgesUnlocked).toEqual([]);
  });

  it('attaches the monthly note when there is one, otherwise null', () => {
    expect(monthReport('2026-11', data, '2026-12-05').note?.highlights).toEqual(['Good start']);
    expect(monthReport('2026-12', data, '2026-12-05').note).toBeNull();
  });

  it('isEmptyReport only for a month with nothing in it', () => {
    expect(isEmptyReport(monthReport('2026-11', data, '2026-12-05'))).toBe(false);
    expect(isEmptyReport(monthReport('2027-03', data, '2027-03-05'))).toBe(true);
  });
});
