import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useStore } from '@/store';
import { initSearch } from '@/lib/search';
import { detectDevice } from '@/lib/device';
import Layout from '@/components/layout/Layout';
import HomePage from '@/components/pages/HomePage';
import LearnPage from '@/components/pages/LearnPage';
import RoadmapPage from '@/components/pages/RoadmapPage';
import ProgressPage from '@/components/pages/ProgressPage';
import SettingsPage from '@/components/pages/SettingsPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

export default function App() {
  const hydrate = useStore(s => s.hydrate);

  useEffect(() => {
    // Hydrate store from localStorage
    hydrate();

    // Init search index in background
    initSearch().catch(() => {/* search unavailable */});

    // Detect device capabilities
    detectDevice().catch(() => {/* device detection failed */});
  }, [hydrate]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="learn/:tech" element={<LearnPage />} />
          <Route path="learn/:tech/:lessonId" element={<LearnPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
