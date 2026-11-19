import { ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectVisual } from '@/components/features/project-visual';
import { Card, Container, SectionHeading, TextLink } from '@/components/ui/primitives';
import { StatusPill } from '@/components/ui/status-pill';
import { getProject, getProjects, getSprints } from '@/lib/content';
import { formatDate } from '@/lib/derive/dates';
import { sprintLabel } from '@/lib/labels';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  return { title: p?.title ?? 'Project' };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, sprints] = await Promise.all([getProject(slug), getSprints()]);
  if (!project) notFound();
  const sprint = sprints.find((s) => s.slug === project.sprint);

  return (
    <Container className="max-w-[1000px]">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/projects" className="hover:text-text">
          Projects
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="line-clamp-1 inline">{project.title}</span>
      </nav>
      <header className="pb-8 pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {sprint ? `Sprint ${sprint.number} project` : 'Project'}
          {project.finishedOn && ` · Finished ${formatDate(project.finishedOn)}`}
        </p>
        <h1 className="mt-3 max-w-[24ch] font-serif text-[2.2rem] font-medium leading-[1.08] tracking-[-0.01em] sm:text-5xl">
          {project.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={project.status} />
          {sprint && <TextLink href={`/sprints/${sprint.slug}`}>{sprintLabel(sprint)}</TextLink>}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProjectVisual project={project} sprintNumber={sprint?.number} priority />
          <section aria-labelledby="about" className="mt-8">
            <SectionHeading id="about">About the project</SectionHeading>
            <p className="max-w-[65ch] whitespace-pre-line text-[0.98rem] leading-relaxed">{project.description}</p>
          </section>
        </div>
        <aside className="space-y-6 lg:col-span-5">
          {project.whatILearned && (
            <Card as="section" aria-labelledby="learned" className="p-5">
              <SectionHeading id="learned">What I learned</SectionHeading>
              <p className="whitespace-pre-line font-serif text-lg leading-relaxed">{project.whatILearned}</p>
            </Card>
          )}
          {project.codeLink && (
            <a
              href={project.codeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text hover:border-border-strong"
            >
              See the code <ExternalLink className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </aside>
      </div>
    </Container>
  );
}
