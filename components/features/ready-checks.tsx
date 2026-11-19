import { Check } from 'lucide-react';
import { formatDate } from '@/lib/derive/dates';
import type { ReadyCheck } from '@/lib/model/types';
import { cx } from '@/components/ui/primitives';

/** Read-only checklist of a sprint's "ready to move on" checks. */
export function ReadyChecks({ checks, compact = false }: { checks: ReadyCheck[]; compact?: boolean }) {
  return (
    <ul className={cx('space-y-2', compact && 'space-y-1.5')}>
      {checks.map((c, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className={cx(
              'mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[5px] border',
              c.done ? 'border-primary bg-primary text-on-primary' : 'border-border-strong bg-surface',
            )}
          >
            {c.done && <Check className="size-3" strokeWidth={3} />}
          </span>
          <span className={cx('text-sm leading-6', c.done ? 'text-text' : 'text-text')}>
            <span className="sr-only">{c.done ? 'Done: ' : 'Not yet: '}</span>
            {c.text}
            {c.done && c.doneOn && !compact && (
              <span className="ml-2 font-mono text-xs text-muted tabular">{formatDate(c.doneOn, 'day-month')}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
