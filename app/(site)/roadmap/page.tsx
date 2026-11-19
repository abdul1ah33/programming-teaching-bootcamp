import type { Metadata } from 'next';
import { RoadMap } from '@/components/features/road-map';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getSprints } from '@/lib/content';
import { overallProgress } from '@/lib/derive/progress';

export const metadata: Metadata = { title: 'Road map' };

export default async function RoadMapPage() {
  const sprints = await getSprints();
  const progress = overallProgress(sprints);
  return (
    <Container>
      <PageHeader
        eyebrow={`${progress.sprintsDone} of ${progress.sprintsTotal} sprints done`}
        title="The road map"
        lead="Ten stops, from first ideas to a finished project. Each stop is a sprint. The times are estimates: you move on when you’re ready, not when the calendar says so."
      >
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Legend">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-full bg-primary" /> Done
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="grid size-3 place-items-center rounded-full border-2 border-primary">
              <span className="size-1 rounded-full bg-primary" />
            </span>{' '}
            In progress
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-full border border-border-strong" /> Upcoming
          </li>
        </ul>
      </PageHeader>
      <div className="mx-auto max-w-[980px]">
        <RoadMap sprints={sprints} />
      </div>
    </Container>
  );
}
