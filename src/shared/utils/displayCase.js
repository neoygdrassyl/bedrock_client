// Acronyms of the domain that must stay uppercase even when the whole source text is uppercase.
export const KNOWN_ACRONYMS = new Set(['BIC', 'CUB', 'FUN', 'LDF', 'MVCT', 'NIT', 'PH', 'POT', 'PQRS', 'RUT', 'VIP', 'VIS', 'VR']);

const UPPERCASE_WORD = /^\p{Lu}{2,5}$/u;
const VOWEL = /[AEIOUÁÉÍÓÚÜ]/u;

/**
 * True when an uppercase token is an acronym. In all-caps text every word looks like one, so
 * only known acronyms and vowel-less tokens (no 2-5 letter Spanish word lacks vowels) qualify;
 * in mixed-case text an uppercase token was written that way on purpose.
 */
function isAcronym(token, sourceIsUppercase) {
  if (!UPPERCASE_WORD.test(token)) return false;
  if (KNOWN_ACRONYMS.has(token) || !VOWEL.test(token)) return true;
  return !sourceIsUppercase;
}

/**
 * Title case for display ("RADICACIÓN LDF" -> "Radicación LDF"). Works on Unicode letters, so
 * accented words are not split at the accented vowel, and keeps acronyms uppercase.
 */
export function toDisplayCase(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const sourceIsUppercase = text === text.toUpperCase();
  return text.replace(/[\p{L}\p{N}]+/gu, (token) => {
    if (isAcronym(token, sourceIsUppercase)) return token;
    const lower = token.toLowerCase();
    return /^\p{L}/u.test(lower) ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  });
}
