import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeBlock } from '@/components/ui/code-block';
import { Container, SectionHeading, TextLink } from '@/components/ui/primitives';
import { getGlossary, getSprints, getTerm } from '@/lib/content';
import { sprintLabel } from '@/lib/labels';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getGlossary()).map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTerm((await params).slug);
  return { title: t ? `${t.term} · Glossary` : 'Glossary' };
}

export default async function TermPage({ params }: Props) {
  const { slug } = await params;
  const [term, terms, sprints] = await Promise.all([getTerm(slug), getGlossary(), getSprints()]);
  if (!term) notFound();
  const sprint = sprints.find((s) => s.slug === term.firstSprint);
  const related = term.related.map((r) => terms.find((t) => t.slug === r)).filter((t) => t !== undefined);
  const i = terms.findIndex((t) => t.slug === term.slug);
  const previous = terms[i - 1];
  const next = terms[i + 1];

  return (
    <Container className="max-w-[820px]">
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-muted">
        <Link href="/glossary" className="hover:text-text">
          Glossary
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>{term.term}</span>
      </nav>

      <article>
        <header className="pb-6 pt-6">
          {sprint && (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              First met in Sprint {sprint.number}
            </p>
          )}
          <h1 className="mt-3 font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-6xl">{term.term}</h1>
        </header>

        <p className="max-w-[60ch] text-xl leading-relaxed text-text">{term.explanation}</p>

        {term.code && (
          <section aria-labelledby="example" className="mt-10">
            <SectionHeading id="example">Example</SectionHeading>
            <CodeBlock code={term.code.code} language={term.code.language} />
          </section>
        )}

        <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
          {sprint && (
            <section aria-labelledby="sprint">
              <SectionHeading id="sprint">Where it comes up</SectionHeading>
              <TextLink href={`/sprints/${sprint.slug}`}>{sprintLabel(sprint)}</TextLink>
            </section>
          )}
          {related.length > 0 && (
            <section aria-labelledby="related">
              <SectionHeading id="related">Related words</SectionHeading>
              <ul className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/glossary/${r.slug}`}
                      className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-sm hover:border-primary hover:bg-primary-tint"
                    >
                      {r.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      <nav aria-label="Other words" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {previous ? (
          <Link href={`/glossary/${previous.slug}`} className="group rounded-lg p-3 hover:bg-surface-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{previous.term}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/glossary/${next.slug}`} className="group rounded-lg p-3 text-right hover:bg-surface-2">
            <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted">
              Next <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="mt-1 block font-medium group-hover:underline">{next.term}</span>
          </Link>
        )}
      </nav>
    </Container>
  );
}
