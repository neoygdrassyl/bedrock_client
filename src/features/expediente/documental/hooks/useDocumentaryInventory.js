import { createContext, useContext, useEffect, useState } from 'react';
import { getDocumentaryInventory } from '../../api/documentaryOperations.service';
import { documentaryError } from '../../api/documentary.service';
import { adaptDocumentaryInventory } from '../documentaryInventoryModel';
import { isCanonicalMode, useExpedienteMode } from '../expedienteMode';

/**
 * A container that already loaded the inventory of an expediente (the "Generar documentos" panel)
 * provides `{ fun0Id, inventory }`; hooks of the same expediente reuse it instead of fetching again.
 */
export const DocumentaryInventoryContext = createContext(null);

// Documentary inventory of a canonical expediente, adapted to the generator shapes.
// Returns null for traditional (legacy) expedientes so callers keep their legacy data
// path untouched (no request is made). For canonical ones: { status, inventory, error }
// with status 'loading' | 'ready' | 'error'.
export function useDocumentaryInventory(fun0) {
  const canonical = isCanonicalMode(useExpedienteMode(fun0));
  const fun0Id = canonical ? fun0.id : null;
  const shared = useContext(DocumentaryInventoryContext);
  const reusesShared = Boolean(shared) && shared.fun0Id === (fun0?.id ?? null);
  const fetchId = reusesShared ? null : fun0Id;
  // A new documentary revision of the same expediente (e.g. after a reload) refreshes the inventory.
  const revision = fun0?.documentaryRevision;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!fetchId) return undefined;
    const controller = new AbortController();
    getDocumentaryInventory(fetchId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        // The expediente may have returned to traditional mode since it was loaded.
        setResult(data.mode === 'canonical' ? { fun0Id: fetchId, status: 'ready', inventory: adaptDocumentaryInventory(data), error: '' }
          : { fun0Id: fetchId, status: 'error', inventory: null, error: 'El expediente ya no usa el modelo documental canónico. Recárguelo.' });
      })
      .catch((error) => { if (!controller.signal.aborted) setResult({ fun0Id: fetchId, status: 'error', inventory: null, error: documentaryError(error) }); });
    return () => controller.abort();
  }, [fetchId, revision]);
  if (reusesShared) return shared.inventory;
  if (!fun0Id) return null;
  return result?.fun0Id === fun0Id ? result : { fun0Id, status: 'loading', inventory: null, error: '' };
}
