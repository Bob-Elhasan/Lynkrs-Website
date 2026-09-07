/**
 * 06 What we run — the service modules.
 *
 * M/01–M/03 are verbatim from the approved journey. The `detail` blocks expand
 * each one into a full page using the company profile, rewritten into the same
 * plain voice rather than pasted in the profile's corporate register.
 *
 * NOTE: `consultancy` is a fourth service that does not exist as a module in
 * the company profile. It is assembled from the Growth Diagnostics audit list,
 * the five-step method and the partnership model, plus fractional-CMO framing
 * that was added deliberately. See the README launch checklist.
 */

export type Service = {
  slug: string;
  code: string;
  name: string;
  navLabel: string;
  lede: string;
  emphasis: string;
  deliverables: { number: string; title: string }[];
  detail: {
    intro: string;
    outcome: string;
    forYouIf: string[];
  };
};

export const services: Service[] = [
  {
    slug: 'performance',
    code: 'M/01',
    name: 'Performance and media buying',
    navLabel: 'Performance',
    lede: 'Where most of the work happens.',
    emphasis: 'We turn paid media into revenue you can count on, without spending more to get it.',
    deliverables: [
      { number: '01', title: 'Paid media strategy and execution' },
      { number: '02', title: 'Ongoing performance work' },
      { number: '03', title: 'Funnel and conversion work' },
      { number: '04', title: 'Creative testing' },
      { number: '05', title: 'Budget efficiency and scaling' },
    ],
    detail: {
      intro:
        'Paid media is the fastest way to learn what your market responds to, and the fastest way to waste money if nobody is watching it. We run it as one system: the brief comes from the strategy, the creative gets tested against it, and the budget follows what works.',
      outcome:
        'Measurable revenue growth from paid media that scales, rather than spend that only grows the invoice.',
      forYouIf: [
        'Your spend is going up but your cost per customer is going up with it',
        'Creative gets made, posted, and never checked against what it earned',
        'Nobody can tell you which channel actually paid for itself last month',
      ],
    },
  },
  {
    slug: 'content',
    code: 'M/02',
    name: 'Content and brand',
    navLabel: 'Content',
    lede: 'Content that earns its place.',
    emphasis: 'Made to bring costs down and returns up, not just to fill a calendar.',
    deliverables: [
      { number: '01', title: 'Social strategy and planning' },
      { number: '02', title: 'Storytelling framework' },
      { number: '03', title: 'Visual and written production' },
      { number: '04', title: 'Community growth' },
      { number: '05', title: 'Content performance analysis' },
    ],
    detail: {
      intro:
        'Content is treated as a performance asset here, not a creative output that gets judged on how it looks. It builds the demand and the trust that make every other channel cheaper to run.',
      outcome:
        'Lower cost per customer and stronger returns on paid, because the brand is doing part of the work before the ad ever loads.',
      forYouIf: [
        'You post consistently but cannot connect any of it to revenue',
        'Your ads have to do all the convincing on their own',
        'The calendar is full and nobody is sure why those posts are on it',
      ],
    },
  },
  {
    slug: 'seo',
    code: 'M/03',
    name: 'SEO revenue system',
    navLabel: 'SEO',
    lede: 'Visibility that keeps paying.',
    emphasis: 'Organic growth that does not disappear the day you pause the ads.',
    deliverables: [
      { number: '01', title: 'Revenue projection and tracking' },
      { number: '02', title: 'Technical SEO and page experience' },
      { number: '03', title: 'Keyword and search intent' },
      { number: '04', title: 'On page optimisation' },
      { number: '05', title: 'Authority building' },
    ],
    detail: {
      intro:
        'Most SEO work chases traffic because traffic is easy to report. We start from the revenue instead, work back to the searches that produce it, and build the technical and content foundation those searches need.',
      outcome:
        'Organic revenue that compounds, better conversion from the traffic you already have, and less of your growth hanging on paid spend.',
      forYouIf: [
        'Traffic is up and revenue is flat',
        'Your rankings move but nobody can price what that is worth',
        'Every month of SEO feels like starting the argument again',
      ],
    },
  },
  {
    slug: 'consultancy',
    code: 'M/04',
    name: 'Marketing consultancy',
    navLabel: 'Consultancy',
    lede: 'Senior thinking, on your side of the table.',
    emphasis: 'For when the problem is the plan, not the execution.',
    deliverables: [
      { number: '01', title: 'Growth diagnostics and audit' },
      { number: '02', title: 'Revenue and channel strategy' },
      { number: '03', title: 'Team and process design' },
      { number: '04', title: 'Executive reporting cadence' },
      { number: '05', title: 'Embedded fractional CMO' },
    ],
    detail: {
      intro:
        'Sometimes you do not need another agency running another channel. You need someone senior to look at the whole picture, tell you what is actually wrong, and stay long enough to see it fixed. We audit the site, the SEO, the customer journey, the channels and the revenue structure, then hand you a ninety day plan that names what is holding you back.',
      outcome:
        'A clear read on where growth is leaking, a prioritised plan, and senior ownership of it at board level.',
      forYouIf: [
        'You have the team but not the plan they should be working to',
        'Reporting fills pages and settles nothing',
        'You need a marketing lead but not a full-time hire yet',
      ],
    },
  },
];

export const servicesIndex = {
  number: '06',
  title: 'What we run',
  lede: 'Three modules that run as one system, and senior help when the plan itself is the problem.',
} as const;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
