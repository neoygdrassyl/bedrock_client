import './App.css';
import React, { useContext, createContext, useState, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// Auth
import DataSerive from './services/data.service';

// Translations
import { useTranslation } from 'react-i18next';
import './translation/i18n';

// New shell & theme
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from './layouts/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { getRouteRedirects } from './layouts/navigation-config';

// Legacy styled-components (font scales) — kept during migration
import { StyleSheetManager, ThemeProvider as SCThemeProvider } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
import { fontZise3 } from './components/font';
import { GlobalStyles } from './components/global';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Login (extracted, eager — entry point for unauthenticated users)
import LoginPage from './pages/auth/LoginPage';

// ── Lazy-loaded page components (code-split per route) ──────────────
const PQRSADMIN = lazy(() => import('./pages/user/pqrs/pqrsadmin'));
const Liquidator = lazy(() => import('./pages/liquidator/liquidator'));
const Dashboard = lazy(() => import('./pages/user/dashboard'));
const Publish = lazy(() => import('./pages/user/publish'));
const Seals = lazy(() => import('./pages/user/seal'));
const Appointments = lazy(() => import('./pages/user/appointments'));
const Mail = lazy(() => import('./pages/user/mail'));
const FUN = lazy(() => import('./pages/user/fun'));
const OSHA = lazy(() => import('./pages/user/osha'));
const NOMENCLATURE = lazy(() => import('./pages/user/nomenclature/nomenclature'));
const SUBMIT = lazy(() => import('./pages/user/submit/submit'));
const ARCHIVE = lazy(() => import('./pages/user/archive/archive.page'));
const DICTIONARY = lazy(() => import('./pages/user/dictionary.page'));
const FUN_MANAGE = lazy(() => import('./pages/user/funmanage.page'));
const FUN_MANAGE_NEW = lazy(() => import('./pages/user/funmanage_new.page'));
const PROFESIONALS = lazy(() => import('./pages/user/profesionals/profesionals.page'));
const GUIDE_USER = lazy(() => import('./pages/user/guide_user/guide_user.page'));
const DEV_GUIDE = lazy(() => import('./pages/user/dev_guide/dev_guide.page'));
const NORMS = lazy(() => import('./pages/user/norms/norms.page'));
const CERTIFICATE_WORKER = lazy(() => import('./pages/user/certifications/certification.page'));
const ZONE_USE = lazy(() => import('./pages/user/zone_use/zone_use.page'));
import LEGAL_FLOW_GUIDE from './pages/user/legal_flow_guide/LegalFlowGuide.page';

// ── Loading fallback for Suspense ───────────────────────────────────
function LoadingFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '40vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando m&oacute;dulo...</p>
      </div>
    </div>
  );
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Route subtree error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-4">
          <div className="alert alert-danger">
            <h4 className="mb-2">Error en este modulo</h4>
            <p className="mb-2">La vista actual presento un error y se detuvo para evitar una pantalla en blanco.</p>
            <p className="mb-0"><a href="/dashboard">Volver al panel</a></p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RoutesWithBoundary({ children }) {
  const location = useLocation();
  return <RouteErrorBoundary key={location.pathname}>{children}</RouteErrorBoundary>;
}

// ── Main App ────────────────────────────────────────────────────────

