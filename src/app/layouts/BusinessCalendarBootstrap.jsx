import { useEffect, useState } from 'react';
import BusinessCalendarService from '@/features/business-calendar/api/business-calendar.service';
import { replaceBusinessCalendarCustomDays, replaceBusinessCalendarHolidays } from '@/shared/utils/BusinessDaysCol';
import { logHttpError } from '@/shared/observability/logger';

const FIRST_DYNAMIC_YEAR = 2021;
const FUTURE_YEAR_COUNT = 1;
// Silent retries after a failed sync: 15 s, 1 min, 5 min.
const RETRY_DELAYS_MS = [15 * 1000, 60 * 1000, 5 * 60 * 1000];

// First authenticated request of the session: syncs official holidays and the
// curaduría's custom days. A failure is logged (see `window.__dovelaLogs`) and
// the app renders anyway with the bundled holiday list; the sync is retried
// silently a few times. No banner or full-page error: when the backend is fully
// unreachable each page shows its own load-error state.
export default function BusinessCalendarBootstrap({ children }) {
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let retryTimer = null;
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
        // The service request opts out of automatic logging; record it here.
        logHttpError(error, { data: { attempt: attempt + 1 } });
        setReady(true);
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay) retryTimer = setTimeout(() => setAttempt(value => value + 1), delay);
      });

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [attempt]);

  if (!ready) return null;

  return children;
}
