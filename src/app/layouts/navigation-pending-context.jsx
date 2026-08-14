import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tracks the target route of an in-flight sidebar navigation, updated
 * OUTSIDE React Router's startTransition so consumers (spinner, progress
 * bar) repaint immediately on click instead of waiting for the route's
 * lazy chunk — the Router's `v7_startTransition` future flag suppresses
 * the Suspense fallback while a transition is pending, which otherwise
 * leaves the previous screen visible with no sign the click registered.
 */
const NavigationPendingContext = createContext(null);

const SAFETY_TIMEOUT_MS = 8000;

export function NavigationPendingProvider({ children }) {
  const location = useLocation();
  const [pendingRoute, setPendingRoute] = useState(null);
  const timeoutRef = useRef(null);

  const beginNavigation = (route) => {
    if (!route || route === location.pathname) return;
    setPendingRoute(route);
  };

  useEffect(() => {
    if (pendingRoute && location.pathname === pendingRoute) {
      setPendingRoute(null);
    }
  }, [location.pathname, pendingRoute]);

  useEffect(() => {
    if (!pendingRoute) return undefined;
    timeoutRef.current = setTimeout(() => setPendingRoute(null), SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [pendingRoute]);

  return (
    <NavigationPendingContext.Provider value={{ pendingRoute, beginNavigation }}>
      {children}
    </NavigationPendingContext.Provider>
  );
}

export function useNavigationPending() {
  const ctx = useContext(NavigationPendingContext);
  return ctx || { pendingRoute: null, beginNavigation: () => {} };
}
