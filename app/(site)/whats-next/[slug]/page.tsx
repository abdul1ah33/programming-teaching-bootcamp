import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentIcon } from '@/components/ui/icon';
import { Card, Container, SectionHeading } from '@/components/ui/primitives';
import { getField, getFields, getSprints } from '@/lib/content';
import { sprintLabel } from '@/lib/labels';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getFields()).map((f) => ({ slug: f.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = await getField((await params).slug);
  return { title: f ? `${f.name} · What’s next` : 'What’s next' };
}

export default async function FieldPage({ params }: Props) {
  const { slug } = await params;
  const [field, fields, sprints] = await Promise.all([getField(slug), getFields(), getSprints()]);
  if (!field) notFound();
  const related = field.buildsOn.sprints.map((s) => sprints.find((x) => x.slug === s)).filter((s) => s !== undefined);
  const i = fields.findIndex((f) => f.slug === field.slug);
  const previous = fields[i - 1];
  const next = fields[i + 1];

  return (
    <Container className="max-w-[1000px]">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/whats-next" className="hover:text-text">
          What’s next
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>{field.name}</span>
      </nav>

      <header className="flex flex-col gap-5 pb-10 pt-6 sm:flex-row sm:items-start">
        <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-border bg-surface text-primary">
          <ContentIcon name={field.icon} className="size-7" strokeWidth={1.5} />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">To explore after the capstone</p>
          <h1 className="mt-2 font-serif text-[2.4rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-5xl">{field.name}</h1>
          <p className="mt-3 max-w-[56ch] text-lg text-muted">{field.summary}</p>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <section aria-labelledby="what">
            <SectionHeading id="what">What it is</SectionHeading>
            <p className="max-w-[62ch] text-[1.02rem] leading-relaxed">{field.whatItIs}</p>
          </section>

          <section aria-labelledby="builds">
            <SectionHeading id="builds">How it builds on what you know</SectionHeading>
            <p className="max-w-[62ch] leading-relaxed text-muted">{field.buildsOn.text}</p>
            {related.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {related.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/sprints/${s.slug}`}
                      className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-sm hover:border-primary hover:bg-primary-tint"
                    >
                      {sprintLabel(s)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="first">
            <SectionHeading id="first">A good first project</SectionHeading>
            <p className="max-w-[60ch] border-l-2 border-primary pl-4 font-serif text-xl leading-relaxed">{field.firstProject}</p>
          </section>
        </div>

        <aside className="space-y-5 lg:col-span-5">
          <Card as="section" aria-labelledby="learn" className="p-5">
            <SectionHeading id="learn">What you’d learn</SectionHeading>
            <ul className="space-y-2">
              {field.whatYoudLearn.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm leading-6">
                  <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </Card>
          <Card as="section" aria-labelledby="fit" className="p-5">
            <SectionHeading id="fit">A good fit if you enjoy…</SectionHeading>
            <ul className="space-y-2">
              {field.goodFitIf.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm leading-6">
                  <span aria-hidden="true" className="mt-[0.7rem] h-px w-3 shrink-0 bg-primary" />
                  {x}
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <nav aria-label="Other fields" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {previous ? (
          <Link href={`/whats-next/${previous.slug}`} className="group rounded-lg p-3 hover:bg-surface-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{previous.name}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/whats-next/${next.slug}`} className="group rounded-lg p-3 text-right hover:bg-surface-2">
            <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted">
              Next <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{next.name}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
