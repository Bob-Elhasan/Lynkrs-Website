import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import { PageHero, PageSection, SectionIntro, SignalCard } from '@/components/site/spatial-page';

const perspectives = [
  { number: '01', title: 'Find the leak', body: 'Map the revenue structure, customer journey, channels, and conversion experience before adding more activity.' },
  { number: '02', title: 'Connect the levers', body: 'Give strategy, media, content, and SEO one shared objective so every channel makes the next one smarter.' },
  { number: '03', title: 'Make learning visible', body: 'Use reporting as a decision tool: what changed, what worked, what we learned, and what to do next.' },
];

export default function PortfolioPage() {
  return <div className="spatial-page"><Seo title="How growth gets built" path="/portfolio" description="The Lynkrs operating perspective on structured, measurable and scalable growth." /><PageHero number="07" eyebrow="How growth gets built" title={<>Less <em>noise.</em><br />More signal.</>} lede="We do not invent success stories or hide behind vanity metrics. We show the operating logic behind growth and build the system with you." /><PageSection tone="light"><SectionIntro eyebrow="Our working lens" title={<>Every engagement starts<br />with <em>clarity.</em></>} body="The work is designed to move from diagnosis to decisions, from decisions to action, and from action to measurable learning." /><div className="signal-grid">{perspectives.map((item) => <SignalCard key={item.number} index={item.number} title={item.title} body={item.body} />)}</div></PageSection><PageSection tone="yellow"><SectionIntro eyebrow="Want the real version?" title={<>Bring us the messy<br /><em>version.</em></>} body="The best work starts before the case study. It starts with an honest look at what is happening now." /><Link className="round-cta round-cta--blue" to="/contact"><span>Start a<br />conversation</span><ArrowUpRight size={20} /></Link></PageSection></div>;
}
