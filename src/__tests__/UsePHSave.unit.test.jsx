import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const swalMocks = vi.hoisted(() => ({
  error: vi.fn(),
  loading: vi.fn(),
  success: vi.fn(),
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: swalMocks.error,
  swalLoading: swalMocks.loading,
  swalSuccess: swalMocks.success,
}));

import usePHSave from '../app/pages/user/records/ph/hooks/usePHSave';

describe('usePHSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('accepts an artifact response when the operation declares its success contract', async () => {
    const artifact = { artifactId: 'artifact-123' };
    const { result } = renderHook(() => usePHSave({ generic_error_text: 'Error' }));
    let execution;

    await act(async () => {
      execution = await result.current.execute(Promise.resolve({ data: artifact }), {
        loading: false,
        success: false,
        isSuccessResponse: response => Boolean(response.data?.artifactId),
      });
    });

    expect(execution).toEqual({ ok: true, data: artifact });
    expect(swalMocks.error).not.toHaveBeenCalled();
  });

  test('preserves the legacy OK response as the default success contract', async () => {
    const { result } = renderHook(() => usePHSave({}));
    let execution;

    await act(async () => {
      execution = await result.current.execute(Promise.resolve({ data: 'OK' }), {
        loading: false,
        success: false,
      });
    });

    expect(execution).toEqual({ ok: true, data: 'OK' });
  });

  test('does not treat arbitrary response objects as successful by default', async () => {
    const payload = { status: 'unexpected' };
    const { result } = renderHook(() => usePHSave({ generic_error_text: 'Error' }));
    let execution;

    await act(async () => {
      execution = await result.current.execute(Promise.resolve({ data: payload }), {
        loading: false,
        success: false,
        error: false,
      });
    });

    expect(execution).toEqual({ ok: false, error: 'unknown', data: payload });
  });
});
