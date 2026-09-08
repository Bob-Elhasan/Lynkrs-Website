import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { JourneyRail } from '@/components/layout/journey-rail';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { cn } from '@/lib/utils';
import { useStageActive } from '@/xr/stage-state';

/** Scroll to top on route change, unless the route carries a hash. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

/**
 * Gives the document real scroll height while the 3D corridor is driving.
 *
 * The mirror is visually hidden in that mode, so without this the page would
 * have nothing to scroll and the journey could never advance. Using genuine
 * document height keeps native scrolling, keyboard paging, scrollbars and
 * trackpad momentum working rather than hijacking the wheel.
 */
function JourneyScroll({ active }: { active: boolean }) {
  const { pathname } = useLocation();
  const isHome = pathname.replace(/\/+$/, '') === '';
  if (!active || !isHome) return null;
  return <div aria-hidden="true" style={{ height: '760vh' }} />;
}

export function RootLayout() {
  const { pathname } = useLocation();
  const isHome = pathname.replace(/\/+$/, '') === '';
  const stageActive = useStageActive();

  return (
    // pointer-events-none on the whole layout, not just the spacer below:
    // this div is a normal in-flow box, and CSS paints negative-z-index
    // positioned elements (the fixed, -z-10 canvas) *before* normal-flow
    // boxes in the same stacking context — meaning this wrapper, despite
    // being fully transparent, sits in front of the canvas for hit-testing
    // even though the canvas paints on top visually. Without this, nothing
    // in the canvas ever receives a pointer event anywhere on the page: not
    // the module/bundle cards' onClick, not even the camera's pointer
    // parallax. Each real interactive region below opts back in explicitly.
    <div className="pointer-events-none flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="bg-primary text-primary-foreground focus:ring-ring pointer-events-auto sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:ring-2"
      >
        Skip to content
      </a>

      {!isHome && <SiteHeader />}

      <main
        id="main"
        className={cn('pointer-events-auto flex-1', stageActive && 'visually-hidden')}
        // The canvas is aria-hidden, so this mirror is the only accessible
        // representation of the content. It stays in the tree either way.
        data-mirror={stageActive ? 'hidden' : 'visible'}
      >
        <Outlet />
      </main>

      <JourneyScroll active={stageActive} />
      <JourneyRail />

      <div className={cn('pointer-events-auto', stageActive && 'visually-hidden')}>
        {!isHome && <SiteFooter />}
      </div>
    </div>
  );
}
