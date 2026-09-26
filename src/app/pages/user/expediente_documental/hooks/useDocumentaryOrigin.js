import { useEffect, useState } from 'react';
import { getDocumentaryOrigin } from '../../../../services/documentaryOperations.service';
import { documentaryError } from '../../../../services/documentary.service';
export function useDocumentaryOrigin({ fun0Id, submitId }) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const key = `${fun0Id || ''}:${submitId || ''}:${revision}`;
  useEffect(() => {
    if (!fun0Id && !submitId) return undefined;
    const controller = new AbortController();
    getDocumentaryOrigin({ fun0Id, submitId }, controller.signal)
      .then((origin) => { if (!controller.signal.aborted) setResult({ key, origin, error: '' }); })
      .catch((error) => { if (!controller.signal.aborted) setResult({ key, origin: null, error: documentaryError(error) }); });
    return () => controller.abort();
  }, [fun0Id, submitId, key]);
  return { ...(result?.key === key ? result : { origin: null, error: '', loading: true }), refresh: () => setRevision((value) => value + 1) };
}
