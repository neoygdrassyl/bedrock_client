import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { funServiceMock, submitServiceMock, getMissingRequirementsMock } = vi.hoisted(() => ({
  funServiceMock: {
    getAll_VrFun: vi.fn(() => Promise.resolve({ data: [] })),
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: { id_public: 'FUN26-2330' } })),
  },
  submitServiceMock: {
    update_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  getMissingRequirementsMock: vi.fn(),
}));

vi.mock('../../../services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../../../services/submit.service', () => ({
  __esModule: true,
  default: submitServiceMock,
}));

vi.mock('@/app/services/documentaryOperations.service', () => ({
  getMissingRequirements: getMissingRequirementsMock,
  refreshDocumentaryRequirements: vi.fn(),
}));

vi.mock('@/shared/components/legacy-modal', () => ({
  LegacyModal: ({ isOpen, children, contentLabel }) => (isOpen ? <section aria-label={contentLabel}>{children}</section> : null),
}));

vi.mock('@/shared/utils/swalAdapter', () => ({
  swalConfirm: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import SUBMIT_LIST from './submit_list.component.jsx';

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

const linkedOrigin = { mode: 'traditional', project: { fun0Id: 2330, idPublic: 'FUN26-2330' }, warnings: [] };
const unlinkedOrigin = { mode: 'unlinked', project: null, warnings: [] };

const notApplicableResult = {
  schemaVersion: 'dovela-backoffice/documentary-missing/v1',
  project: { fun0Id: 2330, idPublic: 'FUN26-2330' },
  mode: 'traditional',
  applicable: false,
  state: 'not_applicable',
  allRequirementsSatisfied: null,
  requirements: [],
  groups: [],
  summary: { total: 0, missing: 0, present: 0 },
  refresh: { allowed: false, path: null, expectedInputRevision: null },
  warnings: [],
};

function renderList(item, origin) {
  return render(
    <SUBMIT_LIST
      translation={{}}
      swaMsg={{}}
      globals={{}}
      currentItem={item}
      refreshList={vi.fn()}
      origin={origin}
      activePanel="physical"
      digitalCount={0}
      digitalDocuments={[]}
      onPanelChange={vi.fn()}
    />,
  );
}

describe('SUBMIT_LIST faltantes documentales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMissingRequirementsMock.mockResolvedValue(notApplicableResult);
    funServiceMock.getAll_VrFun.mockResolvedValue({ data: [] });
  });

  it('consulta los faltantes del expediente vinculado y conserva el formulario de la lista sin guardar', async () => {
    const user = userEvent.setup();
    renderList(currentItem, linkedOrigin);

    const titleInput = screen.getByPlaceholderText('Título de la lista');
    fireEvent.change(titleInput, { target: { value: 'Lista temporal sin guardar' } });

    await user.click(screen.getByRole('button', { name: /Faltantes/i }));

    await waitFor(() => {
      expect(getMissingRequirementsMock).toHaveBeenCalledWith(2330, expect.any(AbortSignal));
    });
    const modal = await screen.findByRole('region', { name: 'Documentos faltantes' });
    expect(await within(modal).findByText(/solo aplica a expedientes activados/)).toBeInTheDocument();
    expect(titleInput).toHaveValue('Lista temporal sin guardar');
    expect(submitServiceMock.update_list).not.toHaveBeenCalled();
    expect(submitServiceMock.create_list).not.toHaveBeenCalled();
    expect(submitServiceMock.delete_list).not.toHaveBeenCalled();
  });

  it('habilita Faltantes en una entrada vinculada aunque no tenga listas documentales activas', async () => {
    const user = userEvent.setup();
    renderList(emptyListItem, linkedOrigin);

    expect(screen.getByText('No hay información documental para esta entrada.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gestionar escaneados/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Faltantes/i }));
    await waitFor(() => expect(getMissingRequirementsMock).toHaveBeenCalledWith(2330, expect.any(AbortSignal)));
  });

  it('deshabilita Faltantes cuando la entrada no tiene expediente vinculado', () => {
    renderList(emptyListItem, unlinkedOrigin);

    const button = screen.getByRole('button', { name: /Faltantes/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', expect.stringMatching(/No aplica/));
    expect(getMissingRequirementsMock).not.toHaveBeenCalled();
  });
});
