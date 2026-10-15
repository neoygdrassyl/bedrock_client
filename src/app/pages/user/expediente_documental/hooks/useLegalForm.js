import { useCallback, useEffect, useState } from 'react';
import { getLegalForm } from '../../../../services/documentaryLegalForm.service';
import { documentaryError } from '../../../../services/documentary.service';

/**
 * GET /legal-form of a canonical expediente. Pass a null fun0Id for traditional expedientes:
 * no request is made and the hook returns null. Otherwise { status: 'loading'|'ready'|'error',
 * data, error, reload }. While reloading, the last data stays available.
 */
export function useLegalForm(fun0Id) {
  const [result, setResult] = useState(null);
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((value) => value + 1), []);
  useEffect(() => {
    if (!fun0Id) return undefined;
    const controller = new AbortController();
    getLegalForm(fun0Id, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setResult({ fun0Id, nonce, data, error: '' }); })
      .catch((failure) => { if (!controller.signal.aborted) setResult((current) => ({ fun0Id, nonce, data: current?.fun0Id === fun0Id ? current.data : null, error: documentaryError(failure) })); });
    return () => controller.abort();
  }, [fun0Id, nonce]);
  if (!fun0Id) return null;
  const own = result?.fun0Id === fun0Id ? result : null;
  const loaded = own?.nonce === nonce;
  const status = !loaded ? 'loading' : own.error ? 'error' : 'ready';
  return { status, data: own?.data || null, error: loaded ? own.error : '', reload };
}

export default useLegalForm;
