import { useCallback, useEffect, useState } from 'react';
import OnlineRadicationService, { isRequestCanceled } from '@/app/services/online-radication.service';

/**
 * Detail of one request (`GET /:id`). `replace` swaps in the item returned by radicate/reject
 * so the sheet shows the new state without another round trip.
 */
export function useOnlineRadicationDetail(id) {
  const [state, setState] = useState({ id: null, item: null, error: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    setState((previous) => (previous.id === id ? { ...previous, error: null } : { id, item: null, error: null }));
    OnlineRadicationService.get(id, { signal: controller.signal })
      .then((item) => {
        if (!controller.signal.aborted) setState({ id, item, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCanceled(error)) return;
        setState((previous) => ({ ...previous, id, error }));
      });
    return () => controller.abort();
  }, [id, revision]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const replace = useCallback((item) => {
    if (item?.id) setState({ id: item.id, item, error: null });
  }, []);

  const current = state.id === id;
  return {
    item: current ? state.item : null,
    error: current ? state.error : null,
    loading: Boolean(id) && (!current || (!state.item && !state.error)),
    reload,
    replace,
  };
}
