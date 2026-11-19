'use client';

import { Printer } from 'lucide-react';

/** Opens the browser's print dialog (where "Save as PDF" lives too). */
export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text hover:border-border-strong print:hidden"
    >
      <Printer className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
