import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const authState = { user: null };

vi.mock('./auth', () => ({ useAuth: () => authState }));
vi.mock('../../shared/config/jsons/vars', () => ({ infoCud: { name: 'Curaduría Test', city: 'Bucaramanga' } }));
vi.mock('../../features/auth/LoginPage', () => ({ default: () => <div data-testid="login-page" /> }));
vi.mock('../layouts/BusinessCalendarBootstrap', () => ({ default: ({ children }) => <>{children}</> }));
vi.mock('../layouts/AppShell', () => ({
  AppShell: ({ children }) => <div data-testid="app-shell">{children}</div>,
}));
vi.mock('../../features/dashboard/dashboard', () => ({ default: () => <div data-testid="dashboard-page" /> }));
vi.mock('../../features/settings/SettingsPage', () => ({ default: () => <div data-testid="settings-page" /> }));

import AppRoutes from './routes';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('route table fallbacks', () => {
  beforeEach(() => {
    authState.user = { id: 1, name: 'Ana' };
  });

  it('shows the full-page not-found screen for an unknown path with a session', () => {
    renderAt('/ruta-que-no-existe');

    expect(screen.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('no corresponde a ninguna pantalla');
    // Full page: not wrapped in the app shell, and no longer a redirect to the panel.
    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument();
  });

  it('also covers unknown sub-paths of existing modules', () => {
    renderAt('/licencias/no-existe/123');
    expect(screen.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeInTheDocument();
  });

  it('"Ir al panel" navigates to the dashboard', async () => {
    renderAt('/ruta-que-no-existe');

    await userEvent.click(screen.getByRole('button', { name: 'Ir al panel' }));

    expect(await screen.findByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('sends a visitor without a session to the login page', () => {
    authState.user = null;
    renderAt('/ruta-que-no-existe');

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Esta página no existe')).not.toBeInTheDocument();
  });

  it('keeps the legacy redirects', async () => {
    renderAt('/settings');
    expect(await screen.findByTestId('settings-page')).toBeInTheDocument();
  });
});
