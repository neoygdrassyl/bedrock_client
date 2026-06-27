import { beforeEach, describe, expect, test, vi } from 'vitest';
import { sha256 } from 'js-sha256';

const mockPost = vi.fn();

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    post: (...args) => mockPost(...args),
  },
}));

const { default: CustomsDataService } = await import('@/app/services/custom.service');

function formDataToObject(formData) {
  return Object.fromEntries(formData.entries());
}

describe('CustomsDataService appLoginCompatible', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  test('envía password plano con hash auxiliar y silencia el error esperado del fallback', async () => {
    const legacyHash = sha256('secret123');
    mockPost.mockResolvedValueOnce({ data: { token: 'token', user: { id: 1 } } });

    await CustomsDataService.appLoginCompatible({
      email: '  ada@example.com  ',
      password: 'secret123',
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      '/login',
      expect.any(FormData),
      expect.objectContaining({ skipDovelaErrorCapture: true })
    );

    const payload = formDataToObject(mockPost.mock.calls[0][1]);
    expect(payload).toEqual({
      email: 'ada@example.com',
      password: 'secret123',
      password_sha256: legacyHash,
    });
  });

  test('reintenta con password SHA-256 cuando el backend viejo rechaza el password plano', async () => {
    const legacyHash = sha256('secret123');
    mockPost
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Ada' }] });

    const response = await CustomsDataService.appLoginCompatible({
      email: 'ada@example.com',
      password: 'secret123',
    });

    expect(response.data).toEqual([{ id: 1, name: 'Ada' }]);
    expect(mockPost).toHaveBeenCalledTimes(2);

    const plainPayload = formDataToObject(mockPost.mock.calls[0][1]);
    expect(plainPayload.password).toBe('secret123');
    expect(plainPayload.password_sha256).toBe(legacyHash);

    const legacyPayload = formDataToObject(mockPost.mock.calls[1][1]);
    expect(legacyPayload).toEqual({
      email: 'ada@example.com',
      password: legacyHash,
      password_sha256: legacyHash,
    });
  });
});
