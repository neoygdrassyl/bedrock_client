import { useCallback, useEffect, useState } from 'react';
import OnlineRadicationService, { isRequestCanceled } from '@/features/ventanilla/api/online-radication.service';

const EMPTY = { key: null, items: [], total: 0, counts: null, error: null };

/**
 * Server-paginated list of the online inbox. `loading` is true while the current filter has no
 * data yet (skeleton); `refreshing` is true while an explicit reload keeps the rows on screen.
 */
export function useOnlineRadicationList({ status, q, page, pageSize }) {
  const key = `${status}|${q}|${page}|${pageSize}`;
  const [state, setState] = useState(EMPTY);
  const [revision, setRevision] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    OnlineRadicationService.list({ status, q, page, pageSize }, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ key, items: data.items, total: data.total, counts: data.counts, error: null, loadedAt: Date.now() });
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCanceled(error)) return;
        // A failed reload keeps the rows already shown; a failed new filter must not show stale rows.
        setState((previous) => (previous.key === key
          ? { ...previous, error }
          : { ...EMPTY, key, counts: previous.counts, error }));
      })
      .finally(() => {
        if (!controller.signal.aborted) setRefreshing(false);
      });
    return () => controller.abort();
  }, [key, status, q, page, pageSize, revision]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setRevision((value) => value + 1);
  }, []);

  const current = state.key === key;
  return {
    items: current ? state.items : [],
    total: current ? state.total : 0,
    counts: state.counts,
    error: current ? state.error : null,
    loading: !current,
    refreshing: current && refreshing,
    loadedAt: state.loadedAt,
    reload,
  };
}
