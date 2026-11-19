import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectVisual } from '@/components/features/project-visual';
import { Container, EmptyState, PageHeader } from '@/components/ui/primitives';
import { StatusPill } from '@/components/ui/status-pill';
import { getProjects, getSprints } from '@/lib/content';
import { formatDate } from '@/lib/derive/dates';
import { plural, sprintMap } from '@/lib/labels';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const [projects, sprints] = await Promise.all([getProjects(), getSprints()]);
  const bySlug = sprintMap(sprints);
  const sorted = [...projects].sort(
    (a, b) => (bySlug.get(b.sprint)?.number ?? 0) - (bySlug.get(a.sprint)?.number ?? 0) || a.title.localeCompare(b.title),
  );
  const finished = projects.filter((p) => p.status === 'finished').length;

  return (
    <Container>
      <PageHeader
        eyebrow={`${plural(finished, 'project')} finished`}
        title="Projects"
        lead="Each sprint ends with something you built. Here they all are, newest sprint first."
      />
      {sorted.length === 0 ? (
        <EmptyState title="No projects yet">The first project comes at the end of Sprint 0.</EmptyState>
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p, i) => {
            const sprint = bySlug.get(p.sprint);
            return (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="group block">
                  <ProjectVisual project={p} sprintNumber={sprint?.number} priority={i < 3} />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted tabular">
                      Sprint {sprint?.number ?? '–'}
                      {p.finishedOn && ` · ${formatDate(p.finishedOn)}`}
                    </span>
                    <StatusPill status={p.status} />
                  </div>
                  <h2 className="mt-1.5 font-serif text-xl font-medium leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {p.title}
                  </h2>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">{p.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
