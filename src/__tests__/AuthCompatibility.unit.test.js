import { sha256 } from 'js-sha256';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
  },
}));

import CustomsDataService from '../app/services/custom.service';

describe('Autenticación compatible con backend nuevo y login legado', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
  });

  test('envía SHA-256 primero para conservar el contrato vigente del backend', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        token: 'jwt-token',
        user: { id: 1, name: 'Diego', Role: { name: 'Admin', short: 'ADM', desc: 'Administrador' } },
      },
    });

    const response = await CustomsDataService.appLoginCompatible({
      email: ' diego@test.com ',
      password: 'clave-plana',
    });

    expect(response.data.token).toBe('jwt-token');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost.mock.calls[0][0]).toBe('/login');
    expect(mockPost.mock.calls[0][1].get('email')).toBe('diego@test.com');
    expect(mockPost.mock.calls[0][1].get('password')).toBe(sha256('clave-plana'));
    expect(mockPost.mock.calls[0][2]).toMatchObject({ skipAuth: true });
  });

  test('reintenta con texto plano cuando el backend nuevo rechaza SHA-256', async () => {
    mockPost
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Diego', role: { name: 'Admin' } }] });

    const response = await CustomsDataService.appLoginCompatible({
      email: 'diego@test.com',
      password: 'clave-legada',
    });

    expect(response.data).toHaveLength(1);
    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost.mock.calls[1][1].get('email')).toBe('diego@test.com');
    expect(mockPost.mock.calls[1][1].get('password')).toBe('clave-legada');
    expect(mockPost.mock.calls[1][2]).toMatchObject({ skipAuth: true });
  });
});