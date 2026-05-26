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
    getDocumentEvaluations: vi.fn(() => Promise.resolve({ data: [] })),
    saveDocumentEvaluations: vi.fn(() => Promise.resolve({ data: { rows: [] } })),
    update_r: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_funr: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

const labels = {
  511: 'Formulario Único Nacional',
  621: 'Plano urbanístico',
  680: 'Copia del plano correspondiente',
  681: 'Reglamento de propiedad horizontal',
  6891: 'Concepto de norma urbanística',
};

const baseSections = [
  {
    id: '6.1',
    title: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD',
    requirements: [
      { code: '511', label: labels[511] },
      { code: '621', label: labels[621] },
    ],
  },
  {
    id: '6.8-cotas',
    title: 'Ajuste de cotas y áreas',
    requirements: [{ code: '680', label: labels[680] }],
  },
];

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  generic_success_title: 'Éxito',
  generic_success_text: 'Guardado',
  generic_eror_title: 'Error',
  generic_error_text: 'No guardado',
};

function renderControl(extraProps = {}) {
  const props = {
    currentItem: { id: 10, id_public: 'FUN-10', fun_6s: [] },
    currentVersion: 1,
    codes: ['511', '621', '680'],
    sections: baseSections,
    labels,
    getCheckValue: (code) => (code === '621' ? 'N/A' : 'SI'),
    isRequirementApplicable: (code) => code !== '621',
    currentReview: { id: 22, review: '511&1,680&0', id6: '511&91,680&-1' },
    readOnly: false,
    requestUpdate: vi.fn(),
    swaMsg,
    ...extraProps,
  };

  return render(<FunCorrelatedDocumentControl {...props} />);
}

