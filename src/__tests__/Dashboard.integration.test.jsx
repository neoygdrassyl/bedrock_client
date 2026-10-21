import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

const {
  funServiceMock,
  pqrsMainServiceMock,
  submitServiceMock,
  mailboxServiceMock,
  appointmentsServiceMock,
} = vi.hoisted(() => ({
  funServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
  },
  pqrsMainServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  submitServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  mailboxServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
  appointmentsServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: pqrsMainServiceMock,
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: submitServiceMock,
}));

vi.mock('../app/services/mailbox.service', () => ({
  __esModule: true,
  default: mailboxServiceMock,
}));

vi.mock('../app/services/appointments.service', () => ({
  __esModule: true,
  default: appointmentsServiceMock,
}));

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
    // Greeting is dynamic (Buenos días/tardes/noches), check for any of them
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toMatch(/Buen[oa]s?\s+(días|tardes|noches)/i);
  });

  it('muestra los grupos operativos reorganizados para licencias', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    expect(screen.getByText('Módulos agrupados')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Radicación' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Gestión Curaduría' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Otras actuaciones' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Ventanilla Única.*Recepción documental completa/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nueva radicación.*Crear y revisar radicaciones realizadas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gestionar Licencias Nuevo.*Dashboard operativo en desarrollo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gestionar Licencias.*Gestión clásica de expedientes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Nomenclaturas.*Asignación y consulta predial/i })).toBeInTheDocument();

    expect(screen.getByText('Comunicaciones')).toBeInTheDocument();
    expect(screen.getByText('Buzón de mensajes')).toBeInTheDocument();
  });

  it('expone anclas para el tutorial guiado del dashboard', () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    expect(container.querySelector('[data-dovela-tour-id="dashboard-hero"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-quick-actions"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-operations"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-tracking"]')).toBeInTheDocument();
  });

  it('muestra sección de utilidades y documentación', () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );
    expect(screen.getByText('Utilidades')).toBeInTheDocument();

    // Cards de utilidades presentes
    expect(screen.getByText('Calculadora de expensas')).toBeInTheDocument();
    expect(screen.getByText('Base de datos profesionales')).toBeInTheDocument();
    expect(screen.getByText('Historial de profesionales')).toBeInTheDocument();
    expect(screen.getByText('Manual de usuario')).toBeInTheDocument();
    expect(screen.getByText('Sellos')).toBeInTheDocument();
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
    expect(screen.getByText('Historial de profesionales')).toBeInTheDocument();
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

  it('usa el endpoint curado de FUN para los conteos del dashboard', async () => {
    render(
      <MemoryRouter>
        <Dashboard {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => expect(funServiceMock.getAll_fun).toHaveBeenCalledTimes(1));
    expect(funServiceMock.getAll).not.toHaveBeenCalled();
  });
});
