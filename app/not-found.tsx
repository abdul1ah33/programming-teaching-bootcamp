import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/features/not-found-content';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return <NotFoundContent />;
}
