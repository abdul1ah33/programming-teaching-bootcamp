'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Wraps every page with the site header/footer, except the admin at /keystatic. */
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/keystatic')) return <>{children}</>;
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium text-text focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-primary"
      >
        Skip to content
      </a>
      {header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
