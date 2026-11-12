import { useEffect, useState } from 'react';
import SearchService from '@/shared/api/search.service';
import FUNService from '../api/fun.service';

const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_LIMIT = 6;

// Flips to false once the backend answers 404 (older version without /api/search).
let unifiedSearchAvailable = true;

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function searchExpedientes(term, signal) {
  if (unifiedSearchAvailable) {
    try {
      const response = await SearchService.search(term, { limit: SEARCH_LIMIT, signal });
      const groups = Array.isArray(response?.data?.groups) ? response.data.groups : [];
      const group = groups.find((candidate) => candidate?.type === 'expedientes');
      return (group?.items || [])
        .filter((item) => item?.title)
        .slice(0, SEARCH_LIMIT)
        .map((item) => ({ radicado: String(item.title), subtitle: item.subtitle || '' }));
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      unifiedSearchAvailable = false;
    }
  }
  if (term.length < 3 || !/\d/.test(term)) return [];
  const response = await FUNService.getSearch('1', term);
  return normalizeRows(response?.data)
    .filter((row) => row?.id_public)
    .slice(0, SEARCH_LIMIT)
    .map((row) => ({ radicado: String(row.id_public), subtitle: '' }));
}

/**
 * Debounced expediente search shared by the dock and the workspace switcher.
 * @returns {{ status: 'idle'|'loading'|'done'|'error', results: Array<{ radicado: string, subtitle: string }> }}
 */
export function useExpedienteSearch(query) {
  const [state, setState] = useState({ status: 'idle', results: [] });

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setState({ status: 'idle', results: [] });
      return undefined;
    }
    const controller = new AbortController();
    setState((previous) => ({ status: 'loading', results: previous.results }));
    const timer = window.setTimeout(async () => {
      try {
        const results = await searchExpedientes(term, controller.signal);
        if (!controller.signal.aborted) setState({ status: 'done', results });
      } catch (error) {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setState({ status: 'error', results: [] });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return state;
}
