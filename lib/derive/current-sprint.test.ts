import { describe, expect, it } from 'vitest';
import { sprint, tenSprints } from '@/tests/fixtures';
import { currentSprint, journeyComplete, neighbours, sprintAtEndOfMonth } from './current-sprint';

describe('currentSprint', () => {
  it('is undefined with no sprints', () => {
    expect(currentSprint([])).toBeUndefined();
  });
  it('picks the first in-progress sprint by number, regardless of input order', () => {
    const s = [sprint(3, { status: 'in-progress' }), sprint(0, { status: 'done' }), sprint(2, { status: 'in-progress' })];
    expect(currentSprint(s)?.number).toBe(2);
  });
  it('falls back to the first upcoming sprint', () => {
    const s = tenSprints();
    s[0] = sprint(0, { status: 'done' });
    expect(currentSprint(s)?.number).toBe(1);
  });
  it('falls back to the last sprint when everything is done', () => {
    const s = tenSprints().map((x) => ({ ...x, status: 'done' as const }));
    expect(currentSprint(s)?.number).toBe(9);
    expect(journeyComplete(s)).toBe(true);
    expect(journeyComplete(tenSprints())).toBe(false);
    expect(journeyComplete([])).toBe(false);
  });
});

describe('sprintAtEndOfMonth', () => {
  const sprints = [
    sprint(0, { status: 'done', completedOn: '2026-11-10' }),
    sprint(1, { status: 'done', completedOn: '2026-12-02' }),
    sprint(2, { status: 'in-progress' }),
  ];
  it('is the first sprint not completed by the end of the month', () => {
    expect(sprintAtEndOfMonth(sprints, '2026-10')?.number).toBe(0);
    expect(sprintAtEndOfMonth(sprints, '2026-11')?.number).toBe(1);
    expect(sprintAtEndOfMonth(sprints, '2026-12')?.number).toBe(2);
  });
  it('treats a Done sprint without a date as completed', () => {
    expect(sprintAtEndOfMonth([sprint(0, { status: 'done' }), sprint(1)], '2026-01')?.number).toBe(1);
  });
  it('is undefined when every sprint was complete', () => {
    expect(sprintAtEndOfMonth([sprint(0, { status: 'done', completedOn: '2026-11-01' })], '2026-11')).toBeUndefined();
  });
});

describe('neighbours', () => {
  it('returns previous and next by number', () => {
    const s = tenSprints();
    expect(neighbours(s, 'sprint-0').previous).toBeUndefined();
    expect(neighbours(s, 'sprint-0').next?.number).toBe(1);
    expect(neighbours(s, 'sprint-9').next).toBeUndefined();
    expect(neighbours(s, 'missing')).toEqual({});
  });
});
