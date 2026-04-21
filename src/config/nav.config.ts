/**
 * Navigation Configuration
 *
 * Defines which pages appear in the site navigation and their display order.
 * Astro handles routing via the filesystem — this only controls nav menus.
 */

export interface NavItem {
  label: string;
  href: string;
  order: number;
  children?: Omit<NavItem, 'order' | 'children'>[];
}

export const navItems: NavItem[] = [
  {
    label: 'Vibe-Coded Games',
    href: '/vibe-coded-games',
    order: 1,
    children: [
      { label: 'Best of the Week', href: '/vibe-coded-games/best-of-the-week' },
      { label: 'Most Played', href: '/vibe-coded-games/most-played' },
      { label: 'New Release', href: '/vibe-coded-games/new-release' },
      { label: 'By Genre', href: '/vibe-coded-games/by-genre' },
      { label: 'By AI Tool', href: '/vibe-coded-games/by-ai-tool' },
    ],
  },
  { label: 'Developer Hub', href: '/developers', order: 2 },
  { label: 'Blog', href: '/blog', order: 3 },
  { label: 'Projects', href: '/projects', order: 4 },
  { label: 'About', href: '/about', order: 5 },
  { label: 'Contact', href: '/contact', order: 6 },
];

/**
 * Get navigation items sorted by order
 */
export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}