export default function App() {
  const { t } = useTranslation();

  // Common translation prop bundles (same keys the pages currently receive)
  const titleT = t('title', { returnObjects: true });
  const loginT = t('login', { returnObjects: true });
  const globalsT = t('globals', { returnObjects: true });
  const swaMsg = t('swa_messages', { returnObjects: true });
  const breadCrums = t('breadCrums', { returnObjects: true });
  const pqrsFormT = t('transparency.pqrs_form', { returnObjects: true });
  const schedulingT = t('scheduling.scheduling', { returnObjects: true });
  const liquidatorT = t('liquidator.liquidator', { returnObjects: true });

  return (
    <ProvideAuth>
      <ThemeProvider defaultTheme="system" storageKey="dovela-theme">
        <Router>
          <StyleSheetManager shouldForwardProp={(prop) => isPropValid(prop)}>
            <SCThemeProvider theme={fontZise3}>
              <GlobalStyles />
              <Toaster position="bottom-right" richColors closeButton />

              <Suspense fallback={<LoadingFallback />}>
                <RoutesWithBoundary>
                  <Routes>
                    {/* ── Public routes (no shell) ──────────────────── */}
                    <Route path="/login" element={<LoginPageWithAuth />} />
                    <Route path="/home" element={<Navigate to="/login" replace />} />

                    <Route path="/normas" element={
                      <NORMS translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                    } />
                    <Route path="/certificados" element={
                      <CERTIFICATE_WORKER translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                    } />
                    <Route path="/uso-suelo" element={
                      <ZONE_USE translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                    } />
                    <Route path="/dev-guide" element={
                      <DEV_GUIDE globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                    } />

                    {/* ── Legacy route redirects ────────────────────── */}
                    {Object.entries(getRouteRedirects()).map(([from, to]) => (
                      <Route key={from} path={from} element={<Navigate to={to} replace />} />
                    ))}

                    {/* ── Authenticated routes (inside AppShell) ───── */}
                    <Route element={<PrivateLayout />}>
                      <Route path="/dashboard" element={
                        <Dashboard translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} theme="auto" />
                      } />
                      <Route path="/licencias" element={
                        <FUN translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/licencias/gestion" element={
                        <FUN_MANAGE translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/licencias/gestion-nueva" element={
                        <FUN_MANAGE_NEW translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/peticiones" element={
                        <PQRSADMIN translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
                      } />
                      <Route path="/ventanilla" element={
                        <SUBMIT translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/mensajes" element={
                        <Mail translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/calendario" element={
                        <Appointments translation={schedulingT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/archivo" element={
                        <ARCHIVE globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                      } />
                      <Route path="/publicaciones" element={
                        <Publish translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />
                      <Route path="/nomenclatura" element={
                        <NOMENCLATURE translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
                      } />
                      <Route path="/documentos" element={
                        <OSHA translation={titleT} globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation_form={pqrsFormT} />
                      } />
                      <Route path="/calculadora" element={
                        <Liquidator globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} versioni="2024" hideInfo useSelector />
                      } />
                      <Route path="/consecutivos" element={
                        <DICTIONARY globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                      } />
                      <Route path="/profesionales" element={
                        <PROFESIONALS globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                      } />
                      <Route path="/ayuda" element={
                        <GUIDE_USER globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                      } />
                      <Route path="/legal-flow-guide" element={<LEGAL_FLOW_GUIDE />} />
                      <Route path="/sellos" element={
                        <Seals translation={titleT} swaMsg={swaMsg} breadCrums={breadCrums} />
                      } />

                      {/* Catch-all for authenticated area → dashboard */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>

                    {/* ── Root & fallback ───────────────────────────── */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                  </Routes>
                </RoutesWithBoundary>
              </Suspense>

            </SCThemeProvider>
          </StyleSheetManager>
        </Router>
      </ThemeProvider>
    </ProvideAuth>
  );
}

// ── Private layout: auth guard + AppShell ───────────────────────────

function PrivateLayout() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <AppShell
      user={auth.user}
      onLogout={() => auth.signout(() => navigate('/login'))}
    >
      <Outlet />
    </AppShell>
  );
}

// ── Login wrapper: redirects if already authenticated ───────────────

function LoginPageWithAuth() {
  const auth = useAuth();
  return auth.user
    ? <Navigate to="/dashboard" replace />
    : <LoginPage signin={auth.signin} />;
}

// ── Auth context (unchanged) ────────────────────────────────────────

const fakeAuth = {
  isAuthenticated: false,
  signin(cb) {
    fakeAuth.isAuthenticated = true;
    setTimeout(cb, 100);
  },
  signout(cb) {
    fakeAuth.isAuthenticated = false;
    setTimeout(cb, 100);
  },
};

const authContext = createContext();

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  return useContext(authContext);
}

function useProvideAuth() {
  const [user, setUser] = useState(() => {
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = (cb) => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = (cb) => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
