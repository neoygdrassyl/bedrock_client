import { useEffect, useState } from 'react';
import { professionalSearch } from './fallbackSearch';
import { withUniqueKeys } from './professionalSuggestion';

const IDLE = { status: 'idle', suggestions: [] };
const collapse = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

/**
 * Debounced professional search. Each new query cancels the request in flight, so a late answer never overwrites a
 * newer one, and the status always settles: 'idle' (query too short), 'loading', 'ready', 'empty' or 'unavailable'.
 * Suggestion keys are made unique.
 * `search` must be stable between renders (the default one is).
 *
 * @returns {{ query: string, setQuery: (query: string) => void, status: string,
 *   suggestions: import('./professionalSuggestion').ProfessionalSuggestion[] }}
 */
export function useProfessionalSearch({ minChars = 3, debounceMs = 300, search = professionalSearch } = {}) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(IDLE);

  useEffect(() => {
    const term = collapse(query);
    if (term.length < minChars) {
      setResult(IDLE);
      return undefined;
    }
    const controller = new AbortController();
    const settle = (next) => { if (!controller.signal.aborted) setResult(next); };
    const timer = setTimeout(() => {
      setResult((previous) => ({ status: 'loading', suggestions: previous.suggestions }));
      // Wrapped so a search that throws synchronously or returns a plain value still settles the status.
      Promise.resolve().then(() => search(term, { signal: controller.signal }))
        .then((found) => {
          const suggestions = withUniqueKeys(Array.isArray(found) ? found : []);
          settle({ status: suggestions.length ? 'ready' : 'empty', suggestions });
        })
        .catch(() => settle({ status: 'unavailable', suggestions: [] }));
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, minChars, debounceMs, search]);

  return { query, setQuery, status: result.status, suggestions: result.suggestions };
}
