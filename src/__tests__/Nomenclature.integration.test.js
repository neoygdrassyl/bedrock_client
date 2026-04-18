import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

// ─── Hoisted mocks ─────────────────────────────────────────────────
const hoisted = vi.hoisted(() => ({
  nomenclatureService: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    getExcellData: vi.fn(() => Promise.resolve({ data: [] })),
    getlastid: vi.fn(() => Promise.resolve({ data: 'NM26-0001' })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
    gen_doc_nomenclature: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/nomeclature.service', () => ({
  __esModule: true,
  default: hoisted.nomenclatureService,
}));

// DataTable mock simple — no llama col.cell para evitar deps de UI internas
vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ data = [], noDataComponent }) => (
    <div data-testid='mock-datatable'>
      {data.length === 0
        ? (noDataComponent || <span>Sin datos</span>)
        : data.map((row, i) => (
          <div key={row.id || i} data-testid={`nom-row-${row.id || i}`}>
            <span data-testid={`nom-id-${row.id}`}>{row.id_public}</span>
            <span>{row.type}</span>
          </div>
        ))}
    </div>
  ),
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen }) =>
    isOpen ? <div data-testid='mock-modal'>{children}</div> : null,
}));

vi.mock('../app/pages/user/nomenclature/new_nomenclature', () => ({
  __esModule: true,
  default: ({ refreshList }) => (
    <div data-testid='nomenclature-new-stub'>
      <button data-testid='nom-save-action' onClick={refreshList}>guardar</button>
    </div>
  ),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (date) => date || '',
}));

vi.mock('moment', () => {
  const m = () => ({
    subtract: () => ({ format: () => '2026-03-03' }),
    format: () => '2026-03-11',
    diff: () => -1,
  });
  m.default = m;
  return { default: m };
});

const { default: NOMENCLATURE } = await import(
  '../app/pages/user/nomenclature/nomenclature'
);

// ─── Fixtures ───────────────────────────────────────────────────────
const nomenclatureList = [
  {
    id: 1,
    id_public: 'NM26-0001',
    type: 'ASIGNACIÓN',
    date_start: '2026-01-15',
    date_end: '2026-02-10',
    nome_doc: 'doc.pdf',
    predial: '12345',
    address: 'Calle 36 # 12-45',
  },
  {
    id: 2,
    id_public: 'NM26-0002',
    type: 'CERTIFICACIÓN',
    date_start: '2026-02-01',
    date_end: null,
    nome_doc: null,
    predial: '67890',
    address: 'Carrera 15 # 3-22',
  },
];

describe('Nomenclature — Integración CRUD y búsqueda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowUser({ roleId: 1, name: 'Admin Test' });
  });

  afterEach(() => {
    clearWindowUser();
  });

  it('renderiza sin crash y muestra título', async () => {
    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalledOnce();
    });

    expect(screen.getByText('GESTIÓN DE NOMENCLATURAS')).toBeInTheDocument();
  });

  it('carga lista inicial y muestra filas en DataTable', async () => {
    hoisted.nomenclatureService.getAll.mockResolvedValueOnce({
      data: nomenclatureList,
    });

    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('nom-id-1')).toHaveTextContent('NM26-0001');
    });
    expect(screen.getByTestId('nom-id-2')).toHaveTextContent('NM26-0002');
  });

  it('muestra componente vacío cuando no hay nomenclaturas', async () => {
    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalledOnce();
    });

    await waitFor(() => {
      expect(screen.getByText('NO HAY INFORMACIÓN')).toBeInTheDocument();
    });
  });

  it('realiza búsqueda con resultados al consultar', async () => {
    hoisted.nomenclatureService.getSearch.mockResolvedValueOnce({
      data: [nomenclatureList[0]],
    });

    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalled();
    });

    const searchInput = document.getElementById('nomen_search_1');
    fireEvent.change(searchInput, { target: { value: 'NM26-0001' } });

    const consultBtn = screen.getByRole('button', { name: /CONSULTAR/i });
    fireEvent.click(consultBtn);

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getSearch).toHaveBeenCalledWith(
        '1',
        'NM26-0001'
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('nom-id-1')).toHaveTextContent('NM26-0001');
    });
  });

  it('búsqueda vacía recarga la lista completa', async () => {
    hoisted.nomenclatureService.getAll.mockResolvedValue({
      data: nomenclatureList,
    });

    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalledOnce();
    });

    const searchInput = document.getElementById('nomen_search_1');
    fireEvent.change(searchInput, { target: { value: '' } });

    const consultBtn = screen.getByRole('button', { name: /CONSULTAR/i });
    fireEvent.click(consultBtn);

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.nomenclatureService.getSearch).not.toHaveBeenCalled();
  });

  it('maneja error del servicio getAll sin crash', async () => {
    hoisted.nomenclatureService.getAll.mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalledOnce();
    });

    expect(screen.getByText('GESTIÓN DE NOMENCLATURAS')).toBeInTheDocument();
  });

  it('abre modal de nueva nomenclatura al clickear CREAR', async () => {
    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalled();
    });

    const crearBtn = screen.getByRole('button', { name: /CREAR NOMENCLATURA/i });
    fireEvent.click(crearBtn);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
      expect(screen.getByTestId('nomenclature-new-stub')).toBeInTheDocument();
    });
  });

  it('muestra botones de acciones y campo de consulta', async () => {
    render(
      <MemoryRouter>
        <NOMENCLATURE {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.nomenclatureService.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('CONSULTAR NOMENCLATURA')).toBeInTheDocument();
    expect(screen.getByText('GENERAR EXCEL')).toBeInTheDocument();
    expect(document.getElementById('nomen_search_0')).toBeInTheDocument();
    expect(document.getElementById('nomen_search_1')).toBeInTheDocument();
  });
});
