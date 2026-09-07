import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { clamp } from '@/xr/motion';
import { prefersReducedMotion } from '@/xr/quality';
import { stationForRoute, stationT } from '@/xr/spline';

/**
 * Turns page scroll and the current route into one normalised journey position.
 *
 * The document is given real scrollable height (see JourneyScroll) so the page
 * keeps native scrolling, keyboard paging and scrollbar affordances instead of
 * hijacking the wheel. Routing sets an anchor; scrolling moves relative to it.
 */
export function useJourneyProgress() {
  const { pathname } = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      // Coalesce to one read per frame; scroll fires far more often than that.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? clamp(window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const isHome = pathname.replace(/\/+$/, '') === '';

  const target = useMemo(() => {
    // The homepage is the full journey and is driven entirely by scroll.
    if (isHome) return scrollProgress;
    // Other routes park at their station.
    return stationT[stationForRoute(pathname).id];
  }, [isHome, pathname, scrollProgress]);

  return { target, reducedMotion, scrollProgress, isHome };
}
