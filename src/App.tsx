import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import BundlesPage from '@/pages/bundles';
import CaseStudyPage from '@/pages/case-study';
import ContactPage from '@/pages/contact';
import NotFoundPage from '@/pages/not-found';
import PortfolioPage from '@/pages/portfolio';
import ServiceDetailPage from '@/pages/services/detail';
import ServicesIndexPage from '@/pages/services/index';

// Three.js, GSAP and Howler are only needed on "/", so this keeps their
// weight out of every other route's bundle instead of paying for it upfront.
const ElevatorScene = lazy(() =>
  import('@/components/site/elevator-scene').then((m) => ({ default: m.ElevatorScene })),
);

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<div className="elevator-scene" />}>
              <ElevatorScene />
            </Suspense>
          }
        />
        <Route path="services" element={<ServicesIndexPage />} />
        <Route path="services/:slug" element={<ServiceDetailPage />} />
        <Route path="bundles" element={<BundlesPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/:slug" element={<CaseStudyPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
