// 5.2.9 of a professional row: the specific experience in its role, typed in years and months and stored in months.
// It may not exceed the general experience, the calendar time since 5.2.7 (the matrícula's issue date). The month count
// follows the server (backend professional-registry-experience.elapsed): the whole months that fit, where a month added
// to the 31st ends on the last day of a shorter month.

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
export function wholeMonthsBetween(fromIso, toIso) {
  const from = dateParts(fromIso);
  const to = dateParts(toIso);
  if (!from || !to) return null;
  const end = Date.UTC(to.year, to.month, to.day);
  let months = (to.year - from.year) * 12 + (to.month - from.month);
  if (addMonths(from, months) > end) months -= 1;
  return months < 0 ? null : months;
}

// Today on the server's clock (UTC), so the form and the server agree on the general experience.
export const todayIso = () => new Date().toISOString().slice(0, 10);

const unit = (count, one, many) => `${count} ${count === 1 ? one : many}`;

export function formatYearsMonths(months) {
  const years = Math.trunc(months / 12);
  const rest = months % 12;
  const parts = [years ? unit(years, 'año', 'años') : '', rest ? unit(rest, 'mes', 'meses') : ''].filter(Boolean);
  return parts.length ? parts.join(' ') : '0 meses';
}

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
