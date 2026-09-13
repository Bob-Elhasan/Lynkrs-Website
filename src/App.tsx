import { useEffect, useMemo, useState } from 'react';

type LandingSection = 'journey' | 'services' | 'clients' | 'contact';

type Service = {
  name: string;
  index: string;
  detail: string;
  accent: string;
};

const sections: { id: LandingSection; label: string; code: string }[] = [
  { id: 'journey', label: 'Our Journey', code: '01' },
  { id: 'services', label: 'Our Services', code: '02' },
  { id: 'clients', label: 'Our Clients', code: '03' },
  { id: 'contact', label: 'Contact Us', code: '04' },
];

const services: Service[] = [
  { name: 'Content', index: '01', detail: 'Words that open doors.', accent: '#d8f24d' },
  { name: 'Media Buying', index: '02', detail: 'Reach, with intention.', accent: '#7db9ff' },
  { name: 'SEO', index: '03', detail: 'Be found in the right rooms.', accent: '#ff9f61' },
  { name: 'Consultancy', index: '04', detail: 'A clearer way forward.', accent: '#cc9cff' },
];

function App() {
  const [active, setActive] = useState<LandingSection>('journey');
  const [stage, setStage] = useState(0);
  const [selectedService, setSelectedService] = useState(0);
  const doorOpen = stage >= 1;

  const activeIndex = useMemo(() => sections.findIndex((item) => item.id === active), [active]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      setStage((current) => {
        const direction = event.deltaY > 0 ? 1 : -1;
        return Math.min(4, Math.max(0, current + direction));
      });
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const chooseSection = (id: LandingSection) => {
    setActive(id);
    setStage(id === 'services' ? 3 : 2);
  };

  const sceneClass = [
    'scene',
    `scene--stage-${stage}`,
    `scene--${active}`,
    doorOpen ? 'scene--door-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <main className={sceneClass}>
      <div className="noise" aria-hidden="true" />
      <div className="ambient ambient--blue" aria-hidden="true" />
      <div className="ambient ambient--lime" aria-hidden="true" />

      <header className="topbar">
        <a className="brand-lockup" href="#top" onClick={() => { setStage(0); setActive('journey'); }} aria-label="Lynkrs home">
          <img src="/lynkrs-logo.png" alt="Lynkrs" />
          <span>/ 01</span>
        </a>
        <div className="topbar-meta"><span className="status-dot" /> The Elevator Pitch <span className="meta-muted">© 2025</span></div>
      </header>

      <aside className="side-rail" aria-label="Journey progress">
        <span className="rail-label">Scroll to travel</span>
        <div className="rail-line"><span style={{ height: `${Math.max(16, (stage + 1) * 20)}%` }} /></div>
        <span className="rail-count">0{Math.min(stage + 1, 4)} / 04</span>
      </aside>

      <section className="stage" id="top" aria-label="The Elevator Pitch interactive journey">
        <div className="world">
          <div className="ceiling-light" />
          <div className="back-wall">
            <div className="wall-copy">LYNKRS <span>EST. 2018</span></div>
            <div className="elevator-title">The<br /><em>Elevator</em><br />Pitch</div>
            <div className="corridor-sign">L — 02 <span>THE WORK</span></div>
          </div>
          <div className="floor"><span className="floor-reflection" /></div>
          <div className="side-wall side-wall--left" />
          <div className="side-wall side-wall--right" />
          <div className="door door--left"><div className="door-rib" /></div>
          <div className="door door--right"><div className="door-rib" /></div>
          <div className="door-frame" />
          <div className="logo-plaque"><img src="/lynkrs-logo.png" alt="Lynkrs engraved logo" /></div>
          <div className="elevator-console">
            <div className="console-top"><span>LYNKRS / 01</span><span className="console-light" /></div>
            <div className="button-grid">
              {sections.map((item) => (
                <button key={item.id} className={`elevator-button ${active === item.id ? 'is-selected' : ''}`} onClick={() => chooseSection(item.id)} aria-label={`Open ${item.label}`}>
                  <span className="button-code">{item.code}</span><span className="button-label">{item.label}</span><span className="button-led" />
                </button>
              ))}
            </div>
            <div className="console-bottom">PRESS TO BEGIN <span>↗</span></div>
          </div>
          <div className="corridor">
            <div className="corridor-glow" />
            <div className="corridor-doors">
              {services.map((service, index) => (
                <button key={service.name} className={`corridor-door ${selectedService === index ? 'is-active' : ''}`} onClick={() => setSelectedService(index)} style={{ '--service-accent': service.accent } as React.CSSProperties}>
                  <span className="door-number">{service.index}</span><span className="door-name">{service.name}</span><span className="door-arrow">↗</span>
                </button>
              ))}
            </div>
            <div className="corridor-copy"><span>OUR SERVICES</span><strong>{services[selectedService].detail}</strong><small>SELECT A DOOR TO EXPLORE</small></div>
          </div>
        </div>
      </section>

      <div className="hero-overlay">
        <p className="eyebrow"><span>SCROLL / 01</span> A spatial introduction to Lynkrs</p>
        <h1>Make an<br /><em>entrance.</em></h1>
        <p className="hero-note">A creative marketing agency for brands ready to move with purpose.</p>
        <button className="enter-button" onClick={() => setStage(1)}><span>Enter the lift</span><b>↓</b></button>
      </div>

      <nav className="nav-console" aria-label="Main navigation">
        <span className="nav-kicker">Choose your floor</span>
        <div className="nav-buttons">{sections.map((item) => <button key={item.id} className={active === item.id ? 'is-active' : ''} onClick={() => chooseSection(item.id)}><span>{item.code}</span>{item.label}</button>)}</div>
      </nav>

      {active === 'services' && stage >= 3 && <div className="journey-card"><span>02 / OUR SERVICES</span><h2>Different doors.<br /><em>Same standard.</em></h2><p>We build the route between a sharp idea and the people it needs to reach.</p><button onClick={() => setStage(4)}>Walk the corridor <span>↗</span></button></div>}
      {active !== 'services' && stage >= 3 && <div className="section-card"><span>0{activeIndex + 1} / {sections[activeIndex]?.label.toUpperCase()}</span><h2>{active === 'journey' ? <>Built for the<br /><em>next floor.</em></> : active === 'clients' ? <>Good company<br /><em>travels far.</em></> : <>Let's make<br /><em>some noise.</em></>}</h2><p>{active === 'contact' ? 'hello@lynkrs.com · Dubai / London / Everywhere' : 'The best work starts with a shared point of view.'}</p></div>}

      <div className="scroll-hint"><span className="mouse-icon" /> <span>{stage === 4 ? 'Select a door to explore' : 'Scroll to continue'}</span></div>
      <div className="mobile-floor-label">FLOOR <strong>0{Math.min(stage + 1, 4)}</strong></div>
    </main>
  );
}

export default App;
