import { useCallback, useEffect, useRef, useState } from 'react';
import OnlineRadicationService, { isRequestCanceled, isUnavailableError } from '@/features/ventanilla/api/online-radication.service';

const REFRESH_INTERVAL_MS = 60_000;
// Coming back to the browser tab refreshes only when the last read is older than this.
const VISIBILITY_REFRESH_MS = 30_000;

/**
 * Pending/radicated/rejected counters of the online inbox for the Ventanilla tab badge.
 * Reads on mount, on demand (`refresh`) and lightly every 60 s while the page is visible.
 * Stops polling when the server reports the inbox as unavailable. Errors stay silent: the badge
 * simply disappears.
 */
export function useOnlineRadicationCounts() {
  const [counts, setCounts] = useState(null);
  const [available, setAvailable] = useState(true);
  const controllerRef = useRef(null);
  const lastReadAtRef = useRef(0);

  const applyCounts = useCallback((next) => {
    if (!next) return;
    lastReadAtRef.current = Date.now();
    setCounts(next);
    setAvailable(true);
  }, []);

  const refresh = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return OnlineRadicationService.counts({ signal: controller.signal, background: true })
      .then((next) => {
        if (!controller.signal.aborted) applyCounts(next);
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCanceled(error)) return;
        if (isUnavailableError(error)) {
          setAvailable(false);
          setCounts(null);
        }
      });
  }, [applyCounts]);

  useEffect(() => {
    refresh();
    return () => controllerRef.current?.abort();
  }, [refresh]);

  useEffect(() => {
    if (!available) return undefined;
    const isVisible = () => document.visibilityState === 'visible';
    const intervalId = window.setInterval(() => {
      if (isVisible()) refresh();
    }, REFRESH_INTERVAL_MS);
    const handleVisibility = () => {
      if (isVisible() && Date.now() - lastReadAtRef.current > VISIBILITY_REFRESH_MS) refresh();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [available, refresh]);

  return { counts, available, refresh, applyCounts };
}
