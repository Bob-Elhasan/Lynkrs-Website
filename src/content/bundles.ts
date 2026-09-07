/**
 * 05 The Growth Suite — four products, four stages of growth.
 *
 * Headlines and customer quotes are verbatim from the approved journey. The
 * `includes` lists come from the company profile, rewritten into the same plain
 * voice. Rendered as four pylons in 3D and as one page at /bundles.
 */

export type Bundle = {
  slug: string;
  order: string;
  label: string;
  name: string;
  quote: string;
  summary: string;
  overview: string;
  output: string;
  includes: string[];
  /** Bundles inherit everything from the previous stage, as in the profile. */
  inherits?: string;
};

export const bundles: Bundle[] = [
  {
    slug: 'diagnostics',
    order: '01',
    label: 'Diagnostics',
    name: 'Growth Diagnostics',
    quote: 'I just need to know if I am doing well.',
    summary:
      'A proper look at your site, SEO, customer journey and channels, plus a 90 day plan that names what is actually holding you back.',
    overview:
      'The intelligence you need before you spend another pound. We look at everything that touches growth and tell you where it is leaking.',
    output:
      'A clear read on where the opportunities are, what to fix first, and what to do about it over the next ninety days.',
    includes: [
      'Website conversion audit',
      'SEO and content audit',
      'Customer journey audit',
      'Acquisition channel audit',
      'Revenue structure map',
      'AI and automation audit',
      '90 day growth roadmap',
      'Executive summary',
    ],
  },
  {
    slug: 'launchpad',
    order: '02',
    label: 'Launchpad',
    name: 'Growth Launchpad',
    quote: 'I want to start this properly.',
    summary:
      'Monthly strategy, SEO, lead generation and a dashboard you will actually read.',
    overview:
      'The tools and the rhythm to put your business on a growth footing, with senior guidance through the early stretch.',
    output:
      'Consistent early growth built on a real plan, executed properly and sharpened every month.',
    includes: [
      'Monthly growth strategy session',
      'Monthly growth roadmap',
      'SEO operations',
      'AI-assisted content planning',
      'Lead generation tactics',
      'Competitor monitoring',
      'KPI dashboard and reporting',
      'Quarterly growth review',
    ],
  },
  {
    slug: 'accelerate',
    order: '03',
    label: 'Accelerate',
    name: 'Growth Accelerate',
    quote: 'Time to speed things up.',
    summary:
      'Funnel and CRM work, media oversight and nurture, built to bring the cost of a customer down and revenue up.',
    overview:
      'For when things are working and you want them to work harder. We widen the funnel, tighten the conversion and push the acquisition cost down.',
    output:
      'Better conversion rates, lower cost per customer, and revenue growing faster than spend.',
    inherits: 'Growth Launchpad',
    includes: [
      'Funnel conversion optimisation',
      'Media buying oversight',
      'CRM optimisation',
      'Marketing automation strategy',
      'Lead nurturing programmes',
      'Sales funnel analytics',
      'Executive growth reporting',
    ],
  },
  {
    slug: 'scale',
    order: '04',
    label: 'Scale',
    name: 'Growth Scale',
    quote: 'Let us go big.',
    summary:
      'Tracking, automation, written processes and reporting your board will understand.',
    overview:
      'The systems and infrastructure that let growth keep going without everything running through one person.',
    output:
      'A growth engine that predicts its own customer acquisition and reports on it without anyone building a spreadsheet.',
    inherits: 'Growth Accelerate',
    includes: [
      'Tracking and analytics structure',
      'CRM setup and parameters',
      'Lead routing automation',
      'Marketing automation workflows',
      'Team training and onboarding',
      'SOP validation',
      'Executive dashboards and reporting framework',
    ],
  },
];

export const suiteIndex = {
  number: '05',
  title: 'The Growth Suite',
  lede: 'Four products. Four stages of growth.',
  body: 'Start wherever you are. Each one hands over cleanly to the next.',
} as const;

export function getBundle(slug: string): Bundle | undefined {
  return bundles.find((b) => b.slug === slug);
}
