import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecordLawDocsCheck from '../app/pages/user/records/law/record_law_docs_check';
import FUNService from '../app/services/fun.service';
import submitService from '../app/services/submit.service';

vi.mock('../app/services/fun.service', () => ({
  default: {
    getDocumentEvaluations: vi.fn(() => Promise.resolve({ data: [] })),
    saveDocumentEvaluations: vi.fn(() => Promise.resolve({ data: { rows: [] } })),
    update_r: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/submit.service', () => ({
  default: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/components/vizualizer.component', () => ({
  default: ({ url }) => <span data-testid="vizualizer">{url}</span>,
}));

vi.mock('../app/components/jsons/fun6DocsList.json', () => ({
  default: {
    511: 'Formulario Único Nacional',
    680: 'Copia del plano correspondiente',
  },
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  GEM_CODE_LIST: vi.fn(() => [
    {
      parent: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD',
      codes: ['511', '680'],
    },
  ]),
  VR_DOCUMENTS_OF_INTEREST: {
    law: ['511', '680'],
    arc: ['680'],
    eng: ['680'],
  },
}));

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  publish_success_title: 'Guardado',
  publish_success_text: 'Cambios guardados',
  text_footer: '',
  generic_eror_title: 'Error',
  generic_error_text: 'No guardado',
};

function renderInventory(extraProps = {}) {
  const requestUpdate = vi.fn();
  const props = {
    currentItem: {
      id: 10,
      id_public: 'FUN-10',
      fun_1s: [{ id: 1 }],
    },
    currentVersion: 1,
    _FUN_6: [],
    _FUN_R: {
      id: 22,
      code: '511,680',
      checked: '1,1',
      review: '511&1,680&0',
      id6: '511&91,680&-1',
    },
    docsScope: 'law',
    ownerRecordId: 303,
    requestUpdate,
    swaMsg,
    showFilters: true,
    ...extraProps,
  };

  const view = render(<RecordLawDocsCheck {...props} />);
  return { ...view, requestUpdate };
}

describe('RecordLawDocsCheck document evaluations by report', () => {
  beforeEach(() => {
    FUNService.getDocumentEvaluations.mockReset();
    FUNService.getDocumentEvaluations.mockResolvedValue({ data: [] });
    FUNService.saveDocumentEvaluations.mockReset();
    FUNService.saveDocumentEvaluations.mockResolvedValue({ data: { rows: [] } });
    FUNService.update_r.mockReset();
    FUNService.update_r.mockResolvedValue({ data: 'OK' });
    submitService.getIdRelated.mockReset();
    submitService.getIdRelated.mockResolvedValue({ data: [] });
  });

  it('loads and displays report-scoped evaluations without using the FUN checklist evaluation', async () => {
    FUNService.getDocumentEvaluations.mockResolvedValue({
      data: [
        {
          requirement_code: '511',
          requirement_label: 'Formulario Único Nacional',
          status: 'cumple',
          observation: 'Validado en informe jurídico',
        },
      ],
    });

    renderInventory();

    await waitFor(() => {
      expect(FUNService.getDocumentEvaluations).toHaveBeenCalledWith(10, 'law', 303);
    });

    expect(screen.getByRole('columnheader', { name: 'EVALUACIÓN FUN' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'EVALUACIÓN INFORME' })).toBeInTheDocument();

    const reportEvaluation = await screen.findByLabelText('Evaluación del informe 511');
    expect(reportEvaluation).toHaveValue('cumple');
    expect(screen.getByLabelText('Observación del informe 511')).toHaveValue('Validado en informe jurídico');

    const row = reportEvaluation.closest('tr');
    expect(within(row).getByRole('combobox', { name: 'Evaluación del informe 511' })).toHaveValue('cumple');
    expect(FUNService.update_r).not.toHaveBeenCalled();
  });

  it('saves report-scoped evaluation changes without modifying fun_r review or id6', async () => {
    const user = userEvent.setup();
    renderInventory();

    const reportEvaluation = await screen.findByLabelText('Evaluación del informe 511');
    await user.selectOptions(reportEvaluation, 'no_cumple');

    const observation = screen.getByLabelText('Observación del informe 511');
    await user.clear(observation);
    await user.type(observation, 'Falta certificado actualizado');

    await user.click(screen.getByRole('button', { name: 'Guardar evaluación del informe' }));

    await waitFor(() => {
      expect(FUNService.saveDocumentEvaluations).toHaveBeenCalledWith(10, 'law', {
        owner_record_id: 303,
        entries: expect.arrayContaining([
          expect.objectContaining({
            requirement_code: '511',
            requirement_label: 'Formulario Único Nacional',
            status: 'no_cumple',
            observation: 'Falta certificado actualizado',
          }),
        ]),
      });
    });

    expect(FUNService.update_r).not.toHaveBeenCalled();
  });

  it('disables report-scoped evaluation controls in readOnly mode', async () => {
    renderInventory({ readOnly: true });

    const reportEvaluation = await screen.findByLabelText('Evaluación del informe 511');
    expect(reportEvaluation).toBeDisabled();
    expect(screen.getByLabelText('Observación del informe 511')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar evaluación del informe' })).toBeDisabled();
  });

  it('keeps the report inventory usable when related VR lookup fails', async () => {
    submitService.getIdRelated.mockRejectedValueOnce(new Error('VR unavailable'));

    renderInventory();

    expect(await screen.findByLabelText('Evaluación del informe 511')).toBeInTheDocument();
    expect(screen.queryByText('CARGANDO...')).not.toBeInTheDocument();
    expect(FUNService.getDocumentEvaluations).toHaveBeenCalledWith(10, 'law', 303);
  });
});
