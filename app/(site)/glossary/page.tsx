import type { Metadata } from 'next';
import { GlossaryList } from '@/components/features/glossary-list';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getGlossary, getSprints } from '@/lib/content';
import { sprintLabel, sprintMap } from '@/lib/labels';

export const metadata: Metadata = { title: 'Word list' };

export default async function GlossaryPage() {
  const [terms, sprints] = await Promise.all([getGlossary(), getSprints()]);
  const bySlug = sprintMap(sprints);
  const items = terms.map((t) => ({
    slug: t.slug,
    term: t.term,
    explanation: t.explanation,
    sprint: t.firstSprint,
    sprintNumber: bySlug.get(t.firstSprint)?.number ?? 0,
  }));
  const used = sprints.filter((s) => terms.some((t) => t.firstSprint === s.slug)).map((s) => ({ slug: s.slug, label: sprintLabel(s) }));

  return (
    <Container className="max-w-[960px]">
      <PageHeader
        eyebrow={`${terms.length} words`}
        title="Word list"
        lead="Coding words you’ll hear in lessons, explained in plain English with a small example. Stuck on a word? Look it up here."
      />
      <GlossaryList items={items} sprints={used} />
    </Container>
  );
}
