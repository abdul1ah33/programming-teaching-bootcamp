import { PHASES, type Phase } from '@/lib/model/enums';
import type { Sprint } from '@/lib/model/types';

export const phaseLabel = (phase: Phase) => PHASES.find((p) => p.value === phase)?.label ?? phase;
export const phaseShort = (phase: Phase) => PHASES.find((p) => p.value === phase)?.short ?? phase;

/** "Sprint 3 · Collections and Functions" */
export const sprintLabel = (sprint: Pick<Sprint, 'number' | 'title'> | undefined) =>
  sprint ? `Sprint ${sprint.number} · ${sprint.title}` : 'No sprint';

/** Lookup helper: slug → sprint. */
export const sprintMap = (sprints: readonly Sprint[]) => new Map(sprints.map((s) => [s.slug, s]));

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
