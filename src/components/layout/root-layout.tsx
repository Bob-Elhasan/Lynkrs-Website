import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

/**
 * Scroll to top on route change, or to the target section for a hash link.
 *
 * React Router's client-side navigation only updates history — unlike a full
 * page load, it never scrolls the browser to a URL's #fragment on its own.
 * Without this, every hash link in the footer (/#problem, /#method,
 * /#together) would silently do nothing when clicked from inside the app.
 */
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

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
