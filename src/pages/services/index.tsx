import { ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import { CheckList, LinkArrow, PageHero, PageSection, SectionIntro, SignalCard } from '@/components/site/spatial-page';

const modules = [
  { number: '01', slug: 'performance', title: 'Performance & media buying', body: 'Turn paid media into predictable revenue with clear strategy, disciplined testing, and efficient scaling.', items: ['Paid media strategy and execution', 'Funnel and conversion optimisation', 'Creative testing and iteration', 'Budget efficiency and scaling logic', 'Continuous performance optimisation'] },
  { number: '02', slug: 'content', title: 'Content & brand', body: 'Make content a performance asset: building demand, trust, and conversion at every touchpoint.', items: ['Content storytelling framework', 'Visual and written production', 'Community engagement and growth', 'Content performance analysis', 'Social media strategy and planning'] },
  { number: '03', slug: 'seo', title: 'SEO revenue system', body: 'Turn organic visibility into sustainable revenue that compounds beyond paid spend.', items: ['Technical SEO and UX optimisation', 'Keyword and search-intent strategy', 'Content and on-page optimisation', 'Authority building and backlinks', 'Revenue projection and SEO tracking'] },
  { number: '04', slug: 'consultancy', title: 'Marketing consultancy', body: 'Bring senior thinking to the table when the problem is the plan, the operating model, or the next decision.', items: ['Executive growth guidance', 'Channel and funnel diagnosis', 'KPI and reporting alignment', 'Growth roadmap design', 'Team enablement and accountability'] },
];

export default function ServicesIndexPage() {
  return <div className="spatial-page" style={{ '--page-accent': '#3c76c0' } as React.CSSProperties}>
    <Seo title="Integrated growth systems" path="/services" description="Strategy, media, content and SEO connected under one growth objective." />
    <PageHero number="06" eyebrow="What we run" title={<>One system.<br /><em>Every lever</em><br />connected.</>} lede="We do not optimise isolated channels. We design and operate growth systems where strategy, media, content and SEO work together under one clear objective." />
    <PageSection tone="light"><SectionIntro eyebrow="The problem we solve" title={<>Stop creating <em>motion</em><br />without momentum.</>} body="Different agencies, different objectives, no shared accountability. We connect the work so performance becomes a business driver, not a recurring expense." /><div className="signal-grid signal-grid--four">{modules.map((module) => <SignalCard key={module.slug} index={module.number} title={module.title} body={module.body}><CheckList items={module.items.slice(0, 3)} /><LinkArrow to={`/services/${module.slug}`}>Explore the module</LinkArrow></SignalCard>)}</div></PageSection>
    <PageSection tone="yellow"><SectionIntro eyebrow="How we approach growth" title={<>Performance must serve<br /><em>the business.</em></>} body="Sustainable growth balances short-term results with long-term equity. Data should guide decisions, not fill reports. Creativity works best when it is accountable." /><div className="method-ribbon"><span>01 Diagnose</span><span>02 Align</span><span>03 Execute</span><span>04 Optimise</span><span>05 Scale</span></div><Link className="round-cta round-cta--blue" to="/contact"><span>Build your<br />growth system</span><ArrowDownRight size={20} /></Link></PageSection>
  </div>;
}
