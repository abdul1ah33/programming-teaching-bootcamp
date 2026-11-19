import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/features/print-button';
import { CodeBlock } from '@/components/ui/code-block';
import { Container } from '@/components/ui/primitives';
import { getCheatSheet, getCheatSheets, getSprints } from '@/lib/content';
import type { CheatSheetSection } from '@/lib/model/types';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCheatSheets()).map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCheatSheet((await params).slug);
  return { title: c?.title ?? 'Cheat sheet' };
}

export default async function CheatSheetPage({ params }: Props) {
  const { slug } = await params;
  const [sheet, sprints, sheets] = await Promise.all([getCheatSheet(slug), getSprints(), getCheatSheets()]);
  if (!sheet) notFound();

  // Group consecutive sections by sprint, keeping the order he learns them.
  const groups: { sprint: string; sections: CheatSheetSection[] }[] = [];
  for (const section of sheet.sections) {
    const last = groups.at(-1);
    if (last?.sprint === section.sprint) last.sections.push(section);
    else groups.push({ sprint: section.sprint, sections: [section] });
  }
  const other = sheets.find((s) => s.slug !== sheet.slug);

  return (
    <Container className="cheatsheet">
      <header className="flex flex-col gap-4 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14 print:pb-3 print:pt-0">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted print:hidden">
            <Link href="/cheatsheets" className="hover:text-text">
              Cheat sheets
            </Link>
          </p>
          <h1 className="mt-3 font-serif text-[2.4rem] font-medium leading-[1.05] tracking-[-0.015em] sm:text-5xl print:mt-0 print:text-2xl">
            {sheet.title}
          </h1>
          <p className="mt-3 max-w-[62ch] text-muted print:mt-1 print:text-xs">{sheet.intro}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          {other && (
            <Link href={`/cheatsheets/${other.slug}`} className="inline-flex h-9 items-center rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-text">
              {other.title} →
            </Link>
          )}
          <PrintButton />
        </div>
      </header>

      <div className="space-y-12 print:space-y-4">
        {groups.map((g) => {
          const sprint = sprints.find((s) => s.slug === g.sprint);
          return (
            <section key={g.sprint} aria-labelledby={`sprint-${g.sprint}`}>
              <h2 id={`sprint-${g.sprint}`} className="mb-4 flex items-baseline gap-3 border-b border-border pb-2 print:mb-2 print:pb-1">
                <span className="font-mono text-sm text-primary-hover tabular dark:text-primary">Sprint {sprint?.number}</span>
                {sprint && (
                  <Link href={`/sprints/${sprint.slug}`} className="font-serif text-xl font-medium hover:underline print:text-base">
                    {sprint.title}
                  </Link>
                )}
              </h2>
              <div className="cheatsheet-grid columns-1 gap-6 lg:columns-2 print:columns-2 print:gap-4">
                {g.sections.map((section) => (
                  <div key={section.heading} className="mb-6 break-inside-avoid print:mb-3">
                    <h3 className="mb-2 text-[0.95rem] font-semibold print:mb-1 print:text-[10pt]">{section.heading}</h3>
                    <div className="space-y-3 print:space-y-1.5">
                      {section.items.map((item) => (
                        <div key={item.label} className="break-inside-avoid">
                          <p className="mb-1 text-sm text-text print:text-[8.5pt]">{item.label}</p>
                          <CodeBlock code={item.code} language={sheet.language} compact showLanguage={false} />
                          {item.note && <p className="mt-1 text-xs leading-relaxed text-muted print:text-[7.5pt]">{item.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
