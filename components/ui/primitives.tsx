import Link from 'next/link';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';

/** Join class names, skipping falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------
   Layout
   ------------------------------------------------------------------ */

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cx('mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8', className)} {...props} />;
}

/** Page header: small mono eyebrow, serif title, optional lead paragraph. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="pb-8 pt-10 sm:pb-10 sm:pt-14">
      {eyebrow && <p className="text-sm font-medium text-primary-hover dark:text-primary">{eyebrow}</p>}
      <h1 className="mt-3 max-w-[22ch] font-serif text-[2.25rem] font-medium leading-[1.08] tracking-[-0.01em] text-text sm:text-5xl">
        {title}
      </h1>
      {lead && <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{lead}</p>}
      {children}
    </header>
  );
}

/** Section heading: sans, compact, with an optional mono count/aside. */
export function SectionHeading({
  as: Tag = 'h2',
  children,
  aside,
  id,
  className,
}: {
  as?: 'h2' | 'h3';
  children: ReactNode;
  aside?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cx('mb-4 flex items-baseline justify-between gap-4', className)}>
      <Tag id={id} className="text-[0.95rem] font-semibold tracking-[-0.005em] text-text">
        {children}
      </Tag>
      {aside !== undefined && aside !== null && aside !== false && (
        <div className="text-sm text-muted tabular">{aside}</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Surfaces
   ------------------------------------------------------------------ */

export function Card({
  className,
  as: Tag = 'div',
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'article' | 'li' | 'aside' }) {
  return <Tag className={cx('rounded-lg border border-border bg-surface', className)} {...props} />;
}

/** A whole card that is a link, with a subtle hover. */
export function CardLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        'block rounded-lg border border-border bg-surface transition-colors duration-150 hover:border-border-strong hover:bg-surface-2/60',
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------
   Small labels
   ------------------------------------------------------------------ */

/** Neutral tag, e.g. a file type or a sprint number. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-[5px] border border-border px-1.5 py-px text-xs leading-5 text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

export type Tone = 'neutral' | 'green' | 'solid' | 'warn' | 'danger' | 'muted';

const TONES: Record<Tone, string> = {
  neutral: 'border-border-strong text-text bg-surface',
  green: 'border-transparent bg-primary-tint text-primary-hover dark:text-primary',
  solid: 'border-transparent bg-primary text-on-primary',
  warn: 'border-transparent bg-warn-tint text-warn',
  danger: 'border-transparent bg-danger-tint text-danger',
  muted: 'border-border text-muted bg-transparent',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-muted',
  green: 'bg-primary',
  solid: 'bg-on-primary',
  warn: 'bg-warn',
  danger: 'bg-danger',
  muted: 'border border-muted bg-transparent',
};

/** Small status badge with a dot. */
export function Pill({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-px text-[0.75rem] font-medium leading-5',
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cx('size-1.5 rounded-full', DOTS[tone])} />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   Misc
   ------------------------------------------------------------------ */

export function EmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-lg border border-dashed border-border-strong px-5 py-6 text-sm', className)}>
      <p className="font-medium text-text">{title}</p>
      {children && <div className="mt-1 text-muted">{children}</div>}
    </div>
  );
}

/** Inline text link in the accent colour. */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        'font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors duration-150 hover:text-primary-hover hover:decoration-primary',
        className,
      )}
      {...props}
    />
  );
}

/** Label/value pair in mono, for dense stats. */
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-medium text-text tabular">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted">{hint}</dd>}
    </div>
  );
}
