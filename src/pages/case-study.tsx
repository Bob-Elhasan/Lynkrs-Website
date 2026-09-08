import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Seo } from '@/components/seo';
import { CheckList, PageHero, PageSection, SectionIntro, SignalCard } from '@/components/site/spatial-page';

const chapters = [
  { title: 'Diagnose before you deploy', body: 'Revenue structure, SEO, content, acquisition channels, customer journey, and conversion experience become one picture.' },
  { title: 'Align the objective', body: 'One commercial goal gives the team a shared definition of progress and makes every channel accountable to the outcome.' },
  { title: 'Execute and test', body: 'Media, content, SEO, and automation move together. Each action creates learning for the next one.' },
  { title: 'Optimise what compounds', body: 'Short-term performance and long-term equity are treated as connected jobs, not competing priorities.' },
];

export default function CaseStudyPage() {
  const { slug = 'growth-system' } = useParams();
  return <div className="spatial-page"><Seo title="Growth system in practice" path={`/portfolio/${slug}`} description="A closer look at the Lynkrs growth-system approach." /><PageHero number="08" eyebrow="Growth system in practice" title={<>Make the next move<br /><em>make sense.</em></>} lede="A useful case study should show the decisions, not just the decoration. Here is the operating model behind a Lynkrs engagement." /><PageSection tone="light"><Link className="back-link" to="/portfolio"><ArrowLeft size={16} /> Back to perspective</Link><SectionIntro eyebrow="The operating model" title={<>Structured.<br /><em>Measurable.</em><br />Scalable.</>} body="The job is to remove fragmentation and replace it with a connected system where learning is continuous and accountability is clear." /><div className="signal-grid signal-grid--four">{chapters.map((chapter, index) => <SignalCard key={chapter.title} index={`0${index + 1}`} title={chapter.title} body={chapter.body} />)}</div></PageSection><PageSection tone="dark"><div className="split-callout"><div><div className="section-kicker"><span>✦</span><span>The outcome</span></div><h2 className="spatial-section-title">Marketing that earns its keep.</h2></div><div><CheckList items={['Predictable performance', 'Continuous learning', 'Clear accountability', 'Scalable growth infrastructure']} /><Link className="spatial-link" to="/contact">Discuss your system <ArrowUpRight size={16} /></Link></div></div></PageSection></div>;
}
