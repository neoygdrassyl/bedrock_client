/**
 * What the FUN 5.2 professional search offers, whatever source answered. Text fields are strings ('' when unknown)
 * so a form can write them as they are.
 *
 * @typedef {object} ProfessionalSuggestion
 * @property {string} key Unique within one result list.
 * @property {'registry'|'external'|'internal'} source
 * @property {number} [registryId] BD PROFESIONALES id; only on registry suggestions.
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

/** Separates the name from the details in an option label; a query never needs what follows it. */
export const LABEL_SEPARATOR = ' · ';

/** The same suggestions with unique keys: a repeated key gets `#2`, `#3`... */
export function withUniqueKeys(suggestions) {
  const seen = new Map();
  return suggestions.map((suggestion) => {
    const count = (seen.get(suggestion.key) || 0) + 1;
    seen.set(suggestion.key, count);
    return count === 1 ? suggestion : { ...suggestion, key: `${suggestion.key}#${count}` };
  });
}

/** The option text: full name in uppercase without accents, plus the cédula and matrícula when known. */
export function suggestionLabel(suggestion) {
  const name = withoutAccents(joinNames(suggestion.givenNames, suggestion.surnames)).toUpperCase();
  const details = [suggestion.cc && `CC ${suggestion.cc}`, suggestion.registration && `MAT. ${suggestion.registration}`];
  return [name, ...details.filter(Boolean)].join(LABEL_SEPARATOR);
}

const shortKey = (key) => key.slice(key.indexOf(':') + 1);

/**
 * One option per suggestion with a unique text, since a datalist identifies the pick by its text: a label shared by
 * several suggestions (namesakes without cédula or matrícula) gets the suggestion key appended. Keys must be unique.
 */
export function suggestionOptions(suggestions) {
  const labels = suggestions.map(suggestionLabel);
  const repeated = (label) => labels.indexOf(label) !== labels.lastIndexOf(label);
  return suggestions.map((suggestion, index) => ({
    text: repeated(labels[index]) ? `${labels[index]}${LABEL_SEPARATOR}#${shortKey(suggestion.key)}` : labels[index],
    value: suggestion.key,
  }));
}

/** The text worth searching from what the user typed: an edited option label keeps only its name part. */
export const searchTextOf = (typed) => String(typed ?? '').split(LABEL_SEPARATOR)[0];
