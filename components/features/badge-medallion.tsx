import { Lock } from 'lucide-react';
import { ContentIcon } from '@/components/ui/icon';
import { cx } from '@/components/ui/primitives';
import type { IconName } from '@/lib/model/enums';

/** Positions of the small notches around the rim (same for every badge, so they read as one set). */
const NOTCHES = Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  return { x1: 32 + Math.cos(a) * 28.5, y1: 32 + Math.sin(a) * 28.5, x2: 32 + Math.cos(a) * 30.5, y2: 32 + Math.sin(a) * 30.5 };
});

/** A simple, consistent SVG medallion with a Lucide glyph in the middle. Locked = grey with a lock. */
export function BadgeMedallion({
  icon,
  unlocked,
  size = 64,
  className,
}: {
  icon: IconName;
  unlocked: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cx('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute inset-0 size-full">
        <circle cx="32" cy="32" r="31" className={unlocked ? 'fill-primary-tint' : 'fill-surface-2'} />
        {NOTCHES.map((n, i) => (
          <line
            key={i}
            {...n}
            strokeWidth={1.25}
            strokeLinecap="round"
            className={unlocked ? 'stroke-primary/60' : 'stroke-border-strong'}
          />
        ))}
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray={unlocked ? undefined : '2 3'}
          className={unlocked ? 'stroke-primary' : 'stroke-border-strong'}
        />
        <circle cx="32" cy="32" r="20.5" className={unlocked ? 'fill-surface' : 'fill-bg'} />
      </svg>
      <ContentIcon
        name={icon}
        className={cx('relative', unlocked ? 'text-primary' : 'text-muted/70')}
        style={{ width: size * 0.3, height: size * 0.3 }}
        strokeWidth={1.75}
      />
      {!unlocked && (
        <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border border-border bg-surface text-muted">
          <Lock className="size-2.5" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
