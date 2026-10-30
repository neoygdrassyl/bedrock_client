import React from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorScreen } from '../../shared/components/errors/ErrorScreen';
import { toast } from 'sonner';
import { isChunkLoadError, NEW_VERSION_TOAST_ID, tryChunkAutoReload } from '../../shared/components/errors/errorKinds';
import { logError } from '../../shared/observability/logger';

/**
 * Last line of defense for render failures anywhere in the route tree. A render
 * crash shows the full-page `crash` screen with the logged event id as reference;
 * a failed lazy chunk (usually a new deploy) reloads once and otherwise shows
 * the `chunk` screen. Navigating to another path resets the boundary.
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
      componentStack: info?.componentStack,
    });
    this.setState({ eventId });
    if (chunk) {
      // The chunk screen replaces the "new version" toast raised by the preload handler.
      toast.dismiss(NEW_VERSION_TOAST_ID);
      (this.props.autoReload || tryChunkAutoReload)();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          kind={isChunkLoadError(this.state.error) ? 'chunk' : 'crash'}
          referenceId={this.state.eventId || undefined}
        />
      );
    }

    return this.props.children;
  }
}

export function RoutesWithBoundary({ children, autoReload }) {
  const location = useLocation();
  return <RouteErrorBoundary pathname={location.pathname} autoReload={autoReload}>{children}</RouteErrorBoundary>;
}

export default RouteErrorBoundary;
