import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

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
  const stageActive = useStageActive();

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:ring-2"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main
        id="main"
        className={cn('flex-1', stageActive && 'visually-hidden')}
        // The canvas is aria-hidden, so this mirror is the only accessible
        // representation of the content. It stays in the tree either way.
        data-mirror={stageActive ? 'hidden' : 'visible'}
      >
        <Outlet />
      </main>

      <JourneyScroll active={stageActive} />

      <div className={cn(stageActive && 'visually-hidden')}>
        <SiteFooter />
      </div>
    </div>
  );
}
