import React, { useContext, createContext, useEffect, useState, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';

// Auth
import DataSerive from './services/data.service';
import FUNService from './services/fun.service';

// Translations
import { useTranslation } from 'react-i18next';
import './translation/i18n';

// New shell & theme
import { ThemeProvider } from '@/components/theme-provider';
import { AppShell } from './layouts/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { getRouteRedirects } from './layouts/navigation-config';

// CSS: loaded after Bootstrap (imported in index.js) so our overrides win
import './App.css';
import './styles/legacy-bridge.css';
import './styles/swal-theme.css';

// Login (extracted, eager — entry point for unauthenticated users)
import LoginPage from './pages/auth/LoginPage';
import Home from './pages/home';

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
const FUN_EXPEDIENTE_FULLSCREEN = lazy(() => import('./pages/user/fun_forms/components/FunExpedienteFullscreen').then((mod) => ({ default: mod.FunExpedienteFullscreen })));
const PROFESIONALS = lazy(() => import('./pages/user/profesionals/profesionals.page'));
const GUIDE_USER = lazy(() => import('./pages/user/guide_user/guide_user.page'));
const DEV_GUIDE = lazy(() => import('./pages/user/dev_guide/dev_guide.page'));
const NORMS = lazy(() => import('./pages/user/norms/norms.page'));
const CERTIFICATE_WORKER = lazy(() => import('./pages/user/certifications/certification.page'));
const ZONE_USE = lazy(() => import('./pages/user/zone_use/zone_use.page'));
const SETTINGS = lazy(() => import('./pages/user/SettingsPage'));
import LEGAL_FLOW_GUIDE from './pages/user/legal_flow_guide/LegalFlowGuide.page';

// ── Loading fallback for Suspense ───────────────────────────────────
function LoadingFallback() {
  return (
    <div className="space-y-6 p-2 md:p-4 animate-in fade-in duration-300">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-md animate-pulse" />
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse" />
      </div>
      {/* Content skeleton — mimics card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/40 p-4 space-y-3" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
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

  componentDidUpdate(prevProps) {
    // Reset error when user navigates away from the broken route
    if (this.props.pathname !== prevProps.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error, info) {
    console.error('Route subtree error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 space-y-2">
            <h4 className="text-base font-semibold text-destructive">Error en este módulo</h4>
            <p className="text-sm text-muted-foreground">La vista actual presentó un error y se detuvo para evitar una pantalla en blanco.</p>
            <p className="text-sm">
              <a href="/dashboard" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/dashboard'); window.location.reload(); }} className="text-primary hover:underline">
                Volver al panel
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RoutesWithBoundary({ children }) {
  const location = useLocation();
  return <RouteErrorBoundary pathname={location.pathname}>{children}</RouteErrorBoundary>;
}

function ShellAwarePublicRoute({ children }) {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.user) {
    return children;
  }

  return (
    <AppShell
      user={auth.user}
      onLogout={() => auth.signout(() => navigate('/login'))}
    >
      {children}
    </AppShell>
  );
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
              <Toaster position="bottom-right" richColors closeButton />

              <RoutesWithBoundary>
                  <Routes>
                    {/* ── Public routes (no shell) ──────────────────── */}
                    <Route path="/login" element={<LoginPageWithAuth />} />
                    <Route path="/home" element={
                      <ShellAwarePublicRoute>
                        <Home translation={loginT} />
                      </ShellAwarePublicRoute>
                    } />

                    <Route path="/normas" element={
                      <ShellAwarePublicRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <NORMS translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                        </Suspense>
                      </ShellAwarePublicRoute>
                    } />
                    <Route path="/certificados" element={
                      <ShellAwarePublicRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <CERTIFICATE_WORKER translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                        </Suspense>
                      </ShellAwarePublicRoute>
                    } />
                    <Route path="/uso-suelo" element={
                      <ShellAwarePublicRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <ZONE_USE translation={loginT} swaMsg={swaMsg} breadCrums={breadCrums} />
                        </Suspense>
                      </ShellAwarePublicRoute>
                    } />
                    <Route path="/dev-guide" element={
                      <ShellAwarePublicRoute>
                        <Suspense fallback={<LoadingFallback />}>
                          <DEV_GUIDE globals={globalsT} swaMsg={swaMsg} breadCrums={breadCrums} translation={liquidatorT} />
                        </Suspense>
                      </ShellAwarePublicRoute>
                    } />

                    {/* ── Legacy route redirects ────────────────────── */}
                    {Object.entries(getRouteRedirects()).map(([from, to]) => (
                      <Route key={from} path={from} element={<Navigate to={to} replace />} />
                    ))}
                    <Route path="/settings" element={<Navigate replace to="/configuracion" />} />
                    <Route path="/ajustes" element={<Navigate replace to="/configuracion" />} />

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
                      <Route path="/funmanage/expediente/:radicado" element={
                        <FunmanageExpedienteRoute translation={titleT} globals={globalsT} swaMsg={swaMsg} />
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
                      <Route path="/configuracion" element={<SETTINGS />} />
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
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
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

function FunmanageExpedienteRoute({ translation, globals, swaMsg }) {
  const { radicado } = useParams();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!radicado) {
      setExpediente(null);
      setError('No se encontró el radicado solicitado.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');

    FUNService.get_fun_IdPublic(radicado)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data?.data ?? response?.data ?? null;
        setExpediente(data);
        if (!data) setError('No fue posible cargar el expediente solicitado.');
      })
      .catch(() => {
        if (cancelled) return;
        setExpediente(null);
        setError('No fue posible cargar el expediente solicitado.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [radicado]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 space-y-2">
          <h4 className="text-base font-semibold text-destructive">Expediente no disponible</h4>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm">
            <a href="/licencias/gestion-nueva" className="text-primary hover:underline">
              Volver a Gestión Licencias Nuevo
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <FUN_EXPEDIENTE_FULLSCREEN
      expediente={expediente}
      translation={translation}
      globals={globals}
      swaMsg={swaMsg}
      onClose={() => window.history.back()}
    />
  );
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
