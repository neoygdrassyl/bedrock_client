/**
 * What the FUN 5.2 professional search offers, whatever source answered. Text fields are strings ('' when unknown)
 * so a form can write them as they are.
 *
 * @typedef {object} ProfessionalSuggestion
 * @property {string} key Unique within one result list.
 * @property {'registry'|'external'} source
 * @property {string} givenNames
 * @property {string} surnames
 * @property {string} cc
 * @property {string} email
 * @property {string} phone
 * @property {string} registration
 * @property {string} registrationDate YYYY-MM-DD.
 * @property {boolean|undefined} sanction Undefined when the source does not know it.
 * @property {boolean} nameNeedsReview The split between given names and surnames may be wrong.
 */

/**
 * A source of suggestions. `search` resolves to an empty list when nobody matches and rejects when it cannot answer.
 *
 * @typedef {object} ProfessionalSearchSource
 * @property {string} name
 * @property {(query: string, options?: { signal?: AbortSignal }) => Promise<ProfessionalSuggestion[]>} search
 */

/** No source could answer: the user has to type the data. */
export class ProfessionalSearchUnavailableError extends Error {
  constructor() {
    super('Professional search is unavailable');
    this.name = 'ProfessionalSearchUnavailableError';
  }
}

export const textOf = (value) => (value === null || value === undefined ? '' : String(value).trim());

export const joinNames = (...parts) => parts.map(textOf).filter(Boolean).join(' ');

export const withoutAccents = (value) => textOf(value).normalize('NFD').replace(/[̀-ͯ]/g, '');

/** The option text: full name in uppercase without accents, plus the cédula (or matrícula) to tell namesakes apart. */
export function suggestionLabel(suggestion) {
  const name = withoutAccents(joinNames(suggestion.givenNames, suggestion.surnames)).toUpperCase();
  if (suggestion.cc) return `${name} · CC ${suggestion.cc}`;
  if (suggestion.registration) return `${name} · MAT. ${suggestion.registration}`;
  return name;
}
