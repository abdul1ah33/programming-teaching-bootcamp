import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/features/site-chrome';
import { SiteFooter } from '@/components/features/site-footer';
import { SiteHeader } from '@/components/features/site-header';
import { ThemeProvider } from '@/components/theme-provider';
import { fraunces, jetbrainsMono, plexSans } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'The Programming Learning Journey', template: '%s · The Programming Learning Journey' },
  description: 'A private progress site for one student.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF7' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1412' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${plexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <SiteChrome header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
