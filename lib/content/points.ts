import type { PointsEntry } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

export const getPointsLog = memo(async (): Promise<PointsEntry[]> => {
  const all = await reader.collections.points.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      activity: entry.activity.discriminant,
      points: entry.activity.value ?? null,
      date: entry.date,
      sprint: orNull(entry.sprint),
      session: orNull(entry.session),
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
});
