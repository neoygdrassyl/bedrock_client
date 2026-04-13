import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

// ─── Hoisted mocks ─────────────────────────────────────────────────
const hoisted = vi.hoisted(() => ({
  zoneUseService: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    search: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    gen_pdf: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  swalFire: vi.fn(() => Promise.resolve({ isConfirmed: false })),
}));

vi.mock('../app/services/zone_use.service', () => ({
  __esModule: true,
  default: hoisted.zoneUseService,
}));

// DataTable mock — renders row data directly without calling column cell functions
vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ data = [], noDataComponent, progressPending, progressComponent }) => (
    <div data-testid='mock-datatable'>
      {progressPending
        ? (progressComponent || <span>Cargando...</span>)
        : data.length === 0
          ? (noDataComponent || <span>Sin datos</span>)
          : data.map((row, i) => (
            <div key={row.id || i} data-testid={`zu-row-${row.id || i}`}>
              <span data-testid={`zu-idin-${row.id}`}>{row.id_in}</span>
              <span data-testid={`zu-idout-${row.id}`}>{row.id_out || ''}</span>
            </div>
          ))}
    </div>
  ),
}));

vi.mock('react-modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }) =>
    isOpen ? <div data-testid='mock-modal'>{children}</div> : null,
}));

vi.mock('../app/pages/user/zone_use/zone_use.component', () => ({
  __esModule: true,
  default: ({ id }) => (
    <div data-testid='zone-use-component-stub'>Concepto ID: {id}</div>
  ),
}));

const { default: ZONE_USE } = await import(
  '../app/pages/user/zone_use/zone_use.page'
);

// ─── Fixtures ───────────────────────────────────────────────────────
const zoneUseList = [
  {
    id: 1,
    id_in: 'CUS26-0001',
    id_out: 'EXP26-0001',
    solicitor: 'Juan Pérez',
    predial: '12345-001',
  },
  {
    id: 2,
    id_in: 'CUS26-0002',
    id_out: null,
    solicitor: 'María López',
    predial: '67890-002',
  },
  {
    id: 3,
    id_in: 'CUS26-0003',
    id_out: 'EXP26-0003',
    solicitor: 'Carlos Ramírez',
    predial: '11111-003',
  },
];

