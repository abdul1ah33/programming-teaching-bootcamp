import type { Metadata } from 'next';
import { GlossaryList } from '@/components/features/glossary-list';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getGlossary, getSprints } from '@/lib/content';
import { sprintLabel, sprintMap } from '@/lib/labels';

export const metadata: Metadata = { title: 'Glossary' };

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
        title="Glossary"
        lead="The words you’ll meet on the way, each explained in a few sentences with a small example."
      />
      <GlossaryList items={items} sprints={used} />
    </Container>
  );
}
