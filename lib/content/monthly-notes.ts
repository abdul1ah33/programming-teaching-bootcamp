import type { Node } from '@markdoc/markdoc';
import type { MonthlyNote } from '@/lib/model/types';
import { memo, orNull, reader } from './reader';

export const getMonthlyNotes = memo(async (): Promise<MonthlyNote[]> => {
  const all = await reader.collections.monthlyNotes.all();
  return all
    .map(({ slug, entry }) => ({
      month: slug,
      highlights: [...entry.highlights],
      focusNextMonth: [...entry.focusNextMonth],
      messageToParents: orNull(entry.messageToParents),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
});

/** The month's teacher note as a Markdoc node, or null when it's empty or missing. */
export async function getMonthlyNoteBody(month: string): Promise<Node | null> {
  const entry = await reader.collections.monthlyNotes.read(month);
  if (!entry) return null;
  const { node } = await entry.teacherNote();
  return (node.children.length > 0 ? node : null) as Node | null;
}
