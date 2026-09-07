/**
 * 04 How we work — the five steps. Verbatim from the approved journey.
 * In 3D these are travelled in sequence; in the DOM mirror they are an <ol>.
 */

export const method = {
  id: 'method' as const,
  number: '04',
  title: 'How we work',
  lede: 'Five steps, one system.',
  body: 'Clear, open and pointed at a result. From the first look at your numbers to the call on what to scale.',
  steps: [
    {
      number: '01',
      title: 'Find out where you actually are',
      body: 'We map your channels, your funnel and where the money really comes from, before touching a single campaign.',
    },
    {
      number: '02',
      title: 'Agree on one goal',
      body: 'Everything points at the same number, and everyone owns it together.',
    },
    {
      number: '03',
      title: 'Build and test in the open',
      body: 'Media, content and SEO run as one. You see what we are trying and what it did.',
    },
    {
      number: '04',
      title: 'Keep sharpening it',
      body: 'What we learn this month shapes the next one. Nothing sits on autopilot.',
    },
    {
      number: '05',
      title: 'Decide what to scale',
      body: 'We back what is working and stop what is not, with the numbers on the table.',
    },
  ],
} as const;
