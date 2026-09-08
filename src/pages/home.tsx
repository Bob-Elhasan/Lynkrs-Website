import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Menu, MoveUpRight, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/logo';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';

const pillars = [
  { number: '01', title: 'Diagnose the system', text: 'We make the messy picture useful: revenue structure, customer journey, channels, and conversion in one view.' },
  { number: '02', title: 'Connect the levers', text: 'Strategy, media, content, and SEO work together under one commercial objective.' },
  { number: '03', title: 'Scale what learns', text: 'Every move leaves the next one in a better place. Performance becomes a compounding advantage.' },
];

const services = [
  { label: 'Performance', detail: 'Paid media that earns its place.' },
  { label: 'Content & brand', detail: 'Demand, trust, and conversion connected.' },
  { label: 'SEO revenue', detail: 'Organic growth that compounds.' },
];

function BrandMark({ light = false }: { light?: boolean }) {
  return <Logo light={light} className="brand-mark-image" />;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Seo path="/" description={siteConfig.description} />
      <div className="lynkrs-home">
        <div className={`loading-screen ${loading ? '' : 'loading-screen--done'}`} aria-hidden={!loading}>
          <div className="loading-top"><BrandMark light /><span>LOADING <i>→</i></span></div>
          <div className="loading-bottom"><span>LYNKRS / 2026</span><strong>100%</strong></div>
        </div>

        <header className="lynkrs-nav">
          <Link to="/" className="nav-logo" aria-label="Lynkrs home"><BrandMark /></Link>
          <nav className={menuOpen ? 'nav-links nav-links--open' : 'nav-links'} aria-label="Primary navigation">
            <a href="#approach" onClick={() => setMenuOpen(false)}>Approach</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={14} /></Link>
          </nav>
          <button className="nav-menu" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <Menu size={17} /></button>
        </header>

        <main>
          <section className="hero-panel">
            <div className="hero-orbit hero-orbit--one" />
            <div className="hero-orbit hero-orbit--two" />
            <div className="hero-copy">
              <p className="eyebrow eyebrow--dark"><span>01</span> Performance-led growth agency</p>
              <h1>Turn motion<br />into <em>momentum.</em></h1>
              <p className="hero-summary">Lynkrs connects strategy, media, content, and SEO into one measurable system — so marketing becomes a business driver.</p>
              <Link className="round-cta" to="/contact"><span>Start a<br />conversation</span><ArrowDownRight size={20} /></Link>
            </div>
            <div className="hero-side-note"><span>Scroll to explore</span><ArrowDownRight size={17} /></div>
            <div className="hero-stamp">L<span>↗</span></div>
            <div className="hero-footer"><span>Strategy / Creative / Growth</span><span>Based in Cairo — working everywhere</span></div>
          </section>

          <section id="approach" className="manifesto-section">
            <div className="section-kicker"><span>(02)</span><span>What we believe</span></div>
            <div className="manifesto-grid">
              <h2>Growth is not<br /><span>guessed.</span><br />It is designed.</h2>
              <div className="manifesto-copy"><p>Most brands do not struggle because they lack activity. They struggle because their efforts are fragmented.</p><p>We eliminate the fragmentation and make performance predictable, learning continuous, and spend scalable.</p><Link className="text-link" to="/services">See how we work <ArrowUpRight size={15} /></Link></div>
            </div>
            <div className="pillars-grid">{pillars.map((pillar) => <article key={pillar.number} className="pillar-card"><span>{pillar.number}</span><h3>{pillar.title}</h3><p>{pillar.text}</p><Plus size={18} /></article>)}</div>
          </section>

          <section id="services" className="services-section">
            <div className="section-kicker section-kicker--light"><span>(03)</span><span>Our orbit</span></div>
            <div className="services-heading"><h2>One studio.<br /><em>Many angles.</em></h2><p>Wherever you start, we build the connective tissue that makes everything else work harder.</p></div>
            <div className="services-list">{services.map((service, index) => <Link to="/services" className="service-row" key={service.label}><span>0{index + 1}</span><h3>{service.label}</h3><p>{service.detail}</p><MoveUpRight size={20} /></Link>)}</div>
            <div className="services-orbit"><Sparkles size={17} /><span>Make something<br />worth noticing.</span></div>
          </section>

          <section id="work" className="work-section">
            <div className="section-kicker"><span>(04)</span><span>Selected thinking</span></div>
            <div className="work-intro"><h2>Small shifts.<br /><em>Big difference.</em></h2><p>We do our best work in the space between what a business is and what it could become.</p></div>
            <div className="work-cards"><Link to="/portfolio" className="work-card work-card--orange"><span>Case study / 001</span><strong>From scattered<br />to <em>signal.</em></strong><ArrowUpRight /></Link><Link to="/portfolio" className="work-card work-card--cream"><span>Case study / 002</span><strong>A brand with<br /><em>somewhere to go.</em></strong><ArrowUpRight /></Link></div>
          </section>

          <section className="closing-section"><div className="closing-top"><BrandMark /><span>Let’s make the next move.</span></div><h2>Ready when<br /><em>you are.</em></h2><Link className="closing-link" to="/contact">Start a conversation <ArrowUpRight size={19} /></Link><div className="closing-bottom"><span>© 2026 Lynkrs</span><span>Growth is designed, not guessed.</span></div></section>
        </main>
      </div>
    </>
  );
}

export { BrandMark };
