import type { Metadata } from 'next';
import Link from 'next/link';
import { NewMonthHint } from '@/components/features/new-month-hint';
import { Container, EmptyState, PageHeader } from '@/components/ui/primitives';
import { getMonthReport, getReportMonths, getSettings } from '@/lib/content';
import { formatMonth } from '@/lib/derive/dates';
import { sprintLabel } from '@/lib/labels';

export const metadata: Metadata = { title: 'Monthly reports' };

export default async function ReportsPage() {
  const [settings, months] = await Promise.all([getSettings(), getReportMonths()]);
  const reports = await Promise.all([...months].reverse().map((m) => getMonthReport(m)));

  return (
    <Container className="max-w-[880px]">
      <PageHeader
        eyebrow="For parents"
        title="Monthly reports"
        lead={`A one-page summary of each month of ${settings.studentFirstName}’s learning: sessions, progress, points and a note from the teacher. Each one prints on a single A4 page.`}
      />
      <NewMonthHint lastMonth={months.at(-1)} />
      {reports.length === 0 ? (
        <EmptyState title="No reports yet">The first report appears in the month lessons start.</EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {reports.map((r) => (
            <li key={r.month}>
              <Link href={`/reports/${r.month}`} className="group grid gap-2 px-4 py-4 hover:bg-surface-2/60 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-4">
                <span className="font-serif text-xl font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {formatMonth(r.month)}
                </span>
                <span className="font-mono text-xs text-muted tabular">
                  {r.sessions.held}/{r.sessions.planned} sessions · +{r.points.earned} points · {r.checksTicked.length} checks
                  {r.currentSprint && <span className="hidden md:inline"> · {sprintLabel(r.currentSprint)}</span>}
                </span>
                <span className="text-xs text-muted">
                  {r.inProgress ? 'In progress' : r.note ? 'With teacher’s note' : 'Stats only'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
