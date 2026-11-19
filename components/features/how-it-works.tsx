'use client';

import { Map as MapIcon, NotebookPen, Star, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const KEY = 'journey-how-it-works-dismissed';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** A short "how this site works" card for first visits. Hidden once dismissed (remembered in this browser). */
export function HowItWorks() {
  // null on the server → render nothing until we know whether it was dismissed.
  const dismissed = useSyncExternalStore(subscribe, read, () => null);
  if (dismissed !== false) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* private mode: just hide for now */
    }
    listeners.forEach((l) => l());
  };

  const points = [
    { icon: MapIcon, title: 'My path', text: 'The course has 10 parts called sprints. Your path shows them all and where you are now.' },
    { icon: NotebookPen, title: 'Lessons', text: 'Every lesson has its notes, files and homework, so you can look back any time.' },
    { icon: Star, title: 'Points', text: 'You earn points for practising, solving things yourself and fixing your own bugs.' },
  ];

  return (
    <section aria-labelledby="how-it-works" className="relative mb-6 rounded-lg border border-primary/30 bg-primary-tint/60 p-5 sm:p-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide this guide"
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-text"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <h2 id="how-it-works" className="pr-10 text-lg font-semibold">
        How this site works
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3">
        {points.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface text-primary">
              <Icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-medium">{title}</span>
              <span className="mt-0.5 block text-sm leading-relaxed text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={dismiss}
        className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        Got it
      </button>
    </section>
  );
}
