import { cx } from './primitives';

/** A thin progress bar with an accessible value. */
export function ProgressBar({
  value,
  label,
  className,
}: {
  /** 0–100 */
  value: number;
  label: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border', className)}
    >
      <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${v}%` }} />
    </div>
  );
}

/**
 * One segment per sprint: filled = done, partly filled = current, empty = upcoming.
 * Reads as "the journey so far" at a glance.
 */
export function SegmentedProgress({
  segments,
  label,
}: {
  segments: { key: string; ratio: number; title: string }[];
  label: string;
}) {
  const done = segments.reduce((s, x) => s + x.ratio, 0);
  const percent = segments.length ? Math.round((done / segments.length) * 100) : 0;
  return (
    <div role="img" aria-label={`${label}: ${percent}%`} className="flex gap-1">
      {segments.map((s) => (
        <span
          key={s.key}
          title={s.title}
          className="relative h-2 flex-1 overflow-hidden rounded-[3px] bg-surface-2 ring-1 ring-inset ring-border"
        >
          <span
            className="absolute inset-y-0 left-0 bg-primary"
            style={{ width: `${Math.round(Math.max(0, Math.min(1, s.ratio)) * 100)}%` }}
          />
        </span>
      ))}
    </div>
  );
}
