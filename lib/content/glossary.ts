import type { GlossaryTerm } from '@/lib/model/types';
import { memo, reader } from './reader';

export const getGlossary = memo(async (): Promise<GlossaryTerm[]> => {
  const all = await reader.collections.glossary.all();
  return all
    .map(({ slug, entry }) => {
      const code = entry.codeExample.code.trim();
      return {
        slug,
        term: entry.term,
        firstSprint: entry.firstSprint,
        explanation: entry.explanation,
        code: code ? { language: entry.codeExample.language, code: entry.codeExample.code.replace(/\s+$/, '') } : null,
        related: [...entry.relatedTerms],
      };
    })
    .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
});

export async function getTerm(slug: string): Promise<GlossaryTerm | undefined> {
  return (await getGlossary()).find((t) => t.slug === slug);
}
