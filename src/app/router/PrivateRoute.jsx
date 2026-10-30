import { Suspense } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import BusinessCalendarBootstrap from '../layouts/BusinessCalendarBootstrap';
import LoginPage from '../../features/auth/LoginPage';
import { IllustratedState } from '../../shared/components/feedback/IllustratedState';
import { Button } from '../../shared/ui/button';
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
  const navigate = useNavigate();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <IllustratedState
      fullPage
      variant="not-found"
      actions={(
        <>
          <Button type="button" onClick={() => navigate('/dashboard')}>Ir al panel</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard'))}
          >
            Volver
          </Button>
        </>
      )}
    />
  );
}
