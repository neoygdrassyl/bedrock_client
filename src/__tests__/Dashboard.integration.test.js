import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

// Mock the Icon component (used by new dashboard cards)
vi.mock('@/components/icon', () => ({
  Icon: ({ name, size }) => <span data-testid={`icon-${name}`} />,
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
    expect(screen.getByText('Operación y Gestión')).toBeInTheDocument();

    // Verificar que al menos 9 cards de módulos de trabajo están visibles
    const expectedTitles = [
      'Buzón de Mensajes',
      'Calendario de Citas',
      'Ventanilla Única',
      'Publicaciones',
      'Peticiones PQRS',
      'Nomenclaturas',
      'Archivo',
      'Radicar Licencias',
      'Gestionar Licencias',
    ];
    const renderedCards = expectedTitles.filter(
      (title) => screen.queryByText(title) !== null
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
    expect(screen.getByText('Documentos')).toBeInTheDocument();
    expect(screen.getByText('Calculadora de Expensas')).toBeInTheDocument();
    expect(screen.getByText('Consecutivos')).toBeInTheDocument();
    expect(screen.getByText('Manual de Usuario')).toBeInTheDocument();
    expect(screen.getByText('Base de Datos Profesionales')).toBeInTheDocument();
  });

  it('oculta cards condicionales (Normas/Uso Suelo) cuando GLOBAL_ID != cb1', () => {
    // _GLOBAL_ID se capturó como '1' al importar el módulo
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Normas Urbanas')).not.toBeInTheDocument();
    expect(screen.queryByText('Uso de Suelo')).not.toBeInTheDocument();
  });

  it('muestra card de historial de profesionales', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Historial de Profesionales')).toBeInTheDocument();
  });

  it('renderiza links correctos a nuevas rutas en español', () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    const links = container.querySelectorAll('a[href]');
    const hrefs = Array.from(links).map((a) => a.getAttribute('href'));

    // Work module links (new Spanish routes)
    expect(hrefs).toContain('/mensajes');
    expect(hrefs).toContain('/calendario');
    expect(hrefs).toContain('/ventanilla');
    expect(hrefs).toContain('/publicaciones');
    expect(hrefs).toContain('/peticiones');
    expect(hrefs).toContain('/licencias');

    // Utility module links
    expect(hrefs).toContain('/documentos');
    expect(hrefs).toContain('/calculadora');
    expect(hrefs).toContain('/consecutivos');
  });
});
