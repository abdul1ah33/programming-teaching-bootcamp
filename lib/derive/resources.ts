import type { FileType } from '@/lib/model/enums';
import type { IsoDate, Session, Sprint } from '@/lib/model/types';

export interface Resource {
  /** Stable key for lists. */
  key: string;
  label: string;
  type: FileType;
  url: string;
  /** Lower-case extension without the dot, e.g. "pdf". Empty when unknown. */
  extension: string;
  source: 'sprint' | 'session';
  sprint: { slug: string; number: number; title: string } | null;
  session: { slug: string; number: number; title: string; date: IsoDate } | null;
}

export function fileExtension(url: string): string {
  const clean = url.split(/[?#]/)[0] ?? '';
  const name = clean.slice(clean.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** PDFs preview inline; everything else downloads. */
export function canPreview(url: string): boolean {
  return fileExtension(url) === 'pdf';
}

/**
 * Every file from sessions and sprints in one list: session files newest first, then sprint files
 * by sprint number. Cancelled sessions' files are still listed.
 */
export function allResources(sprints: readonly Sprint[], sessions: readonly Session[]): Resource[] {
  const sprintInfo = new Map(sprints.map((s) => [s.slug, { slug: s.slug, number: s.number, title: s.title }]));

  const fromSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number)
    .flatMap((s) =>
      s.files.map((f, i) => ({
        key: `session-${s.slug}-${i}`,
        label: f.label,
        type: f.type,
        url: f.url,
        extension: fileExtension(f.url),
        source: 'session' as const,
        sprint: sprintInfo.get(s.sprint) ?? null,
        session: { slug: s.slug, number: s.number, title: s.title, date: s.date },
      })),
    );

  const fromSprints = [...sprints]
    .sort((a, b) => a.number - b.number)
    .flatMap((s) =>
      s.files.map((f, i) => ({
        key: `sprint-${s.slug}-${i}`,
        label: f.label,
        type: f.type,
        url: f.url,
        extension: fileExtension(f.url),
        source: 'sprint' as const,
        sprint: sprintInfo.get(s.slug) ?? null,
        session: null,
      })),
    );

  return [...fromSessions, ...fromSprints];
}

/** The newest files for the home page: the most recent session files first. */
export function latestResources(sprints: readonly Sprint[], sessions: readonly Session[], limit = 4): Resource[] {
  return allResources(sprints, sessions).slice(0, limit);
}
