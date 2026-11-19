'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cx } from './primitives';

/** Copies `text` to the clipboard and briefly confirms. */
export function CopyButton({ text, className, label = 'Copy code' }: { text: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cx(
        'inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-1 font-mono text-[0.7rem] text-muted transition-colors duration-150 hover:border-border-strong hover:text-text print:hidden',
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-primary" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : label}
      </span>
    </button>
  );
}
