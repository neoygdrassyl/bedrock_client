import { FUN_1_OPTIONS } from '../fun/fun_forms/funOptions';

// Fields of FUN 1 that store several letters ("A,D" or "AD").
const MULTI_FIELDS = new Set(['tipo', 'm_lic', 'usos']);
// Options that exist only for some FUN models; the full set is kept here for display.
const EXTRA_OPTIONS = { area: ['D. Genera 5 o más unidades de vivienda para transferir a terceros'] };
const OPTION_PREFIX = /^[A-Z](?:\.\d)?\.?\s+/;

function optionCode(field, label) {
  // m_lic stores G.1 as "G" and G.2 as "g" (see getFun1OptionValue in fun_n_1.js).
  if (field === 'm_lic' && label.startsWith('G.1')) return 'G';
  if (field === 'm_lic' && label.startsWith('G.2')) return 'g';
  return label.charAt(0);
}

function nameOf(label) {
  return label.replace(OPTION_PREFIX, '');
}

function splitTokens(field, value) {
  if (Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (!MULTI_FIELDS.has(field)) return [text];
  if (text.includes(',')) return text.split(',').map((item) => item.trim()).filter(Boolean);
  return /^[A-Za-z]+$/.test(text) ? text.split('') : [text];
}

function labelOfToken(field, token) {
  const options = [...(FUN_1_OPTIONS[field] || []), ...(EXTRA_OPTIONS[field] || [])];
  const exact = options.find((label) => optionCode(field, label) === token);
  const match = exact || (field === 'm_lic' ? null : options.find((label) => optionCode(field, label) === token.toUpperCase()));
  return match ? nameOf(match) : token;
}

/**
 * Human name of a FUN 1 value ("A" -> "Licencia de Urbanización"). Several values are
 * joined with ", ". Empty values return null; unknown codes and fields are shown as stored.
 */
export function funFactLabel(field, value) {
  const tokens = splitTokens(field, value);
  if (!tokens.length) return null;
  return tokens.map((token) => labelOfToken(field, token)).join(', ');
}
