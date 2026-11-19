import type { Badge, BadgeRule } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

type RawRule = Awaited<ReturnType<typeof reader.collections.badges.readOrThrow>>['rule'];

function toRule(rule: RawRule): BadgeRule {
  switch (rule.discriminant) {
    case 'manual':
      return { kind: 'manual', earnedOn: orNull(rule.value.earnedOn), howToEarn: rule.value.howToEarn };
    case 'totalPoints':
      return { kind: 'totalPoints', n: rule.value };
    case 'sprintCompleted':
      return { kind: 'sprintCompleted', sprint: rule.value };
    case 'phaseCompleted':
      return { kind: 'phaseCompleted', phase: rule.value };
    case 'projectsFinished':
      return { kind: 'projectsFinished', n: rule.value };
    case 'sessionsDone':
      return { kind: 'sessionsDone', n: rule.value };
    case 'activityCount':
      return { kind: 'activityCount', activity: rule.value.activity, n: rule.value.count };
  }
}

export const getBadges = memo(async (): Promise<Badge[]> => {
  const all = await reader.collections.badges.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      name: entry.name,
      description: entry.description,
      icon: entry.icon,
      order: entry.order ?? 100,
      rule: toRule(entry.rule),
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
});
