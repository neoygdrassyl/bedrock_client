import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

// Mock child components that Dashboard depends on
vi.mock('../app/components/dashBoardCards/dashBoardCard.js', () => ({
  DashBoardCard: ({ title, image, link }) => (
    <div data-testid={`dashboard-card-${link.replace('/', '')}`}>
      <h3>{title}</h3>
      <i className={image} />
    </div>
  ),
}));

vi.mock('../app/components/title', () => ({
  __esModule: true,
  default: () => <div data-testid='title-mock' />,
}));

// _GLOBAL_ID se captura al cargar el módulo. Fijamos antes del import dinámico.
// Usamos '1' (valor habitual de test) para que las cards condicionales (cb1) NO aparezcan.
import.meta.env.VITE_GLOBAL_ID = '1';

const { default: Dashboard } = await import('../app/pages/user/dashboard');

describe('Dashboard — Integración del panel principal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowUser({ roleId: 1, name: 'Admin Test' });
  });

  afterEach(() => {
    clearWindowUser();
  });

  it('renderiza sin crash', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
  });

  it('muestra sección de módulos de trabajo con al menos 2 widgets', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Módulos de Trabajo')).toBeInTheDocument();

    // Verificar que al menos 9 cards de módulos de trabajo están visibles
    const workCards = [
      'dashboard-card-mail',
      'dashboard-card-appointments',
      'dashboard-card-submit',
      'dashboard-card-publish',
      'dashboard-card-pqrsadmin',
      'dashboard-card-nomenclature',
      'dashboard-card-archive',
      'dashboard-card-fun',
      'dashboard-card-funmanage',
    ];
    const renderedCards = workCards.filter(
      (id) => screen.queryByTestId(id) !== null
    );
    expect(renderedCards.length).toBeGreaterThanOrEqual(9);
  });

  it('muestra sección de utilidades y documentación', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Utilidades y Documentación')).toBeInTheDocument();

    // Cards de utilidades presentes
    expect(screen.getByTestId('dashboard-card-osha')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-dictionary')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-guide_user')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-profesionals')).toBeInTheDocument();
  });

  it('oculta cards condicionales (Normas/Uso Suelo) cuando GLOBAL_ID != cb1', () => {
    // _GLOBAL_ID se capturó como '1' al importar el módulo
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('dashboard-card-norms')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dashboard-card-zone_use')).not.toBeInTheDocument();
  });

  it('usa breadcrumbs con textos de props', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} breadCrums={{ bc_01: 'Home', bc_u1: 'Panel' }} />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Panel')).toBeInTheDocument();
  });

  it('muestra card de historial de profesionales', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('dashboard-card-certs')).toBeInTheDocument();
  });

  it('renderiza links correctos en cards de módulos', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    // Cards de trabajo
    expect(screen.getByTestId('dashboard-card-mail')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-appointments')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-submit')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-publish')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-card-pqrsadmin')).toBeInTheDocument();
  });
});
