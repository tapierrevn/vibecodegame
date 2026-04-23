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
  showInHeader?: boolean;
  showInFooter?: boolean;
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
      { label: 'By Game Engine', href: '/vibe-coded-games/by-game-engine' },
    ],
  },
  {
    label: 'Developer Hub',
    href: '/developers',
    order: 2,
    children: [{ label: 'Game Studio', href: '/game-studios-using-AI' }],
  },
  { label: 'AI Tools', href: '/ai-tools', order: 3 },
  { label: 'Blog', href: '/blog', order: 4 },
  { label: 'Game Jams', href: '/game-jams', order: 5 },
  {
    label: 'Glossary',
    href: '/game-vibe-coding-glossary',
    order: 6,
    showInHeader: false,
    showInFooter: true,
  },
  {
    label: 'FAQ',
    href: '/faq',
    order: 7,
    showInHeader: false,
    showInFooter: true,
  },
];

/**
 * Get navigation items sorted by order
 */
export function getNavItems(): NavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order);
}

export function getHeaderNavItems(): NavItem[] {
  return getNavItems().filter((item) => item.showInHeader !== false);
}

export function getFooterNavItems(): NavItem[] {
  return getNavItems().filter((item) => item.showInFooter !== false);
}
