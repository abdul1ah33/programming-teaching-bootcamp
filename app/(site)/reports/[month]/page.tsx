import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeMedallion } from '@/components/features/badge-medallion';
import { PrintButton } from '@/components/features/print-button';
import { RichText } from '@/components/features/rich-text';
import { Container } from '@/components/ui/primitives';
import { StatusPill } from '@/components/ui/status-pill';
import { buildDate, getMonthlyNoteBody, getMonthReport, getReportMonths, getSettings } from '@/lib/content';
import { formatDate, formatMonth } from '@/lib/derive/dates';
import { isEmptyReport } from '@/lib/derive/reports';
import { phaseLabel, plural, sprintLabel } from '@/lib/labels';
import type { ReactNode } from 'react';

type Props = { params: Promise<{ month: string }> };

export async function generateStaticParams() {
  return (await getReportMonths()).map((month) => ({ month }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Report · ${formatMonth((await params).month)}` };
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 print:rounded-md print:p-2.5">
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="mt-1.5 font-mono text-3xl font-medium text-text tabular print:mt-0.5 print:text-xl">{value}</dd>
      {sub && <dd className="mt-0.5 text-xs text-muted">{sub}</dd>}
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 text-sm font-semibold text-text print:mb-1 print:text-[9.5pt]">{title}</h2>
      {children}
    </section>
  );
}

const None = ({ children }: { children: ReactNode }) => <p className="text-sm text-muted print:text-[8.5pt]">{children}</p>;

export default async function ReportPage({ params }: Props) {
  const { month } = await params;
  const months = await getReportMonths();
  if (!months.includes(month)) notFound();
  const [report, settings, body] = await Promise.all([getMonthReport(month), getSettings(), getMonthlyNoteBody(month)]);
  const name = settings.studentFirstName;
  const i = months.indexOf(month);
  const previous = months[i - 1];
  const next = months[i + 1];
  const note = report.note;
  const empty = isEmptyReport(report);

  return (
    <Container className="report max-w-[880px]">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-8 print:hidden">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/reports" className="hover:text-text">
            Monthly reports
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span>{formatMonth(month)}</span>
        </nav>
        <PrintButton label="Print / Save as PDF" />
      </div>

      <article className="pt-6 print:pt-0">
        <header className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between print:flex-row print:items-end print:justify-between print:pb-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Monthly progress report</p>
            <h1 className="mt-2 font-serif text-[2.4rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-5xl print:mt-1 print:text-[22pt]">
              {name} · {formatMonth(month)}
            </h1>
          </div>
          <p className="text-sm text-muted sm:text-right print:text-right print:text-[8.5pt]">
            {settings.siteTitle}
            <br />
            Teacher: {settings.teacherName}
            <br />
            {report.inProgress ? `Month in progress · as of ${formatDate(buildDate())}` : `Updated ${formatDate(buildDate())}`}
          </p>
        </header>

        {empty && (
          <p className="mt-6 rounded-md border border-dashed border-border-strong px-4 py-3 text-sm text-muted">
            Nothing was recorded this month.
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 print:mt-3 print:grid-cols-4 print:gap-2">
          <Stat
            label="Sessions held"
            value={
              <>
                {report.sessions.held}
                <span className="text-lg text-muted print:text-sm"> / {report.sessions.planned}</span>
              </>
            }
            sub={report.sessions.cancelled ? `${report.sessions.cancelled} cancelled` : 'held / planned'}
          />
          <Stat label="Points earned" value={`+${report.points.earned}`} sub={plural(report.points.entries, 'entry', 'entries')} />
          <Stat label="Checks ticked" value={report.checksTicked.length} sub="ready-to-move-on checks" />
          <Stat label="Badges" value={report.badgesUnlocked.length} sub="unlocked this month" />
        </dl>

        <div className="mt-8 grid gap-8 md:grid-cols-2 print:mt-4 print:grid-cols-2 print:gap-x-6 print:gap-y-3">
          <Block title="Where things stand">
            {report.currentSprint ? (
              <p className="text-sm print:text-[9pt]">
                {report.inProgress ? 'Working on ' : 'At the end of the month: '}
                <Link href={`/sprints/${report.currentSprint.slug}`} className="font-medium hover:underline">
                  {sprintLabel(report.currentSprint)}
                </Link>{' '}
                <span className="text-muted">({phaseLabel(report.currentSprint.phase)})</span>
              </p>
            ) : (
              <None>All sprints complete.</None>
            )}
            {report.sprintsCompleted.length > 0 && (
              <ul className="mt-2 space-y-1">
                {report.sprintsCompleted.map((s) => (
                  <li key={s.slug} className="flex items-center gap-2 text-sm print:text-[9pt]">
                    <Check className="size-4 text-primary" aria-hidden="true" />
                    Completed {sprintLabel(s)}
                    {s.completedOn && <span className="font-mono text-xs text-muted tabular">{formatDate(s.completedOn, 'day-month')}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Block>

          <Block title="Ready-to-move-on checks ticked">
            {report.checksTicked.length > 0 ? (
              <ul className="space-y-1">
                {report.checksTicked.map((c) => (
                  <li key={`${c.sprint.slug}-${c.text}`} className="flex gap-2 text-sm print:text-[9pt]">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      {c.text} <span className="text-muted">· Sprint {c.sprint.number}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <None>None this month.</None>
            )}
          </Block>

          <Block title="Projects finished">
            {report.projectsFinished.length > 0 ? (
              <ul className="space-y-1">
                {report.projectsFinished.map((p) => (
                  <li key={p.slug} className="text-sm print:text-[9pt]">
                    <Link href={`/projects/${p.slug}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    {p.finishedOn && <span className="ml-2 font-mono text-xs text-muted tabular">{formatDate(p.finishedOn, 'day-month')}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <None>None this month.</None>
            )}
          </Block>

          <Block title="Badges unlocked">
            {report.badgesUnlocked.length > 0 ? (
              <ul className="space-y-1.5">
                {report.badgesUnlocked.map((b) => (
                  <li key={b.badge.slug} className="flex items-center gap-2.5 text-sm print:text-[9pt]">
                    <BadgeMedallion icon={b.badge.icon} unlocked size={28} />
                    <span className="font-medium">{b.badge.name}</span>
                    {b.unlockedOn && <span className="font-mono text-xs text-muted tabular">{formatDate(b.unlockedOn, 'day-month')}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <None>None this month.</None>
            )}
          </Block>
        </div>

        <section className="mt-8 break-inside-avoid print:mt-4">
          <h2 className="mb-2 text-sm font-semibold print:mb-1 print:text-[9.5pt]">Sessions</h2>
          {report.sessions.list.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface print:rounded-md">
              {report.sessions.list.map((s) => (
                <li key={s.slug} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-3 py-2 text-sm print:py-1 print:text-[8.5pt]">
                  <span className="font-mono text-xs text-muted tabular">{formatDate(s.date, 'day-month')}</span>
                  <Link href={`/sessions/${s.slug}`} className="min-w-0 truncate hover:underline">
                    <span className="font-mono text-muted tabular">#{s.number}</span> {s.title}
                  </Link>
                  <StatusPill status={s.status} />
                </li>
              ))}
            </ul>
          ) : (
            <None>No sessions this month.</None>
          )}
        </section>

        {note && (
          <section aria-labelledby="note" className="mt-8 break-inside-avoid border-t border-border pt-6 print:mt-4 print:pt-3">
            <h2 id="note" className="font-serif text-2xl font-medium print:text-[13pt]">
              From the teacher
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-[1.4fr_1fr] print:mt-2 print:grid-cols-[1.4fr_1fr] print:gap-4">
              <div>
                {body && <RichText node={body} className="text-[0.98rem] print:text-[9pt] print:leading-snug" />}
                {note.messageToParents && (
                  <div className="mt-5 border-l-2 border-primary pl-4 print:mt-2 print:pl-3">
                    <p className="text-sm font-semibold print:text-[9pt]">For parents</p>
                    <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-muted print:text-[8.5pt] print:leading-snug">
                      {note.messageToParents}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-5 print:space-y-2">
                {note.highlights.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold print:text-[9pt]">Highlights</p>
                    <ul className="mt-1.5 space-y-1">
                      {note.highlights.map((h) => (
                        <li key={h} className="flex gap-2 text-sm print:text-[8.5pt]">
                          <span aria-hidden="true" className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {note.focusNextMonth.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold print:text-[9pt]">Focus for next month</p>
                    <ul className="mt-1.5 space-y-1">
                      {note.focusNextMonth.map((f) => (
                        <li key={f} className="flex gap-2 text-sm print:text-[8.5pt]">
                          <span aria-hidden="true" className="mt-[0.6rem] h-px w-2.5 shrink-0 bg-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </article>

      <nav aria-label="Other months" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2 print:hidden">
        {previous ? (
          <Link href={`/reports/${previous}`} className="group rounded-lg p-3 hover:bg-surface-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous month
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{formatMonth(previous)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/reports/${next}`} className="group rounded-lg p-3 text-right hover:bg-surface-2">
            <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted">
              Next month <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{formatMonth(next)}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
