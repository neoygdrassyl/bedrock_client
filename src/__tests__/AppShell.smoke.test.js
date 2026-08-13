import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the theme provider
vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

import { AppShell } from '@/app/layouts/AppShell';

function renderShell(ui, { route = '/dashboard', role = 'ADMIN', user = null } = {}) {
  const defaultUser = user || { name: 'Test', surname: 'User', role_short: role };
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell user={defaultUser} onLogout={() => {}}>
        <div data-testid="page-content">Page Content</div>
      </AppShell>
    </MemoryRouter>
  );
}

describe('AppShell', () => {
  it('renders the icon rail', () => {
    renderShell();
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();
  });

  it('renders children in main content area', () => {
    renderShell();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders footer with institution info', () => {
    renderShell();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('shows user name in header', () => {
    renderShell(null, { user: { name: 'Diego', surname: 'Lopez', role_short: 'ADMIN' } });
    expect(screen.getByText(/Diego/)).toBeInTheDocument();
  });

  it('keeps all nav items visible while role filtering is disabled', () => {
    renderShell(null, { role: 'USER' });
    // navigation-config.js currently exposes all items for every role
    const nav = screen.getByRole('navigation', { name: /principal/i });
    expect(nav).toHaveTextContent('Mensajes');
  });
});
