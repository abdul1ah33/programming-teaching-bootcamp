import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReadyChecks } from '@/components/features/ready-checks';
import { SessionRow } from '@/components/features/session-row';
import { FileRow } from '@/components/ui/file-row';
import { Card, CardLink, Container, EmptyState, SectionHeading } from '@/components/ui/primitives';
import { ProgressBar } from '@/components/ui/progress-bar';
import { StatusPill } from '@/components/ui/status-pill';
import { getProjects, getSessions, getSprint, getSprints } from '@/lib/content';
import { neighbours } from '@/lib/derive/current-sprint';
import { formatDate } from '@/lib/derive/dates';
import { sprintProgress } from '@/lib/derive/progress';
import { sessionsForSprint } from '@/lib/derive/sessions';
import { phaseLabel } from '@/lib/labels';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSprints()).map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sprint = await getSprint((await params).slug);
  return { title: sprint ? `Sprint ${sprint.number}: ${sprint.title}` : 'Sprint' };
}

export default async function SprintPage({ params }: Props) {
  const { slug } = await params;
  const [sprint, sprints, sessions, projects] = await Promise.all([getSprint(slug), getSprints(), getSessions(), getProjects()]);
  if (!sprint) notFound();

  const progress = sprintProgress(sprint);
  const related = sessionsForSprint(sessions, sprint.slug);
  const sprintProjects = projects.filter((p) => p.sprint === sprint.slug);
  const { previous, next } = neighbours(sprints, sprint.slug);

  return (
    <Container>
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/roadmap" className="hover:text-text">
          Road map
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>Sprint {sprint.number}</span>
      </nav>

      <header className="grid gap-6 pb-10 pt-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            Sprint {sprint.number} · {phaseLabel(sprint.phase)} · About {sprint.duration}
          </p>
          <h1 className="mt-3 font-serif text-[2.4rem] font-medium leading-[1.06] tracking-[-0.015em] sm:text-[3.25rem]">
            {sprint.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted">{sprint.goal}</p>
        </div>
        <div className="self-end lg:col-span-4">
          <div className="flex items-center justify-between gap-3">
            <StatusPill status={sprint.status} />
            {sprint.status === 'done' && sprint.completedOn ? (
              <span className="font-mono text-xs text-muted tabular">Completed {formatDate(sprint.completedOn)}</span>
            ) : (
              <span className="font-mono text-xs text-muted tabular">
                {progress.checksDone} of {progress.checksTotal} checks
              </span>
            )}
          </div>
          <ProgressBar className="mt-3" value={progress.ratio * 100} label={`Sprint ${sprint.number} progress`} />
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        {/* Main column */}
        <div className="space-y-10 lg:col-span-7">
          <section aria-labelledby="topics">
            <SectionHeading id="topics" aside={sprint.topics.length}>
              What you’ll learn
            </SectionHeading>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {sprint.topics.map((t) => (
                <li key={t} className="flex gap-2.5 text-[0.95rem] leading-6">
                  <span aria-hidden="true" className="mt-[0.6rem] h-px w-3 shrink-0 bg-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="missions">
            <SectionHeading id="missions" aside={sprint.missions.length}>
              Practice missions
            </SectionHeading>
            <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
              {sprint.missions.map((m, i) => (
                <li key={m} className="flex gap-4 px-4 py-3 text-[0.95rem] leading-6">
                  <span className="w-5 shrink-0 pt-px font-mono text-sm text-muted tabular">{String(i + 1).padStart(2, '0')}</span>
                  <span>{m}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="build">
            <SectionHeading id="build">What you’ll build</SectionHeading>
            <p className="max-w-[62ch] border-l-2 border-primary pl-4 font-serif text-xl leading-relaxed text-text">
              {sprint.build}
            </p>
            {sprintProjects.length > 0 && (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {sprintProjects.map((p) => (
                  <li key={p.slug}>
                    <CardLink href={`/projects/${p.slug}`} className="p-4">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-text">{p.title}</span>
                        <StatusPill status={p.status} />
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm text-muted">{p.description}</span>
                    </CardLink>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="sessions">
            <SectionHeading id="sessions" aside={related.length}>
              Sessions in this sprint
            </SectionHeading>
            {related.length > 0 ? (
              <Card className="divide-y divide-border p-2">
                {related.map((s) => (
                  <SessionRow key={s.slug} session={s} />
                ))}
              </Card>
            ) : (
              <EmptyState title="No sessions yet">Sessions for this sprint will be listed here.</EmptyState>
            )}
          </section>
        </div>

        {/* Side column */}
        <aside className="order-first space-y-6 self-start lg:sticky lg:top-20 lg:order-none lg:col-span-5">
          <Card as="section" aria-labelledby="ready" className="p-5">
            <SectionHeading id="ready" aside={`${progress.checksDone}/${progress.checksTotal}`}>
              Ready to move on when you can…
            </SectionHeading>
            <ReadyChecks checks={sprint.readyChecks} />
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted">
              Your teacher ticks these when you can do them on your own. The sprint is complete when they’re all ticked.
            </p>
          </Card>

          <Card as="section" aria-labelledby="files" className="p-5">
            <SectionHeading id="files" aside={sprint.files.length || undefined}>
              Sprint files
            </SectionHeading>
            {sprint.files.length > 0 ? (
              <div className="divide-y divide-border">
                {sprint.files.map((f) => (
                  <FileRow key={f.url} label={f.label} type={f.type} url={f.url} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No sprint files yet. Session files are on each session’s page.</p>
            )}
          </Card>
        </aside>
      </div>

      <nav aria-label="Other sprints" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {previous ? (
          <Link href={`/sprints/${previous.slug}`} className="group rounded-lg p-3 hover:bg-surface-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Sprint {previous.number}
            </span>
            <span className="mt-1 block font-medium text-text group-hover:underline">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/sprints/${next.slug}`} className="group rounded-lg p-3 text-right hover:bg-surface-2">
            <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted">
              Sprint {next.number} <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="mt-1 block font-medium text-text group-hover:underline">{next.title}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
