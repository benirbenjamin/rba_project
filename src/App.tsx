import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { GlobalRadioPlayer } from './components/player/GlobalRadioPlayer';

// Pages
import { Home } from './pages/Home';
import { RadioPage } from './pages/Radio';
import { StationDetailPage } from './pages/StationDetail';
import { TVPage } from './pages/TV';
import { VideoDetailPage } from './pages/VideoDetail';
import { SearchPage } from './pages/Search';
import { AboutPage } from './pages/About';
import { ContactPage } from './pages/Contact';
import { PrivacyPage } from './pages/Privacy';
import { AdminLoginPage } from './pages/AdminLogin';

// Admin Pages
import { DashboardPage } from './pages/admin/Dashboard';
import { StationsAdminPage } from './pages/admin/StationsAdmin';
import { VideosAdminPage } from './pages/admin/VideosAdmin';
import { AnalyticsAdminPage } from './pages/admin/AnalyticsAdmin';
import { UsersAdminPage } from './pages/admin/UsersAdmin';
import { SettingsAdminPage } from './pages/admin/SettingsAdmin';
import { ProfileAdminPage } from './pages/admin/ProfileAdmin';
import { NotFoundPage } from './pages/NotFound';

// Protected Route Helpers
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rba-blue border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const ProtectedSuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rba-blue border-t-transparent" />
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// Layout with persistent header & footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AnalyticsProvider>
            <div className="relative min-h-screen flex flex-col">
              <Routes>
                {/* Public Website Routes */}
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/radio" element={<PublicLayout><RadioPage /></PublicLayout>} />
                <Route path="/radio/:slug" element={<PublicLayout><StationDetailPage /></PublicLayout>} />
                <Route path="/tv" element={<PublicLayout><TVPage /></PublicLayout>} />
                <Route path="/tv/:id" element={<PublicLayout><VideoDetailPage /></PublicLayout>} />
                <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <DashboardPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/stations"
                  element={
                    <ProtectedAdminRoute>
                      <StationsAdminPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/videos"
                  element={
                    <ProtectedAdminRoute>
                      <VideosAdminPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedAdminRoute>
                      <AnalyticsAdminPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedSuperAdminRoute>
                      <UsersAdminPage />
                    </ProtectedSuperAdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedAdminRoute>
                      <SettingsAdminPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedAdminRoute>
                      <ProfileAdminPage />
                    </ProtectedAdminRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
              </Routes>

              {/* Persistent Global Radio Player */}
              <GlobalRadioPlayer />
            </div>
          </AnalyticsProvider>
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
