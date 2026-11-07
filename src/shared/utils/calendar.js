// Calendar of YYYY-MM-DD days on the UTC clock, the same rule as the server (backend professional-registry-calendar):
// a month added to the 31st ends on the last day of a shorter month (31 Jan + 1 = 28 Feb).

export const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// { year, month (0-11), day } of a YYYY-MM-DD text, or null. The day is not checked: 2021-02-30 passes.
export function dateParts(iso) {
  const match = DATE_PATTERN.exec(String(iso || ''));
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) } : null;
}

// dateParts of a real calendar day only: null for 2021-02-30 or 2021-13-01.
export function realDateParts(iso) {
  const parts = dateParts(iso);
  if (!parts) return null;
  const check = new Date(Date.UTC(parts.year, parts.month, parts.day));
  return check.getUTCMonth() === parts.month && check.getUTCDate() === parts.day ? parts : null;
}

export const daysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

// `from` plus `count` months, as the UTC timestamp of that day: the same day of the month or the last day of a
// shorter month.
export function addMonths(from, count) {
  const total = from.month + count;
  const year = from.year + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return Date.UTC(year, month, Math.min(from.day, daysInMonth(year, month)));
}

// The whole months from `from` that fit before the UTC timestamp `end`, whose year and month are `to.year` and
// `to.month`. Negative when `from` is after `end`.
export function wholeMonthsUntil(from, to, end) {
  const months = (to.year - from.year) * 12 + (to.month - from.month);
  return addMonths(from, months) > end ? months - 1 : months;
}

// Today on the server's clock (UTC), so the forms and the server agree on what "today" is.
export const todayIso = () => new Date().toISOString().slice(0, 10);
