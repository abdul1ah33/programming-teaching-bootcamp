import type { Metadata } from 'next';
import { RoadMap } from '@/components/features/road-map';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getSprints } from '@/lib/content';
import { overallProgress } from '@/lib/derive/progress';

export const metadata: Metadata = { title: 'My path' };

export default async function RoadMapPage() {
  const sprints = await getSprints();
  const progress = overallProgress(sprints);
  return (
    <Container>
      <PageHeader
        eyebrow={`${progress.sprintsDone} of ${progress.sprintsTotal} sprints finished`}
        title="My path"
        lead="The course has 10 parts called sprints, from your first ideas to a project of your own. Tap any sprint to see what’s in it. There’s no rush: you move on when you’re ready, not when the calendar says so."
      >
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted" aria-label="What the circles mean">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-full bg-primary" /> Finished
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="grid size-3 place-items-center rounded-full border-2 border-primary">
              <span className="size-1 rounded-full bg-primary" />
            </span>{' '}
            You’re here
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-full border border-control" /> Coming up
          </li>
        </ul>
      </PageHeader>
      <div className="mx-auto max-w-[980px]">
        <RoadMap sprints={sprints} />
      </div>
    </Container>
  );
}