describe('FunCorrelatedDocumentControl', () => {
  beforeEach(() => {
    FUNService.getUnifiedDocumentEntries.mockReset();
    FUNService.getUnifiedDocumentEntries.mockResolvedValue({ data: [] });
    FUNService.getDocumentEvaluations.mockReset();
    FUNService.getDocumentEvaluations.mockResolvedValue({ data: [] });
    FUNService.saveDocumentEvaluations.mockReset();
    FUNService.saveDocumentEvaluations.mockResolvedValue({ data: { rows: [] } });
    FUNService.update_r.mockReset();
    FUNService.update_r.mockResolvedValue({ data: 'OK' });
    FUNService.create_funr.mockReset();
    FUNService.create_funr.mockResolvedValue({ data: 'OK' });
  });

  it('renders a compact primary control with one concise title, no Checklist column, and no KPI counters', async () => {
    renderControl();

    const control = await screen.findByRole('region', { name: /Control documental FUN/i });
    expect(within(control).getByRole('heading', { name: /Control documental FUN/i })).toBeInTheDocument();
    expect(within(control).getByRole('columnheader', { name: /Requisito/i })).toBeInTheDocument();
    expect(within(control).getByRole('columnheader', { name: /Documento seleccionado/i })).toBeInTheDocument();
    expect(within(control).queryByRole('columnheader', { name: /Evaluación/i })).not.toBeInTheDocument();
    expect(within(control).getByRole('columnheader', { name: /Gestionar/i })).toBeInTheDocument();
    expect(within(control).queryByRole('columnheader', { name: /^Checklist$/i })).not.toBeInTheDocument();
    expect(within(control).queryByText(/Aplicables:/i)).not.toBeInTheDocument();
    expect(within(control).queryByText(/Consultables:/i)).not.toBeInTheDocument();
    expect(within(control).queryByText(/Control de requisitos FUN/i)).not.toBeInTheDocument();
    expect(within(control).queryByText(/Control documental correlacionado/i)).not.toBeInTheDocument();
    expect(within(control).queryByText(/Cruza requisitos aplicables/i)).not.toBeInTheDocument();
    expect(within(control).queryByText(/Requisitos correlacionados con documentos/i)).not.toBeInTheDocument();

    const scrollContainer = within(control).getByTestId('fun-correlated-table-scroll');
    expect(scrollContainer).toHaveClass('max-h-[min(54vh,42rem)]');
    expect(scrollContainer).toHaveClass('overflow-y-auto');
  });

  it('shows only applicable rows with stronger section hierarchy than document rows', async () => {
    renderControl();

    const control = await screen.findByRole('region', { name: /Control documental FUN/i });
    const sectionHeading = within(control).getByText('6.1 DOCUMENTOS COMUNES A TODA SOLICITUD');
    expect(sectionHeading).toHaveClass('text-sm');
    expect(sectionHeading).toHaveClass('font-bold');
    expect(within(control).getByText('Ajuste de cotas y áreas')).toBeInTheDocument();
    expect(within(control).getByRole('row', { name: /511.*Formulario Único Nacional/i })).toBeInTheDocument();
    expect(within(control).getByRole('row', { name: /680.*Copia del plano correspondiente/i })).toBeInTheDocument();
    expect(within(control).queryByRole('row', { name: /621.*Plano urbanístico/i })).not.toBeInTheDocument();
  });

  it('does not expose report evaluation toggles or observation fields in chequeo', async () => {
    renderControl();

    const control = await screen.findByRole('region', { name: /Control documental FUN/i });
    expect(within(control).queryByRole('button', { name: /Ver evaluación/i })).not.toBeInTheDocument();
    expect(within(control).queryByRole('button', { name: /Ver todo/i })).not.toBeInTheDocument();
    expect(within(control).queryByLabelText(/Observación documental/i)).not.toBeInTheDocument();
    expect(FUNService.getDocumentEvaluations).not.toHaveBeenCalled();
    expect(FUNService.saveDocumentEvaluations).not.toHaveBeenCalled();
  });

  it('inherits review and id6 and saves only the chequeo through FUNService.update_r', async () => {
    const user = userEvent.setup();
    renderControl();

    expect(screen.queryByLabelText(/Evaluación requerida 511/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('selected-document-511')).toHaveTextContent(/91/);

    await user.click(screen.getByRole('button', { name: /Guardar control documental/i }));

    await waitFor(() => expect(FUNService.update_r).toHaveBeenCalledTimes(1));
    expect(FUNService.saveDocumentEvaluations).not.toHaveBeenCalled();
    const [funRId, formData] = FUNService.update_r.mock.calls[0];
    expect(funRId).toBe(22);
    expect(formData.get('review')).toContain('511&1');
    expect(formData.get('review')).toContain('680&0');
    expect(formData.get('id6')).toContain('511&91');
    expect(formData.get('id6')).toContain('680&-1');
  });

  it('persists legacy review and id6 on first creation without report evaluation payloads', async () => {
    const user = userEvent.setup();
    renderControl({ currentReview: null });

    await screen.findByRole('region', { name: /Control documental FUN/i });
    expect(screen.queryByLabelText(/Evaluación requerida/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Guardar control documental/i }));

    await waitFor(() => expect(FUNService.create_funr).toHaveBeenCalledTimes(1));
    expect(FUNService.saveDocumentEvaluations).not.toHaveBeenCalled();
    const [formData] = FUNService.create_funr.mock.calls[0];
    expect(formData.get('review')).toContain('511&1');
    expect(formData.get('review')).toContain('680&1');
    expect(formData.get('id6')).toContain('511&0');
    expect(formData.get('id6')).toContain('680&0');
  });

  it('opens Gestionar in a modal for rows without aportado/VR and keeps legal absence visible', async () => {
    const user = userEvent.setup();
    renderControl({ currentReview: { id: 22, review: '', id6: '' } });

    const row = await screen.findByRole('row', { name: /511.*Formulario Único Nacional/i });
    expect(within(row).getByText(/No aportado con VR/i)).toBeInTheDocument();

    await user.click(within(row).getByRole('button', { name: /Gestionar documento 511/i }));

    const modal = screen.getByRole('dialog', { name: /Gestionar documento 511/i });
    expect(within(modal).getByText(/No hay documento ni VR asociado a este requisito/i)).toBeInTheDocument();
    expect(within(modal).getByText(/ausencia queda visible como información para revisión legal/i)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Acción documental 511/i })).not.toBeInTheDocument();
  });

  it('lists related and grouped attached entries in the modal and changes the selected VR for chequeo', async () => {
    const user = userEvent.setup();
    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'digital-511-a',
          documentCode: '511',
          documentName: 'Formulario Único Nacional digital A',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-20',
          canPreview: true,
          previewUrl: '/files/fun6/doc-a.pdf',
        },
        {
          id: 'digital-511-b',
          documentCode: '511',
          documentName: 'Formulario Único Nacional digital B',
          sourceType: 'digital',
          vr: 'VR-124',
          date: '2026-05-21',
          canPreview: true,
          previewUrl: '/files/fun6/doc-b.pdf',
        },
        {
          id: 'digital-680-a',
          documentCode: '680',
          documentName: 'Plano de cotas adjunto',
          sourceType: 'digital',
          vr: 'VR-680',
          date: '2026-05-22',
          canPreview: true,
          previewUrl: '/files/fun6/doc-c.pdf',
        },
      ],
    });

    renderControl({ currentReview: { id: 22, review: '511&1', id6: '511&digital-511-a' } });

    const row = await screen.findByRole('row', { name: /511.*Documento aportado con VR/i });
    await user.click(within(row).getByRole('button', { name: /Gestionar documento 511/i }));

    let modal = screen.getByRole('dialog', { name: /Gestionar documento 511/i });
    expect(within(modal).getAllByRole('columnheader', { name: /Entrada/i }).length).toBeGreaterThan(0);
    expect(within(modal).getAllByRole('columnheader', { name: /^VR$/i }).length).toBeGreaterThan(0);
    expect(within(modal).getAllByText(/Formulario Único Nacional digital A/i).length).toBeGreaterThan(0);
    expect(within(modal).getAllByText(/Formulario Único Nacional digital B/i).length).toBeGreaterThan(0);
    expect(within(modal).getByText(/Otros documentos adjuntos/i)).toBeInTheDocument();
    expect(within(modal).getByText(/Plano de cotas adjunto/i)).toBeInTheDocument();
    expect(within(modal).getByTitle(/Documento aportado Opción 1 · Formulario Único Nacional digital A/i)).toHaveAttribute('src', '/files/fun6/doc-a.pdf?inline=1');

    await user.click(within(modal).getByRole('button', { name: /Seleccionar para chequeo.*VR-124/i }));
    expect(screen.getByTestId('selected-document-511')).toHaveTextContent(/Formulario Único Nacional digital B/);
    expect(screen.getByTestId('selected-document-511')).toHaveTextContent(/VR-124/);

    await user.keyboard('{Escape}');
    await user.click(within(row).getByRole('button', { name: /Gestionar documento 511/i }));

    modal = screen.getByRole('dialog', { name: /Gestionar documento 511/i });
    expect(within(modal).getByRole('button', { name: /Usado en chequeo.*VR-124/i })).toBeDisabled();
    expect(within(modal).getAllByText(/Formulario Único Nacional digital A/i).length).toBeGreaterThan(0);
  });

  it('identifies duplicate unnamed Gestionar options with visible option labels', async () => {
    const user = userEvent.setup();
    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'digital-511-a',
          documentCode: '511',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-20',
          pages: 6,
          canPreview: true,
          previewUrl: '/files/fun6/doc-a.pdf',
        },
        {
          id: 'digital-511-b',
          documentCode: '511',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-21',
          pages: 4,
          canPreview: true,
          previewUrl: '/files/fun6/doc-b.pdf',
        },
      ],
    });

    renderControl({ currentReview: { id: 22, review: '511&1', id6: '511&digital-511-a' } });

    const row = await screen.findByRole('row', { name: /511.*Documento aportado con VR/i });
    await user.click(within(row).getByRole('button', { name: /Gestionar documento 511/i }));

    const modal = screen.getByRole('dialog', { name: /Gestionar documento 511/i });
    expect(within(modal).getAllByText(/^Opción 1$/i).length).toBeGreaterThan(0);
    expect(within(modal).getAllByText(/^Opción 2$/i).length).toBeGreaterThan(0);
    expect(within(modal).getByText(/Opción 1 · Documento sin nombre/i)).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: /Usado en chequeo.*Opción 1.*VR-123/i })).toBeDisabled();
    expect(within(modal).getByRole('button', { name: /Seleccionar para chequeo.*Opción 2.*VR-123/i })).toBeEnabled();
  });

  it('hides report evaluation controls in readOnly mode while locking save and document selection', async () => {
    const user = userEvent.setup();
    FUNService.getUnifiedDocumentEntries.mockResolvedValueOnce({
      data: [
        {
          id: 'digital-511-a',
          documentCode: '511',
          documentName: 'Formulario Único Nacional digital A',
          sourceType: 'digital',
          vr: 'VR-123',
          date: '2026-05-20',
          canPreview: true,
          previewUrl: '/files/fun6/doc-a.pdf',
        },
      ],
    });

    renderControl({ readOnly: true });

    await screen.findByRole('region', { name: /Control documental FUN/i });
    expect(screen.queryByLabelText(/Evaluación requerida 511/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar control documental/i })).toBeDisabled();

    const row = screen.getByRole('row', { name: /511.*Formulario Único Nacional/i });
    await user.click(within(row).getByRole('button', { name: /Gestionar documento 511/i }));

    const modal = screen.getByRole('dialog', { name: /Gestionar documento 511/i });
    expect(within(modal).getByRole('button', { name: /Seleccionar para chequeo.*VR-123/i })).toBeDisabled();
  });
});

