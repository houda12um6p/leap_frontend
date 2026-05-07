import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import Background from './components/Background';
import { SectionBar } from './components/dashboard/SectionBar';
import { RequireAuth } from './components/auth/RequireAuth';
import { authState, bootstrapAuth, logout } from './lib/auth';

const Welcome           = lazy(() => import('./pages/Welcome'));
const Login             = lazy(() => import('./pages/Login'));
const DashboardShell    = lazy(() => import('./pages/DashboardShell'));
const ProjectsPage      = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));

function RouteFallback() {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: 'var(--leap-text-faint)',
      }}
    >
      Loading…
    </div>
  );
}

function AppRoutes() {
  const snap = useSnapshot(authState);
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/login"
        element={snap.token && snap.user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={<RequireAuth><WithSectionBar><DashboardShell /></WithSectionBar></RequireAuth>}
      />
      <Route
        path="/projects"
        element={<RequireAuth><WithSectionBar><ProjectsPage /></WithSectionBar></RequireAuth>}
      />
      <Route
        path="/projects/:id"
        element={<RequireAuth><WithSectionBar><ProjectDetailPage /></WithSectionBar></RequireAuth>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function WithSectionBar({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SectionBar />
    </>
  );
}

function AuthBootstrap() {
  const navigate = useNavigate();
  useEffect(() => {
    bootstrapAuth();
  }, []);
  // expose a global logout listener for components that don't want to import directly
  useEffect(() => {
    const onLogout = () => { logout(); navigate('/login', { replace: true }); };
    window.addEventListener('leap:logout', onLogout);
    return () => window.removeEventListener('leap:logout', onLogout);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Background />
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
