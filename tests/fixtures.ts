/** Small builders for derive-function tests. */
import { POINTS_RULES } from '@/lib/model/points-rules';
import type {
  Badge,
  BadgeRule,
  PointsEntry,
  PointsRule,
  Project,
  Session,
  Sprint,
} from '@/lib/model/types';

export const rules: PointsRule[] = POINTS_RULES.map((r) => ({ ...r }));

export function sprint(number: number, overrides: Partial<Sprint> = {}): Sprint {
  return {
    slug: `sprint-${number}`,
    number,
    title: `Sprint ${number} title`,
    status: 'upcoming',
    completedOn: null,
    phase: number === 0 ? 'thinking' : number <= 4 ? 'python' : number <= 8 ? 'c' : 'capstone',
    duration: '2 weeks',
    goal: 'Goal',
    topics: [],
    missions: [],
    build: 'Build',
    readyChecks: [
      { text: 'Check A', done: false, doneOn: null },
      { text: 'Check B', done: false, doneOn: null },
    ],
    files: [],
    ...overrides,
  };
}

/** Ten sprints numbered 0–9, all upcoming, phases as in the curriculum. */
export const tenSprints = (): Sprint[] => Array.from({ length: 10 }, (_, i) => sprint(i));

export function session(number: number, overrides: Partial<Session> = {}): Session {
  return {
    slug: String(number),
    number,
    title: `Session ${number}`,
    date: '2026-11-01',
    status: 'planned',
    sprint: 'sprint-0',
    files: [],
    homework: null,
    links: [],
    ...overrides,
  };
}

export function project(slug: string, overrides: Partial<Project> = {}): Project {
  return {
    slug,
    title: slug,
    sprint: 'sprint-0',
    status: 'in-progress',
    finishedOn: null,
    description: '',
    screenshot: null,
    codeLink: null,
    whatILearned: '',
    ...overrides,
  };
}

let pointsCounter = 0;
export function points(date: string, overrides: Partial<PointsEntry> = {}): PointsEntry {
  pointsCounter += 1;
  return {
    slug: `${date}-entry-${String(pointsCounter).padStart(3, '0')}`,
    title: 'Entry',
    activity: 'exercise',
    points: null,
    date,
    sprint: null,
    session: null,
    ...overrides,
  };
}

export function badge(slug: string, rule: BadgeRule, order = 100): Badge {
  return { slug, name: slug, description: '', icon: 'award', order, rule };
}
