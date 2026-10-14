import { useEffect, useState } from 'react';
import { getDocumentaryInventory } from '../../../../services/documentaryOperations.service';
import { documentaryError } from '../../../../services/documentary.service';
import { adaptDocumentaryInventory } from '../documentaryInventoryModel';

export const isCanonicalExpediente = (fun0) => fun0?.centralReleaseId != null;

// Documentary inventory of a canonical expediente, adapted to the generator shapes.
// Returns null for traditional (legacy) expedientes so callers keep their legacy data
// path untouched (no request is made). For canonical ones: { status, inventory, error }
// with status 'loading' | 'ready' | 'error'.
export function useDocumentaryInventory(fun0) {
  const canonical = isCanonicalExpediente(fun0);
  const fun0Id = canonical ? fun0.id : null;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!fun0Id) return undefined;
    const controller = new AbortController();
    getDocumentaryInventory(fun0Id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        // The expediente may have returned to traditional mode since it was loaded.
        setResult(data.mode === 'canonical' ? { fun0Id, status: 'ready', inventory: adaptDocumentaryInventory(data), error: '' }
          : { fun0Id, status: 'error', inventory: null, error: 'El expediente ya no usa el modelo documental canónico. Recárguelo.' });
      })
      .catch((error) => { if (!controller.signal.aborted) setResult({ fun0Id, status: 'error', inventory: null, error: documentaryError(error) }); });
    return () => controller.abort();
  }, [fun0Id]);
  if (!fun0Id) return null;
  return result?.fun0Id === fun0Id ? result : { fun0Id, status: 'loading', inventory: null, error: '' };
}
