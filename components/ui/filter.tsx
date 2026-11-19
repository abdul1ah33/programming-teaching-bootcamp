'use client';

import { cx } from './primitives';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** A labelled native select — the most reliable control on phones. */
export function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 rounded-md border border-border bg-surface px-2.5 pr-8 text-sm text-text hover:border-border-strong"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.count !== undefined ? ` (${o.count})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Segmented single-choice buttons (radio group semantics). */
export function ChipFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1">
      <legend className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cx(
                'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors duration-150',
                active ? 'border-primary bg-primary-tint font-medium text-text' : 'border-border bg-surface text-muted hover:border-border-strong hover:text-text',
              )}
            >
              {o.label}
              {o.count !== undefined && <span className="font-mono text-xs tabular text-muted">{o.count}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
