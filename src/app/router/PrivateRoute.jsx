import { Suspense } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import BusinessCalendarBootstrap from '../layouts/BusinessCalendarBootstrap';
import LoginPage from '../pages/auth/LoginPage';
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
