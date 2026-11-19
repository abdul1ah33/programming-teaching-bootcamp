import { createReader } from '@keystatic/core/reader';
import config from '../../keystatic.config';

/**
 * The single Keystatic Reader for the site. Everything in lib/content goes through this;
 * pages and components never read content files directly.
 */
export const reader = createReader(process.cwd(), config);

/** Empty strings from the admin become null. */
export const orNull = (value: string | null | undefined): string | null =>
  value === undefined || value === null || value.trim() === '' ? null : value;

/**
 * Memoise a loader for the lifetime of a production build/process; always re-read in development
 * so edits in the admin show up on refresh.
 */
export function memo<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    if (process.env.NODE_ENV !== 'production') return load();
    cached ??= load();
    return cached;
  };
}
