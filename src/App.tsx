import type { ReactNode } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './data/auth';
import { StoreProvider } from './data/store';
import CalendarPage from './pages/CalendarPage';
import CamperPage from './pages/CamperPage';
import CoveragePage from './pages/CoveragePage';
import InstructionsPage from './pages/InstructionsPage';
import JournalEditorPage from './pages/JournalEditorPage';
import JournalPage from './pages/JournalPage';
import LoginPage from './pages/LoginPage';
import PlacesPage from './pages/PlacesPage';
import RoutePage from './pages/RoutePage';
import SuppliesPage from './pages/SuppliesPage';
import TodayPage from './pages/TodayPage';

function Private({ children }: { children: ReactNode }) {
  const { unlocked } = useAuth();
  return unlocked ? <>{children}</> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<JournalPage />} />
              <Route path="dzisiaj" element={<Private><TodayPage /></Private>} />
              <Route path="kalendarz" element={<Private><CalendarPage /></Private>} />
              <Route path="trasa" element={<Private><RoutePage /></Private>} />
              <Route path="zasieg" element={<Private><CoveragePage /></Private>} />
              <Route path="kamper" element={<Private><CamperPage /></Private>} />
              <Route path="instrukcje" element={<Private><InstructionsPage /></Private>} />
              <Route path="instrukcje/:id" element={<Private><InstructionsPage /></Private>} />
              <Route path="zapasy" element={<Private><SuppliesPage /></Private>} />
              <Route path="miejsca" element={<Private><PlacesPage /></Private>} />
              <Route path="dziennik/nowy" element={<Private><JournalEditorPage /></Private>} />
              <Route path="*" element={<JournalPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
