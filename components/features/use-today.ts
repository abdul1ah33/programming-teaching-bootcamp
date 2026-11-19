'use client';

import { useSyncExternalStore } from 'react';
import { toIsoDate } from '@/lib/derive/dates';

const subscribe = (onChange: () => void) => {
  // Re-check when the tab becomes visible again (e.g. the next morning).
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

/** Today's date (YYYY-MM-DD) in the viewer's time zone; null during server render and hydration. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => toIsoDate(new Date()), () => null);
}
