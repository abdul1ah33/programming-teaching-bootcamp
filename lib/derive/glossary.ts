import type { GlossaryTerm } from '@/lib/model/types';

export type Segment = { text: string; slug?: string };

type TermLike = Pick<GlossaryTerm, 'slug' | 'term' | 'firstSprint'>;

/** The phrases that count as a mention of a term: its name, the name without "(…)", and each half of "X and Y". */
export function termAliases(term: string): string[] {
  const lower = term.toLowerCase().trim();
  const base = lower.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const aliases = new Set([lower, base]);
  if (base.includes(' and ')) base.split(' and ').forEach((p) => aliases.add(p.trim()));
  return [...aliases].filter((a) => a.length > 1);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches the alias and simple plurals: loop/loops, class/classes, dictionary/dictionaries. */
function aliasPattern(alias: string): string {
  const e = escape(alias);
  if (/[^aeiou]y$/.test(alias)) return `${escape(alias.slice(0, -1))}(?:y|ies)`;
  return `${e}(?:es|s)?`;
}

/**
 * Splits each text into plain and linked segments, linking glossary terms where they're mentioned.
 * Each term is linked once (its first mention across all texts). When two terms share an alias
 * ("stack"), the one introduced in `currentSprint` wins.
 */
export function linkTerms(texts: readonly string[], terms: readonly TermLike[], currentSprint?: string): Segment[][] {
  const byAlias = new Map<string, TermLike>();
  for (const t of terms) {
    for (const a of termAliases(t.term)) {
      const existing = byAlias.get(a);
      if (!existing || (existing.firstSprint !== currentSprint && t.firstSprint === currentSprint)) byAlias.set(a, t);
    }
  }
  const aliases = [...byAlias.keys()].sort((a, b) => b.length - a.length);
  if (aliases.length === 0) return texts.map((text) => [{ text }]);

  const re = new RegExp(`\\b(${aliases.map(aliasPattern).join('|')})\\b`, 'gi');
  const used = new Set<string>();

  const exact = aliases.map((a) => ({ alias: a, re: new RegExp(`^${aliasPattern(a)}$`, 'i') }));
  const resolve = (match: string): TermLike | undefined => {
    const hit = exact.find((x) => x.re.test(match));
    return hit ? byAlias.get(hit.alias) : undefined;
  };

  return texts.map((text) => {
    const out: Segment[] = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const term = resolve(m[0]);
      if (!term || used.has(term.slug)) continue;
      used.add(term.slug);
      if (start > last) out.push({ text: text.slice(last, start) });
      out.push({ text: m[0], slug: term.slug });
      last = start + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out.length ? out : [{ text }];
  });
}

/** Terms introduced in a sprint, in A–Z order. */
export function termsForSprint<T extends TermLike>(terms: readonly T[], sprint: string): T[] {
  return terms.filter((t) => t.firstSprint === sprint).sort((a, b) => a.term.localeCompare(b.term));
}

/** Group terms by first letter for an A–Z list. */
export function groupByLetter<T extends Pick<GlossaryTerm, 'term'>>(terms: readonly T[]): { letter: string; terms: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const t of [...terms].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))) {
    const first = t.term.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    groups.set(letter, [...(groups.get(letter) ?? []), t]);
  }
  return [...groups.entries()].map(([letter, list]) => ({ letter, terms: list }));
}
