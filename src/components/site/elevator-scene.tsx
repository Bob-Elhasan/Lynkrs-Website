import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Volume2, VolumeX, X } from 'lucide-react';

import { ElevatorApp, type Phase } from '@/three/ElevatorApp';
import type { DoorContent, FloorContent } from '@/three/content';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';

const SCROLL_HINT: Partial<Record<Phase, string>> = {
  lobby: 'Scroll to enter',
  entering: 'Keep scrolling',
  panel: 'Choose a floor',
  corridor: 'Scroll to walk the corridor',
};

export function ElevatorScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ElevatorApp | null>(null);

  const [loading, setLoading] = useState(0);
  const [ready, setReady] = useState(false);
  const [fadedIn, setFadedIn] = useState(false);
  const [phase, setPhase] = useState<Phase>('lobby');
  const [floor, setFloor] = useState<FloorContent | null>(null);
  const [door, setDoor] = useState<DoorContent | null>(null);
  const [fade, setFade] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    document.body.classList.add('elevator-locked');

    const app = new ElevatorApp(container, {
      onLoadingProgress: setLoading,
      onReady: () => setReady(true),
      onPhaseChange: setPhase,
      onFloorChange: setFloor,
      onDoorChange: setDoor,
      onFadeChange: setFade,
      onContactRequest: openContact,
    });
    appRef.current = app;

    return () => {
      app.dispose();
      appRef.current = null;
      document.body.classList.remove('elevator-locked');
    };
  }, [openContact]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setFadedIn(true), 220);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // Escape closes the form, so the 3D scene is never trapped behind it.
  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContactOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contactOpen]);

  function toggleSound() {
    const app = appRef.current;
    if (!app) return;
    const next = !app.isSoundEnabled();
    app.setSoundEnabled(next);
    setSoundEnabled(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Growth conversation — ${data.get('name') || 'new enquiry'}`);
    const body = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\n\n${data.get('message')}`,
    );
    setSent(true);
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  }

  const showBack = phase === 'corridor' || phase === 'room';
  const hint = SCROLL_HINT[phase];

  return (
    <div className="elevator-scene">
      <Seo path="/" description={siteConfig.description} />

      <div ref={containerRef} className="elevator-scene__canvas" aria-hidden={!ready} />

      <div className="elevator-scene__fade" style={{ opacity: fade }} aria-hidden="true" />

      <div className={`elevator-scene__loading ${fadedIn ? 'is-hidden' : ''}`}>
        <div className="elevator-scene__loading-mark">LYNKRS</div>
        <div className="elevator-scene__loading-track">
          <div className="elevator-scene__loading-fill" style={{ width: `${loading}%` }} />
        </div>
        <div className="elevator-scene__loading-text">Preparing the lift</div>
      </div>

      <button
        type="button"
        className="elevator-scene__sound"
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>

      {showBack && (
        <button type="button" className="elevator-scene__back" onClick={() => appRef.current?.goBack()}>
          ← {phase === 'room' ? 'Back to corridor' : 'Back to the lift'}
        </button>
      )}

      {floor && (phase === 'corridor' || phase === 'room') && (
        <div className="elevator-scene__floor-indicator">
          <span className="elevator-scene__floor-number">{floor.floorNumber}</span>
          <span className="elevator-scene__floor-label">{floor.buttonLabel}</span>
        </div>
      )}

      {door?.cta && phase === 'room' && (
        <div className="elevator-scene__door-cta">
          <Link to={door.cta.to} className="elevator-scene__door-cta-link">
            {door.cta.label} <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      {fadedIn && hint && phase !== 'room' && (
        <div className="elevator-scene__hint">
          <span>{hint}</span>
          {phase !== 'panel' && <span className="elevator-scene__hint-arrow" />}
        </div>
      )}

      {contactOpen && (
        <div className="elevator-dialog" role="dialog" aria-modal="true" aria-label="Get in touch">
          <button
            type="button"
            className="elevator-dialog__scrim"
            aria-label="Close"
            onClick={() => setContactOpen(false)}
          />
          <div className="elevator-dialog__panel">
            <button
              type="button"
              className="elevator-dialog__close"
              onClick={() => setContactOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <p className="elevator-dialog__kicker">Car telephone</p>
            <h2 className="elevator-dialog__title">Get in touch</h2>
            <p className="elevator-dialog__lede">
              Tell us what is happening now. We will come back with the next right move within one working day.
            </p>
            <form className="elevator-dialog__form" onSubmit={handleSubmit}>
              <label>
                Your name
                <input name="name" required placeholder="Your name" />
              </label>
              <label>
                Work email
                <input name="email" type="email" required placeholder="you@company.com" />
              </label>
              <label>
                Company
                <input name="company" placeholder="Company name" />
              </label>
              <label>
                What is happening?
                <textarea name="message" required rows={4} placeholder="What are you trying to fix or grow?" />
              </label>
              <button type="submit">{sent ? 'Opening your email…' : 'Start the conversation'}</button>
            </form>
            <p className="elevator-dialog__foot">
              Prefer email? <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
