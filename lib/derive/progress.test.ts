import { describe, expect, it } from 'vitest';
import type { Sprint } from '@/lib/model/types';
import { sprint, tenSprints } from '@/tests/fixtures';
import { overallProgress, sprintProgress } from './progress';

const checks = (done: boolean[]) => done.map((d, i) => ({ text: `c${i}`, done: d, doneOn: null }));

describe('sprintProgress', () => {
  it('upcoming sprints are 0 even with ticked checks', () => {
    expect(sprintProgress(sprint(1, { readyChecks: checks([true, true]) })).ratio).toBe(0);
  });
  it('in-progress sprints count ticked checks, capped below 1', () => {
    expect(sprintProgress(sprint(1, { status: 'in-progress', readyChecks: checks([true, false]) })).ratio).toBe(0.5);
    expect(sprintProgress(sprint(1, { status: 'in-progress', readyChecks: checks([true, true]) })).ratio).toBe(0.95);
  });
  it('in-progress sprint without checks is 0', () => {
    expect(sprintProgress(sprint(1, { status: 'in-progress', readyChecks: [] })).ratio).toBe(0);
  });
  it('done sprints are 1 regardless of checks', () => {
    const p = sprintProgress(sprint(1, { status: 'done', readyChecks: checks([false, true]) }));
    expect(p).toEqual({ checksDone: 1, checksTotal: 2, ratio: 1 });
  });
});

describe('overallProgress', () => {
  it('is 0 with no sprints or nothing started', () => {
    expect(overallProgress([]).percent).toBe(0);
    expect(overallProgress(tenSprints()).percent).toBe(0);
  });

  it('counts done sprints and partial credit for the current one', () => {
    const sprints = tenSprints();
    sprints[0] = sprint(0, { status: 'done' });
    sprints[1] = sprint(1, { status: 'in-progress', readyChecks: checks([true, false]) });
    const p = overallProgress(sprints);
    expect(p.percent).toBe(15); // (1 + 0.5) / 10
    expect(p.sprintsDone).toBe(1);
    expect(p.sprintsTotal).toBe(10);
    expect(p.checksDone).toBe(1);
    expect(p.checksTotal).toBe(20);
  });

  it('only reaches 100 when every sprint is done', () => {
    const almost: Sprint[] = tenSprints().map((s) => ({ ...s, status: 'done' }));
    almost[9] = sprint(9, { status: 'in-progress', readyChecks: checks([true, true]) });
    expect(overallProgress(almost).percent).toBe(99);
    expect(overallProgress(tenSprints().map((s) => ({ ...s, status: 'done' as const }))).percent).toBe(100);
  });
});
