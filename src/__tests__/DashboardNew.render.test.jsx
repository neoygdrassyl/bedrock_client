/**
 * Render tests — widget dashboard.
 * Verifies the module groups render as widgets with links to the Spanish routes.
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() }
  }),
}));

vi.mock('@/shared/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

import Dashboard from '@/features/dashboard/dashboard';

function renderDashboard(props = {}) {
  const defaultProps = {
    translation: { bc_u1: 'Panel' },
    swaMsg: {},
    breadCrums: { bc_01: 'Inicio', bc_u1: 'Panel de Control' },
    theme: 'light',
    ...props,
  };
  return render(
    <MemoryRouter>
      <Dashboard {...defaultProps} />
    </MemoryRouter>
  );
}

describe('Dashboard (redesigned)', () => {
  // The layout (order, sizes, favorites) is persisted per user in localStorage.
  beforeEach(() => localStorage.clear());

  it('renders each module group as a widget with its own heading', () => {
    renderDashboard();
    ['Radicación', 'Gestión Curaduría', 'Archivo y Expedición', 'Comunicaciones'].forEach((name) => {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    });
  });

  it('renders utility section heading', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { level: 2, name: 'Utilidades' })).toBeInTheDocument();
  });

  it('renders Licencias module card in its group and as a seeded quick access', () => {
    renderDashboard();
    // Default favorites include /licencias, so it shows in the quick-access strip too.
    expect(screen.getAllByRole('link', { name: /nueva radicaci[oó]n/i })).toHaveLength(2);
  });

  it('renders links to new Spanish routes', () => {
    const { container } = renderDashboard();
    const links = container.querySelectorAll('a[href]');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));
    // Should contain new Spanish routes, not old English ones
    expect(hrefs).toContain('/licencias');
    expect(hrefs).toContain('/peticiones');
    expect(hrefs).toContain('/mensajes');
  });

  it('renders module cards as clickable links', () => {
    const { container } = renderDashboard();
    const cards = container.querySelectorAll('a[href]');
    expect(cards.length).toBeGreaterThanOrEqual(10);
  });
});
