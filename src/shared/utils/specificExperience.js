// 5.2.9 of a professional row: the specific experience in its role, typed in years and months and stored in months.
// It may not exceed the general experience, the calendar time since 5.2.7 (the matrícula's issue date). The month count
// follows the server (backend professional-registry-experience.elapsed): the whole months that fit, where a month added
// to the 31st ends on the last day of a shorter month.

import { dateParts, todayIso, wholeMonthsUntil } from './calendar';
import { formatMonthsDuration } from './durationText';

// Whole months from `fromIso` to `toIso` (YYYY-MM-DD), or null when a date is missing or `from` is later.
export function wholeMonthsBetween(fromIso, toIso) {
  const from = dateParts(fromIso);
  const to = dateParts(toIso);
  if (!from || !to) return null;
  const months = wholeMonthsUntil(from, to, Date.UTC(to.year, to.month, to.day));
  return months < 0 ? null : months;
}

// Today on the server's clock (UTC), so the form and the server agree on the general experience.
export { todayIso };

// "2 años 3 meses" of a count of months, zeros left out ("0 meses" when both are).
export const formatYearsMonths = formatMonthsDuration;

const LIMITS = { years: 99, months: 11 };

// Reads the two 5.2.9 fields: { empty: true } when both are blank, { problem } when invalid, else { months }.
// `registrationDate` (5.2.7) bounds it when known.
export function readSpecificExperience(yearsText, monthsText, registrationDate, today = todayIso()) {
  const years = String(yearsText ?? '').trim();
  const months = String(monthsText ?? '').trim();
  if (!years && !months) return { empty: true };
  if (!/^\d*$/.test(years) || Number(years) > LIMITS.years) return { problem: 'Los años deben ser un número entero entre 0 y 99.' };
  if (!/^\d*$/.test(months) || Number(months) > LIMITS.months) return { problem: 'Los meses deben ser un número entero entre 0 y 11.' };
  const total = Number(years || 0) * 12 + Number(months || 0);
  const general = registrationDate ? wholeMonthsBetween(registrationDate, today) : null;
  if (general !== null && total > general) {
    return { problem: `La experiencia específica (${formatYearsMonths(total)}) no puede superar la experiencia general desde la expedición de la matrícula (${formatYearsMonths(general)}).` };
  }
  return { months: total };
}
