import { describe, expect, it } from 'vitest';
import { session } from '@/tests/fixtures';
import { nextSession, recentSessions, sessionsDone, sessionsForSprint, timeline } from './sessions';

const sessions = [
  session(1, { date: '2026-11-03', status: 'done' }),
  session(2, { date: '2026-11-07', status: 'done' }),
  session(3, { date: '2026-11-10', status: 'cancelled' }),
  session(4, { date: '2026-11-14', status: 'planned' }), // planned but in the past (not updated)
  session(5, { date: '2026-11-24', status: 'planned', sprint: 'sprint-1' }),
  session(6, { date: '2026-11-21', status: 'planned', sprint: 'sprint-1' }),
];

describe('nextSession', () => {
  it('is the earliest planned session on or after today', () => {
    expect(nextSession(sessions, '2026-11-19')?.number).toBe(6);
  });
  it('includes a session happening today', () => {
    expect(nextSession(sessions, '2026-11-21')?.number).toBe(6);
  });
  it('skips past-dated planned sessions and cancelled ones', () => {
    expect(nextSession(sessions, '2026-11-11')?.number).toBe(4);
    expect(nextSession(sessions, '2026-11-15')?.number).toBe(6);
  });
  it('breaks a same-day tie by session number', () => {
    const tie = [session(9, { date: '2026-12-01' }), session(8, { date: '2026-12-01' })];
    expect(nextSession(tie, '2026-11-30')?.number).toBe(8);
  });
  it('is undefined when nothing is planned ahead', () => {
    expect(nextSession(sessions, '2026-11-25')).toBeUndefined();
    expect(nextSession([], '2026-11-25')).toBeUndefined();
  });
});

describe('session lists', () => {
  it('recentSessions: done only, newest first, limited', () => {
    expect(recentSessions(sessions).map((s) => s.number)).toEqual([2, 1]);
    expect(recentSessions(sessions, 1).map((s) => s.number)).toEqual([2]);
  });
  it('sessionsDone counts done sessions only', () => {
    expect(sessionsDone(sessions)).toBe(2);
  });
  it('timeline is newest first', () => {
    expect(timeline(sessions).map((s) => s.number)).toEqual([5, 6, 4, 3, 2, 1]);
  });
  it('sessionsForSprint filters and sorts by date', () => {
    expect(sessionsForSprint(sessions, 'sprint-1').map((s) => s.number)).toEqual([6, 5]);
  });
});
