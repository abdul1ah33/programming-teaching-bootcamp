import type { FileRef, Sprint } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

type RawFile = { label: string; type: FileRef['type']; file: string | null };
export const toFiles = (files: readonly RawFile[]): FileRef[] =>
  files.flatMap((f) => (f.file ? [{ label: f.label, type: f.type, url: f.file }] : []));

export const getSprints = memo(async (): Promise<Sprint[]> => {
  const all = await reader.collections.sprints.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      number: entry.number ?? 0,
      title: entry.title,
      status: entry.status,
      completedOn: orNull(entry.completedOn),
      phase: entry.phase,
      duration: entry.duration,
      goal: entry.goal,
      topics: [...entry.topics],
      missions: [...entry.missions],
      build: entry.build,
      readyChecks: entry.readyChecks.map((c) => ({ text: c.text, done: c.done, doneOn: orNull(c.doneOn) })),
      files: toFiles(entry.files),
    }))
    .sort((a, b) => a.number - b.number);
});

export async function getSprint(slug: string): Promise<Sprint | undefined> {
  return (await getSprints()).find((s) => s.slug === slug);
}
