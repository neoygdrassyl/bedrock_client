import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { resetSubmitGuard } from '@/shared/utils/submitGuard.js';

const { lawServiceMock } = vi.hoisted(() => ({
  lawServiceMock: {
    getRecord: vi.fn(),
    create_step: vi.fn(),
    update_step: vi.fn(),
  },
}));

vi.mock('../../api/record_law.service', () => ({ default: lawServiceMock }));

import SubdivisionLegalCriteria from './SubdivisionLegalCriteria.jsx';

const JSON_REQUEST = { headers: { 'Content-Type': 'application/json' } };
const funWith = mSub => ({ id: 10, fun_1s: [{ version: 1, m_sub: mSub }] });
const recordWith = (steps = []) => ({ id: 5, fun0Id: 10, version: 1, record_law_steps: steps });

const criterionGroup = label => screen.getByRole('group', { name: label });
const answer = (label, option) => fireEvent.click(within(criterionGroup(label)).getByRole('button', { name: option }));

describe('SubdivisionLegalCriteria', () => {
  beforeEach(() => {
    resetSubmitGuard();
    vi.clearAllMocks();
    lawServiceMock.create_step.mockResolvedValue({ data: 'OK' });
    lawServiceMock.update_step.mockResolvedValue({ data: 'OK' });
    lawServiceMock.getRecord.mockResolvedValue({ data: [recordWith()] });
  });

  it('shows the rural criteria for m_sub A', () => {
    render(<SubdivisionLegalCriteria currentItem={funWith('A')} currentVersion={1} currentRecord={recordWith()} currentVersionR={1} />);

    expect(screen.getByRole('heading', { name: 'Revisión jurídica · Subdivisión' })).toBeInTheDocument();
    expect(screen.getByText('Subdivisión rural')).toBeInTheDocument();
    expect(criterionGroup(/cumplen la UAF/)).toBeInTheDocument();
    expect(criterionGroup(/excepción a la UAF/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /previamente urbanizado/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /Plano base/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /art\. 2\.2\.6\.1\.1\.6/ })).not.toBeInTheDocument();
  });

  it('honours the modality prop and shows every criterion with null', () => {
    const { rerender } = render(<SubdivisionLegalCriteria currentItem={funWith('A')} currentRecord={recordWith()} currentVersionR={1} modality="reloteo" />);
    expect(criterionGroup(/previamente urbanizado/)).toBeInTheDocument();
    expect(criterionGroup(/Plano base/)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /cumplen la UAF/ })).not.toBeInTheDocument();

    rerender(<SubdivisionLegalCriteria currentItem={funWith('A')} currentRecord={recordWith()} currentVersionR={1} modality={null} />);
    expect(screen.getByText('Todas las modalidades')).toBeInTheDocument();
    expect(criterionGroup(/cumplen la UAF/)).toBeInTheDocument();
    expect(criterionGroup(/art\. 2\.2\.6\.1\.1\.6/)).toBeInTheDocument();
    expect(criterionGroup(/previamente urbanizado/)).toBeInTheDocument();
  });

  it('suggests no procedente and saves the exact json shape as a new sub_law step', async () => {
    const requestUpdateRecord = vi.fn();
    render(<SubdivisionLegalCriteria currentItem={funWith('B')} currentVersion={1} currentRecord={recordWith()} currentVersionR={1} requestUpdateRecord={requestUpdateRecord} />);

    answer('Quien otorga el poder está legitimado', 'Sí');
    answer('Expedido hasta 30 días antes de la radicación', 'No');
    answer('Bien de interés cultural', 'Sí');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar nota: Expedido hasta 30 días antes de la radicación' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nota: Expedido hasta 30 días antes de la radicación' }), { target: { value: 'Certificado vencido' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Observaciones' }), { target: { value: 'Aportar certificado actualizado.' } });

    expect(screen.getByTestId('decision-suggestion')).toHaveTextContent('No procedente');
    expect(screen.getByText(/registra anotaciones que deben valorarse/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Usar sugerencia' }));
    expect(within(screen.getByRole('group', { name: 'Decisión' })).getByRole('button', { name: 'No procedente' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));

    await waitFor(() => expect(lawServiceMock.create_step).toHaveBeenCalledTimes(1));
    expect(lawServiceMock.create_step).toHaveBeenCalledWith({
      id_public: 'sub_law',
      version: 1,
      recordLawId: 5,
      json: {
        criteria: { poder_legitimado: 'SI', clt_vigente: 'NO', anot_bic: 'SI' },
        notes: { clt_vigente: 'Certificado vencido' },
        observations: 'Aportar certificado actualizado.',
        decision: 'no_procedente',
      },
    }, JSON_REQUEST);
    expect(lawServiceMock.update_step).not.toHaveBeenCalled();
    await waitFor(() => expect(requestUpdateRecord).toHaveBeenCalledWith(10));
    expect(lawServiceMock.getRecord).toHaveBeenCalledWith(10);
    expect(await screen.findByText('Revisión guardada')).toBeInTheDocument();
  });

  it('loads an existing step json and updates it', async () => {
    const stored = { criteria: { poder_legitimado: 'SI', clt_vigente: 'NA' }, notes: { poder_legitimado: 'Poder general' }, observations: 'Sin reparos.', decision: 'procedente' };
    const steps = [
      { id: 3, id_public: 'sub_law', version: 0, json: { criteria: { poder_legitimado: 'NO' } } },
      { id: 9, id_public: 'sub_law', version: 1, json: JSON.stringify(stored) },
    ];
    render(<SubdivisionLegalCriteria currentItem={funWith('B')} currentVersion={1} currentRecord={recordWith(steps)} currentVersionR={1} />);

    expect(within(criterionGroup('Quien otorga el poder está legitimado')).getByRole('button', { name: 'Sí' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(criterionGroup('Expedido hasta 30 días antes de la radicación')).getByRole('button', { name: 'No aplica' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Nota: Quien otorga el poder está legitimado' })).toHaveValue('Poder general');
    expect(screen.getByRole('textbox', { name: 'Observaciones' })).toHaveValue('Sin reparos.');
    expect(within(screen.getByRole('group', { name: 'Decisión' })).getByRole('button', { name: 'Procedente' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(lawServiceMock.update_step).toHaveBeenCalledTimes(1));
    expect(lawServiceMock.update_step).toHaveBeenCalledWith(9, {
      id_public: 'sub_law',
      version: 1,
      recordLawId: 5,
      json: stored,
    }, JSON_REQUEST);
    expect(lawServiceMock.create_step).not.toHaveBeenCalled();
  });

  it('loads the record itself when the parent does not pass one', async () => {
    lawServiceMock.getRecord.mockResolvedValue({ data: [
      { id: 4, fun0Id: 10, version: 0, record_law_steps: [] },
      recordWith([{ id: 9, id_public: 'sub_law', version: 1, json: { criteria: { doc_fun: 'NO' } } }]),
    ] });
    render(<SubdivisionLegalCriteria currentId={10} currentVersion={1} modality="urbana" />);

    await waitFor(() => expect(within(criterionGroup('Formulario único nacional diligenciado')).getByRole('button', { name: 'No' })).toHaveAttribute('aria-pressed', 'true'));
    expect(lawServiceMock.getRecord).toHaveBeenCalledWith(10);
  });

  it('keeps the review read-only without a legal record', () => {
    render(<SubdivisionLegalCriteria currentItem={funWith('B')} currentRecord={null} />);
    expect(screen.getByText(/cuando se cree el informe jurídico/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar revisión' })).toBeDisabled();
  });

  it('shows an error when the API does not confirm the save', async () => {
    lawServiceMock.create_step.mockResolvedValue({ data: 'ERROR' });
    render(<SubdivisionLegalCriteria currentItem={funWith('B')} currentRecord={recordWith()} currentVersionR={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible guardar la revisión');
  });
});
