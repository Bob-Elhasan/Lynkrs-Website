import { Route, Routes } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import { ThemeProvider } from '@/components/theme-provider';
import ContactPage from '@/pages/contact';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';
import PlatformPage from '@/pages/platform';
import WorkPage from '@/pages/work';

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="platform" element={<PlatformPage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
