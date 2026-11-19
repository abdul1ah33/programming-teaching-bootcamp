'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from '@/components/ui/primitives';
import { isActive, LEARN_MENU_LABEL, LEARN_NAV, PARENTS_NAV, PRIMARY_NAV, type NavLink } from './nav-items';

const itemClass = (active: boolean) =>
  cx(
    'relative inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-[0.9rem] transition-colors duration-150',
    active ? 'font-medium text-text' : 'text-muted hover:bg-surface-2 hover:text-text',
  );

function Menu({ label, items, pathname }: { label: string; items: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const active = items.some((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={itemClass(active)}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cx('size-3.5 transition-transform duration-150', open && 'rotate-180')}
        />
        <ActiveMark active={active} />
      </button>
      <div
        id={id}
        hidden={!open}
        className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-border bg-surface p-1.5 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.18)]"
      >
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className="block rounded-md px-3 py-2 hover:bg-surface-2 aria-[current=page]:bg-primary-tint"
              >
                <span className="block text-sm font-medium text-text">{item.label}</span>
                {item.description && <span className="mt-0.5 block text-xs text-muted">{item.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Always rendered (only its visibility changes) so a page served for a different path — like the
 * shared 404 — hydrates without a structural mismatch.
 */
function ActiveMark({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx('absolute inset-x-2.5 -bottom-[13px] h-0.5 rounded-full bg-primary', !active && 'invisible')}
    />
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
      {PRIMARY_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={itemClass(active)}>
            {item.label}
            <ActiveMark active={active} />
          </Link>
        );
      })}
      <span aria-hidden="true" className="mx-1.5 h-4 w-px bg-border" />
      <Menu label={LEARN_MENU_LABEL} items={LEARN_NAV} pathname={pathname} />
      <Menu label="For parents" items={PARENTS_NAV} pathname={pathname} />
    </nav>
  );
}
