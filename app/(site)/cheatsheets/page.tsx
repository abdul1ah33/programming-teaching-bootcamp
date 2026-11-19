import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, PageHeader } from '@/components/ui/primitives';
import { getCheatSheets, getSprints } from '@/lib/content';

export const metadata: Metadata = { title: 'Cheat sheets' };

export default async function CheatSheetsPage() {
  const [sheets, sprints] = await Promise.all([getCheatSheets(), getSprints()]);
  const number = (slug: string) => sprints.find((s) => s.slug === slug)?.number ?? 0;
  return (
    <Container className="max-w-[880px]">
      <PageHeader
        eyebrow="Help"
        title="Cheat sheets"
        lead="All the code you need on a few pages, in the order you learn it. Keep one open while you practise, or print it out."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {sheets.map((sheet) => {
          const nums = sheet.sections.map((s) => number(s.sprint));
          const items = sheet.sections.reduce((n, s) => n + s.items.length, 0);
          return (
            <li key={sheet.slug}>
              <Link href={`/cheatsheets/${sheet.slug}`} className="group block rounded-lg border border-border bg-surface p-5 hover:border-border-strong">
                <span className="text-sm text-muted">
                  Sprints {Math.min(...nums)}–{Math.max(...nums)} · {items} examples
                </span>
                <span className="mt-2 block font-serif text-2xl font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {sheet.title}
                </span>
                <span className="mt-2 line-clamp-3 block text-sm text-muted">{sheet.intro}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
