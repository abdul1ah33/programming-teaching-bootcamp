import type { Field } from '@/lib/model/types';
import { memo, reader } from './reader';

export const getFields = memo(async (): Promise<Field[]> => {
  const all = await reader.collections.fields.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      name: entry.name,
      icon: entry.icon,
      order: entry.order ?? 100,
      summary: entry.summary,
      whatItIs: entry.whatItIs,
      whatYoudLearn: [...entry.whatYoudLearn],
      firstProject: entry.firstProject,
      buildsOn: { text: entry.buildsOn.text, sprints: [...entry.buildsOn.sprints] },
      goodFitIf: [...entry.goodFitIf],
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
});

export async function getField(slug: string): Promise<Field | undefined> {
  return (await getFields()).find((f) => f.slug === slug);
}
