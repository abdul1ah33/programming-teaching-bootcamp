'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** Switches between light and dark. Follows the system until you choose; your choice is remembered. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // Only render the real state after hydration, so the server HTML never disagrees.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? (isDark ? 'Switch to light theme' : 'Switch to dark theme') : 'Switch theme'}
      className={`grid size-9 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text ${className}`}
    >
      {isDark ? <Sun className="size-[18px]" aria-hidden="true" /> : <Moon className="size-[18px]" aria-hidden="true" />}
    </button>
  );
}
