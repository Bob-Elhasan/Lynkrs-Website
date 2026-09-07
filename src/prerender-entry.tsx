import { renderToStaticMarkup } from 'react-dom/server';
import { Route, Routes, StaticRouter } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import BundlesPage from '@/pages/bundles';
import CaseStudyPage from '@/pages/case-study';
import ContactPage from '@/pages/contact';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';
import PortfolioPage from '@/pages/portfolio';
import ServiceDetailPage from '@/pages/services/detail';
import ServicesIndexPage from '@/pages/services/index';
import { caseStudies } from '@/content/portfolio';
import { services } from '@/content/services';

/**
 * Build-time prerender.
 *
 * The live site renders to a WebGL canvas, which no crawler and no screen
 * reader can read. This emits the DOM mirror as real HTML into every route's
 * index.html so the content exists before a single byte of JavaScript runs.
 *
 * The 3D stage is deliberately absent here — it needs a browser, and the whole
 * point of this pass is the readable copy underneath it.
 */

export const routes: string[] = [
  '/',
  '/services',
  ...services.map((s) => `/services/${s.slug}`),
  '/bundles',
  '/portfolio',
  ...caseStudies.map((c) => `/portfolio/${c.slug}`),
  '/contact',
  '/404',
];

export function render(pathname: string): string {
  return renderToStaticMarkup(
    <StaticRouter location={pathname}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesIndexPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="bundles" element={<BundlesPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/:slug" element={<CaseStudyPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </StaticRouter>,
  );
}
