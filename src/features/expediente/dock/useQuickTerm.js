import { useEffect, useState } from 'react';
import FUNService from '../api/fun.service';
import { logError } from '@/shared/observability/logger';
import { useExpedienteTerm } from '../workspace/useExpedienteTerm';
import { publishComputedTerm, useComputedTerm } from './computedTermStore';

/**
 * Legal term of a docked expediente for its quick window, computed exactly like the
 * workspace computes it (`useExpedienteTerm` on the expediente detail, which carries the
 * clocks). The detail is loaded once each time the window opens (`GET /fun/get/idpublic`);
 * the backend summary is never used for the term.
 *
 * Returns `term` once computed, and `shownTerm`: the fresh term, else (while loading) the
 * last term computed in this session for the same radicado, else `null` (no number yet).
 */
export function useQuickTerm(radicado) {
  const [state, setState] = useState({ radicado, status: 'loading', data: null });

  useEffect(() => {
    if (!radicado) return undefined;
    let active = true;
    setState({ radicado, status: 'loading', data: null });
    Promise.resolve()
      .then(() => FUNService.get_fun_IdPublic(radicado, { skipErrorLog: true }))
      .then((response) => {
        if (!active) return;
        const data = response?.data?.data ?? response?.data ?? null;
        setState({ radicado, status: data ? 'done' : 'error', data });
      })
      .catch((error) => {
        if (!active) return;
        if (error?.response?.status !== 404) {
          logError('ui_load_failed', error, { level: 'warn', component: 'ExpedienteQuickWindow', radicado });
        }
        setState({ radicado, status: 'error', data: null });
      });
    return () => {
      active = false;
    };
  }, [radicado]);

  const current = state.radicado === radicado ? state : { radicado, status: 'loading', data: null };
  const computed = useExpedienteTerm(current.status === 'done' ? current.data : null, { loading: current.status === 'loading' });
  const term = current.status === 'done' ? computed : null;

  useEffect(() => {
    if (term) publishComputedTerm(radicado, term);
  }, [radicado, term]);

  const previous = useComputedTerm(radicado);
  return {
    status: current.status,
    term,
    shownTerm: term ?? (current.status === 'loading' ? previous : null),
  };
}

export default useQuickTerm;
