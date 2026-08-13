import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
  ThemeProvider: ({ children }) => <>{children}</>,
}));

import { AppShell } from '@/app/layouts/AppShell';

function renderShell(route = '/licencias') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppShell
        user={{ name: 'Test', surname: 'User', role_short: 'ADMIN' }}
        onLogout={() => {}}
      >
        <div data-testid="page-content">Page Content</div>
      </AppShell>
    </MemoryRouter>,
  );
}

describe('AppShell official sidebar integration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1440 });
    localStorage.removeItem('dovela-sidebar-collapsed');
  });

  it('renders the shadcn sidebar menu with nested navigation items', () => {
    renderShell();

    expect(document.querySelector('[data-sidebar="sidebar"]')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /licencias/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /radicar/i })).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('keeps the legacy sidebar storage key when the official trigger toggles it', () => {
    localStorage.removeItem('dovela-sidebar-collapsed');
    renderShell();

    fireEvent.click(screen.getByRole('button', { name: /ocultar menú lateral/i }));

    expect(localStorage.getItem('dovela-sidebar-collapsed')).toBe('true');
  });

  it('keeps Ctrl+B as the official keyboard shortcut', () => {
    localStorage.removeItem('dovela-sidebar-collapsed');
    renderShell();

    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });

    expect(localStorage.getItem('dovela-sidebar-collapsed')).toBe('true');
  });

  it('allows the content inset to shrink beside the sidebar', () => {
    renderShell('/licencias/gestion');

    expect(document.querySelector('main')).toHaveClass('min-w-0');
  });

  it('starts with the icon sidebar on compact desktop without overwriting the wide-screen preference', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1024 });
    renderShell('/licencias/gestion');

    expect(document.querySelector('[data-state="collapsed"]')).toBeInTheDocument();
    expect(localStorage.getItem('dovela-sidebar-collapsed')).toBeNull();
  });

  it('keeps the brand row height stable in expanded and collapsed states', () => {
    renderShell();

    expect(document.querySelector('[data-sidebar="header"]')).toHaveClass('h-16');
    fireEvent.click(screen.getByRole('button', { name: /ocultar menú lateral/i }));
    expect(document.querySelector('[data-sidebar="header"]')).toHaveClass('h-16');
  });

  it('closes the mobile drawer after navigating to a sidebar destination', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    renderShell('/dashboard');

    const trigger = await screen.findByRole('button', { name: /expandir menú lateral/i });
    fireEvent.click(trigger);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Gestión' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('restores focus to the mobile trigger when Escape closes the drawer', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 390 });
    renderShell('/dashboard');

    const trigger = await screen.findByRole('button', { name: /expandir menú lateral/i });
    fireEvent.click(trigger);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
