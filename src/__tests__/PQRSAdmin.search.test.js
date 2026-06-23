import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  swalLoadingMock: vi.fn(),
  swalCloseMock: vi.fn(),
  pqrsService: {
    getAllPqrs: vi.fn(),
    getAllPqrsPending: vi.fn(),
    search: vi.fn(),
  },
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsService,
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalLoading: hoisted.swalLoadingMock,
  swalClose: hoisted.swalCloseMock,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (value) => value ?? '',
  dateParser_timeLeft: () => '',
  dateParser_finalDate: (value) => value ?? '',
  dateParser_dateDiff: () => 0,
}));

vi.mock('../app/utils/BusinessDaysCol', () => ({
  DiasHabilesColombia: { diff: () => 0 },
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: ({ data = [], columns = [] }) => (
    <div data-testid="datatable-stub">
      {data.map((row) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          <div>{row.id_global || row.id_publico || row.id}</div>
          {columns.map((column) => (
            <div key={`${row.id}-${String(column.name)}`}>{column.cell ? column.cell(row) : null}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../app/pages/user/pqrs/newpqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/infopqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/asignpqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/infomalpqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/replypqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/lockpqrs', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/pqrs_edit', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/pqrs_macrotable', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_reviewAction.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/submit/submit_x_fun.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/pqrs_manage.view', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/access_edit', () => ({ __esModule: true, ACESS_EDIT: () => <div /> }));

import PQRSADMIN from '../app/pages/user/pqrs/pqrsadmin';

const baseProps = {
  translation: {},
  translation_form: { form_radication_chanel: ['EMAIL', 'WEB'] },
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
  },
  globals: { id: '1' },
  breadCrums: { bc_01: 'Inicio', bc_u1: 'Dashboard', bc_u7: 'PQRS' },
};

function renderPQRS() {
  return render(
    <MemoryRouter>
      <PQRSADMIN {...baseProps} />
    </MemoryRouter>
  );
}

describe('PQRSADMIN search on production component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
    hoisted.pqrsService.getAllPqrs.mockResolvedValue({ data: [] });
    hoisted.pqrsService.getAllPqrsPending.mockResolvedValue({ data: [] });
    hoisted.pqrsService.search.mockResolvedValue({
      data: [
        {
          id: 2612,
          id_publico: 'VR26-2207',
          id_global: 'VR26-2207',
          id_reply: null,
          status: 0,
          createdAt: '2026-06-23',
          pqrs_law: { extension: false },
          pqrs_time: { legal: '2026-06-23', reply_formal: null },
          pqrs_workers: [],
        },
      ],
    });
  });

  test('searches by entry consecutive on pqrsadmin.js and keeps the manage action available for active results', async () => {
    renderPQRS();

    const searchInput = document.getElementById('search_1');
    fireEvent.change(searchInput, { target: { value: 'Vr26-2207' } });
    fireEvent.click(screen.getByRole('button', { name: /consultar/i }));

    await waitFor(() => {
      expect(hoisted.pqrsService.search).toHaveBeenCalledTimes(1);
    });

    const payload = hoisted.pqrsService.search.mock.calls[0][0];
    expect(payload.get('search_field')).toBe('1');
    expect(payload.get('serach_str')).toBe('Vr26-2207');
    expect((await screen.findAllByText('VR26-2207')).length).toBeGreaterThan(0);
    expect(await screen.findByRole('button', { name: /gestionar peticion/i })).toBeInTheDocument();
  });
});
