import type { Metadata } from 'next';
import KeystaticApp from './keystatic';

export const metadata: Metadata = { title: 'Admin' };

export default function KeystaticLayout() {
  return <KeystaticApp />;
}
