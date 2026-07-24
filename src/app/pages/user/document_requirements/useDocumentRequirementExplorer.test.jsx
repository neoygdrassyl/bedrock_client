import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const mockExplorerData = {
  schemaVersion: 1,
  status: 'published',
  version: 5,
  readOnly: true,
  fields: [
    { key: 'tipoAny', shortLabel: 'Actuación', label: 'Tipo de actuación' },
  ],
  groups: [],
  documents: [],
  rules: [],
  warnings: [],
};

const mockPreviewData = {
  requirements: [
    { documentCode: '511', required: true, ruleKey: 'common-all' },
  ],
};

const {
  getExplorerMock,
  previewRequirementsMock,
} = vi.hoisted(() => ({
  getExplorerMock: vi.fn(),
  previewRequirementsMock: vi.fn(),
}));

vi.mock('../../../services/document_requirement.service.js', () => ({
  __esModule: true,
  default: {
    getExplorer: (...args) => getExplorerMock(...args),
    previewRequirements: (...args) => previewRequirementsMock(...args),
    getConfig: vi.fn(),
    saveDraft: vi.fn(),
    publishConfig: vi.fn(),
  },
}));

import { useDocumentRequirementExplorer } from './useDocumentRequirementExplorer.js';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useDocumentRequirementExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getExplorerMock.mockResolvedValue({ data: mockExplorerData });
    previewRequirementsMock.mockResolvedValue({ data: mockPreviewData });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads explorer data on mount', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getExplorerMock).toHaveBeenCalledWith('published');
    expect(result.current.explorer).toEqual(mockExplorerData);
    expect(result.current.explorer.readOnly).toBe(true);
  });

  it('exposes read-only state without mutation callbacks', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('explorer');
    expect(result.current).toHaveProperty('selection');
    expect(result.current).toHaveProperty('preview');
    expect(result.current).toHaveProperty('simulate');
    expect(result.current).toHaveProperty('refresh');

    expect(result.current).not.toHaveProperty('saveDraft');
    expect(result.current).not.toHaveProperty('publishConfig');
    expect(result.current).not.toHaveProperty('updateDraft');
    expect(result.current).not.toHaveProperty('recalculate');
  });

  it('selection starts empty', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.selection).toEqual({});
    expect(result.current.selectionIsEmpty).toBe(true);
  });

  it('can set local selection without calling service', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelection({ tipo: 'B' });
    });

    expect(result.current.selection).toEqual({ tipo: 'B' });
    expect(result.current.selectionIsEmpty).toBe(false);

    expect(previewRequirementsMock).not.toHaveBeenCalled();
  });

  it('simulate calls previewRequirements with selection', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSelection({ tipo: 'B' });
    });

    await act(async () => {
      await result.current.simulate({ tipo: 'B' });
    });

    expect(previewRequirementsMock).toHaveBeenCalledWith(
      { tipo: 'B' },
      expect.objectContaining({
        status: 'published',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.current.preview).toEqual(mockPreviewData);
  });

  it('handles preview error gracefully', async () => {
    previewRequirementsMock.mockRejectedValue({
      response: { data: { message: 'Error de simulación' } },
    });
    getExplorerMock.mockResolvedValue({ data: mockExplorerData });

    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.simulate({ tipo: 'B' });
    });

    expect(result.current.preview).toBeNull();
    expect(result.current.errorMessage).toBeTruthy();
  });

  it('aborts the previous preview request and ignores its late failure when a newer result already won', async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();
    const latestPreview = {
      requirements: [
        { documentCode: '602', matched: true, ruleKey: 'conditional-urban' },
      ],
    };

    previewRequirementsMock
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise);

    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('draft')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      void result.current.simulate({ tipo: 'A' });
    });

    act(() => {
      void result.current.simulate({ tipo: 'B' });
    });

    const firstOptions = previewRequirementsMock.mock.calls[0][1];
    const secondOptions = previewRequirementsMock.mock.calls[1][1];

    expect(firstOptions).toEqual(
      expect.objectContaining({
        status: 'draft',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(secondOptions).toEqual(
      expect.objectContaining({
        status: 'draft',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(firstOptions.signal.aborted).toBe(true);
    expect(secondOptions.signal.aborted).toBe(false);

    await act(async () => {
      secondRequest.resolve({ data: latestPreview });
      await secondRequest.promise;
    });

    expect(result.current.preview).toEqual(latestPreview);

    await act(async () => {
      firstRequest.reject({
        response: { data: { message: 'stale preview failure' } },
      });
      try {
        await firstRequest.promise;
      } catch {
        // stale rejection ignored by the hook
      }
    });

    expect(result.current.preview).toEqual(latestPreview);
    expect(result.current.errorMessage).toBe('');
    expect(result.current.previewLoading).toBe(false);
  });

  it('handles explorer load error', async () => {
    getExplorerMock.mockRejectedValue({
      response: { data: { message: 'Error de carga' } },
    });

    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.errorMessage).toBeTruthy();
    expect(result.current.explorer).toBeNull();
  });

  it('does nothing from simulate when selection empty', async () => {
    const { result } = renderHook(() =>
      useDocumentRequirementExplorer('published')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.simulate({});
    });

    expect(previewRequirementsMock).not.toHaveBeenCalled();
  });
});
