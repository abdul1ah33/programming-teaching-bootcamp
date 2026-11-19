/**
 * The activities you can award points for.
 *
 * This list is the single source for the "Activity" choices in the admin (Keystatic needs them in code
 * so it can prefill the points). The settings file shows the same rules on the site; `npm run
 * validate-content` fails if the two drift apart. To add a new kind of activity, add it here AND in
 * Settings → Points rules.
 */
export const POINTS_RULES = [
  { key: 'exercise', label: 'Exercise completed', points: 5 },
  { key: 'challenge', label: 'Challenge problem solved', points: 10 },
  { key: 'independent', label: 'Solved independently', points: 15 },
  { key: 'bugfix', label: 'Bug found and fixed', points: 5 },
  { key: 'project', label: 'Mini-project / sprint project completed', points: 30 },
] as const;

export type PointsRuleKey = (typeof POINTS_RULES)[number]['key'];
export const CUSTOM_ACTIVITY = 'custom' as const;
export type ActivityKey = PointsRuleKey | typeof CUSTOM_ACTIVITY;
