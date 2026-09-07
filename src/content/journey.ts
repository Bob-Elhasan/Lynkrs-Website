/**
 * The 01–07 narrative. This is the spine of the site.
 *
 * Copy is taken verbatim from the approved Lynkrs journey. Do not rewrite it
 * into marketing-speak: the plainness is the point. Each station becomes a
 * waypoint in the 3D corridor and a <section> in the DOM mirror.
 */

export type StationId =
  | 'arrival'
  | 'problem'
  | 'positioning'
  | 'principles'
  | 'method'
  | 'suite'
  | 'modules'
  | 'together'
  | 'contact';

export const arrival = {
  id: 'arrival' as const,
  tagline: 'Growth is designed, not guessed',
  headline: ["You're busy running the business.", 'We run the growth.'],
  subhead: 'Strategy, media, content and SEO, all pulling towards the same number.',
} as const;

export const problem = {
  id: 'problem' as const,
  number: '01',
  title: 'The problem',
  lede: 'Most marketing does not fail because nobody is working hard. It fails because nothing is joined up.',
  body: 'Different agencies, different targets, and nobody owning the result. You end up paying for that in four places at once.',
  costs: [
    {
      number: '01',
      title: 'Wasted spend',
      body: 'Media runs without a clear brief, so the budget goes out and very little comes back.',
    },
    {
      number: '02',
      title: 'Rising costs',
      body: 'Nobody checks what the content actually earns, so winning a customer keeps getting dearer.',
    },
    {
      number: '03',
      title: 'Starting over',
      body: 'SEO chases traffic instead of revenue, and every month begins from scratch.',
    },
    {
      number: '04',
      title: 'No room to grow',
      body: 'A good month looks great in a report, but there is nothing underneath it to build on.',
    },
  ],
  resolution: 'Marketing turns into a cost you tolerate instead of an investment you make.',
} as const;

export const positioning = {
  id: 'positioning' as const,
  number: '02',
  title: 'Our positioning',
  lede: 'We do not tune channels one at a time. We build the whole system, so results hold steady, lessons carry forward, and the money you put in comes back.',
  body: 'Every channel works towards the same goal, and every call we make is one we can explain to you in plain terms.',
  stamp: 'Growth is designed, not guessed.',
} as const;

export const principles = {
  id: 'principles' as const,
  number: '03',
  title: 'How we think',
  items: [
    {
      number: '01',
      title: 'Numbers should answer to the business',
      caption: 'Not vanity metrics',
    },
    {
      number: '02',
      title: 'A report should settle a question, not fill a page',
      caption: 'Signal over noise',
    },
    {
      number: '03',
      title: 'Good ideas can still be held to account',
      caption: 'Ideas with a job',
    },
    {
      number: '04',
      title: 'Growth that lasts beats growth that spikes',
      caption: 'Short and long term',
    },
  ],
} as const;

export const together = {
  id: 'together' as const,
  number: '07',
  title: 'How we work together',
  stamp: 'We do not chase volume. We build growth.',
  lede: 'Most agencies run on a strict retainer. Flat rate, service against value, a rate card. It creates dependencies and bottlenecks, so we got rid of it.',
  body: 'We work as an extension of your team. Here is how that runs.',
  steps: [
    { number: '1', title: 'You set the objectives' },
    { number: '2', title: 'We look at where things stand' },
    { number: '3', title: 'We agree the numbers together' },
    { number: '4', title: 'We do what it takes to hit them' },
  ],
} as const;

export const closing = {
  eyebrow: 'Ready when you are',
  headline: 'Turn marketing spend into growth you can rely on.',
  body: 'Tell us what you are aiming at. We will tell you what it takes, then go and do it.',
} as const;
