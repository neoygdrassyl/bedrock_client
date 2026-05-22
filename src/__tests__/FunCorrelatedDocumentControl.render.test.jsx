import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FunCorrelatedDocumentControl from '../app/pages/user/fun_forms/components/FunCorrelatedDocumentControl';
import FUN_CHECKLIST_N from '../app/pages/user/fun_forms/components/fun_checklist_n';
import FUNService from '../app/services/fun.service';

vi.mock('../app/services/fun.service', () => ({
  default: {
    getUnifiedDocumentEntries: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('FunCorrelatedDocumentControl', () => {
  beforeEach(() => {
    FUNService.getUnifiedDocumentEntries.mockReset();
    FUNService.getUnifiedDocumentEntries.mockResolvedValue({ data: [] });
  });

  it('renders a correlated table without treating missing evidence as an error', async () => {
    render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 10, id_public: 'FUN-10', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'NO'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    expect(await screen.findByText('Control documental correlacionado')).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /511/i });
    expect(within(row).getByText('Sin evidencia registrada')).toBeInTheDocument();
    expect(screen.getByText(/No bloquea el envío a Legal y debida forma/i)).toBeInTheDocument();
  });

  it('opens detail for a previewable entry and shows related VRs plus iframe preview', async () => {
    const user = userEvent.setup();

    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'physical-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional físico',
          originState: 'FISICO',
          vr: 'VR-456',
          date: '2026-05-19',
          canPreview: false,
        },
        {
          id: 'digital-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional digital',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-20',
          canPreview: true,
          previewUrl: '/files/fun6/doc-digital.pdf',
        },
      ],
    });

    render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 11, id_public: 'FUN-11', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    expect(await screen.findByText(/VR-123/)).toBeInTheDocument();
    const detailButton = screen.getByRole('button', { name: /ver detalle para requisito 511/i });
    expect(detailButton).toBeEnabled();

    await user.click(detailButton);

    const panel = screen.getByRole('region', { name: /detalle documental 511/i });
    expect(within(panel).getByRole('heading', { name: /511.*Formulario Único Nacional/i })).toBeInTheDocument();
    expect(within(panel).getAllByText('VR-123').length).toBeGreaterThan(0);
    expect(within(panel).getAllByText('VR-456').length).toBeGreaterThan(0);
    expect(within(panel).getByText(/Entrada seleccionada para evaluación/i)).toBeInTheDocument();

    const iframe = within(panel).getByTitle(/Previsualización documental Formulario Único Nacional digital/i);
    expect(iframe).toHaveAttribute('src', '/files/fun6/doc-digital.pdf?inline=1');
  });

  it('switches the selected evaluation entry to physical-only and hides the iframe preview', async () => {
    const user = userEvent.setup();

    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'digital-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional digital',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-20',
          canPreview: true,
          previewUrl: '/files/fun6/doc-digital.pdf',
        },
        {
          id: 'physical-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional físico',
          originState: 'FISICO',
          vr: '',
          date: '2026-05-21',
          canPreview: false,
        },
      ],
    });

    render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 12, id_public: 'FUN-12', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    await user.click(await screen.findByRole('button', { name: /ver detalle para requisito 511/i }));
    const panel = screen.getByRole('region', { name: /detalle documental 511/i });
    expect(within(panel).getByTitle(/Previsualización documental Formulario Único Nacional digital/i)).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /Formulario Único Nacional físico/i }));

    expect(within(panel).queryByTitle(/Previsualización documental/i)).not.toBeInTheDocument();
    expect(within(panel).getByText(/Documento físico: no tiene previsualización digital/i)).toBeInTheDocument();
    expect(within(panel).getAllByText(/Sin VR/i).length).toBeGreaterThan(0);
    expect(within(panel).getByText(/Entrada seleccionada para evaluación/i)).toBeInTheDocument();
  });

  it('marks the row updated when the selected evaluation entry has newer VR evidence', async () => {
    const user = userEvent.setup();

    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'old-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional anterior',
          sourceType: 'digital',
          vr: 'VR-001',
          date: '2026-05-01',
          canPreview: false,
        },
        {
          id: 'new-511',
          documentCode: '511',
          documentName: 'Formulario Único Nacional actualizado',
          sourceType: 'digital',
          vr: 'VR-002',
          date: '2026-05-20',
          canPreview: true,
          previewUrl: '/files/fun6/doc-actualizado.pdf',
        },
      ],
    });

    render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 16, id_public: 'FUN-16', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    expect(await screen.findByText('Actualizados: 0')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ver detalle para requisito 511/i }));

    const panel = screen.getByRole('region', { name: /detalle documental 511/i });
    expect(within(panel).getByTitle(/Previsualización documental Formulario Único Nacional actualizado/i)).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /Formulario Único Nacional anterior/i }));

    await waitFor(() => {
      expect(screen.getByText(/Evaluado con VR anterior; hay actualización posterior/i)).toBeInTheDocument();
      expect(screen.getByText('Actualizados: 1')).toBeInTheDocument();
    });
  });

  it('keeps detail opening disabled in readOnly mode even when preview exists', async () => {
    const user = userEvent.setup();

    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [{ id: 'doc-511', documentCode: '511', documentName: 'Formulario Único Nacional', vr: 'VR-123', canPreview: true, previewUrl: '/files/fun6/doc.pdf' }],
    });

    render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 13, id_public: 'FUN-13', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly
      />,
    );

    expect(await screen.findByText(/VR-123/)).toBeInTheDocument();
    const detailButton = screen.getByRole('button', { name: /solo lectura para requisito 511/i });
    expect(detailButton).toBeDisabled();

    await user.click(detailButton);

    expect(screen.queryByRole('region', { name: /detalle documental 511/i })).not.toBeInTheDocument();
  });

  it('clears old evidence and closes detail when switching current item before new evidence loads', async () => {
    const user = userEvent.setup();

    FUNService.getUnifiedDocumentEntries
      .mockResolvedValueOnce({
        data: [{
          id: 'old-doc-511',
          documentCode: '511',
          documentName: 'Documento anterior',
          vr: 'VR-OLD',
          canPreview: true,
          previewUrl: '/files/fun6/old.pdf',
        }],
      })
      .mockImplementationOnce(() => new Promise(() => {}));

    const { rerender } = render(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 14, id_public: 'FUN-14', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    await user.click(await screen.findByRole('button', { name: /ver detalle para requisito 511/i }));
    expect(screen.getByTitle(/Previsualización documental Documento anterior/i)).toHaveAttribute('src', '/files/fun6/old.pdf?inline=1');
    expect(screen.getAllByText(/VR-OLD/i).length).toBeGreaterThan(0);

    rerender(
      <FunCorrelatedDocumentControl
        currentItem={{ id: 15, id_public: 'FUN-15', fun_6s: [] }}
        currentVersion={1}
        codes={['511']}
        labels={{ 511: 'Formulario Único Nacional' }}
        getCheckValue={() => 'SI'}
        isRequirementApplicable={() => true}
        readOnly={false}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /detalle documental 511/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Previsualización documental Documento anterior/i)).not.toBeInTheDocument();
      expect(screen.queryAllByText(/VR-OLD/i)).toHaveLength(0);
    });
  });
});

