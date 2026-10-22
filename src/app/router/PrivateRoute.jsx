import { Suspense } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import BusinessCalendarBootstrap from '../layouts/BusinessCalendarBootstrap';
import LoginPage from '../../features/auth/LoginPage';
import { ErrorScreen } from '../../shared/components/errors/ErrorScreen';
import { useAuth } from './auth';
import LoadingFallback from './LoadingFallback';

// ── Private layout: auth guard + AppShell ───────────────────────────

export function PrivateLayout() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <BusinessCalendarBootstrap>
      <AppShell
        user={auth.user}
        onLogout={() => auth.signout(() => navigate('/login'))}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </BusinessCalendarBootstrap>
  );
}

// ── Login wrapper: redirects if already authenticated ───────────────

export function LoginPageWithAuth() {
  const auth = useAuth();
  return auth.user
    ? <Navigate to="/dashboard" replace />
    : <LoginPage signin={auth.signin} />;
}

// ── Unknown path: 404 screen with a session, login without one ──────

export function NotFoundRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <ErrorScreen kind="not-found" />;
}
