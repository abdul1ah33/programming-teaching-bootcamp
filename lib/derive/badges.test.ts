import { describe, expect, it } from 'vitest';
import { badge, points, project, rules, session, sprint, tenSprints } from '@/tests/fixtures';
import type { BadgeInputs } from './badges';
import { evaluateBadges, isNewBadge, latestBadge, unlockedBadges } from './badges';

const base = (overrides: Partial<BadgeInputs> = {}): BadgeInputs => ({
  badges: [],
  sprints: tenSprints(),
  sessions: [],
  projects: [],
  points: [],
  rules,
  ...overrides,
});

const one = (input: BadgeInputs) => {
  const [status] = evaluateBadges(input);
  if (!status) throw new Error('no badge');
  return status;
};

describe('manual badges', () => {
  it('locked until an earned-on date is set', () => {
    const locked = one(base({ badges: [badge('first', { kind: 'manual', earnedOn: null, howToEarn: 'Run your first program.' })] }));
    expect(locked).toMatchObject({ unlocked: false, unlockedOn: null, progress: null, howToUnlock: 'Run your first program.' });
    const earned = one(base({ badges: [badge('first', { kind: 'manual', earnedOn: '2026-11-08', howToEarn: '' })] }));
    expect(earned).toMatchObject({ unlocked: true, unlockedOn: '2026-11-08' });
    expect(earned.howToUnlock).toBe('Awarded by your teacher.');
  });
});

describe('totalPoints', () => {
  const rule = { kind: 'totalPoints', n: 20 } as const;
  it('unlocks on the date the running total first reaches N', () => {
    const s = one(
      base({
        badges: [badge('twenty', rule)],
        points: [
          points('2026-11-10', { activity: 'challenge' }), // 10 → 25 on the 10th? no: order matters
          points('2026-11-03', { activity: 'exercise' }), // 5
          points('2026-11-05', { activity: 'bugfix' }), // 5 → 10
          points('2026-11-20', { activity: 'exercise' }), // 5 → 25
        ],
      }),
    );
    // 03: 5, 05: 10, 10: 20 ← exactly N
    expect(s).toMatchObject({ unlocked: true, unlockedOn: '2026-11-10', progress: { current: 25, target: 20 } });
  });
  it('stays locked below N and reports progress', () => {
    const s = one(base({ badges: [badge('twenty', rule)], points: [points('2026-11-03', { activity: 'challenge' })] }));
    expect(s).toMatchObject({ unlocked: false, unlockedOn: null, progress: { current: 10, target: 20 } });
    expect(s.howToUnlock).toBe('Reach 20 points.');
  });
  it('re-locks if a correction brings the total back under N', () => {
    const s = one(
      base({
        badges: [badge('twenty', rule)],
        points: [points('2026-11-03', { activity: 'custom', points: 25 }), points('2026-11-04', { activity: 'custom', points: -10 })],
      }),
    );
    expect(s.unlocked).toBe(false);
    expect(s.progress).toEqual({ current: 15, target: 20 });
  });
});

describe('sessionsDone', () => {
  const rule = { kind: 'sessionsDone', n: 2 } as const;
  it('unlocks on the date of the N-th done session', () => {
    const s = one(
      base({
        badges: [badge('two', rule)],
        sessions: [
          session(3, { date: '2026-11-10', status: 'done' }),
          session(1, { date: '2026-11-03', status: 'done' }),
          session(2, { date: '2026-11-07', status: 'cancelled' }),
          session(4, { date: '2026-11-24', status: 'planned' }),
        ],
      }),
    );
    expect(s).toMatchObject({ unlocked: true, unlockedOn: '2026-11-10', progress: { current: 2, target: 2 } });
  });
  it('locked below N, with singular/plural wording', () => {
    const s = one(base({ badges: [badge('two', rule)], sessions: [session(1, { status: 'done' })] }));
    expect(s).toMatchObject({ unlocked: false, progress: { current: 1, target: 2 }, howToUnlock: 'Complete 2 sessions.' });
    const single = one(base({ badges: [badge('one', { kind: 'sessionsDone', n: 1 })] }));
    expect(single.howToUnlock).toBe('Complete 1 session.');
  });
});

