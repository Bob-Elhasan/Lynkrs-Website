/**
 * Site-wide identity, navigation and contact details.
 *
 * Everything in src/content is the single source of truth for copy. It feeds
 * three consumers at once: the 3D stations, the DOM mirror, and the build-time
 * prerender. Write a sentence once, it appears everywhere.
 *
 * VOICE: plain, warm, second person, British English. Short declaratives.
 * "You're busy running the business. We run the growth." Never corporate.
 */

export const siteConfig = {
  name: 'Lynkrs',
  tagline: 'Growth is designed, not guessed',
  /** Absolute origin for canonical links and OG tags. */
  url: import.meta.env.VITE_SITE_URL ?? 'https://bob-elhasan.github.io/Lynkrs-Website',
  description:
    'A growth agency. We join strategy, execution and reporting into one system, so marketing earns its keep.',
  email: 'info@lynkrs.com',
  address: 'Arkan Plaza, Sheikh Zayed, Cairo, Egypt',
  social: {
    linkedin: 'https://www.linkedin.com/company/lynkrs',
    instagram: 'https://www.instagram.com/lynkrs',
  },
} as const;

export const mainNav = [
  { label: 'Services', href: '/services' },
  { label: 'Growth Suite', href: '/bundles' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
] as const;

export const footerNav = [
  {
    heading: 'Agency',
    links: [
      { label: 'The problem', href: '/#problem' },
      { label: 'How we work', href: '/#method' },
      { label: 'Together', href: '/#together' },
    ],
  },
  {
    heading: 'Work',
    links: [
      { label: 'What we run', href: '/services' },
      { label: 'Growth Suite', href: '/bundles' },
      { label: 'Portfolio', href: '/portfolio' },
    ],
  },
  {
    heading: 'Start',
    links: [
      { label: 'Start a conversation', href: '/contact' },
      { label: 'Book a growth audit', href: '/contact' },
    ],
  },
] as const;

export const ctas = {
  primary: { label: 'Book a growth audit', href: '/contact' },
  secondary: { label: 'See the Growth Suite', href: '/bundles' },
  nav: { label: 'Start a conversation', href: '/contact' },
} as const;
