// Reference copies of the calendar helpers and duration formatters as they were before src/shared/utils/calendar.js
// and src/shared/utils/durationText.js gathered them: features/professional-registry/experienceDuration.js,
// shared/utils/specificExperience.js, features/professional-registry/professionalRegistry.utils.js (formatDuration) and
// the todayIso of RegistryExperienceDialog.jsx and RegistryValidityTab.jsx. Copied verbatim, grouped per source file
// because their names clash. The equivalence tests compare them, old against new. Test-only.

// --- features/professional-registry/experienceDuration.js -------------------------------------------------------
const experienceDuration = (() => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function dateParts(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!match) return null;
    const parts = { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
    const check = new Date(Date.UTC(parts.year, parts.month, parts.day));
    return check.getUTCMonth() === parts.month && check.getUTCDate() === parts.day ? parts : null;
  }

  const daysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  function addMonths(from, count) {
    const total = from.month + count;
    const year = from.year + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;
    return Date.UTC(year, month, Math.min(from.day, daysInMonth(year, month)));
  }

  // { years, months, days }, or null when a date is not a real YYYY-MM-DD day or the end is before the start.
  function certifiedDuration(startIso, endIso) {
    const from = dateParts(startIso);
    const last = dateParts(endIso);
    if (!from || !last || endIso < startIso) return null;
    const end = Date.UTC(last.year, last.month, last.day + 1);
    const next = new Date(end);
    let months = (next.getUTCFullYear() - from.year) * 12 + (next.getUTCMonth() - from.month);
    if (addMonths(from, months) > end) months -= 1;
    const days = Math.round((end - addMonths(from, months)) / DAY_MS);
    return { years: Math.floor(months / 12), months: months % 12, days };
  }

  const unit = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  // "1 año 0 meses 0 días": every part, zeros included.
  function formatFullDuration(duration) {
    if (!duration) return '—';
    return [unit(duration.years, 'año', 'años'), unit(duration.months, 'mes', 'meses'), unit(duration.days, 'día', 'días')].join(' ');
  }

  return { dateParts, daysInMonth, addMonths, certifiedDuration, formatFullDuration };
})();

// --- shared/utils/specificExperience.js ---------------------------------------------------------------------------
const specificExperience = (() => {
  const daysInMonth = (year, month) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  function dateParts(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return match ? { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) } : null;
  }

  function addMonths(from, count) {
    const total = from.month + count;
    const year = from.year + Math.floor(total / 12);
    const month = ((total % 12) + 12) % 12;
    return Date.UTC(year, month, Math.min(from.day, daysInMonth(year, month)));
  }

  // Whole months from `fromIso` to `toIso` (YYYY-MM-DD), or null when a date is missing or `from` is later.
  function wholeMonthsBetween(fromIso, toIso) {
    const from = dateParts(fromIso);
    const to = dateParts(toIso);
    if (!from || !to) return null;
    const end = Date.UTC(to.year, to.month, to.day);
    let months = (to.year - from.year) * 12 + (to.month - from.month);
    if (addMonths(from, months) > end) months -= 1;
    return months < 0 ? null : months;
  }

  // Today on the server's clock (UTC), so the form and the server agree on the general experience.
  const todayIso = () => new Date().toISOString().slice(0, 10);

  const unit = (count, one, many) => `${count} ${count === 1 ? one : many}`;

  function formatYearsMonths(months) {
    const years = Math.trunc(months / 12);
    const rest = months % 12;
    const parts = [years ? unit(years, 'año', 'años') : '', rest ? unit(rest, 'mes', 'meses') : ''].filter(Boolean);
    return parts.length ? parts.join(' ') : '0 meses';
  }

  return { daysInMonth, dateParts, addMonths, wholeMonthsBetween, todayIso, formatYearsMonths };
})();

// --- features/professional-registry/professionalRegistry.utils.js -----------------------------------------------
const registryUtils = (() => {
  // Experience as { years, months, days }, as the server sends it (professional-registry-experience).
  const DURATION_UNITS = [['years', 'año', 'años'], ['months', 'mes', 'meses'], ['days', 'día', 'días']];

  function formatDuration(duration) {
    if (!duration) return '—';
    const parts = DURATION_UNITS.filter(([key]) => duration[key]).map(([key, one, many]) => `${duration[key]} ${duration[key] === 1 ? one : many}`);
    return parts.length ? parts.join(' ') : '0 días';
  }

  return { formatDuration };
})();

// --- RegistryExperienceDialog.jsx and RegistryValidityTab.jsx ---------------------------------------------------
// Today on the server clock (UTC), the latest end date it accepts.
const dialogTodayIso = () => new Date().toISOString().slice(0, 10);
// Today on the server clock (UTC), the latest issue date it accepts.
const validityTodayIso = () => new Date().toISOString().slice(0, 10);

export { experienceDuration, specificExperience, registryUtils, dialogTodayIso, validityTodayIso };
