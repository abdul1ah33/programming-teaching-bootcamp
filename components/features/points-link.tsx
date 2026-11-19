'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/primitives';

/** "Points" link that always shows the current total. */
export function PointsLink({ total }: { total: number }) {
  const active = usePathname().startsWith('/points');
  return (
    <Link
      href="/points"
      aria-current={active ? 'page' : undefined}
      aria-label={`Points: ${total}`}
      className={cx(
        'inline-flex h-9 items-center gap-2 rounded-md border px-2.5 text-sm transition-colors duration-150',
        active ? 'border-primary bg-primary-tint text-text' : 'border-border text-text hover:border-border-strong hover:bg-surface-2',
      )}
    >
      <span className="hidden text-muted sm:inline">Points</span>
      <span className="font-mono font-medium tabular text-primary-hover dark:text-primary">{total}</span>
    </Link>
  );
}
