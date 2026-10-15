import { expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { DocumentaryInventoryContext, useDocumentaryInventory } from './useDocumentaryInventory';
import { getDocumentaryInventory } from '../../../../services/documentaryOperations.service';
vi.mock('../../../../services/documentaryOperations.service', () => ({ getDocumentaryInventory: vi.fn() }));
const canonical = { schemaVersion: 'dovela-backoffice/documentary-inventory/v1', mode: 'canonical', applicable: true, project: { fun0Id: 5 }, items: [], requirements: [], evaluation: { state: 'missing', evaluatedAt: null } };
it('returns null and makes no request for traditional expedientes', () => {
  const { result } = renderHook(() => useDocumentaryInventory({ id: 5, centralReleaseId: null }));
  expect(result.current).toBeNull();
  expect(renderHook(() => useDocumentaryInventory(null)).result.current).toBeNull();
  expect(getDocumentaryInventory).not.toHaveBeenCalled();
});
it('loads and adapts the inventory of canonical expedientes', async () => {
  getDocumentaryInventory.mockResolvedValue(canonical);
  const { result } = renderHook(() => useDocumentaryInventory({ id: 5, centralReleaseId: 3 }));
  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(getDocumentaryInventory).toHaveBeenCalledWith(5, expect.any(AbortSignal));
  expect(result.current.inventory.statusByCode.size).toBe(0);
});
it('reports an error when the expediente is no longer canonical', async () => {
  getDocumentaryInventory.mockResolvedValue({ ...canonical, mode: 'traditional', applicable: false });
  const { result } = renderHook(() => useDocumentaryInventory({ id: 5, centralReleaseId: 3 }));
  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.inventory).toBeNull();
});
it('reuses the inventory provided by a container instead of fetching again', () => {
  getDocumentaryInventory.mockClear();
  const shared = { fun0Id: 5, inventory: { status: 'ready', inventory: { statusByCode: new Map() }, error: '' } };
  const wrapper = ({ children }) => <DocumentaryInventoryContext.Provider value={shared}>{children}</DocumentaryInventoryContext.Provider>;
  const { result } = renderHook(() => useDocumentaryInventory({ id: 5, centralReleaseId: 3 }), { wrapper });
  expect(result.current).toBe(shared.inventory);
  expect(getDocumentaryInventory).not.toHaveBeenCalled();
});
