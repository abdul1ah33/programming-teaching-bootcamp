import type { CheatSheet } from '@/lib/model/types';
import { memo, reader } from './reader';

export const getCheatSheets = memo(async (): Promise<CheatSheet[]> => {
  const all = await reader.collections.cheatsheets.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      language: entry.language,
      intro: entry.intro,
      sections: entry.sections.map((s) => ({
        heading: s.heading,
        sprint: s.sprint,
        items: s.items.map((i) => ({ label: i.label, code: i.code.replace(/\s+$/, ''), note: i.note })),
      })),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
});

export async function getCheatSheet(slug: string): Promise<CheatSheet | undefined> {
  return (await getCheatSheets()).find((c) => c.slug === slug);
}
