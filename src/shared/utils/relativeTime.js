const relativeFormat = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' });
const dateFormat = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
const RELATIVE_STEPS = [
  ['minute', 60, 60],
  ['hour', 3600, 24],
  ['day', 86400, 7],
  ['week', 604800, 5],
];

/** "hace 5 minutos", "ayer", ...; falls back to a short date beyond ~5 weeks. */
export function formatRelativeTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const seconds = (date.getTime() - Date.now()) / 1000;
  if (Math.abs(seconds) < 60) return 'hace un momento';
  for (const [unit, size, limit] of RELATIVE_STEPS) {
    const amount = Math.round(seconds / size);
    if (Math.abs(amount) < limit) return relativeFormat.format(amount, unit);
  }
  return dateFormat.format(date);
}
