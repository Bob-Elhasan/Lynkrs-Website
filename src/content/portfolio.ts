/**
 * Portfolio — client logos and case studies.
 *
 * ⚠️  EVERY ENTRY BELOW IS PLACEHOLDER DATA.
 *
 * Neither the company profile nor the approved journey contains a single client
 * name, logo, metric or case study. The structure here is real and production
 * ready; the content is not. Every user-visible string is prefixed
 * `PLACEHOLDER —` on purpose, so nothing invented can reach a live site by
 * accident. Replace the arrays, drop the prefixes, and the pages work as-is.
 *
 * See the README launch checklist.
 */

export const PLACEHOLDER_PREFIX = 'PLACEHOLDER —';

export type CaseStudy = {
  slug: string;
  client: string;
  sector: string;
  title: string;
  summary: string;
  /** Headline numbers. Keep to three: more reads as noise. */
  metrics: { value: string; label: string }[];
  challenge: string;
  approach: string[];
  result: string;
  services: string[];
};

export const clients: string[] = [
  `${PLACEHOLDER_PREFIX} Client One`,
  `${PLACEHOLDER_PREFIX} Client Two`,
  `${PLACEHOLDER_PREFIX} Client Three`,
  `${PLACEHOLDER_PREFIX} Client Four`,
  `${PLACEHOLDER_PREFIX} Client Five`,
  `${PLACEHOLDER_PREFIX} Client Six`,
];

export const caseStudies: CaseStudy[] = [
  {
    slug: 'case-one',
    client: `${PLACEHOLDER_PREFIX} Client One`,
    sector: `${PLACEHOLDER_PREFIX} Sector`,
    title: `${PLACEHOLDER_PREFIX} Headline result in one line`,
    summary: `${PLACEHOLDER_PREFIX} Two sentences on what was broken and what changed. Replace with a real engagement.`,
    metrics: [
      { value: '0%', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0x', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0', label: `${PLACEHOLDER_PREFIX} metric` },
    ],
    challenge: `${PLACEHOLDER_PREFIX} What the client was up against when they came to us.`,
    approach: [
      `${PLACEHOLDER_PREFIX} First thing we did`,
      `${PLACEHOLDER_PREFIX} Second thing we did`,
      `${PLACEHOLDER_PREFIX} Third thing we did`,
    ],
    result: `${PLACEHOLDER_PREFIX} What it produced, with the numbers.`,
    services: ['performance', 'seo'],
  },
  {
    slug: 'case-two',
    client: `${PLACEHOLDER_PREFIX} Client Two`,
    sector: `${PLACEHOLDER_PREFIX} Sector`,
    title: `${PLACEHOLDER_PREFIX} Headline result in one line`,
    summary: `${PLACEHOLDER_PREFIX} Two sentences on what was broken and what changed. Replace with a real engagement.`,
    metrics: [
      { value: '0%', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0x', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0', label: `${PLACEHOLDER_PREFIX} metric` },
    ],
    challenge: `${PLACEHOLDER_PREFIX} What the client was up against when they came to us.`,
    approach: [
      `${PLACEHOLDER_PREFIX} First thing we did`,
      `${PLACEHOLDER_PREFIX} Second thing we did`,
      `${PLACEHOLDER_PREFIX} Third thing we did`,
    ],
    result: `${PLACEHOLDER_PREFIX} What it produced, with the numbers.`,
    services: ['content'],
  },
  {
    slug: 'case-three',
    client: `${PLACEHOLDER_PREFIX} Client Three`,
    sector: `${PLACEHOLDER_PREFIX} Sector`,
    title: `${PLACEHOLDER_PREFIX} Headline result in one line`,
    summary: `${PLACEHOLDER_PREFIX} Two sentences on what was broken and what changed. Replace with a real engagement.`,
    metrics: [
      { value: '0%', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0x', label: `${PLACEHOLDER_PREFIX} metric` },
      { value: '0', label: `${PLACEHOLDER_PREFIX} metric` },
    ],
    challenge: `${PLACEHOLDER_PREFIX} What the client was up against when they came to us.`,
    approach: [
      `${PLACEHOLDER_PREFIX} First thing we did`,
      `${PLACEHOLDER_PREFIX} Second thing we did`,
      `${PLACEHOLDER_PREFIX} Third thing we did`,
    ],
    result: `${PLACEHOLDER_PREFIX} What it produced, with the numbers.`,
    services: ['consultancy', 'performance'],
  },
];

export const portfolioIndex = {
  title: 'Portfolio',
  lede: 'Work we have done and what it produced.',
  body: 'Every engagement below ran on the same system: one goal, joined-up channels, numbers on the table.',
} as const;

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** True while the placeholders are still in place. Drives the build-time warning. */
export const portfolioIsPlaceholder = clients.some((c) =>
  c.startsWith(PLACEHOLDER_PREFIX),
);
