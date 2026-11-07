// A duration { years, months, days } as text: "2 años 3 meses". The same words as the server
// (backend professional-registry-experience durationText).

const UNITS = [['years', 'año', 'años'], ['months', 'mes', 'meses'], ['days', 'día', 'días']];
const ALL_UNITS = UNITS.map(([key]) => key);

const unit = (count, one, many) => `${count} ${count === 1 ? one : many}`;

// options:
//   units    the parts that may be shown, in this order (default: years, months and days)
//   zeros    true to show the parts that are zero too ("1 año 0 meses 0 días"); by default they are left out
//   empty    the text when no part is shown (default "0 días")
//   missing  the text when there is no duration (default "—")
export function formatDuration(duration, { units = ALL_UNITS, zeros = false, empty = '0 días', missing = '—' } = {}) {
  if (!duration) return missing;
  const parts = UNITS.filter(([key]) => units.includes(key) && (zeros || duration[key]))
    .map(([key, one, many]) => unit(duration[key], one, many));
  return parts.length ? parts.join(' ') : empty;
}

// A count of months as "2 años 3 meses", zeros left out ("0 meses" when both are).
export const formatMonthsDuration = (months) => formatDuration(
  { years: Math.trunc(months / 12), months: months % 12 },
  { units: ['years', 'months'], empty: '0 meses' },
);
