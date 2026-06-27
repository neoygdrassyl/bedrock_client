import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { funServiceMock, submitServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    getMissingDocuments: vi.fn(),
    getAll_VrFun: vi.fn(() => Promise.resolve({ data: [] })),
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: { id_public: 'FUN26-2330' } })),
  },
  submitServiceMock: {
    update_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../../../services/submit.service', () => ({
  __esModule: true,
  default: submitServiceMock,
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ isOpen, children, contentLabel }) => (isOpen ? <section aria-label={contentLabel}>{children}</section> : null),
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalConfirm: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import SUBMIT_LIST from './submit_list.component.js';

const currentItem = {
  id: 90,
  id_public: 'VR26-2330',
  id_related: 'FUN26-2330',
  sub_lists: [
    {
      id: 10,
      list_title: 'Lista documental editable',
      list_name: 'Formulario único nacional;Certificado de libertad',
      list_category: 'BASE,BASE',
      list_code: 'DOC-001,DOC-002',
      list_pages: '1,3',
      list_aportante: 'Solicitante,Curaduría',
      list_review: 'SI,SI',
    },
  ],
};

const emptyListItem = {
  id: 91,
  id_public: 'VR26-2330',
  id_related: 'FUN26-2330',
  sub_lists: [],
};

const missingResult = {
  source: 'snapshot',
  snapshotId: 321,
  summary: { totalRequirements: 1, missing: 1, pendingScan: 0, present: 0, notApplicable: 0 },
  requirements: [
    { code: 'DOC-001', label: 'Formulario único nacional', status: 'missing', statusReason: 'required_without_evidence', evidence: [] },
  ],
  missingDocuments: [
    { code: 'DOC-001', label: 'Formulario único nacional', reason: 'required_without_evidence', suggestedText: 'Solicitar Formulario único nacional.' },
  ],
};

describe('SUBMIT_LIST faltantes documentales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    funServiceMock.getMissingDocuments.mockResolvedValue({ data: missingResult });
    funServiceMock.getAll_VrFun.mockResolvedValue({ data: [] });
  });

  it('muestra Faltantes, consulta el endpoint y conserva el formulario de la lista sin guardar', async () => {
    const user = userEvent.setup();

    render(
      <SUBMIT_LIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={currentItem}
        refreshList={vi.fn()}
        activePanel="physical"
        digitalCount={0}
        digitalDocuments={[]}
        onPanelChange={vi.fn()}
      />,
    );

    const titleInput = screen.getByPlaceholderText('Título de la lista');
    fireEvent.change(titleInput, { target: { value: 'Lista temporal sin guardar' } });

    await user.click(screen.getByRole('button', { name: /Faltantes/i }));

    await waitFor(() => {
      expect(funServiceMock.getMissingDocuments).toHaveBeenCalledWith('FUN26-2330', 'VR26-2330');
    });
    expect(await screen.findByText('snapshotId: 321')).toBeInTheDocument();
    const missingGroup = screen.getByRole('region', { name: /^Faltantes$/i });
    expect(within(missingGroup).getByText('Formulario único nacional')).toBeInTheDocument();
    expect(titleInput).toHaveValue('Lista temporal sin guardar');
    expect(submitServiceMock.update_list).not.toHaveBeenCalled();
    expect(submitServiceMock.create_list).not.toHaveBeenCalled();
    expect(submitServiceMock.delete_list).not.toHaveBeenCalled();
  });

  it('muestra Faltantes en una VR vinculada aunque no tenga listas documentales activas', async () => {
    const user = userEvent.setup();

    render(
      <SUBMIT_LIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={emptyListItem}
        refreshList={vi.fn()}
        activePanel="physical"
        digitalCount={0}
        digitalDocuments={[]}
        onPanelChange={vi.fn()}
      />,
    );

    expect(screen.getByText('No hay información documental para esta entrada.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gestionar escaneados/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Faltantes/i }));

    await waitFor(() => {
      expect(funServiceMock.getMissingDocuments).toHaveBeenCalledWith('FUN26-2330', 'VR26-2330');
    });
    expect(await screen.findByText('snapshotId: 321')).toBeInTheDocument();
    expect(submitServiceMock.update_list).not.toHaveBeenCalled();
    expect(submitServiceMock.create_list).not.toHaveBeenCalled();
    expect(submitServiceMock.delete_list).not.toHaveBeenCalled();
  });
});
