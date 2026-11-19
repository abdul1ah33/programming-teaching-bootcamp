'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SelectFilter } from '@/components/ui/filter';
import { EmptyState } from '@/components/ui/primitives';
import { groupByLetter } from '@/lib/derive/glossary';

export interface GlossaryItem {
  slug: string;
  term: string;
  explanation: string;
  sprint: string;
  sprintNumber: number;
}

const normalise = (s: string) => s.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');

/** A–Z glossary with an instant text filter and a sprint filter. */
export function GlossaryList({ items, sprints }: { items: GlossaryItem[]; sprints: { slug: string; label: string }[] }) {
  const [query, setQuery] = useState('');
  const [sprint, setSprint] = useState('all');

  const shown = useMemo(() => {
    const q = normalise(query.trim());
    return items.filter(
      (t) =>
        (sprint === 'all' || t.sprint === sprint) &&
        (!q || normalise(t.term).includes(q) || normalise(t.explanation).includes(q)),
    );
  }, [items, query, sprint]);
  const groups = groupByLetter(shown);
  const allLetters = groupByLetter(items).map((g) => g.letter);
  const present = new Set(groups.map((g) => g.letter));

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-8 border-b border-border bg-bg/95 px-4 pb-4 pt-2 backdrop-blur-[6px] sm:mx-0 sm:rounded-lg sm:border sm:bg-surface sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="glossary-search" className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
              Find a word
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                id="glossary-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. loop, pointer, list"
                autoComplete="off"
                className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-sm text-text placeholder:text-muted/80 hover:border-border-strong"
              />
            </div>
          </div>
          <SelectFilter
            id="glossary-sprint"
            label="Sprint"
            value={sprint}
            onChange={setSprint}
            options={[{ value: 'all', label: 'All sprints' }, ...sprints.map((s) => ({ value: s.slug, label: s.label }))]}
          />
        </div>
        <nav aria-label="Jump to letter" className="mt-3 flex flex-wrap gap-1">
          {allLetters.map((l) =>
            present.has(l) ? (
              <a key={l} href={`#letter-${l}`} className="grid size-7 place-items-center rounded font-mono text-xs text-text hover:bg-primary-tint">
                {l}
              </a>
            ) : (
              <span key={l} aria-hidden="true" className="grid size-7 place-items-center font-mono text-xs text-muted/50">
                {l}
              </span>
            ),
          )}
        </nav>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} terms shown
      </p>

      {groups.length === 0 ? (
        <EmptyState title="No words match">
          <button
            type="button"
            className="font-medium text-primary underline underline-offset-2"
            onClick={() => {
              setQuery('');
              setSprint('all');
            }}
          >
            Show every word
          </button>
        </EmptyState>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <section key={g.letter} aria-labelledby={`letter-${g.letter}`} className="scroll-mt-48">
              <h2 id={`letter-${g.letter}`} className="mb-3 border-b border-border pb-2 font-serif text-2xl font-medium">
                {g.letter}
              </h2>
              <ul className="grid gap-x-8 gap-y-1 md:grid-cols-2">
                {g.terms.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/glossary/${t.slug}`} className="group block rounded-md px-2 py-2.5 -mx-2 hover:bg-surface-2/70">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-text group-hover:underline">{t.term}</span>
                        <span className="shrink-0 font-mono text-xs text-muted tabular">Sprint {t.sprintNumber}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{t.explanation}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
