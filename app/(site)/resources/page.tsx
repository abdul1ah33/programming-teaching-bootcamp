import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResourceList, ResourceListFallback } from '@/components/features/resource-list';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getSessions, getSprints } from '@/lib/content';
import { allResources } from '@/lib/derive/resources';
import { plural, sprintLabel } from '@/lib/labels';

export const metadata: Metadata = { title: 'My files' };

export default async function ResourcesPage() {
  const [sprints, sessions] = await Promise.all([getSprints(), getSessions()]);
  const resources = allResources(sprints, sessions);
  const sprintOptions = sprints.map((s) => ({ slug: s.slug, label: sprintLabel(s) }));
  return (
    <Container className="max-w-[880px]">
      <PageHeader
        eyebrow={plural(resources.length, 'file')}
        title="My files"
        lead="Every file from your lessons and sprints in one place: slides, notes, exercises and answers."
      />
      <Suspense fallback={<ResourceListFallback resources={resources} sprints={sprintOptions} />}>
        <ResourceList resources={resources} sprints={sprintOptions} />
      </Suspense>
    </Container>
  );
}
