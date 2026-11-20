import { BookA, BookOpen, FileCode2, FolderOpen, Map as MapIcon, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { BadgeMedallion } from '@/components/features/badge-medallion';
import { CurrentLessonTile } from '@/components/features/home/current-lesson-tile';
import { HomeworkTile } from '@/components/features/home/homework-tile';
import { NextLessonTile } from '@/components/features/home/next-lesson-tile';
import { PathDots, ProgressRing, Tile, tileClass } from '@/components/features/home/tiles';
import { NewBadgeFlag } from '@/components/features/new-badge-flag';
import { Container, cx } from '@/components/ui/primitives';
import { getBadges, getPointsLog, getProjects, getSessions, getSettings, getSprints } from '@/lib/content';
import { evaluateBadges, latestBadge } from '@/lib/derive/badges';
import { currentSprint, journeyComplete } from '@/lib/derive/current-sprint';
import { totalPoints } from '@/lib/derive/points';
import { sprintProgress } from '@/lib/derive/progress';

const SHORTCUTS = [
  { href: '/sessions', label: 'Lessons', icon: BookOpen },
  { href: '/resources', label: 'My files', icon: FolderOpen },
  { href: '/glossary', label: 'Word list', icon: BookA },
  { href: '/cheatsheets', label: 'Cheat sheets', icon: FileCode2 },
];

export default async function HomePage() {
  const [settings, sprints, sessions, projects, log, badges] = await Promise.all([
    getSettings(),
    getSprints(),
    getSessions(),
    getProjects(),
    getPointsLog(),
    getBadges(),
  ]);

  const current = currentSprint(sprints);
  const complete = journeyComplete(sprints);
  const progress = current ? sprintProgress(current) : undefined;
  const points = totalPoints(log, settings.pointsRules);
  const badge = latestBadge(
    evaluateBadges({ badges, sprints, sessions, projects, points: log, rules: settings.pointsRules }),
  );
  const position = current ? sprints.findIndex((s) => s.slug === current.slug) + 1 : 0;

  const lessons = sessions
    .filter((s) => s.status === 'planned')
    .map(({ slug, number, title, date, status, sprint }) => ({ slug, number, title, date, status, sprint }));

  // Everything not cancelled: the tile picks today's lesson or the last one held, in the browser.
  const pastLessons = sessions
    .filter((s) => s.status !== 'cancelled')
    .map(({ slug, number, title, date, status, sprint, files }) => ({
      slug,
      number,
      title,
      date,
      status,
      sprint,
      fileCount: files.length,
    }));

  const homework = sessions
    .filter((s) => s.homework?.status === 'assigned')
    .map((s) => ({ sessionSlug: s.slug, description: s.homework?.description ?? '', dueDate: s.homework?.dueDate ?? null }))
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'));

  return (
    <Container className="pb-4">
      <h1 className="pb-6 pt-10 font-serif text-[2.75rem] font-medium leading-none tracking-[-0.02em] sm:pb-8 sm:pt-14 sm:text-6xl">
        Hi {settings.studentFirstName}<span className="text-primary">.</span>
      </h1>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Row 1: lessons */}
        <div className="lg:col-span-6">
          <CurrentLessonTile lessons={pastLessons} />
        </div>
        <div className="lg:col-span-6">
          <NextLessonTile lessons={lessons} />
        </div>

        {/* Row 2: homework + what I'm learning */}
        <div className="lg:col-span-5">
          <HomeworkTile items={homework} />
        </div>
        {current && progress && (
          <div className="lg:col-span-7">
            <Tile
              href={`/sprints/${current.slug}`}
              label={complete ? 'Last sprint' : 'Now learning'}
              icon={<Sparkles className="size-4" aria-hidden="true" />}
            >
              <span className="mt-auto flex items-end justify-between gap-4 pt-8">
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-primary-hover dark:text-primary">Sprint {current.number}</span>
                  <span className="mt-1 block font-serif text-[1.75rem] font-medium leading-tight">{current.title}</span>
                </span>
                <span className="flex flex-col items-center gap-1">
                  <ProgressRing done={progress.checksDone} total={progress.checksTotal} />
                  <span className="text-xs text-muted">checklist</span>
                </span>
              </span>
            </Tile>
          </div>
        )}

        {/* Row 3: points + path */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-12">
          <Tile href="/points" label="Points" icon={<Star className="size-4" aria-hidden="true" />}>
            <span className="mt-auto block pt-8">
              <span className="block font-mono text-5xl font-medium leading-none tracking-[-0.03em] tabular sm:text-6xl">
                {points}
              </span>
              {badge && (
                <span className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <BadgeMedallion icon={badge.badge.icon} unlocked size={30} />
                  <span className="text-sm font-medium leading-tight">{badge.badge.name}</span>
                  <NewBadgeFlag unlockedOn={badge.unlockedOn} />
                </span>
              )}
            </span>
          </Tile>

          <Tile href="/roadmap" label="My path" icon={<MapIcon className="size-4" aria-hidden="true" />}>
            <span className="mt-auto block pt-8">
              <span className="block font-mono text-5xl font-medium leading-none tracking-[-0.03em] tabular sm:text-6xl">
                {position}
                <span className="text-2xl text-muted sm:text-3xl">/{sprints.length}</span>
              </span>
              <span className="mt-5 block">
                <PathDots statuses={sprints.map((s) => s.status)} />
              </span>
            </span>
          </Tile>
        </div>

        {/* Row 4: shortcuts */}
        <nav aria-label="Shortcuts" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:col-span-12">
          {SHORTCUTS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cx(tileClass(), 'flex-row items-center gap-3 !p-4')}>
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-on-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </Container>
  );
}
