/**
 * Single source of truth for site copy, navigation and metadata.
 *
 * Everything the marketing pages render reads from here, so rewriting the
 * positioning is a text edit in one file rather than a hunt through JSX.
 *
 * NOTE: the copy below is placeholder positioning. Replace it with the real
 * Lynkrs messaging before launch.
 */

export const siteConfig = {
  name: 'Lynkrs',
  domain: 'lynkrs.com',
  url: import.meta.env.VITE_SITE_URL ?? 'https://lynkrs.com',
  tagline: 'Every part of your go-to-market, finally linked.',
  description:
    'Lynkrs connects the pieces of your go-to-market so strategy, content and measurement run as one system instead of five disconnected tools.',
  email: 'hello@lynkrs.com',
  social: {
    linkedin: 'https://www.linkedin.com/company/lynkrs',
    x: 'https://x.com/lynkrs',
    instagram: 'https://www.instagram.com/lynkrs',
  },
} as const;

export const mainNav = [
  { label: 'Platform', href: '/platform' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
] as const;

export const footerNav = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform', href: '/platform' },
      { label: 'Work', href: '/work' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/platform#about' },
      { label: 'Careers', href: '/contact' },
      { label: 'Press', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
] as const;

export const heroContent = {
  eyebrow: 'Go-to-market infrastructure',
  headline: 'Every part of your go-to-market, finally linked.',
  rotatingWords: ['strategy', 'content', 'campaigns', 'reporting'],
  subhead:
    'Strategy in one deck, content in another tool, numbers in a third. Lynkrs pulls them into a single system so the plan, the work and the proof stay connected.',
  primaryCta: { label: 'Book a walkthrough', href: '/contact' },
  secondaryCta: { label: 'See the platform', href: '/platform' },
} as const;

export const logoStrip = [
  'BasharSoft',
  'WUZZUF',
  'Forasna',
  'Edge Gym',
  'Woodpecker',
  'iCareer',
] as const;

export const features = [
  {
    title: 'One strategy layer',
    body: 'Positioning, audiences and messaging live in a structure the whole team works from, not a deck that ages out after a quarter.',
  },
  {
    title: 'Calendars that inherit the plan',
    body: 'Content calendars pull their angles straight from the strategy layer, so every post can be traced back to an objective.',
  },
  {
    title: 'Measurement that closes the loop',
    body: 'Channel numbers land against the objective that asked for them, which turns reporting into a decision instead of a screenshot.',
  },
  {
    title: 'Built for multi-brand',
    body: 'Run a house of brands without cloning the same workflow five times. Shared spine, independent voices.',
  },
  {
    title: 'Handoff without the drop',
    body: 'Briefs, assets and approvals move in one thread, so nothing dies between the strategist and the designer.',
  },
  {
    title: 'Answers, not dashboards',
    body: 'Ask what moved and why. Lynkrs reads the plan alongside the performance and tells you where the gap is.',
  },
] as const;

export const steps = [
  {
    step: '01',
    title: 'Map the system',
    body: 'We model your brands, audiences and objectives once, so everything downstream has a shared spine to hang off.',
  },
  {
    step: '02',
    title: 'Wire the workflow',
    body: 'Calendars, briefs and approvals connect to that spine. The plan stops being a document and starts being the workflow.',
  },
  {
    step: '03',
    title: 'Read the loop',
    body: 'Performance flows back against the objectives that asked for it, so the next quarter is a decision, not a guess.',
  },
] as const;

export const stats = [
  { value: '4x', label: 'faster brief-to-live cycle' },
  { value: '1', label: 'source of truth per brand' },
  { value: '0', label: 'spreadsheets in the reporting loop' },
] as const;

export const faqs = [
  {
    question: 'Is Lynkrs a project manager or a strategy tool?',
    answer:
      'Both, and that is the point. Project tools track tasks without knowing why they exist. Lynkrs keeps the objective attached to the work, so the task list stays accountable to the strategy.',
  },
  {
    question: 'Does it replace our current stack?',
    answer:
      'It sits above it. Keep the tools your team already likes. Lynkrs is the layer that makes them agree with each other.',
  },
  {
    question: 'How long does onboarding take?',
    answer:
      'Mapping a single brand takes about a week. A multi-brand house typically runs two to three weeks, mostly spent agreeing on the shared spine.',
  },
  {
    question: 'Who is it built for?',
    answer:
      'Marketing leads and fractional CMOs running more than one brand, or one brand with more moving parts than a single calendar can hold.',
  },
] as const;
