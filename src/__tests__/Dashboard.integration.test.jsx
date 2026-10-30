import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

const {
  funServiceMock,
  pqrsMainServiceMock,
  submitServiceMock,
  mailboxServiceMock,
  appointmentsServiceMock,
  bookmarkServiceMock,
} = vi.hoisted(() => ({
  funServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
  },
  pqrsMainServiceMock: { count: vi.fn(() => Promise.resolve({ data: { count: 4 } })) },
  submitServiceMock: { count: vi.fn(() => Promise.resolve({ data: { count: 99 } })) },
  mailboxServiceMock: { count: vi.fn(() => Promise.resolve({ data: { count: 2 } })) },
  appointmentsServiceMock: { count: vi.fn(() => Promise.resolve({ data: { count: 7 } })) },
  bookmarkServiceMock: { list: vi.fn(() => Promise.resolve({ data: [] })) },
}));

vi.mock('../features/expediente/api/fun.service', () => ({ __esModule: true, default: funServiceMock }));
vi.mock('../features/pqrs/api/pqrs_main.service', () => ({ __esModule: true, default: pqrsMainServiceMock }));
vi.mock('../features/ventanilla/api/submit.service', () => ({ __esModule: true, default: submitServiceMock }));
vi.mock('../features/messaging/api/mailbox.service', () => ({ __esModule: true, default: mailboxServiceMock }));
vi.mock('../features/appointments/api/appointments.service', () => ({ __esModule: true, default: appointmentsServiceMock }));
vi.mock('../shared/api/bookmark.service', () => ({ __esModule: true, default: bookmarkServiceMock }));

// Mock the Icon component (used by the widgets)
vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

// _GLOBAL_ID se captura al cargar el módulo. Fijamos antes del import dinámico.
// Usamos '1' (valor habitual de test) para que las cards condicionales (cb1) NO aparezcan.
import.meta.env.VITE_GLOBAL_ID = '1';

const { default: Dashboard } = await import('../features/dashboard/dashboard');

const USER_ID = 77;
const LAYOUT_KEY = `dovela-dashboard-layout:v2:${USER_ID}`;

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard {...defaultProps} />
    </MemoryRouter>,
  );
}

function widget(name) {
  return screen.getByRole('region', { name });
}

