import { useCallback, useEffect, useState } from 'react';
import OnlineRadicationService, { isRequestCanceled } from '@/features/ventanilla/api/online-radication.service';

/**
 * Liquidation of one request (`GET /:id/liquidation`): `null` when none was issued. `replace`
 * swaps in the value returned by issue/reject so the section updates without another round trip.
 */
export function useOnlineRadicationLiquidation(id) {
  const [state, setState] = useState({ id: null, liquidation: null, loaded: false, error: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    setState((previous) => (previous.id === id ? { ...previous, error: null } : { id, liquidation: null, loaded: false, error: null }));
    OnlineRadicationService.getLiquidation(id, { signal: controller.signal })
      .then((liquidation) => {
        if (!controller.signal.aborted) setState({ id, liquidation, loaded: true, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCanceled(error)) return;
        setState((previous) => ({ ...previous, id, error }));
      });
    return () => controller.abort();
  }, [id, revision]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const replace = useCallback((liquidation) => setState((previous) => ({ ...previous, liquidation, loaded: true, error: null })), []);

  const current = state.id === id;
  return {
    liquidation: current ? state.liquidation : null,
    loaded: current && state.loaded,
    error: current ? state.error : null,
    reload,
    replace,
  };
}
