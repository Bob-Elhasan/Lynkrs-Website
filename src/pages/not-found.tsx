import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/seo';
import { PageHero, PageSection } from '@/components/site/spatial-page';
export default function NotFoundPage() { return <div className="spatial-page"><Seo title="Page not found" path="/404" description="That page is not part of the Lynkrs system." /><PageHero number="404" eyebrow="Wrong turn" title={<>This link lost<br /><em>the signal.</em></>} lede="The page you asked for is not here. The next right move is back at the beginning." /><PageSection tone="yellow"><Link className="back-link" to="/"><ArrowLeft size={16} /> Return to Lynkrs</Link></PageSection></div>; }
