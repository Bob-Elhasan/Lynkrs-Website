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
    </ThemeProvider>
  );
}
