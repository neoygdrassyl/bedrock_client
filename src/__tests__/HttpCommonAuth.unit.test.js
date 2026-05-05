import http from '../http-common';

describe('http-common autenticado', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adjunta Authorization Bearer cuando existe token local', () => {
    localStorage.setItem('dovela_token', 'jwt-token');

    const requestHandler = http.interceptors.request.handlers.find(Boolean).fulfilled;
    const config = requestHandler({ url: '/fun', headers: {} });

    expect(config.headers.Authorization).toBe('Bearer jwt-token');
  });

  test('no adjunta Authorization en login aunque exista token local', () => {
    localStorage.setItem('dovela_token', 'jwt-token');

    const requestHandler = http.interceptors.request.handlers.find(Boolean).fulfilled;
    const config = requestHandler({ url: '/login', headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});