import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BadgeMedallion } from '@/components/features/badge-medallion';
import { HomeworkCard } from '@/components/features/homework-card';
import { HowItWorks } from '@/components/features/how-it-works';
import { NewBadgeFlag } from '@/components/features/new-badge-flag';
import { NextSession } from '@/components/features/next-session';
import { ReadyChecks } from '@/components/features/ready-checks';
import { SessionRow } from '@/components/features/session-row';
import { FileRow } from '@/components/ui/file-row';
import { Card, Container, EmptyState, SectionHeading, TextLink } from '@/components/ui/primitives';
import { SegmentedProgress } from '@/components/ui/progress-bar';
import { getBadges, getPointsLog, getProjects, getSessions, getSettings, getSprints } from '@/lib/content';
import { evaluateBadges, latestBadge } from '@/lib/derive/badges';
import { currentSprint, journeyComplete } from '@/lib/derive/current-sprint';
import { formatDate } from '@/lib/derive/dates';
import { totalPoints } from '@/lib/derive/points';
import { sprintProgress } from '@/lib/derive/progress';
import { latestResources } from '@/lib/derive/resources';
import { recentSessions } from '@/lib/derive/sessions';
import { sprintLabel, sprintMap } from '@/lib/labels';

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
  const currentProgress = current ? sprintProgress(current) : undefined;
  const sprintsDone = sprints.filter((s) => s.status === 'done').length;
  const points = totalPoints(log, settings.pointsRules);
  const statuses = evaluateBadges({ badges, sprints, sessions, projects, points: log, rules: settings.pointsRules });
  const badge = latestBadge(statuses);
  const recent = recentSessions(sessions, 3);
  const files = latestResources(sprints, sessions, 3);

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

  // Homework still to do, the one due soonest first (undated last).
  const homework = sessions
    .filter((s) => s.homework && s.homework.status === 'assigned')
    .map((s) => ({
      sessionSlug: s.slug,
      sessionTitle: s.title,
      description: s.homework?.description ?? '',
      dueDate: s.homework?.dueDate ?? null,
    }))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

  return (
    <Container>
      <section className="pb-6 pt-10 sm:pt-14">
        <h1 className="font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-6xl">
          Hi {settings.studentFirstName}.
        </h1>
        <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-muted">
          {complete ? 'You’ve finished the whole course. Amazing work.' : 'Here’s what’s coming up and what you’re working on.'}
        </p>
      </section>

      <HowItWorks />

      {/* 1. What now: next lesson + homework */}
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
        <Card as="section" aria-label="Your next lesson">
          <NextSession sessions={planned} schedule={settings.scheduleText} />
        </Card>
        <Card as="section" aria-label="Homework">
          <HomeworkCard items={homework} />
        </Card>
      </div>

      {/* 2. What I'm learning now */}
      {current && currentProgress && (
        <section aria-labelledby="learning-now" className="mt-10">
          <h2 id="learning-now" className="text-xl font-semibold">
            {complete ? 'Your last sprint' : 'What you’re learning now'}
          </h2>
          <p className="mt-1 max-w-[62ch] text-sm text-muted">
            The course is split into 10 parts called <strong className="font-medium text-text">sprints</strong>. Each one
            takes a week or a few, and you finish it when you can do everything on its checklist.
          </p>

          <Card className="mt-4">
            <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row">
              <div className="md:w-[55%]">
                <p className="text-sm font-medium text-primary-hover dark:text-primary">Sprint {current.number}</p>
                <h3 className="mt-1 font-serif text-[1.75rem] font-medium leading-tight">{current.title}</h3>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-text">{current.goal}</p>
                <p className="mt-4 text-sm leading-relaxed">
                  <span className="font-medium">You’ll make: </span>
                  <span className="text-muted">{current.build}</span>
                </p>
              </div>
              <div className="border-t border-border pt-5 md:w-[45%] md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="font-medium">Your checklist</p>
                <p className="mb-3 mt-0.5 text-sm text-muted">
                  {currentProgress.checksDone === 0
                    ? 'Your teacher ticks these when you can do them on your own.'
                    : `${currentProgress.checksDone} of ${currentProgress.checksTotal} done. Keep going!`}
                </p>
                <ReadyChecks checks={current.readyChecks} compact />
              </div>
            </div>
            <div className="border-t border-border px-5 py-3 sm:px-6">
              <Link
                href={`/sprints/${current.slug}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
              >
                See everything in this sprint
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="shrink-0 text-sm">
              <span className="font-medium">Your path:</span>{' '}
              <span className="text-muted">
                {sprintsDone} of {sprints.length} sprints finished
              </span>
            </p>
            <div className="min-w-0 flex-1">
              <SegmentedProgress
                label="Sprints finished"
                segments={sprints.map((s) => ({
                  key: s.slug,
                  ratio: sprintProgress(s).ratio,
                  title: `Sprint ${s.number}: ${s.title}`,
                }))}
              />
            </div>
            <TextLink href="/roadmap" className="shrink-0 text-sm">
              See the whole path
            </TextLink>
          </div>
        </section>
      )}

      {/* 3. Points + badge, recent lessons, files */}
      <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Card as="section" aria-labelledby="points-heading" className="p-5 lg:col-span-3">
          <h2 id="points-heading" className="text-sm font-medium text-muted">
            My points
          </h2>
          <p className="mt-1 font-mono text-5xl font-medium text-text tabular">{points}</p>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-muted">Newest badge</p>
            {badge ? (
              <div className="mt-2 flex items-center gap-3">
                <BadgeMedallion icon={badge.badge.icon} unlocked size={44} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-text">{badge.badge.name}</span>
                    <NewBadgeFlag unlockedOn={badge.unlockedOn} />
                  </span>
                  {badge.unlockedOn && <span className="block text-sm text-muted">{formatDate(badge.unlockedOn)}</span>}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted">None yet. Your first one is close!</p>
            )}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <TextLink href="/points" className="text-sm">
              How to get more points
            </TextLink>
          </div>
        </Card>

        <section aria-labelledby="latest-sessions" className="lg:col-span-5">
          <Card className="h-full p-3 sm:p-4">
            <SectionHeading
              id="latest-sessions"
              className="mb-1 px-2 pt-1"
              aside={
                <Link href="/sessions" className="hover:text-text">
                  All lessons →
                </Link>
              }
            >
              Your last lessons
            </SectionHeading>
            {recent.length > 0 ? (
              <div className="divide-y divide-border">
                {recent.map((s) => (
                  <SessionRow key={s.slug} session={s} sprintLabel={sprintLabel(bySlug.get(s.sprint))} />
                ))}
              </div>
            ) : (
              <EmptyState title="No lessons yet" className="m-2">
                After each lesson, its notes and homework appear here.
              </EmptyState>
            )}
          </Card>
        </section>

        <section aria-labelledby="latest-files" className="lg:col-span-4">
          <Card className="h-full p-3 sm:p-4">
            <SectionHeading
              id="latest-files"
              className="mb-1 px-2 pt-1"
              aside={
                <Link href="/resources" className="hover:text-text">
                  All →
                </Link>
              }
            >
              New files
            </SectionHeading>
            {files.length > 0 ? (
              <div className="divide-y divide-border px-2">
                {files.map((f) => (
                  <FileRow key={f.key} label={f.label} type={f.type} url={f.url} size={f.size} />
                ))}
              </div>
            ) : (
              <EmptyState title="No files yet" className="m-2">
                Slides, notes and exercise sheets will appear here.
              </EmptyState>
            )}
          </Card>
        </section>
      </div>
    </Container>
  );
}
