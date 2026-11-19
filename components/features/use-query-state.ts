'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/** Reads/writes one URL query parameter, so filtered views can be shared and survive reloads. */
export function useQueryState(key: string, fallback = 'all'): [string, (value: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = params.get(key) ?? fallback;
  const set = useCallback(
    (next: string) => {
      const p = new URLSearchParams(params.toString());
      if (next === fallback) p.delete(key);
      else p.set(key, next);
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [params, router, pathname, key, fallback],
  );
  return [value, set];
}
