import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BadgeMedallion } from '@/components/features/badge-medallion';
import { NewBadgeFlag } from '@/components/features/new-badge-flag';
import { NextSession } from '@/components/features/next-session';
import { ReadyChecks } from '@/components/features/ready-checks';
import { SessionRow } from '@/components/features/session-row';
import { FileRow } from '@/components/ui/file-row';
import { Card, Container, EmptyState, SectionHeading, TextLink } from '@/components/ui/primitives';
import { SegmentedProgress } from '@/components/ui/progress-bar';
import { StatusPill } from '@/components/ui/status-pill';
import { getBadges, getPointsLog, getProjects, getSessions, getSettings, getSprints } from '@/lib/content';
import { evaluateBadges, latestBadge } from '@/lib/derive/badges';
import { currentSprint, journeyComplete } from '@/lib/derive/current-sprint';
import { formatDate } from '@/lib/derive/dates';
import { totalPoints } from '@/lib/derive/points';
import { overallProgress, sprintProgress } from '@/lib/derive/progress';
import { latestResources } from '@/lib/derive/resources';
import { recentSessions } from '@/lib/derive/sessions';
import { phaseLabel, plural, sprintLabel, sprintMap } from '@/lib/labels';

export default async function HomePage() {
  const [settings, sprints, sessions, projects, log, badges] = await Promise.all([
    getSettings(),
    getSprints(),
    getSessions(),
    getProjects(),
    getPointsLog(),
    getBadges(),
  ]);

  const bySlug = sprintMap(sprints);
  const current = currentSprint(sprints);
  const complete = journeyComplete(sprints);
  const progress = overallProgress(sprints);
  const currentProgress = current ? sprintProgress(current) : undefined;
  const points = totalPoints(log, settings.pointsRules);
  const statuses = evaluateBadges({ badges, sprints, sessions, projects, points: log, rules: settings.pointsRules });
  const badge = latestBadge(statuses);
  const unlockedCount = statuses.filter((s) => s.unlocked).length;
  const recent = recentSessions(sessions, 3);
  const files = latestResources(sprints, sessions, 4);

  const planned = sessions
    .filter((s) => s.status === 'planned')
    .map((s) => ({
      slug: s.slug,
      number: s.number,
      title: s.title,
      date: s.date,
      status: s.status,
      sprint: s.sprint,
      sprintLabel: sprintLabel(bySlug.get(s.sprint)),
    }));

  return (
    <Container>
      {/* Greeting + overall progress */}
      <section className="grid gap-8 pb-8 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Your learning journey</p>
          <h1 className="mt-3 font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-6xl">
            Hi {settings.studentFirstName}.
          </h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted">
            {complete
              ? 'All ten sprints are done. Have a look at what’s next.'
              : current
                ? `You’re on Sprint ${current.number}, ${current.title}. Here’s what you’re working on and what comes next.`
                : 'Your sprints will appear here soon.'}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm font-medium text-text">Overall progress</p>
            <p className="font-mono text-2xl font-medium text-text tabular">{progress.percent}%</p>
          </div>
          <div className="mt-3">
            <SegmentedProgress
              label="Overall progress"
              segments={sprints.map((s) => ({
                key: s.slug,
                ratio: sprintProgress(s).ratio,
                title: `Sprint ${s.number}: ${s.title}`,
              }))}
            />
          </div>
          <p className="mt-2.5 font-mono text-xs text-muted tabular">
            {progress.sprintsDone} of {progress.sprintsTotal} sprints done · {progress.checksDone} of {progress.checksTotal}{' '}
            checks ticked
          </p>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Current sprint */}
        {current && currentProgress && (
          <Card as="section" aria-labelledby="current-sprint" className="lg:col-span-7">
            <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row">
              <div className="md:w-[58%]">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
                  {complete ? 'Last sprint' : 'Current sprint'} · {phaseLabel(current.phase)}
                </p>
                <h2 id="current-sprint" className="mt-3 flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-medium text-primary tabular">{current.number}</span>
                  <span className="font-serif text-2xl font-medium leading-tight sm:text-[1.75rem]">{current.title}</span>
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{current.goal}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusPill status={current.status} />
                  <span className="font-mono text-xs text-muted">About {current.duration}</span>
                </div>
                <p className="mt-5 text-sm">
                  <span className="font-medium text-text">You’ll build: </span>
                  <span className="text-muted">{current.build}</span>
                </p>
              </div>
              <div className="border-t border-border pt-5 md:w-[42%] md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="mb-3 text-sm font-medium text-text">Ready to move on when you can…</p>
                <ReadyChecks checks={current.readyChecks} compact />
                <p className="mt-3 font-mono text-xs text-muted tabular">
                  {currentProgress.checksDone} of {currentProgress.checksTotal} ticked
                </p>
              </div>
            </div>
            <div className="border-t border-border px-5 py-3 sm:px-6">
              <Link
                href={`/sprints/${current.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
              >
                Open Sprint {current.number}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-5">
          <Card as="section" aria-label="Next session">
            <NextSession sessions={planned} schedule={settings.scheduleText} />
          </Card>

          <Card as="section" aria-labelledby="points-heading" className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="points-heading" className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">
                  Points
                </p>
                <p className="mt-2 font-mono text-4xl font-medium text-text tabular">{points}</p>
                <p className="mt-1 text-xs text-muted">{plural(unlockedCount, 'badge')} unlocked</p>
              </div>
              <div className="min-w-0 max-w-[55%] text-right">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">Latest badge</p>
                {badge ? (
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-snug text-text">{badge.badge.name}</span>
                      {badge.unlockedOn && (
                        <span className="block font-mono text-xs text-muted tabular">{formatDate(badge.unlockedOn)}</span>
                      )}
                      <span className="mt-1 flex justify-end">
                        <NewBadgeFlag unlockedOn={badge.unlockedOn} />
                      </span>
                    </span>
                    <BadgeMedallion icon={badge.badge.icon} unlocked size={44} />
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">None yet. The first one is close.</p>
                )}
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <TextLink href="/points" className="text-sm">
                How to earn more
              </TextLink>
            </div>
          </Card>
        </div>

        {/* Latest sessions */}
        <section aria-labelledby="latest-sessions" className="lg:col-span-7">
          <Card className="p-3 sm:p-4">
            <SectionHeading
              id="latest-sessions"
              className="mb-1 px-2 pt-1"
              aside={
                <Link href="/sessions" className="hover:text-text">
                  All sessions →
                </Link>
              }
            >
              Latest sessions
            </SectionHeading>
            {recent.length > 0 ? (
              <div className="divide-y divide-border">
                {recent.map((s) => (
                  <SessionRow key={s.slug} session={s} sprintLabel={sprintLabel(bySlug.get(s.sprint))} />
                ))}
              </div>
            ) : (
              <EmptyState title="No sessions yet" className="m-2">
                Sessions show up here after they happen.
              </EmptyState>
            )}
          </Card>
        </section>

        {/* Latest files */}
        <section aria-labelledby="latest-files" className="lg:col-span-5">
          <Card className="p-3 sm:p-4">
            <SectionHeading
              id="latest-files"
              className="mb-1 px-2 pt-1"
              aside={
                <Link href="/resources" className="hover:text-text">
                  All files →
                </Link>
              }
            >
              Latest files
            </SectionHeading>
            {files.length > 0 ? (
              <div className="divide-y divide-border px-2">
                {files.map((f) => (
                  <FileRow
                    key={f.key}
                    label={f.label}
                    type={f.type}
                    url={f.url} size={f.size}
                    meta={
                      f.session ? <span>Session {f.session.number}</span> : f.sprint ? <span>Sprint {f.sprint.number}</span> : null
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No files yet" className="m-2">
                Slides, notes and exercises will appear here.
              </EmptyState>
            )}
          </Card>
        </section>
      </div>
    </Container>
  );
}
