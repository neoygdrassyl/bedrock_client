import { useEffect, useState } from 'react';
import BusinessCalendarService from '@/features/business-calendar/api/business-calendar.service';
import { replaceBusinessCalendarCustomDays, replaceBusinessCalendarHolidays } from '@/shared/utils/BusinessDaysCol';
import { getRequestIdFromError, logHttpError } from '@/shared/observability/logger';
import { ErrorScreen } from '@/shared/components/errors/ErrorScreen';
import { isServerUnreachable } from '@/shared/components/errors/errorKinds';

const FIRST_DYNAMIC_YEAR = 2021;
const FUTURE_YEAR_COUNT = 1;

// First authenticated request of the session. When it cannot reach the backend
// at all (network failure, 502/503/504) nothing else will work either, so the
// app shows the full-page `unavailable` screen; any other failure only affects
// the calendar and keeps the non-blocking banner.
export default function BusinessCalendarBootstrap({ children }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [unavailable, setUnavailable] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setUnavailable(null);
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + FUTURE_YEAR_COUNT;

    BusinessCalendarService.getBootstrap(FIRST_DYNAMIC_YEAR, endYear)
      .then(({ data }) => {
        if (!active) return;
        const availableYears = data.years.filter(year => year.available !== false);
        const officialYears = availableYears.map(year => year.year);
        if (officialYears.length) {
          const dates = availableYears.flatMap(year => year.holidays.map(item => item.date));
          replaceBusinessCalendarHolidays(dates, officialYears);
        }
        const years = Array.from({ length: endYear - FIRST_DYNAMIC_YEAR + 1 }, (_, index) => FIRST_DYNAMIC_YEAR + index);
        replaceBusinessCalendarCustomDays(data.customDays, years);
        setReady(true);
      })
      .catch((error) => {
        if (!active) return;
        logHttpError(error);
        if (isServerUnreachable(error)) {
          // Only a request id the server answered with can be found in its logs.
          setUnavailable({ referenceId: error?.response ? getRequestIdFromError(error) : null });
        } else {
          setFailed(true);
        }
        setReady(true);
      });

    return () => { active = false; };
  }, [attempt]);

  if (!ready) return null;

  if (unavailable) {
    return (
      <ErrorScreen
        kind="unavailable"
        referenceId={unavailable.referenceId || undefined}
        onRetry={() => {
          setReady(false);
          setAttempt(value => value + 1);
        }}
      />
    );
  }

  return (
    <>
      {failed && (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-3 text-foreground">
          <p className="m-0 text-sm">El calendario laboral no pudo actualizarse. Los demás módulos siguen disponibles.</p>
          <button type="button" className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => setAttempt(value => value + 1)}>Reintentar</button>
        </div>
      )}
      {children}
    </>
  );
}
