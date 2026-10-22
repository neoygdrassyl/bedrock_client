import { BrowserRouter as Router } from 'react-router-dom';

// Translations
import { useTranslation } from 'react-i18next';
import './translation/i18n';

// New shell & theme
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

// CSS: loaded after Bootstrap (imported in index.jsx) so our overrides win
import './App.css';
import './styles/legacy-bridge.css';
import './styles/swal-theme.css';

// Router: auth context, guards and the route table (imported after the CSS above
// so the stylesheet order of the modules they pull in is unchanged).
import { ProvideAuth } from './router/auth';
import { RoutesWithBoundary } from './router/RouteErrorBoundary';
import AppRoutes from './router/routes';

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
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
              <Toaster position="bottom-right" richColors closeButton />

              <RoutesWithBoundary>
                  <AppRoutes
                    titleT={titleT}
                    loginT={loginT}
                    globalsT={globalsT}
                    swaMsg={swaMsg}
                    breadCrums={breadCrums}
                    pqrsFormT={pqrsFormT}
                    schedulingT={schedulingT}
                    liquidatorT={liquidatorT}
                  />
              </RoutesWithBoundary>

        </Router>
      </ThemeProvider>
    </ProvideAuth>
  );
}
