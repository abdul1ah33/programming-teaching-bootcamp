import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentIcon } from '@/components/ui/icon';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getFields, getSprints } from '@/lib/content';

export const metadata: Metadata = { title: 'After the course' };

export default async function WhatsNextPage() {
  const [fields, sprints] = await Promise.all([getFields(), getSprints()]);
  const capstone = sprints.find((s) => s.phase === 'capstone');

  return (
    <Container>
      <PageHeader
        eyebrow="For later"
        title="After the course"
        lead="Once you’ve finished all 10 sprints, coding opens lots of doors. These aren’t part of the course. They’re ideas for what you could explore next, if one sounds fun."
      >
        <p className="mt-4 max-w-[62ch] text-sm text-muted">
          For now the plan is the core path, finishing with{' '}
          {capstone ? (
            <Link href={`/sprints/${capstone.slug}`} className="font-medium text-primary underline underline-offset-2">
              Sprint {capstone.number}: {capstone.title}
            </Link>
          ) : (
            'the capstone'
          )}
          . Everything here builds on it.
        </p>
      </PageHeader>

      <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <li key={f.slug} className="bg-surface">
            <Link href={`/whats-next/${f.slug}`} className="group flex h-full flex-col p-5 hover:bg-surface-2/60 sm:p-6">
              <span className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-md border border-border text-primary">
                  <ContentIcon name={f.icon} className="size-5" strokeWidth={1.75} />
                </span>
                <span aria-hidden="true" />
              </span>
              <span className="mt-5 font-serif text-2xl font-medium leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {f.name}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{f.summary}</span>
              <span className="mt-auto pt-5 text-sm text-muted">
                {f.whatYoudLearn.slice(0, 2).join(' · ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
