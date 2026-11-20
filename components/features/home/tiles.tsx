import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from '@/components/ui/primitives';

/** Shared look for every Home tile: one big tap target with a small lift on hover and press. */
export const tileClass = (variant: 'surface' | 'solid' = 'surface') =>
  cx(
    'group relative flex h-full flex-col overflow-hidden rounded-[10px] border p-5 transition-[transform,border-color,background-color] duration-150 ease-out sm:p-6',
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]',
    variant === 'solid'
      ? 'border-transparent bg-primary text-on-primary hover:bg-primary-hover'
      : 'border-border bg-surface hover:border-border-strong',
  );

export function Tile({
  href,
  label,
  icon,
  variant = 'surface',
  className,
  children,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  variant?: 'surface' | 'solid';
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cx(tileClass(variant), className)}>
      <span className={cx('flex items-center justify-between text-sm font-medium', variant === 'solid' ? 'text-on-primary' : 'text-muted')}>
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 opacity-50 transition-[opacity,transform] duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </span>
      {children}
    </Link>
  );
}

/** Circular progress (e.g. checklist done / total), with the count in the middle. */
export function ProgressRing({ done, total, size = 84 }: { done: number; total: number; size?: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const ratio = total > 0 ? Math.min(1, done / total) : 0;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth={7} className="stroke-surface-2" />
        {ratio > 0 && (
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${c * ratio} ${c}`}
            className="stroke-primary transition-[stroke-dasharray] duration-200"
          />
        )}
      </svg>
      <span className="font-mono text-lg font-medium tabular">
        {done}
        <span className="text-muted">/{total}</span>
      </span>
    </span>
  );
}

/** Ten little stops in a row: filled = finished, ringed = you're here, empty = coming up. */
export function PathDots({ statuses }: { statuses: ('done' | 'in-progress' | 'upcoming')[] }) {
  return (
    <span className="relative flex items-center justify-between" aria-hidden="true">
      <span className="absolute inset-x-1 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-surface-2" />
      {statuses.map((s, i) => (
        <span
          key={i}
          className={cx(
            'relative grid place-items-center rounded-full',
            s === 'done' && 'size-2.5 bg-primary sm:size-3.5',
            s === 'in-progress' && 'size-4 border-2 border-primary bg-surface ring-[3px] ring-primary/20 sm:size-5',
            s === 'upcoming' && 'size-2.5 border-[1.5px] border-control bg-surface sm:size-3.5',
          )}
        >
          {s === 'in-progress' && <span className="size-1 rounded-full bg-primary sm:size-1.5" />}
        </span>
      ))}
    </span>
  );
}