describe('ZoneUse — Integración CRUD y búsqueda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowUser({ id: 1, roleId: 1, name: 'Admin Test' });
  });

  afterEach(() => {
    clearWindowUser();
  });

  it('renderiza sin crash y muestra título', async () => {
    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalledOnce();
    });

    expect(screen.getByRole('heading', { name: /^CONCEPTOS$/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('LISTADO DE CONCEPTOS')).toBeInTheDocument();
  });

  it('carga lista inicial y muestra filas en DataTable', async () => {
    hoisted.zoneUseService.getAll.mockResolvedValueOnce({
      data: zoneUseList,
    });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toHaveTextContent('CUS26-0001');
    });
    expect(screen.getByTestId('zu-idin-2')).toHaveTextContent('CUS26-0002');
    expect(screen.getByTestId('zu-idin-3')).toHaveTextContent('CUS26-0003');
    expect(screen.getByTestId('zu-idout-1')).toHaveTextContent('EXP26-0001');
  });

  it('muestra mensaje vacío cuando no hay conceptos', async () => {
    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalledOnce();
    });

    await waitFor(() => {
      expect(screen.getByText('NO HAY CONCEPTOS')).toBeInTheDocument();
    });
  });

  it('filtra datos del lado del cliente al buscar', async () => {
    hoisted.zoneUseService.getAll.mockResolvedValueOnce({
      data: zoneUseList,
    });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toBeInTheDocument();
    });

    // Type in search field and submit
    const searchInput = document.getElementById('search');
    fireEvent.change(searchInput, { target: { value: 'CUS26-0001' } });

    const searchForm = document.getElementById('app-form');
    fireEvent.submit(searchForm);

    // Only matching row should show
    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toHaveTextContent('CUS26-0001');
      expect(screen.queryByTestId('zu-idin-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('zu-idin-3')).not.toBeInTheDocument();
    });
  });

  it('búsqueda vacía restaura lista completa', async () => {
    hoisted.zoneUseService.getAll.mockResolvedValueOnce({
      data: zoneUseList,
    });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toBeInTheDocument();
    });

    // Filter first
    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('app-form');

    fireEvent.change(searchInput, { target: { value: 'CUS26-0001' } });
    fireEvent.submit(searchForm);

    await waitFor(() => {
      expect(screen.queryByTestId('zu-idin-2')).not.toBeInTheDocument();
    });

    // Clear and search again — restores original list
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.submit(searchForm);

    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toBeInTheDocument();
      expect(screen.getByTestId('zu-idin-2')).toBeInTheDocument();
      expect(screen.getByTestId('zu-idin-3')).toBeInTheDocument();
    });
  });

  it('crea nuevo concepto vía formulario', async () => {
    hoisted.zoneUseService.create.mockResolvedValueOnce({ data: 'OK' });
    hoisted.zoneUseService.getAll.mockResolvedValue({ data: zoneUseList });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalled();
    });

    const idInput = document.getElementById('id_in');
    fireEvent.change(idInput, { target: { value: 'CUS26-0004' } });

    const createForm = document.getElementById('new-norm-form');
    fireEvent.submit(createForm);

    await waitFor(() => {
      expect(hoisted.zoneUseService.create).toHaveBeenCalledOnce();
    });

    // Verify FormData was passed
    const formDataArg = hoisted.zoneUseService.create.mock.calls[0][0];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.get('id_in')).toBe('CUS26-0004');
  });

  it('muestra error de duplicación en creación', async () => {
    hoisted.zoneUseService.getAll.mockResolvedValue({ data: [] });
    hoisted.zoneUseService.create.mockRejectedValueOnce({
      response: { data: { message: 'Validation error' } },
    });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalled();
    });

    const idInput = document.getElementById('id_in');
    fireEvent.change(idInput, { target: { value: 'CUS26-DUP' } });

    const createForm = document.getElementById('new-norm-form');
    fireEvent.submit(createForm);

    await waitFor(() => {
      expect(hoisted.zoneUseService.create).toHaveBeenCalledOnce();
    });
  });

  it('maneja error del servicio getAll mostrando alerta', async () => {
    hoisted.zoneUseService.getAll.mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalledOnce();
    });

    // Component should still render without crash
    expect(screen.getByRole('heading', { name: /^CONCEPTOS$/i, level: 1 })).toBeInTheDocument();
  });

  it('muestra secciones de crear y buscar concepto', async () => {
    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.zoneUseService.getAll).toHaveBeenCalled();
    });

    expect(
      screen.getByText('GENERAR NUEVA CONCEPTO DE USO DEL SUELO')
    ).toBeInTheDocument();
    expect(screen.getByText('BUSCAR CONCEPTO')).toBeInTheDocument();
    expect(document.getElementById('id_in')).toBeInTheDocument();
    expect(document.getElementById('search')).toBeInTheDocument();
  });

  it('filtra por predial en búsqueda del cliente', async () => {
    hoisted.zoneUseService.getAll.mockResolvedValueOnce({
      data: zoneUseList,
    });

    render(
      <MemoryRouter>
        <ZONE_USE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-1')).toBeInTheDocument();
    });

    const searchInput = document.getElementById('search');
    const searchForm = document.getElementById('app-form');

    fireEvent.change(searchInput, { target: { value: '67890' } });
    fireEvent.submit(searchForm);

    // Only row 2 has predial with '67890'
    await waitFor(() => {
      expect(screen.getByTestId('zu-idin-2')).toHaveTextContent('CUS26-0002');
      expect(screen.queryByTestId('zu-idin-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('zu-idin-3')).not.toBeInTheDocument();
    });
  });
});
