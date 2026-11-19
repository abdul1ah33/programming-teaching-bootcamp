import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeWall } from '@/components/features/badge-wall';
import { PointsChart } from '@/components/features/points-chart';
import { PointsThisMonth } from '@/components/features/points-this-month';
import { Card, Container, EmptyState, SectionHeading } from '@/components/ui/primitives';
import { getBadges, getPointsLog, getProjects, getSessions, getSettings, getSprints } from '@/lib/content';
import { evaluateBadges } from '@/lib/derive/badges';
import { formatDate } from '@/lib/derive/dates';
import { activityLabel, pointsLog, pointsSeries, totalPoints } from '@/lib/derive/points';

export const metadata: Metadata = { title: 'Points' };

export default async function PointsPage() {
  const [settings, log, badges, sprints, sessions, projects] = await Promise.all([
    getSettings(),
    getPointsLog(),
    getBadges(),
    getSprints(),
    getSessions(),
    getProjects(),
  ]);
  const rules = settings.pointsRules;
  const total = totalPoints(log, rules);
  const entries = pointsLog(log, rules);
  const series = pointsSeries(log, rules);
  const statuses = evaluateBadges({ badges, sprints, sessions, projects, points: log, rules });
  const unlocked = statuses.filter((s) => s.unlocked).length;
  const sessionTitle = new Map(sessions.map((s) => [s.slug, `Lesson ${s.number}`]));

  return (
    <Container>
      <header className="grid gap-6 pb-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="text-sm font-medium text-primary-hover dark:text-primary">My points and badges</p>
          <h1 className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-6xl font-medium tracking-[-0.03em] text-text tabular sm:text-7xl">{total}</span>
            <span className="font-serif text-2xl font-medium text-muted">points</span>
          </h1>
          <p className="mt-3 text-sm">
            <PointsThisMonth entries={entries.map((e) => ({ date: e.date, points: e.resolved }))} />
            <span className="text-muted"> · {unlocked} of {statuses.length} badges earned</span>
          </p>
        </div>
        <p className="max-w-[46ch] text-muted lg:col-span-5">
          You get points for practising and for working things out yourself, not for being fast. Finding and
          fixing your own bug is worth points too.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card as="section" aria-labelledby="over-time" className="min-w-0 p-5 lg:col-span-8">
          <SectionHeading id="over-time">Your points so far</SectionHeading>
          {series.length > 0 ? (
            <PointsChart series={series} />
          ) : (
            <EmptyState title="No points yet">The chart starts with the first points you earn.</EmptyState>
          )}
        </Card>

        <Card as="section" aria-labelledby="rules" className="p-5 lg:col-span-4">
          <SectionHeading id="rules">How to get points</SectionHeading>
          <ul className="divide-y divide-border">
            {rules.map((r) => (
              <li key={r.key} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-sm">{r.label}</span>
                <span className="font-mono text-sm font-medium tabular">+{r.points}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted">
            Sometimes there are bonus points for something special. Your teacher adds your points after each lesson.
          </p>
        </Card>
      </div>

      <section aria-labelledby="badges" className="mt-12">
        <SectionHeading id="badges" aside={`${unlocked}/${statuses.length}`}>
          Badges
        </SectionHeading>
        <p className="-mt-2 mb-4 text-sm text-muted">Grey badges are still locked. Each one says how to get it.</p>
        {statuses.length > 0 ? <BadgeWall statuses={statuses} /> : <EmptyState title="No badges set up yet" />}
      </section>

      <section aria-labelledby="log" className="mt-12">
        <SectionHeading id="log" aside={entries.length}>
          Every point you’ve earned
        </SectionHeading>
        {entries.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {entries.map((e) => (
              <li key={e.slug} className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 px-4 py-3 sm:grid-cols-[6rem_1fr_auto]">
                <span className="text-sm text-muted">{formatDate(e.date, 'day-month')}</span>
                <span className="min-w-0">
                  <span className="block text-sm text-text">{e.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {activityLabel(e.activity, rules)}
                    {e.session && sessionTitle.has(e.session) && (
                      <>
                        {' · '}
                        <Link href={`/sessions/${e.session}`} className="hover:text-text hover:underline">
                          {sessionTitle.get(e.session)}
                        </Link>
                      </>
                    )}
                  </span>
                </span>
                <span className="font-mono text-sm font-medium tabular text-primary-hover dark:text-primary">
                  {e.resolved >= 0 ? `+${e.resolved}` : e.resolved}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No points yet">Your points show up here after each lesson.</EmptyState>
        )}
      </section>
    </Container>
  );
}
