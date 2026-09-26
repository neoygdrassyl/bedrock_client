import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

const { updateAreaMock } = vi.hoisted(() => ({
  updateAreaMock: vi.fn(),
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas_resumen.component', () => ({
  default: () => <div data-testid="areas-summary" />,
}));

vi.mock('../app/services/record_arc.service', () => ({
  default: {
    update_arc_33_area: updateAreaMock,
  },
}));

vi.mock('../app/services/fun.service', () => ({
  default: {},
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import RecordArcAreas from '../app/pages/user/records/arc/record_arc_areas_2.component';

describe('Información de Áreas central grid', () => {
  test('renders the shared editable grid with the dynamic architectural area columns', async () => {
    const { container } = render(
      <RecordArcAreas
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{
          id: 1417,
          fun_1s: [{
            id: 11,
            tipo: '',
            tramite: '',
            m_urb: '',
            m_sub: '',
            m_lic: 'A',
            usos: '',
            area: '',
            vivienda: '',
            cultural: '',
          }],
        }}
        currentVersion={1}
        currentRecord={{
          id: 90,
          category: '{}',
          record_arc_steps: [],
          record_arc_33_areas: [{
            id: 10,
            type: 'area',
            floor: 'Piso 1',
            id_public: 'A-101',
            scale: '1:125',
            level: 'N+&0.00',
            build: '4259.45,0,0,0,0,0,0,0,0,0,0',
            destroy: '0,0,0,0,0,0',
            units: '',
            units_a: '',
            historic_areas: '',
            empate_h: '',
            use: 'Residencial',
          }],
        }}
        currentVersionR={1}
        requestUpdateRecord={vi.fn()}
        requestUpdate={vi.fn()}
      />,
    );

    const grid = await screen.findByRole('grid', { name: 'Información de áreas arquitectónicas' });
    expect(screen.getByRole('columnheader', { name: 'Sótano/Piso' })).toHaveAttribute('data-sticky', 'true');
    expect(screen.getByRole('columnheader', { name: 'Obra Nueva' })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('gridcell', { name: 'Piso 1' })).toBeTruthy());
    expect(container.querySelector('.table-bordered')).toBeNull();
  });

  test('keeps architectural persistence in the domain consumer after editing the shared grid', async () => {
    updateAreaMock.mockResolvedValue({ data: 'OK' });
    const user = userEvent.setup();
    render(
      <RecordArcAreas
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{ id: 1417, fun_1s: [{ id: 11, tipo: '', tramite: '', m_urb: '', m_sub: '', m_lic: '', usos: '', area: '', vivienda: '', cultural: '' }] }}
        currentVersion={1}
        currentRecord={{
          id: 90,
          category: '{}',
          record_arc_steps: [],
          record_arc_33_areas: [{
            id: 10,
            type: 'area',
            floor: 'Piso 1',
            id_public: 'A-101',
            scale: '1:125',
            level: 'N+&0.00',
            build: '0,0,0,0,0,0,0,0,0,0,0',
            destroy: '0,0,0,0,0,0',
            units: '',
            units_a: '',
            historic_areas: '',
            empate_h: '',
            use: 'Residencial',
          }],
        }}
        currentVersionR={1}
        requestUpdateRecord={vi.fn()}
        requestUpdate={vi.fn()}
      />,
    );

    await user.dblClick(await screen.findByRole('gridcell', { name: 'Piso 1' }));
    const input = screen.getByRole('textbox', { name: 'Editar Sótano/Piso, fila 1' });
    await user.clear(input);
    await user.type(input, 'Piso 2{Enter}');

    await waitFor(() => expect(updateAreaMock).toHaveBeenCalledTimes(1));
    expect(updateAreaMock.mock.calls[0][0]).toBe(10);
    expect(updateAreaMock.mock.calls[0][1].get('floor')).toBe('Piso 2');
  });
});
