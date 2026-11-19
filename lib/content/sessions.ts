import type { Node } from '@markdoc/markdoc';
import type { Session } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';
import { toFiles } from './sprints';

export const getSessions = memo(async (): Promise<Session[]> => {
  const all = await reader.collections.sessions.all();
  return all
    .map(({ slug, entry }) => {
      const description = entry.homework.description.trim();
      return {
        slug,
        number: Number(slug),
        title: entry.title,
        date: entry.date,
        status: entry.status,
        sprint: entry.sprint,
        files: toFiles(entry.files),
        homework: description
          ? { description, dueDate: orNull(entry.homework.dueDate), status: entry.homework.status }
          : null,
        links: entry.links.map((l) => ({ label: l.label, url: l.url })),
      } satisfies Session;
    })
    .sort((a, b) => a.number - b.number);
});

export async function getSession(slug: string): Promise<Session | undefined> {
  return (await getSessions()).find((s) => s.slug === slug);
}

/** The session's rich-text summary as a Markdoc node, or null when it's empty. */
export async function getSessionSummary(slug: string): Promise<Node | null> {
  const entry = await reader.collections.sessions.read(slug);
  if (!entry) return null;
  const { node } = await entry.summary();
  return (node.children.length > 0 ? node : null) as Node | null;
}