describe('FUN_CHECKLIST_N correlated document integration', () => {
  beforeEach(() => {
    FUNService.getUnifiedDocumentEntries.mockReset();
    FUNService.getUnifiedDocumentEntries.mockResolvedValue({ data: [] });
    FUNService.getDocumentEvaluations.mockReset();
    FUNService.getDocumentEvaluations.mockResolvedValue({ data: [] });
    FUNService.saveDocumentEvaluations.mockReset();
    FUNService.saveDocumentEvaluations.mockResolvedValue({ data: { rows: [] } });
    FUNService.update_r.mockReset();
    FUNService.update_r.mockResolvedValue({ data: 'OK' });
    FUNService.create_funr.mockReset();
    FUNService.create_funr.mockResolvedValue({ data: 'OK' });
  });

  it('selects the new correlated control tab by default and keeps the legacy checklist available for comparison', async () => {
    const user = userEvent.setup();

    render(
      <FUN_CHECKLIST_N
        currentItem={{
          id: 10,
          id_public: 'FUN-10',
          model: 2022,
          fun_1s: [{ id: 1, tipo: 'G', tramite: 'ajuste de cotas', m_urb: '', m_sub: '', m_lic: '', area: '', cultural: '' }],
          fun_rs: [{ id: 22, code: '680,681,6891', checked: '1,2,1', review: '680&1', id6: '680&-1' }],
          fun_6s: [],
        }}
        currentVersion={1}
        readOnly={false}
        requestUpdate={vi.fn()}
        swaMsg={swaMsg}
      />,
    );

    const newTab = screen.getByRole('tab', { name: /Control documental/i });
    expect(newTab).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByRole('region', { name: /Control documental FUN/i })).toBeInTheDocument();
    expect(screen.queryByText(/6\.8 DOCUMENTOS PARA OTRAS ACTUACIONES/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Checklist legacy/i }));
    expect(screen.getByText(/6\.8 DOCUMENTOS PARA OTRAS ACTUACIONES/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i })).toBeInTheDocument();
  });

  it('passes only dynamically applicable section rows from the legacy branching logic into the new control', async () => {
    render(
      <FUN_CHECKLIST_N
        currentItem={{
          id: 11,
          id_public: 'FUN-11',
          model: 2022,
          fun_1s: [{ id: 1, tipo: 'G', tramite: 'ajuste de cotas', m_urb: '', m_sub: '', m_lic: '', area: '', cultural: '' }],
          fun_rs: [{ id: 23, code: '680,681,6891', checked: '1,2,1', review: '680&1', id6: '680&-1' }],
          fun_6s: [],
        }}
        currentVersion={1}
        readOnly={false}
        requestUpdate={vi.fn()}
        swaMsg={swaMsg}
      />,
    );

    const control = await screen.findByRole('region', { name: /Control documental FUN/i });
    expect(within(control).getByText(/Ajuste de cotas y áreas/i)).toBeInTheDocument();
    expect(within(control).getByRole('row', { name: /680.*Copia del plano correspondiente/i })).toBeInTheDocument();
    expect(within(control).queryByRole('row', { name: /681.*Reglamento de propiedad horizontal/i })).not.toBeInTheDocument();
    expect(within(control).getByText(/Concepto de norma urbanística y uso del suelo/i)).toBeInTheDocument();
        expect(within(control).getByRole('row', { name: /6891.*Dirección oficial del predio/i })).toBeInTheDocument();
  });
});
