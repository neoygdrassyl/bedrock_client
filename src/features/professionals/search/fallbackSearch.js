import { externalSource } from './externalSource';
import { ProfessionalSearchUnavailableError } from './professionalSuggestion';
import { registrySource } from './registrySource';

export const SOURCES = { registry: registrySource, external: externalSource };
export const DEFAULT_SOURCE_NAMES = ['registry', 'external'];

const isAbort = (error, signal) => Boolean(signal?.aborted)
  || error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
// A 401 from the main API ends the session (the HTTP client logs the user out): no other source is asked.
const endsSearch = (error, signal) => isAbort(error, signal) || error?.response?.status === 401;

/**
 * Searches each source in order and answers with the first non-empty result. A source that fails (403, 404 on an
 * older backend, network) or finds nobody passes the turn to the next one. When every source failed it rejects with
 * ProfessionalSearchUnavailableError; a cancelled search or a 401 rejects with that error at once.
 *
 * @param {import('./professionalSuggestion').ProfessionalSearchSource[]} sources
 */
export function createFallbackSearch(sources) {
  return async function search(query, { signal } = {}) {
    let failures = 0;
    for (const source of sources) {
      if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');
      try {
        const suggestions = await source.search(query, { signal });
        if (suggestions.length) return suggestions;
      } catch (error) {
        if (endsSearch(error, signal)) throw error;
        failures += 1;
      }
    }
    if (failures === sources.length) throw new ProfessionalSearchUnavailableError();
    return [];
  };
}

/** Source names from a comma separated setting; unknown names are ignored and an empty setting means the default. */
export function sourceNames(setting) {
  const names = String(setting ?? '').split(',').map((name) => name.trim().toLowerCase())
    .filter((name, index, all) => SOURCES[name] && all.indexOf(name) === index);
  return names.length ? names : DEFAULT_SOURCE_NAMES;
}

/** The search the FUN 5.2 box uses, in the order VITE_PROFESSIONAL_SEARCH_SOURCES sets (default 'registry,external'). */
export const professionalSearch = createFallbackSearch(
  sourceNames(import.meta.env.VITE_PROFESSIONAL_SEARCH_SOURCES).map((name) => SOURCES[name]),
);
