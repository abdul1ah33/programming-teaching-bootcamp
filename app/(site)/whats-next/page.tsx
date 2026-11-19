import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentIcon } from '@/components/ui/icon';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getFields, getSprints } from '@/lib/content';

export const metadata: Metadata = { title: 'What’s next' };

export default async function WhatsNextPage() {
  const [fields, sprints] = await Promise.all([getFields(), getSprints()]);
  const capstone = sprints.find((s) => s.phase === 'capstone');

  return (
    <Container>
      <PageHeader
        eyebrow="After the capstone"
        title="What’s next"
        lead="Programming opens a lot of doors. These aren’t part of the course: they’re places to explore once the ten sprints are done, if one of them catches your interest."
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
        {fields.map((f, i) => (
          <li key={f.slug} className="bg-surface">
            <Link href={`/whats-next/${f.slug}`} className="group flex h-full flex-col p-5 hover:bg-surface-2/60 sm:p-6">
              <span className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-md border border-border text-primary">
                  <ContentIcon name={f.icon} className="size-5" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-xs text-muted tabular">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="mt-5 font-serif text-2xl font-medium leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {f.name}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-muted">{f.summary}</span>
              <span className="mt-auto pt-5 font-mono text-xs text-muted">
                {f.whatYoudLearn.slice(0, 2).join(' · ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
