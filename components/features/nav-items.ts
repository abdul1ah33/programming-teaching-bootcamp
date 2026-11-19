export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/roadmap', label: 'My path' },
  { href: '/sessions', label: 'Lessons' },
  { href: '/resources', label: 'My files' },
  { href: '/projects', label: 'My projects' },
];

/** The "Help" menu: things to look up while learning. */
export const LEARN_NAV: NavLink[] = [
  { href: '/glossary', label: 'Word list', description: 'Coding words explained in plain English' },
  { href: '/cheatsheets', label: 'Cheat sheets', description: 'The code you need, on one page' },
  { href: '/whats-next', label: 'After the course', description: 'Things you could build next' },
];
export const LEARN_MENU_LABEL = 'Help';

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
