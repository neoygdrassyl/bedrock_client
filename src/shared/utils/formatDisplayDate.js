import dayjs from 'dayjs';

const EMPTY_VALUE = '—';
const DATE_ONLY = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ISO_DATE_TIME = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])[T ]([01]\d|2[0-3]):[0-5]\d/;

/**
 * Read-only date text for the UI: "2026-02-25" -> "25/02/2026" and, with `withTime`,
 * "2026-02-25T15:30:00Z" -> "25/02/2026 10:30" (local time).
 *
 * Date-only values are split as text (never parsed as UTC), so they cannot shift a day.
 * Empty values return `empty` ("—" by default); anything that is not an ISO date (already
 * formatted text, free text) is returned unchanged.
 * Display only: never feed the result to inputs, payloads, sorting or generated documents.
 */
export function formatDisplayDate(value, { withTime = false, empty = EMPTY_VALUE } = {}) {
    if (value === null || value === undefined) return empty;
    const format = withTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY';
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? empty : dayjs(value).format(format);

    const text = String(value).trim();
    if (!text || text === 'null' || text === 'undefined') return empty;

    const dateOnly = DATE_ONLY.exec(text);
    if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;

    if (ISO_DATE_TIME.test(text)) {
        const parsed = dayjs(text);
        if (parsed.isValid()) return parsed.format(format);
    }
    return text;
}

export default formatDisplayDate;
