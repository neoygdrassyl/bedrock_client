import React from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { IllustratedState } from '../../shared/components/feedback/IllustratedState';
import { isChunkLoadError, tryChunkAutoReload } from '../../shared/components/errors/errorKinds';
import { logError } from '../../shared/observability/logger';

function reloadPage() {
  window.location.reload();
}

/**
 * Last line of defense for render failures anywhere in the route tree. Both
 * cases are logged (`render` / `chunk` kinds, see `window.__dovelaLogs`) and
 * show a calm illustrated state instead of an error screen:
 * - a failed lazy chunk (usually a new deploy) reloads once and otherwise
 *   offers "Recargar";
 * - a render crash offers "Recargar" and "Ir al panel" with the event id as a
 *   small reference for support.
 * Navigating to another path resets the boundary.
 */
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    // Reset error when user navigates away from the broken route
    if (this.props.pathname !== prevProps.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: null, eventId: null });
    }
  }

  componentDidCatch(error, info) {
    const chunk = isChunkLoadError(error);
    const eventId = logError(chunk ? 'chunk_load_failed' : 'ui_crash', error, {
      level: chunk ? 'warn' : 'error',
      kind: chunk ? 'chunk' : 'render',
      componentStack: info?.componentStack,
    });
    this.setState({ eventId });
    if (chunk) (this.props.autoReload || tryChunkAutoReload)();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (isChunkLoadError(this.state.error)) {
      return (
        <IllustratedState
          fullPage
          variant="load-error"
          title="Hay una versión nueva de Dovela"
          description="Dovela se actualizó mientras esta pestaña estaba abierta. Recargue la página para continuar; su sesión se conserva."
          onRetry={reloadPage}
          retryLabel="Recargar"
        />
      );
    }

    return (
      <IllustratedState
        fullPage
        variant="load-error"
        title="No pudimos mostrar esta pantalla"
        description="Algo no salió como esperábamos. Recargue la página o vuelva al panel para continuar."
        actions={(
          <>
            <Button type="button" onClick={reloadPage}>
              <RefreshCw aria-hidden="true" />
              Recargar
            </Button>
            {/* After a crash the app state is unreliable: leave through a full page load. */}
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/dashboard')}>
              Ir al panel
            </Button>
          </>
        )}
        detail={this.state.eventId ? <>Referencia: <code className="font-mono text-foreground">{this.state.eventId}</code></> : null}
      />
    );
  }
}

export function RoutesWithBoundary({ children, autoReload }) {
  const location = useLocation();
  return <RouteErrorBoundary pathname={location.pathname} autoReload={autoReload}>{children}</RouteErrorBoundary>;
}

export default RouteErrorBoundary;
