// Duration of a certified work experience, with the server rule (backend professional-registry-experience
// certifiedDuration): the end date is a worked day too, so it counts. Calendar time from the start to the day after the
// end: whole months first (a day missing in a shorter month falls on its last day), then the days left.
// 2020-01-01 to 2020-12-31 is 1 year; 2021-03-01 to 2021-03-31 is 1 month; a single day is 1 day.

import { DAY_MS, addMonths, realDateParts, wholeMonthsUntil } from '@/shared/utils/calendar';
import { formatDuration } from '@/shared/utils/durationText';

// { years, months, days }, or null when a date is not a real YYYY-MM-DD day or the end is before the start.
export function certifiedDuration(startIso, endIso) {
  const from = realDateParts(startIso);
  const last = realDateParts(endIso);
  if (!from || !last || endIso < startIso) return null;
  const end = Date.UTC(last.year, last.month, last.day + 1);
  const next = new Date(end);
  const months = wholeMonthsUntil(from, { year: next.getUTCFullYear(), month: next.getUTCMonth() }, end);
  const days = Math.round((end - addMonths(from, months)) / DAY_MS);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

// "1 año 0 meses 0 días": every part, zeros included.
export const formatFullDuration = (duration) => formatDuration(duration, { zeros: true });
