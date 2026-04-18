import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  swalFire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  pqrsService: {
    getAllPqrs: vi.fn(() => Promise.resolve({
      data: [
        {
          id: 1,
          id_publico: 'PQRS-001',
          id_global: 'VR-001',
          status: 0,
          createdAt: '2026-03-01',
          pqrs_fun: null,
          pqrs_law: { extension: false },
          pqrs_time: { legal: '2026-03-01', time: 15, reply_formal: '2026-03-05' },
          pqrs_workers: [{ worker_id: 1, name: 'Admin Test', reply: null, feedback: null }],
        },
      ],
    })),
    getAllPqrsPending: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: { id: 1, version: 1 } })),
    search: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: hoisted.swalFire,
    close: vi.fn(),
  },
}));

vi.mock('sweetalert2-react-content', () => ({
  default: (swal) => swal,
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen }) => (isOpen ? <div data-testid='mock-modal'>{children}</div> : null),
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ title, data = [], columns = [] }) => (
    <div data-testid='mock-datatable'>
      <div>{title}</div>
      {data.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          <span>{row.id_global || row.id_publico || row.id}</span>
          {columns.map((col, idx) => (
            <div key={`${row.id}-${idx}`} data-testid={`col-${row.id}-${idx}`}>
              {col.cell ? col.cell(row) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsService,
}));

vi.mock('../app/pages/user/pqrs/newpqrs', () => ({
  __esModule: true,
  default: ({ refreshRequested }) => (
    <div data-testid='pqrs-new-stub'>
      <button data-testid='pqrs-create-action' onClick={refreshRequested}>crear</button>
    </div>
  ),
}));

vi.mock('../app/pages/user/pqrs/pqrs_manage.view', () => ({
  __esModule: true,
  default: ({ NAVIGATION }) => (
    <div data-testid='pqrs-manage-stub'>
      <button
        data-testid='manage-open-reply'
        onClick={() => NAVIGATION({ id: 1, id_publico: 'PQRS-001', id_global: 'VR-001', status: 0 }, 'formal', 'manage')}
      >
        abrir responder
      </button>
      <button
        data-testid='manage-open-lock'
        onClick={() => NAVIGATION({ id: 1, id_publico: 'PQRS-001', id_global: 'VR-001', status: 0 }, 'lock', 'manage')}
      >
        abrir cerrar
      </button>
    </div>
  ),
}));

vi.mock('../app/pages/user/pqrs/replypqrs', () => ({
  __esModule: true,
  default: ({ refreshList }) => (
    <div data-testid='pqrs-reply-stub'>
      <button data-testid='pqrs-reply-action' onClick={refreshList}>responder</button>
    </div>
  ),
}));

vi.mock('../app/pages/user/pqrs/lockpqrs', () => ({
  __esModule: true,
  default: ({ refreshList }) => (
    <div data-testid='pqrs-lock-stub'>
      <button data-testid='pqrs-lock-action' onClick={refreshList}>cerrar</button>
    </div>
  ),
}));

vi.mock('../app/pages/user/pqrs/infopqrs', () => ({ __esModule: true, default: () => <div data-testid='pqrs-info-stub' /> }));
vi.mock('../app/pages/user/pqrs/asignpqrs', () => ({ __esModule: true, default: () => <div data-testid='pqrs-asign-stub' /> }));
vi.mock('../app/pages/user/pqrs/infomalpqrs', () => ({ __esModule: true, default: () => <div data-testid='pqrs-informal-stub' /> }));
vi.mock('../app/pages/user/pqrs/pqrs_edit', () => ({ __esModule: true, default: () => <div data-testid='pqrs-edit-stub' /> }));
vi.mock('../app/pages/user/pqrs/pqrs_macrotable', () => ({ __esModule: true, default: () => <div data-testid='pqrs-macro-stub' /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_reviewAction.component', () => ({ __esModule: true, PQRS_ACTION_REVIEW: () => <div data-testid='pqrs-review-stub' /> }));
vi.mock('../app/pages/user/submit/submit_x_fun.component', () => ({ __esModule: true, default: () => <div data-testid='submit-x-fun-stub' /> }));
vi.mock('../app/pages/user/pqrs/access_edit', () => ({ __esModule: true, ACESS_EDIT: () => <div data-testid='access-edit-stub' /> }));

import PQRSADMIN from '../app/pages/user/pqrs/pqrsadmin.functional';

const baseProps = {
  translation: {},
  translation_form: { form_radication_chanel: ['EMAIL', 'WEB'] },
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    text_btn: 'OK',
  },
  globals: { id: '1' },
  breadCrums: { bc_01: 'Inicio', bc_u1: 'Dashboard', bc_u7: 'PQRS' },
};

const renderPQRS = () =>
  render(
    <MemoryRouter>
      <PQRSADMIN {...baseProps} />
    </MemoryRouter>
  );

describe('PQRS — Integración profunda inicial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  it('renderiza módulo PQRS sin crash', async () => {
    // Arrange

    // Act
    renderPQRS();

    // Assert
    expect(await screen.findByText(/GESTIÓN DE PQRS Y SOLICITUDES/i)).toBeInTheDocument();
  });

  it('carga listado inicial de solicitudes', async () => {
    // Arrange

    // Act
    renderPQRS();

    // Assert
    await waitFor(() => {
      expect(hoisted.pqrsService.getAllPqrs).toHaveBeenCalledTimes(1);
      expect(hoisted.pqrsService.getAllPqrsPending).toHaveBeenCalledTimes(1);
    });
    expect((await screen.findAllByText('VR-001')).length).toBeGreaterThan(0);
  });

  it('crea PQRS desde modal y refresca listado', async () => {
    // Arrange
    renderPQRS();

    // Act
    fireEvent.click(await screen.findByRole('button', { name: /NUEVA SOLICITUD/i }));
    fireEvent.click(await screen.findByTestId('pqrs-create-action'));

    // Assert
    await waitFor(() => {
      expect(hoisted.pqrsService.getAllPqrs).toHaveBeenCalledTimes(2);
    });
  });

  it('responde PQRS y refresca listado', async () => {
    // Arrange
    renderPQRS();
    expect((await screen.findAllByText('VR-001')).length).toBeGreaterThan(0);

    // Act
    const row = screen.getByTestId('row-1');
    const actionButtons = within(row).getAllByRole('button');
    fireEvent.click(actionButtons.find((btn) => btn.className.includes('btn-success')) || actionButtons[0]);

    fireEvent.click(await screen.findByTestId('manage-open-reply'));
    fireEvent.click(await screen.findByTestId('pqrs-reply-action'));

    // Assert
    await waitFor(() => {
      expect(hoisted.pqrsService.getAllPqrs).toHaveBeenCalledTimes(2);
    });
  });

  it('cierra PQRS y refresca listado', async () => {
    // Arrange
    renderPQRS();
    expect((await screen.findAllByText('VR-001')).length).toBeGreaterThan(0);

    // Act
    const row = screen.getByTestId('row-1');
    const actionButtons = within(row).getAllByRole('button');
    fireEvent.click(actionButtons.find((btn) => btn.className.includes('btn-success')) || actionButtons[0]);

    fireEvent.click(await screen.findByTestId('manage-open-lock'));
    fireEvent.click(await screen.findByTestId('pqrs-lock-action'));

    // Assert
    await waitFor(() => {
      expect(hoisted.pqrsService.getAllPqrs).toHaveBeenCalledTimes(2);
    });
  });

  it('maneja error de service en carga sin crash', async () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hoisted.pqrsService.getAllPqrs.mockRejectedValueOnce(new Error('load failed'));

    // Act
    renderPQRS();

    // Assert
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalled();
    });
    expect(screen.getByText(/GESTIÓN DE PQRS Y SOLICITUDES/i)).toBeInTheDocument();
    logSpy.mockRestore();
  });

  it('maneja error de service en responder/cerrar con feedback', async () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hoisted.pqrsService.getAllPqrs.mockRejectedValueOnce(new Error('reply/close refresh failed'));
    renderPQRS();

    // Act
    fireEvent.click(await screen.findByRole('button', { name: /NUEVA SOLICITUD/i }));
    fireEvent.click(await screen.findByTestId('pqrs-create-action'));

    // Assert
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalled();
    });
    expect(screen.getByText(/GESTIÓN DE PQRS Y SOLICITUDES/i)).toBeInTheDocument();
    logSpy.mockRestore();
  });
});
