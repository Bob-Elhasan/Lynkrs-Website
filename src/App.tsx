import { MotionConfig } from 'motion/react';
import { Route, Routes } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import { ThemeProvider } from '@/components/theme-provider';
import BundlesPage from '@/pages/bundles';
import CaseStudyPage from '@/pages/case-study';
import ContactPage from '@/pages/contact';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';
import PortfolioPage from '@/pages/portfolio';
import ServiceDetailPage from '@/pages/services/detail';
import ServicesIndexPage from '@/pages/services/index';

export default function App() {
  return (
    <ThemeProvider>
      {/* The CSS prefers-reduced-motion block in index.css only zeroes CSS
       * animation/transition durations — it has no effect on Motion's
       * JS-driven transforms, which every scroll-reveal and hover effect in
       * the marketing components uses. This is the one place that setting
       * needs wiring, and it covers every Motion-driven component in the
       * tree automatically. */}
      <MotionConfig reducedMotion="user">
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
      </MotionConfig>
    </ThemeProvider>
  );
}