describe('projectsFinished', () => {
  const rule = { kind: 'projectsFinished', n: 1 } as const;
  it('unlocks with the finish date', () => {
    const s = one(
      base({
        badges: [badge('p', rule)],
        projects: [project('a', { status: 'finished', finishedOn: '2026-11-10' }), project('b')],
      }),
    );
    expect(s).toMatchObject({ unlocked: true, unlockedOn: '2026-11-10' });
  });
  it('unlocks without a date when the finish date is missing', () => {
    const s = one(base({ badges: [badge('p', rule)], projects: [project('a', { status: 'finished' })] }));
    expect(s).toMatchObject({ unlocked: true, unlockedOn: null });
  });
  it('locked when no project is finished', () => {
    const s = one(base({ badges: [badge('p', rule)], projects: [project('a')] }));
    expect(s).toMatchObject({ unlocked: false, progress: { current: 0, target: 1 }, howToUnlock: 'Finish 1 project.' });
  });
});

describe('activityCount', () => {
  const rule = { kind: 'activityCount', activity: 'bugfix', n: 3 } as const;
  it('counts only that activity and dates the N-th one', () => {
    const s = one(
      base({
        badges: [badge('bug-hunter', rule)],
        points: [
          points('2026-11-01', { activity: 'bugfix' }),
          points('2026-11-02', { activity: 'exercise' }),
          points('2026-11-09', { activity: 'bugfix' }),
          points('2026-11-05', { activity: 'bugfix' }),
          points('2026-11-12', { activity: 'bugfix' }),
        ],
      }),
    );
    expect(s).toMatchObject({ unlocked: true, unlockedOn: '2026-11-09', progress: { current: 4, target: 3 } });
  });
  it('explains how to unlock using the rule label', () => {
    const s = one(base({ badges: [badge('bug-hunter', rule)] }));
    expect(s.unlocked).toBe(false);
    expect(s.howToUnlock).toBe('Earn points for “Bug found and fixed” 3 times.');
  });
});

describe('sprintCompleted', () => {
  const rule = { kind: 'sprintCompleted', sprint: 2 } as const;
  it('unlocks when that sprint is done, dated by completedOn', () => {
    const sprints = tenSprints();
    sprints[2] = sprint(2, { status: 'done', completedOn: '2027-01-15', title: 'Decisions and Loops' });
    expect(one(base({ badges: [badge('loops', rule)], sprints }))).toMatchObject({ unlocked: true, unlockedOn: '2027-01-15' });
  });
  it('done without a date → unlocked, date unknown', () => {
    const sprints = tenSprints();
    sprints[2] = sprint(2, { status: 'done' });
    expect(one(base({ badges: [badge('loops', rule)], sprints }))).toMatchObject({ unlocked: true, unlockedOn: null });
  });
  it('locked while in progress, naming the sprint', () => {
    const sprints = tenSprints();
    sprints[2] = sprint(2, { status: 'in-progress', title: 'Decisions and Loops' });
    const s = one(base({ badges: [badge('loops', rule)], sprints }));
    expect(s).toMatchObject({ unlocked: false, unlockedOn: null, progress: null });
    expect(s.howToUnlock).toBe('Complete Sprint 2: Decisions and Loops.');
  });
  it('handles a sprint number that does not exist', () => {
    const s = one(base({ badges: [badge('x', { kind: 'sprintCompleted', sprint: 42 })] }));
    expect(s).toMatchObject({ unlocked: false, howToUnlock: 'Complete Sprint 42.' });
  });
});

