import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';

import { ElevatorApp, type Phase } from '@/three/ElevatorApp';
import type { DoorContent, FloorContent } from '@/three/content';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';

const SCROLL_HINT: Partial<Record<Phase, string>> = {
  intro: 'Scroll to enter',
  inside: 'Scroll to enter',
  corridor: 'Scroll to explore',
};

export function ElevatorScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<ElevatorApp | null>(null);

  const [loading, setLoading] = useState(0);
  const [ready, setReady] = useState(false);
  const [fadedIn, setFadedIn] = useState(false);
  const [phase, setPhase] = useState<Phase>('intro');
  const [floor, setFloor] = useState<FloorContent | null>(null);
  const [door, setDoor] = useState<DoorContent | null>(null);
  const [fade, setFade] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const app = new ElevatorApp(container, {
      onLoadingProgress: (pct) => setLoading(pct),
      onReady: () => setReady(true),
      onPhaseChange: (p) => setPhase(p),
      onFloorChange: (f) => setFloor(f),
      onDoorChange: (d) => setDoor(d),
      onFadeChange: (v) => setFade(v),
    });
    appRef.current = app;

    return () => {
      app.dispose();
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setFadedIn(true), 250);
    return () => window.clearTimeout(timer);
  }, [ready]);

  function toggleSound() {
    const app = appRef.current;
    if (!app) return;
    const next = !app.isSoundEnabled();
    app.setSoundEnabled(next);
    setSoundEnabled(next);
  }

  const showBack = phase === 'corridor' || phase === 'doorDetail';
  const hint = SCROLL_HINT[phase];

  return (
    <div className="elevator-scene">
      <Seo path="/" description={siteConfig.description} />

      <div ref={containerRef} className="elevator-scene__canvas" aria-hidden={!ready} />

      <div className="elevator-scene__fade" style={{ opacity: fade }} aria-hidden="true" />

      <div className={`elevator-scene__loading ${fadedIn ? 'is-hidden' : ''}`}>
        <svg width="56" height="56" viewBox="0 0 60 60" fill="none" aria-hidden="true">
          <rect x="5" y="5" width="50" height="50" rx="4" stroke="#c8a85c" strokeWidth="1" />
          <text x="30" y="36" textAnchor="middle" fill="#c8a85c" fontFamily="Georgia, serif" fontSize="14">
            L
          </text>
        </svg>
        <div className="elevator-scene__loading-track">
          <div className="elevator-scene__loading-fill" style={{ width: `${loading}%` }} />
        </div>
        <div className="elevator-scene__loading-text">Loading experience</div>
      </div>

      <button
        type="button"
        className="elevator-scene__sound"
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
        aria-pressed={soundEnabled}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {showBack && (
        <button
          type="button"
          className="elevator-scene__back"
          onClick={() => appRef.current?.goBack()}
        >
          ← {phase === 'doorDetail' ? 'Close' : 'Lobby'}
        </button>
      )}

      {floor && phase === 'corridor' && !door && (
        <div className="elevator-scene__floor-indicator">
          <span className="elevator-scene__floor-number">{floor.floorNumber}</span>
          <span className="elevator-scene__floor-label">{floor.buttonLabel}</span>
        </div>
      )}

      {door?.cta && (
        <div className="elevator-scene__door-cta">
          <Link to={door.cta.to} className="elevator-scene__door-cta-link">
            {door.cta.label} →
          </Link>
        </div>
      )}

      {fadedIn && hint && !door && (
        <div className="elevator-scene__hint">
          <span>{hint}</span>
          <span className="elevator-scene__hint-arrow" />
        </div>
      )}
    </div>
  );
}
