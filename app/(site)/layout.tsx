import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/features/site-footer';
import { SiteHeader } from '@/components/features/site-header';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium text-text focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-primary"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