describe('Dashboard — Integración del panel principal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setWindowUser({ id: USER_ID, roleId: 1, name: 'Admin Test' });
  });

  afterEach(() => {
    clearWindowUser();
    vi.restoreAllMocks();
  });

  it('renderiza sin crash', () => {
    renderDashboard();
    // Greeting is dynamic (Buenos días/tardes/noches), check for any of them
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Buen[oa]s?\s+(días|tardes|noches)/i);
  });

  it('muestra primero el trabajo diario y después el catálogo de módulos', () => {
    renderDashboard();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(titles.slice(0, 4)).toEqual(['Accesos rápidos', 'Continuar trabajando', 'Expedientes marcados', 'Radicación']);
    expect(screen.getByRole('list', { name: 'Indicadores operativos' })).toBeInTheDocument();
  });

  it('muestra los grupos operativos como widgets con sus módulos', () => {
    renderDashboard();

    const radicacion = widget('Radicación');
    expect(within(radicacion).getByRole('link', { name: /Ventanilla Única.*Recepción documental completa/i })).toBeInTheDocument();
    expect(within(radicacion).getByRole('link', { name: /Nueva radicación.*Crear y revisar radicaciones realizadas/i })).toBeInTheDocument();

    const gestion = widget('Gestión Curaduría');
    expect(within(gestion).getByRole('link', { name: /Gestionar Licencias Nuevo.*Dashboard operativo en desarrollo/i })).toBeInTheDocument();
    expect(within(gestion).getByRole('link', { name: /Gestionar Licencias.*Gestión clásica de expedientes/i })).toBeInTheDocument();

    expect(within(widget('Otras actuaciones')).getByRole('link', { name: /Nomenclaturas.*Asignación y consulta predial/i })).toBeInTheDocument();
    expect(within(widget('Comunicaciones')).getByText('Buzón de mensajes')).toBeInTheDocument();
  });

  it('expone anclas para el tutorial guiado del dashboard', () => {
    const { container } = renderDashboard();

    expect(container.querySelector('[data-dovela-tour-id="dashboard-hero"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-quick-actions"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-operations"]')).toBeInTheDocument();
    expect(container.querySelector('[data-dovela-tour-id="dashboard-tracking"]')).toBeInTheDocument();
  });

  it('muestra sección de utilidades y documentación', () => {
    renderDashboard();
    const utilidades = widget('Utilidades');

    ['Calculadora de expensas', 'Base de datos profesionales', 'Historial de profesionales', 'Manual de usuario', 'Sellos']
      .forEach((title) => expect(within(utilidades).getByText(title)).toBeInTheDocument());
  });

  it('oculta cards condicionales (Normas/Uso Suelo) cuando GLOBAL_ID != cb1', () => {
    renderDashboard();
    expect(screen.queryByText('Normas Urbanas')).not.toBeInTheDocument();
    expect(screen.queryByText('Usos del suelo')).not.toBeInTheDocument();
  });

  it('renderiza links correctos a nuevas rutas en español', () => {
    const { container } = renderDashboard();
    const hrefs = Array.from(container.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));

    ['/mensajes', '/calendario', '/ventanilla', '/publicaciones', '/peticiones', '/licencias', '/documentos', '/calculadora', '/consecutivos']
      .forEach((href) => expect(hrefs).toContain(href));
  });

  it('carga solo los conteos ligeros: PQRS, Buzón, Citas y marcados (sin FUN ni Ventanilla)', async () => {
    renderDashboard();

    const kpis = screen.getByRole('list', { name: 'Indicadores operativos' });
    await waitFor(() => expect(within(kpis).getByText('4')).toBeInTheDocument());
    expect(within(kpis).getByText('2')).toBeInTheDocument();
    expect(within(kpis).getByText('7')).toBeInTheDocument();
    await waitFor(() => expect(bookmarkServiceMock.list).toHaveBeenCalledTimes(2));
    expect(bookmarkServiceMock.list).toHaveBeenCalledWith({ scope: 'personal' });
    expect(bookmarkServiceMock.list).toHaveBeenCalledWith({ scope: 'team' });

    expect(funServiceMock.getAll_fun).not.toHaveBeenCalled();
    expect(funServiceMock.getAll).not.toHaveBeenCalled();
    expect(submitServiceMock.count).not.toHaveBeenCalled();
    // Ventanilla Única has no counter: its row only shows the arrow.
    expect(within(widget('Radicación')).queryByText('99')).not.toBeInTheDocument();
  });

  it('agrega y quita módulos de accesos rápidos con la estrella', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const favorites = widget('Accesos rápidos');
    expect(within(favorites).queryByRole('link', { name: /Calculadora de expensas/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Agregar a accesos rápidos: Calculadora de expensas' }));
    expect(within(favorites).getByRole('link', { name: /Calculadora de expensas/ })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(LAYOUT_KEY)).favorites).toContain('/calculadora');

    await user.click(within(favorites).getByRole('button', { name: 'Quitar de accesos rápidos: Calculadora de expensas' }));
    expect(within(favorites).queryByRole('link', { name: /Calculadora de expensas/ })).not.toBeInTheDocument();
  });

  it('personaliza el panel: oculta, vuelve a mostrar y restablece tarjetas', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'Personalizar' }));
    const toolbar = screen.getByRole('toolbar', { name: 'Personalizar panel' });

    await user.click(screen.getByRole('button', { name: 'Ocultar Utilidades' }));
    expect(screen.queryByRole('region', { name: 'Utilidades' })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(LAYOUT_KEY)).hidden).toEqual(['utilidades']);

    await user.click(within(toolbar).getByRole('button', { name: 'Mostrar Utilidades' }));
    expect(widget('Utilidades')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar Simulador' }));
    await user.click(within(toolbar).getByRole('button', { name: 'Restablecer' }));
    expect(widget('Simulador')).toBeInTheDocument();

    await user.click(within(toolbar).getByRole('button', { name: 'Listo' }));
    expect(screen.queryByRole('toolbar', { name: 'Personalizar panel' })).not.toBeInTheDocument();
  });
});
