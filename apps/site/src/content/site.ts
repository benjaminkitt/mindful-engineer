export const site = {
  name: 'Mindful Engineer',
  domain: 'mindful.engineer',
  author: 'Benjamin Kitt',
  title: 'Mindful Engineer',
  description:
    'A monastery-first reading site about software, change, and the people in the middle of it.',
  tagline:
    'A working notebook on software, change, and the people in the middle of it.',
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/notes', label: 'Notes' },
    { href: '/links', label: 'Links' },
    { href: '/snippets', label: 'Snippets' },
    { href: '/archive', label: 'Archive' },
    { href: '/about', label: 'About' },
    { href: '/now', label: 'Now' },
  ],
  footerLinks: {
    sections: [
      { href: '/articles', label: 'Articles' },
      { href: '/notes', label: 'Notes' },
      { href: '/links', label: 'Links' },
      { href: '/archive', label: 'Archive' },
    ],
    elsewhere: [
      { href: 'https://github.com/benjaminkitt', label: 'GitHub · benjaminkitt' },
      { href: 'mailto:mail@mindful.engineer', label: 'mail@mindful.engineer' },
    ],
  },
};

export type NavItem = (typeof site.navigation)[number];
