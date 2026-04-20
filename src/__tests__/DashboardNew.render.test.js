/**
 * Render tests — Dashboard redesigned (modern card grid)
 * Verifies the dashboard renders module cards with new design.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() }
  }),
}));

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn(), resolvedTheme: 'light' }),
}));

import Dashboard from '@/app/pages/user/dashboard';

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
  it('renders operation section heading', () => {
    renderDashboard();
    expect(screen.getByText(/operaci[oó]n y gesti[oó]n/i)).toBeInTheDocument();
  });

  it('renders utility section heading', () => {
    renderDashboard();
    expect(screen.getByText(/utilidades/i)).toBeInTheDocument();
  });

  it('renders Licencias module card', () => {
    renderDashboard();
    expect(screen.getByText(/radicar licencias/i)).toBeInTheDocument();
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