describe('FUN_CHECKLIST_N correlated document integration', () => {
  beforeEach(() => {
    FUNService.getUnifiedDocumentEntries.mockReset();
    FUNService.getUnifiedDocumentEntries.mockResolvedValue({ data: [] });
  });

  it('renders correlated control after section 6.8 and before the save action with legacy checklist values', async () => {
    render(
      <FUN_CHECKLIST_N
        currentItem={{
          id: 10,
          id_public: 'FUN-10',
          model: 2022,
          fun_1s: [{ id: 1, tipo: 'G', tramite: 'A', m_urb: '', m_sub: '', m_lic: '', area: '', cultural: '' }],
          fun_rs: [{ id: 22, code: '680,6891', checked: '1,2' }],
          fun_6s: [],
        }}
        currentVersion={1}
        readOnly={false}
        requestUpdate={vi.fn()}
        swaMsg={{
          title_wait: 'Espere...',
          text_wait: 'Procesando...',
          generic_success_title: 'Éxito',
          generic_success_text: 'Guardado',
          generic_eror_title: 'Error',
          generic_error_text: 'No guardado',
        }}
      />,
    );

    const legacySection680 = screen.getByText(/6\.8 DOCUMENTOS PARA OTRAS ACTUACIONES/i);
    const correlatedTitle = await screen.findByRole('heading', { name: /Control documental correlacionado/i });
    const saveButton = screen.getByRole('button', { name: /GUARDAR CAMBIOS/i });

    expect(legacySection680.compareDocumentPosition(correlatedTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(correlatedTitle.compareDocumentPosition(saveButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('row', { name: /680.*Checklist: SI/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /6891.*Checklist: N\/A/i })).toBeInTheDocument();
  });

  it('renders correlated control when FUN 1 data is missing', async () => {
    render(
      <FUN_CHECKLIST_N
        currentItem={{
          id: 11,
          id_public: 'FUN-11',
          model: 2022,
          fun_rs: [],
          fun_6s: [],
        }}
        currentVersion={1}
        readOnly={true}
        requestUpdate={vi.fn()}
        swaMsg={{
          title_wait: 'Espere...',
          text_wait: 'Procesando...',
          generic_success_title: 'Éxito',
          generic_success_text: 'Guardado',
          generic_eror_title: 'Error',
          generic_error_text: 'No guardado',
        }}
      />,
    );

    expect(await screen.findByRole('heading', { name: /Control documental correlacionado/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /621.*No aplica.*Checklist: sin_definir/i })).toBeInTheDocument();
  });
});
