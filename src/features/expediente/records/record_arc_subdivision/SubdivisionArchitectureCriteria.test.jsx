import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { resetSubmitGuard } from '@/shared/utils/submitGuard.js';

const { arcServiceMock, funServiceMock } = vi.hoisted(() => ({
  arcServiceMock: {
    getRecord: vi.fn(),
    create_step: vi.fn(),
    update_step: vi.fn(),
  },
  funServiceMock: { get: vi.fn() },
}));

vi.mock('../../api/record_arc.service', () => ({ default: arcServiceMock }));
vi.mock('../../api/fun.service', () => ({ default: funServiceMock }));

import SubdivisionArchitectureCriteria from './SubdivisionArchitectureCriteria.jsx';

const JSON_REQUEST = { headers: { 'Content-Type': 'application/json' } };
const technical = [
  { id: 1, lindero: 'Norte', puntoInicialEtiqueta: 'P1', puntoInicialX: '1102030.5', puntoInicialY: '1278000.1', puntoFinalEtiqueta: 'P2', puntoFinalX: '1102050.5', puntoFinalY: '1278000.1', distancia: '20.00', rumbo: 'N 90° E', colindante: 'Lote 2' },
  { id: 2, coord: 'SUR', longitud: '15', colinda: 'Vía pública' },
];
const funWith = (mSub, boundaries = technical) => ({ id: 10, fun_1s: [{ version: 1, m_sub: mSub }], fun_4_technicals: boundaries });
const arcRecord = (steps = []) => ({ data: { record_arc: { id: 7, version: 1 }, record_arc_steps: steps } });

const criterionGroup = label => screen.getByRole('group', { name: label });
const answer = (label, option) => fireEvent.click(within(criterionGroup(label)).getByRole('button', { name: option }));

describe('SubdivisionArchitectureCriteria', () => {
  beforeEach(() => {
    resetSubmitGuard();
    vi.clearAllMocks();
    arcServiceMock.create_step.mockResolvedValue({ data: 'OK' });
    arcServiceMock.update_step.mockResolvedValue({ data: 'OK' });
    arcServiceMock.getRecord.mockResolvedValue(arcRecord());
    funServiceMock.get.mockResolvedValue({ data: funWith('B') });
  });

  it('loads the FUN and the record from currentId and shows the urban norm and boundaries', async () => {
    render(<SubdivisionArchitectureCriteria currentId={10} currentVersion={1} />);

    expect(await screen.findByText('Subdivisión urbana')).toBeInTheDocument();
    expect(funServiceMock.get).toHaveBeenCalledWith(10);
    expect(arcServiceMock.getRecord).toHaveBeenCalledWith(10);
    expect(criterionGroup(/a\. Presenta el área de los predios/)).toBeInTheDocument();
    expect(criterionGroup(/k\. Firmado por profesionales idóneos/)).toBeInTheDocument();
    expect(criterionGroup(/área mínima de lote/)).toBeInTheDocument();
    expect(criterionGroup(/Frente sobre vía pública/)).toBeInTheDocument();

    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText('Norte')).toBeInTheDocument();
    expect(within(rows[1]).getByText('P1 (1102030.5, 1278000.1) → P2 (1102050.5, 1278000.1)')).toBeInTheDocument();
    expect(within(rows[1]).getByText('20.00')).toBeInTheDocument();
    expect(within(rows[1]).getByText('N 90° E')).toBeInTheDocument();
    expect(within(rows[2]).getByText('SUR')).toBeInTheDocument();
    expect(within(rows[2]).getByText('15')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Vía pública')).toBeInTheDocument();
  });

  it('hides the urban norm for rural subdivisions and states missing boundaries', () => {
    render(<SubdivisionArchitectureCriteria currentItem={funWith('A', [])} currentVersion={1} currentRecord={arcRecord().data.record_arc} currentVersionR={1} />);

    expect(screen.queryByRole('group', { name: /área mínima de lote/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Norma urbana')).not.toBeInTheDocument();
    expect(screen.getByText('El solicitante no registró linderos técnicos')).toBeInTheDocument();
    expect(funServiceMock.get).not.toHaveBeenCalled();
  });

  it('saves the criteria as a new sub_arc step with Viable / No viable mapped to the decision', async () => {
    render(<SubdivisionArchitectureCriteria currentId={10} currentVersion={1} />);
    await screen.findByText('Subdivisión urbana');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar revisión' })).toBeEnabled());

    answer(/a\. Presenta el área de los predios/, 'Sí');
    answer(/g\. Está referido al Datum Magna Sirgas/, 'No aplica');
    answer(/Frente sobre vía pública/, 'No');
    expect(screen.getByTestId('decision-suggestion')).toHaveTextContent('No viable');
    fireEvent.click(within(screen.getByRole('group', { name: 'Decisión' })).getByRole('button', { name: 'Viable' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Observaciones' }), { target: { value: 'Revisar acceso.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(arcServiceMock.create_step).toHaveBeenCalledTimes(1));
    expect(arcServiceMock.create_step).toHaveBeenCalledWith({
      id_public: 'sub_arc',
      version: 1,
      recordArcId: 7,
      json: {
        criteria: { a_area_predios: 'SI', g_magna_sirgas: 'NA', norma_frente_via: 'NO' },
        notes: {},
        observations: 'Revisar acceso.',
        decision: 'procedente',
      },
    }, JSON_REQUEST);
  });

  it('loads an existing sub_arc step and updates it', async () => {
    const stored = { criteria: { b_area_clt: 'NO' }, notes: { b_area_clt: 'Área distinta al CLT' }, observations: '', decision: 'no_procedente' };
    arcServiceMock.getRecord.mockResolvedValue(arcRecord([{ id: 21, id_public: 'sub_arc', version: 1, json: stored }]));
    render(<SubdivisionArchitectureCriteria currentItem={funWith('C')} currentVersion={1} />);

    await waitFor(() => expect(within(criterionGroup(/b\. El área del predio de mayor extensión/)).getByRole('button', { name: 'No' })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByText('Reloteo')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Nota: b\./ })).toHaveValue('Área distinta al CLT');
    expect(within(screen.getByRole('group', { name: 'Decisión' })).getByRole('button', { name: 'No viable' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(arcServiceMock.update_step).toHaveBeenCalledWith(21, {
      id_public: 'sub_arc',
      version: 1,
      recordArcId: 7,
      json: stored,
    }, JSON_REQUEST));
    expect(arcServiceMock.create_step).not.toHaveBeenCalled();
  });
});
