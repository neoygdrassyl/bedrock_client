import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom';
import { __getQueuedEventsForTests, __resetLoggerForTests } from '../../shared/observability/logger';

vi.mock('../../shared/config/jsons/vars', () => ({ infoCud: { name: 'Curaduría Test' } }));

import { RoutesWithBoundary } from './RouteErrorBoundary';

function Boom({ error }) {
  throw error;
}

function renderWithBoundary(error, autoReload = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/licencias']}>
      <RoutesWithBoundary autoReload={autoReload}>
        <Boom error={error} />
      </RoutesWithBoundary>
    </MemoryRouter>,
  );
  return autoReload;
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    __resetLoggerForTests();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the crash screen with the logged event id as reference', () => {
    const autoReload = renderWithBoundary(new TypeError('Cannot read properties of undefined'));

    expect(screen.getByRole('heading', { level: 1, name: 'Algo falló al mostrar esta pantalla' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir al panel' })).toBeInTheDocument();

    const [event] = __getQueuedEventsForTests();
    expect(event).toMatchObject({ level: 'error', event: 'ui_crash', message: 'TypeError: Cannot read properties of undefined' });
    expect(event.componentStack).toContain('Boom');
    expect(screen.getByTestId('error-reference')).toHaveTextContent(event.clientEventId);
    expect(autoReload).not.toHaveBeenCalled();
  });

  it('shows the new-version screen and reloads once for a failed lazy chunk', () => {
    const chunkError = new TypeError('Failed to fetch dynamically imported module: https://app/assets/fun-abc123.js');
    const autoReload = renderWithBoundary(chunkError);

    expect(screen.getByRole('heading', { level: 1, name: 'Hay una versión nueva de Dovela' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(autoReload).toHaveBeenCalledTimes(1);
    expect(__getQueuedEventsForTests()[0]).toMatchObject({ level: 'warn', event: 'chunk_load_failed' });
  });

  it.each([
    'Importing a module script failed.',
    'error loading dynamically imported module: /assets/x.js',
  ])('treats "%s" as a chunk error', (message) => {
    renderWithBoundary(new Error(message));
    expect(screen.getByRole('heading', { level: 1, name: 'Hay una versión nueva de Dovela' })).toBeInTheDocument();
  });

  it('renders children normally when nothing fails', () => {
    render(
      <MemoryRouter>
        <RoutesWithBoundary><p>contenido</p></RoutesWithBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('resets when the path changes', async () => {
    render(
      <MemoryRouter initialEntries={['/licencias']}>
        <Link to="/dashboard">salir</Link>
        <RoutesWithBoundary autoReload={vi.fn()}>
          <Routes>
            <Route path="/licencias" element={<Boom error={new Error('broken view')} />} />
            <Route path="/dashboard" element={<p>vista sana</p>} />
          </Routes>
        </RoutesWithBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText('Algo falló al mostrar esta pantalla')).toBeInTheDocument();

    await userEvent.click(screen.getByText('salir'));

    expect(await screen.findByText('vista sana')).toBeInTheDocument();
  });
});
