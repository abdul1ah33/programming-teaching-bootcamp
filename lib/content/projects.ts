import type { Project } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

export const getProjects = memo(async (): Promise<Project[]> => {
  const all = await reader.collections.projects.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      title: entry.title,
      sprint: entry.sprint,
      status: entry.status,
      finishedOn: orNull(entry.finishedOn),
      description: entry.description,
      screenshot: orNull(entry.screenshot),
      codeLink: orNull(entry.codeLink),
      whatILearned: entry.whatILearned,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
});

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}
