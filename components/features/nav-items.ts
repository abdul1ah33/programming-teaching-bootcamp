export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/roadmap', label: 'Road map' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/resources', label: 'Resources' },
  { href: '/projects', label: 'Projects' },
];

export const LEARN_NAV: NavLink[] = [
  { href: '/glossary', label: 'Glossary', description: 'Words you’ll meet, explained simply' },
  { href: '/cheatsheets', label: 'Cheat sheets', description: 'Python and C on a page or two' },
  { href: '/whats-next', label: 'What’s next', description: 'Fields to explore after the capstone' },
];

export const PARENTS_NAV: NavLink[] = [
  { href: '/plan', label: 'Learning plan', description: 'How the course works and how progress is checked' },
  { href: '/reports', label: 'Monthly reports', description: 'A printable summary of each month' },
];

/** Is `href` the current section? Home matches only "/". */
export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  // Sprint pages live under the road map.
  if (href === '/roadmap' && pathname.startsWith('/sprints/')) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
