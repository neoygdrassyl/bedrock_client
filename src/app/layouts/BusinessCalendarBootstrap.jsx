import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarX2, RotateCw } from 'lucide-react';
import BusinessCalendarService from '@/features/business-calendar/api/business-calendar.service';
import { replaceBusinessCalendarCustomDays, replaceBusinessCalendarHolidays } from '@/shared/utils/BusinessDaysCol';
import { logHttpError } from '@/shared/observability/logger';
import { cn } from '@/shared/lib/utils';

const FIRST_DYNAMIC_YEAR = 2021;
const FUTURE_YEAR_COUNT = 1;
// Background retries after a failed sync: 15 s, 1 min, 5 min.
export const RETRY_DELAYS_MS = [15 * 1000, 60 * 1000, 5 * 60 * 1000];

const BusinessCalendarSyncContext = createContext(null);

function applyBootstrap(data, endYear) {
  const availableYears = data.years.filter(year => year.available !== false);
  const officialYears = availableYears.map(year => year.year);
  if (officialYears.length) {
    const dates = availableYears.flatMap(year => year.holidays.map(item => item.date));
    replaceBusinessCalendarHolidays(dates, officialYears);
  }
  const years = Array.from({ length: endYear - FIRST_DYNAMIC_YEAR + 1 }, (_, index) => FIRST_DYNAMIC_YEAR + index);
  replaceBusinessCalendarCustomDays(data.customDays, years);
}

// First authenticated request of the session: syncs official holidays and the
// curaduría's custom days. A failure is logged (see `window.__dovelaLogs`) and
// the app renders anyway with the bundled holiday list. The sync is retried in
// the background a few times, and `BusinessCalendarSyncNotice` (mounted by the
// shell) shows a calm notice with a manual "Reintentar" while it stays failed.
export default function BusinessCalendarBootstrap({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | failed
  const [retrying, setRetrying] = useState(false);
  const mountedRef = useRef(false);
  const inFlightRef = useRef(null);
  const retryTimerRef = useRef(null);
  const attemptRef = useRef(0);
  const backgroundRetriesRef = useRef(0);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }, []);

  const sync = useCallback((trigger) => {
    // A manual click during a background attempt joins the request in flight.
    if (inFlightRef.current) return inFlightRef.current;
    attemptRef.current += 1;
    const attempt = attemptRef.current;
    const endYear = new Date().getFullYear() + FUTURE_YEAR_COUNT;

    const request = BusinessCalendarService.getBootstrap(FIRST_DYNAMIC_YEAR, endYear)
      .then(({ data }) => {
        if (!mountedRef.current) return;
        applyBootstrap(data, endYear);
        clearRetryTimer();
        setStatus('ready');
      })
      .catch((error) => {
        if (!mountedRef.current) return;
        // The service request opts out of automatic logging; record it here.
        logHttpError(error, { data: { attempt, trigger } });
        setStatus('failed');
        const delay = RETRY_DELAYS_MS[backgroundRetriesRef.current];
        if (delay && !retryTimerRef.current) {
          backgroundRetriesRef.current += 1;
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            sync('background');
          }, delay);
        }
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    inFlightRef.current = request;
    return request;
  }, [clearRetryTimer]);

  useEffect(() => {
    mountedRef.current = true;
    sync('initial');
    return () => {
      mountedRef.current = false;
      clearRetryTimer();
    };
  }, [sync, clearRetryTimer]);

  const retry = useCallback(async () => {
    setRetrying(true);
    try {
      await sync('manual');
    } finally {
      if (mountedRef.current) setRetrying(false);
    }
  }, [sync]);

  const value = useMemo(() => ({ failed: status === 'failed', retrying, retry }), [status, retrying, retry]);

  if (status === 'loading') return null;

  return (
    <BusinessCalendarSyncContext.Provider value={value}>
      {children}
    </BusinessCalendarSyncContext.Provider>
  );
}

/**
 * Slim, non-blocking notice shown while the business calendar could not be
 * synchronized. Renders nothing outside `BusinessCalendarBootstrap` or when the
 * sync succeeded.
 */
export function BusinessCalendarSyncNotice({ className }) {
  const sync = useContext(BusinessCalendarSyncContext);
  if (!sync?.failed) return null;

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-1.5 text-sm text-foreground',
        className,
      )}
    >
      <CalendarX2 className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="m-0 min-w-0 flex-1 leading-snug">
        <span className="font-medium">No se pudieron sincronizar los días hábiles.</span>{' '}
        <span className="text-muted-foreground">Los cálculos de términos usan los festivos predeterminados.</span>
      </p>
      <button
        type="button"
        onClick={sync.retry}
        disabled={sync.retrying}
        aria-busy={sync.retrying}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70"
      >
        <RotateCw className={cn('h-3.5 w-3.5', sync.retrying && 'animate-spin')} aria-hidden="true" />
        Reintentar
      </button>
    </div>
  );
}
