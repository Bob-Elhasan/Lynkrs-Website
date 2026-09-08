import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { cn } from '@/lib/utils';

/** Scroll to top on route change, or to the target section for a hash link. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export function RootLayout() {
  const { pathname } = useLocation();
  const isHome = pathname.replace(/\/+$/, '') === '';
  return (
    <div className={cn('site-shell pointer-events-none flex min-h-dvh flex-col', isHome ? 'site-shell--home' : 'site-shell--inner')}>
      <ScrollToTop />
      <a
        href="#main"
        className="bg-primary text-primary-foreground focus:ring-ring pointer-events-auto sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:ring-2"
      >
        Skip to content
      </a>
      {!isHome && <SiteHeader />}
      <main id="main" className="pointer-events-auto flex-1" data-mirror="visible">
        <Outlet />
      </main>
      <div className="pointer-events-auto">
        {!isHome && <SiteFooter />}
      </div>
    </div>
  );
}
