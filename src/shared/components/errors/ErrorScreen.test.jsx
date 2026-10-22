import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/shared/config/jsons/vars', () => ({ infoCud: { name: 'Curaduría Test', city: 'Bucaramanga' } }));

import { ErrorScreen, ERROR_SCREEN_KINDS } from './ErrorScreen';
import { isChunkLoadError, isServerUnreachable, tryChunkAutoReload } from './errorKinds';

function renderInRouter(ui, path = '/somewhere') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard" element={<p>panel</p>} />
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

describe('ErrorScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete navigator.clipboard;
  });

  it.each([
    ['not-found', 'Esta página no existe', ['Ir al panel', 'Volver'], '404'],
    ['crash', 'Algo falló al mostrar esta pantalla', ['Recargar', 'Ir al panel'], '500'],
    ['chunk', 'Hay una versión nueva de Dovela', ['Actualizar'], null],
    ['unavailable', 'No pudimos conectar con el servidor', ['Reintentar'], null],
    ['forbidden', 'No tiene permiso para ver esta página', ['Ir al panel'], '403'],
  ])('renders the %s kind', (kind, title, actions, status) => {
    const { container } = renderInRouter(<ErrorScreen kind={kind} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(title);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent(ERROR_SCREEN_KINDS[kind].description);
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(actions);
    if (status) expect(container).toHaveTextContent(status);
    expect(screen.getByText('Curaduría Test', { selector: 'aside p' })).toBeInTheDocument();
    expect(heading).toHaveFocus();
  });

  it('navigates to the panel inside the router for not-found and forbidden', async () => {
    renderInRouter(<ErrorScreen kind="forbidden" />);
    await userEvent.click(screen.getByRole('button', { name: 'Ir al panel' }));
    expect(await screen.findByText('panel')).toBeInTheDocument();
  });

  it('"Volver" goes back in history', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(3);
    renderInRouter(<ErrorScreen kind="not-found" />);

    await userEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it('runs the retry callback of the unavailable screen', async () => {
    const onRetry = vi.fn();
    renderInRouter(<ErrorScreen kind="unavailable" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders outside a router', () => {
    render(<ErrorScreen kind="crash" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Algo falló al mostrar esta pantalla');
  });

  it('shows and copies the reference code', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    renderInRouter(<ErrorScreen kind="crash" referenceId="req_abc123_k3j4h5g6" />);

    expect(screen.getByText('Código de referencia:')).toBeInTheDocument();
    expect(screen.getByTestId('error-reference')).toHaveTextContent('req_abc123_k3j4h5g6');

    await userEvent.click(screen.getByRole('button', { name: 'Copiar código de referencia' }));

    expect(writeText).toHaveBeenCalledWith('req_abc123_k3j4h5g6');
    expect(await screen.findByRole('button', { name: 'Código copiado' })).toBeInTheDocument();
  });

  it('selects the code when the clipboard is not available', async () => {
    setClipboard(undefined);
    renderInRouter(<ErrorScreen kind="crash" referenceId="evt_abc123_k3j4h5g6" />);

    await userEvent.click(screen.getByRole('button', { name: 'Copiar código de referencia' }));

    expect(window.getSelection().toString()).toBe('evt_abc123_k3j4h5g6');
  });

  it('omits the reference line without an id', () => {
    renderInRouter(<ErrorScreen kind="not-found" />);
    expect(screen.queryByText('Código de referencia:')).not.toBeInTheDocument();
  });
});

describe('error kind classification', () => {
  it('detects lazy chunk failures across browsers', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/a.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError({ name: 'ChunkLoadError', message: 'x' })).toBe(true);
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/a.css'))).toBe(true);
    expect(isChunkLoadError(new TypeError('x is undefined'))).toBe(false);
  });

  it('detects an unreachable backend but not a timeout or an ordinary error status', () => {
    expect(isServerUnreachable({ isAxiosError: true, code: 'ERR_NETWORK', request: {} })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 503 } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 502 } })).toBe(true);
    // A 5xx produced by Dovela carries its request id: a real server error, not an outage.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { 'x-dovela-request-id': 'req_abc_12345678' } } })).toBe(false);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { get: (name) => (name === 'x-dovela-request-id' ? 'req_abc_12345678' : null) } } })).toBe(false);
    // A 5xx without it came from a proxy or gateway (Vite's dev proxy answers an empty 500 when the backend is down).
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: {} } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500 } })).toBe(true);
    // Client errors are never an outage.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 404, headers: {} } })).toBe(false);
    expect(isServerUnreachable({ isAxiosError: true, code: 'ECONNABORTED', request: {} })).toBe(false);
    expect(isServerUnreachable({ code: 'ERR_CANCELED' })).toBe(false);
  });

  it('reloads once per minute at most', () => {
    const store = new Map();
    const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
    const reload = vi.fn();

    expect(tryChunkAutoReload({ storage, reload })).toBe(true);
    expect(tryChunkAutoReload({ storage, reload })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when storage is unavailable', () => {
    const storage = { getItem: () => { throw new Error('blocked'); }, setItem: vi.fn() };
    const reload = vi.fn();
    expect(tryChunkAutoReload({ storage, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
