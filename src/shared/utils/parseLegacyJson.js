import { logError } from '../observability/logger';

const MAX_REPORTED = 200;
/** Bad values already logged this session, so a getter called on every render logs once. */
const reported = new Set();

function reportInvalid(value, error, context) {
  const field = typeof context === 'string' ? context : context?.field;
  const signature = `${field || ''}|${value.length}|${value.slice(0, 64)}`;
  if (reported.has(signature)) return;
  if (reported.size >= MAX_REPORTED) reported.clear();
  reported.add(signature);
  const details = context && typeof context === 'object' ? context : {};
  logError('legacy_json_invalid', error, {
    level: 'warn',
    data: { ...details, field: field || 'unknown', length: value.length },
  });
}

/**
 * Reads a JSON field of the legacy record/expedition models. It never throws.
 *
 * Those fields were historically stored double-encoded (a JSON string holding a JSON
 * string), and every reader did `JSON.parse(JSON.parse(value))`. Depending on the backend
 * version the same field now also arrives single-encoded or already parsed, and the
 * double parse throws (`"[object Object]" is not valid JSON`), which crashed the whole
 * expediente workspace. This accepts the three shapes and returns the decoded value:
 *
 * - double-encoded, single-encoded and already parsed values decode as before;
 * - a single-encoded scalar string (`"\"hola\""`) decodes to that string (`hola`): when the
 *   second pass cannot parse the first-pass string, the first-pass string is the value;
 * - missing data (`null`, `undefined`, an empty or blank string, or JSON `null`) and a
 *   string that is not JSON return `fallback`. Pass the shape the caller reads
 *   (`{}`, `[]`, ...); it defaults to `null`.
 *
 * A non-empty string that is not JSON is logged once per distinct value as
 * `legacy_json_invalid`. `context` names the field for that log: a string
 * (`'expedition.reso'`) or an object with `field` plus any extra detail.
 */
export function parseLegacyJson(value, fallback = null, context = undefined) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  if (value.trim() === '') return fallback;

  let decoded;
  try {
    decoded = JSON.parse(value);
  } catch (error) {
    reportInvalid(value, error, context);
    return fallback;
  }

  if (typeof decoded === 'string') {
    try {
      decoded = JSON.parse(decoded);
    } catch {
      // Single-encoded scalar string: the first-pass string is the value.
    }
  }
  return decoded ?? fallback;
}

/** Test helper: forgets which invalid values were already logged. */
export function resetParseLegacyJsonLog() {
  reported.clear();
}
