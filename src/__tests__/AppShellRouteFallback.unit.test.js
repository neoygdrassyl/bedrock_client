import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

import { AppShell } from '@/app/layouts/AppShell';

describe('AppShell route fallback behavior', () => {
  it('does not mark dashboard as active for private routes outside the icon rail', () => {
    render(
      <MemoryRouter initialEntries={['/sellos']}>
        <AppShell user={{ name: 'Test', surname: 'User', role_short: 'ADMIN' }} onLogout={() => {}}>
          <div>Sellos</div>
        </AppShell>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Panel de control' })).not.toHaveAttribute('aria-current', 'page');
  });
});
