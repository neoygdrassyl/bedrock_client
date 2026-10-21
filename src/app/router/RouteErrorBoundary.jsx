import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorReportInlineTrigger } from '../components/DovelaSupportLayer';
import { captureDovelaError } from '../utils/errorReporting';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorSnapshot: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    // Reset error when user navigates away from the broken route
    if (this.props.pathname !== prevProps.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorSnapshot: null });
    }
  }

  componentDidCatch(error, info) {
    const errorSnapshot = captureDovelaError(error, {
      source: 'route-error-boundary',
      componentStack: info?.componentStack,
      notify: false,
    });
    this.setState({ errorSnapshot });
    console.error('Route subtree error captured:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 space-y-2">
            <h4 className="text-base font-semibold text-destructive">Error en este módulo</h4>
            <p className="text-sm text-muted-foreground">La vista actual presentó un error y se detuvo para evitar una pantalla en blanco.</p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-sm">
              <ErrorReportInlineTrigger context={{ lastError: this.state.errorSnapshot }} />
              <a href="/dashboard" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/dashboard'); window.location.reload(); }} className="text-primary hover:underline">
                Volver al panel
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RoutesWithBoundary({ children }) {
  const location = useLocation();
  return <RouteErrorBoundary pathname={location.pathname}>{children}</RouteErrorBoundary>;
}
