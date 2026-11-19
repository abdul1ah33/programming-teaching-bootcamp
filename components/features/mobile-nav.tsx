'use client';

import { Menu as MenuIcon, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { cx } from '@/components/ui/primitives';
import { isActive, LEARN_NAV, PARENTS_NAV, PRIMARY_NAV, type NavLink } from './nav-items';
import { ThemeToggle } from './theme-toggle';

function Group({ title, items, pathname, onNavigate }: { title?: string; items: NavLink[]; pathname: string; onNavigate: () => void }) {
  return (
    <div className="py-2">
      {title && <p className="px-3 pb-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">{title}</p>}
      <ul>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex min-h-11 items-center rounded-md px-3 text-[0.95rem]',
                  active ? 'bg-primary-tint font-medium text-text' : 'text-text hover:bg-surface-2',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Phone navigation: a bottom sheet built on <dialog>, which gives focus trapping, Esc to close and an
 * inert page behind it for free.
 */
export function MobileNav({ pointsTotal }: { pointsTotal: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const close = () => dialog.current?.close();

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium text-text hover:bg-surface-2"
      >
        <MenuIcon className="size-4" aria-hidden="true" />
        Menu
      </button>
      <dialog
        ref={dialog}
        aria-label="Site menu"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className="sheet m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-xl border border-b-0 border-border bg-surface p-0 text-text backdrop:bg-black/40"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted">Menu</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-border px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Group items={PRIMARY_NAV} pathname={pathname} onNavigate={close} />
          <Group
            items={[{ href: '/points', label: `Points · ${pointsTotal}` }]}
            pathname={pathname}
            onNavigate={close}
          />
          <Group title="Learn" items={LEARN_NAV} pathname={pathname} onNavigate={close} />
          <Group title="For parents" items={PARENTS_NAV} pathname={pathname} onNavigate={close} />
        </div>
      </dialog>
    </div>
  );
}
