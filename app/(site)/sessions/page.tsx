import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SessionsTimeline, TimelineList } from '@/components/features/sessions-timeline';
import { Container, EmptyState, PageHeader } from '@/components/ui/primitives';
import { getSessions, getSprints } from '@/lib/content';
import { sessionsDone, timeline } from '@/lib/derive/sessions';
import { plural, sprintLabel } from '@/lib/labels';

export const metadata: Metadata = { title: 'Lessons' };

export default async function SessionsPage() {
  const [sessions, sprints] = await Promise.all([getSessions(), getSprints()]);
  const ordered = timeline(sessions);
  const sprintOptions = sprints.map((s) => ({ slug: s.slug, label: sprintLabel(s) }));
  const labels = Object.fromEntries(sprintOptions.map((s) => [s.slug, s.label]));

  return (
    <Container className="max-w-[880px]">
      <PageHeader
        eyebrow={`${plural(sessionsDone(sessions), 'lesson')} so far`}
        title="Lessons"
        lead="Every lesson, newest first. Open one to see what we did, its files and the homework."
      />
      {ordered.length === 0 ? (
        <EmptyState title="No lessons yet">Your first lesson will show up here.</EmptyState>
      ) : (
        // Without JavaScript (or before it loads) the full list shows; filters appear once it's ready.
        <Suspense fallback={<TimelineList sessions={ordered} sprintLabels={labels} />}>
          <SessionsTimeline sessions={ordered} sprints={sprintOptions} />
        </Suspense>
      )}
    </Container>
  );
}
