import { expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDocumentaryOrigin } from './useDocumentaryOrigin';
import { getDocumentaryOrigin } from '../../api/documentaryOperations.service';
vi.mock('../../api/documentaryOperations.service', () => ({ getDocumentaryOrigin: vi.fn() }));
it('ignora una respuesta tardía del expediente anterior', async () => {
  let finishFirst;
  getDocumentaryOrigin.mockImplementation(({ fun0Id }) => fun0Id === 1 ? new Promise((resolve) => { finishFirst = resolve; }) : Promise.resolve({ project: { fun0Id: 2 }, mode: 'traditional' }));
  const { result, rerender } = renderHook(({ id }) => useDocumentaryOrigin({ fun0Id: id }), { initialProps: { id: 1 } });
  rerender({ id: 2 });
  await waitFor(() => expect(result.current.origin.project.fun0Id).toBe(2));
  await act(async () => finishFirst({ project: { fun0Id: 1 }, mode: 'canonical' }));
  expect(result.current.origin.project.fun0Id).toBe(2);
});
