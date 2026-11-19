import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@/components/features/rich-text';
import { FileRow } from '@/components/ui/file-row';
import { Card, Container, EmptyState, SectionHeading, TextLink } from '@/components/ui/primitives';
import { StatusPill } from '@/components/ui/status-pill';
import { getPointsLog, getSession, getSessions, getSessionSummary, getSettings, getSprints } from '@/lib/content';
import { formatDate } from '@/lib/derive/dates';
import { activityLabel, pointsForSession, pointsLog } from '@/lib/derive/points';
import { timeline } from '@/lib/derive/sessions';
import { sprintLabel } from '@/lib/labels';

type Props = { params: Promise<{ number: string }> };

export async function generateStaticParams() {
  return (await getSessions()).map((s) => ({ number: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSession((await params).number);
  return { title: s ? `Lesson ${s.number}: ${s.title}` : 'Lesson' };
}

export default async function SessionPage({ params }: Props) {
  const { number } = await params;
  const [session, sessions, sprints, log, settings, summary] = await Promise.all([
    getSession(number),
    getSessions(),
    getSprints(),
    getPointsLog(),
    getSettings(),
    getSessionSummary(number),
  ]);
  if (!session) notFound();

  const sprint = sprints.find((s) => s.slug === session.sprint);
  const earned = pointsLog(log, settings.pointsRules).filter((e) => e.session === session.slug);
  const earnedTotal = pointsForSession(log, settings.pointsRules, session.slug);
  // Chronological neighbours.
  const chrono = [...timeline(sessions)].reverse();
  const i = chrono.findIndex((s) => s.slug === session.slug);
  const previous = chrono[i - 1];
  const next = chrono[i + 1];

  return (
    <Container className="max-w-[960px]">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/sessions" className="hover:text-text">
          Lessons
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>Lesson {session.number}</span>
      </nav>

      <header className="pb-8 pt-6">
        <p className="text-sm font-medium text-primary-hover dark:text-primary">
          Lesson {session.number} · {formatDate(session.date, 'long')}
        </p>
        <h1 className="mt-3 max-w-[24ch] font-serif text-[2.2rem] font-medium leading-[1.08] tracking-[-0.01em] sm:text-5xl">
          {session.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={session.status} />
          {sprint && <TextLink href={`/sprints/${sprint.slug}`}>{sprintLabel(sprint)}</TextLink>}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <section aria-labelledby="summary">
            <SectionHeading id="summary">What we did</SectionHeading>
            {summary ? (
              <RichText node={summary} />
            ) : (
              <p className="text-sm text-muted">
                {session.status === 'planned' ? 'This lesson hasn’t happened yet.' : 'No notes for this lesson.'}
              </p>
            )}
          </section>

          {session.homework && (
            <section aria-labelledby="homework">
              <SectionHeading id="homework">Homework</SectionHeading>
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusPill status={session.homework.status} />
                  {session.homework.dueDate && (
                    <span className="text-sm font-medium text-text">Due {formatDate(session.homework.dueDate, 'long')}</span>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed">{session.homework.description}</p>
              </Card>
            </section>
          )}

          {session.links.length > 0 && (
            <section aria-labelledby="links">
              <SectionHeading id="links">Useful links</SectionHeading>
              <ul className="space-y-2">
                {session.links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      {l.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:col-span-5">
          <Card as="section" aria-labelledby="files" className="p-5">
            <SectionHeading id="files" aside={session.files.length || undefined}>
              Files
            </SectionHeading>
            {session.files.length > 0 ? (
              <div className="divide-y divide-border">
                {session.files.map((f) => (
                  <FileRow key={f.url} label={f.label} type={f.type} url={f.url} size={f.size} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No files for this lesson.</p>
            )}
          </Card>

          <Card as="section" aria-labelledby="points" className="p-5">
            <SectionHeading id="points" aside={earned.length ? `+${earnedTotal}` : undefined}>
              Points you earned
            </SectionHeading>
            {earned.length > 0 ? (
              <ul className="divide-y divide-border">
                {earned.map((e) => (
                  <li key={e.slug} className="flex items-start justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm text-text">{e.title}</span>
                      <span className="block text-xs text-muted">{activityLabel(e.activity, settings.pointsRules)}</span>
                    </span>
                    <span className="font-mono text-sm font-medium text-primary-hover tabular dark:text-primary">+{e.resolved}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No points for this lesson yet" className="py-4" />
            )}
          </Card>
        </aside>
      </div>

      <nav aria-label="Other lessons" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {previous ? (
          <Link href={`/sessions/${previous.slug}`} className="group rounded-lg p-3 hover:bg-surface-2">
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Lesson {previous.number} · {formatDate(previous.date)}
            </span>
            <span className="mt-1 block font-medium text-text group-hover:underline">{previous.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/sessions/${next.slug}`} className="group rounded-lg p-3 text-right hover:bg-surface-2">
            <span className="flex items-center justify-end gap-1.5 text-sm text-muted">
              Lesson {next.number} · {formatDate(next.date)} <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="mt-1 block font-medium text-text group-hover:underline">{next.title}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