describe('phaseCompleted', () => {
  const rule = { kind: 'phaseCompleted', phase: 'python' } as const;
  const withPython = (statuses: { status: 'done' | 'in-progress' | 'upcoming'; completedOn?: string | null }[]) => {
    const sprints = tenSprints();
    statuses.forEach((st, i) => {
      sprints[i + 1] = sprint(i + 1, { status: st.status, completedOn: st.completedOn ?? null });
    });
    return sprints;
  };

  it('unlocks when every sprint in the phase is done, on the last completion date', () => {
    const sprints = withPython([
      { status: 'done', completedOn: '2026-12-01' },
      { status: 'done', completedOn: '2027-01-20' },
      { status: 'done', completedOn: '2027-01-05' },
      { status: 'done', completedOn: '2027-02-10' },
    ]);
    expect(one(base({ badges: [badge('py', rule)], sprints }))).toMatchObject({
      unlocked: true,
      unlockedOn: '2027-02-10',
      progress: { current: 4, target: 4 },
    });
  });
  it('unknown date if any sprint lacks completedOn', () => {
    const sprints = withPython([
      { status: 'done', completedOn: '2026-12-01' },
      { status: 'done' },
      { status: 'done', completedOn: '2027-01-05' },
      { status: 'done', completedOn: '2027-02-10' },
    ]);
    expect(one(base({ badges: [badge('py', rule)], sprints }))).toMatchObject({ unlocked: true, unlockedOn: null });
  });
  it('locked with progress while sprints remain', () => {
    const sprints = withPython([{ status: 'done', completedOn: '2026-12-01' }, { status: 'in-progress' }]);
    const s = one(base({ badges: [badge('py', rule)], sprints }));
    expect(s).toMatchObject({ unlocked: false, progress: { current: 1, target: 4 } });
    expect(s.howToUnlock).toBe('Complete all 4 sprints in the Python phase.');
  });
  it('single-sprint phase has no progress bar and simpler wording', () => {
    const s = one(base({ badges: [badge('cap', { kind: 'phaseCompleted', phase: 'capstone' })] }));
    expect(s).toMatchObject({ unlocked: false, progress: null, howToUnlock: 'Complete the Capstone phase.' });
  });
  it('a phase with no sprints never unlocks', () => {
    const s = one(base({ badges: [badge('py', rule)], sprints: [] }));
    expect(s.unlocked).toBe(false);
  });
});

describe('ordering helpers', () => {
  const statuses = evaluateBadges(
    base({
      badges: [
        badge('a', { kind: 'manual', earnedOn: '2026-11-05', howToEarn: '' }, 1),
        badge('b', { kind: 'manual', earnedOn: null, howToEarn: '' }, 2),
        badge('c', { kind: 'manual', earnedOn: '2026-11-15', howToEarn: '' }, 3),
        badge('d', { kind: 'projectsFinished', n: 1 }, 4),
      ],
      projects: [project('p', { status: 'finished' })],
    }),
  );

  it('keeps wall order in evaluateBadges', () => {
    expect(statuses.map((s) => s.badge.slug)).toEqual(['a', 'b', 'c', 'd']);
  });
  it('unlockedBadges: newest first, undated last', () => {
    expect(unlockedBadges(statuses).map((s) => s.badge.slug)).toEqual(['c', 'a', 'd']);
  });
  it('latestBadge is the most recent; undefined when none', () => {
    expect(latestBadge(statuses)?.badge.slug).toBe('c');
    expect(latestBadge([])).toBeUndefined();
  });
  it('isNewBadge: within the window, not before unlock, not undated', () => {
    const c = statuses[2]!;
    expect(isNewBadge(c, '2026-11-15')).toBe(true);
    expect(isNewBadge(c, '2026-11-28')).toBe(true);
    expect(isNewBadge(c, '2026-11-29')).toBe(false);
    expect(isNewBadge(c, '2026-11-14')).toBe(false);
    expect(isNewBadge(statuses[1]!, '2026-11-15')).toBe(false);
    expect(isNewBadge(statuses[3]!, '2026-11-15')).toBe(false);
  });
});
