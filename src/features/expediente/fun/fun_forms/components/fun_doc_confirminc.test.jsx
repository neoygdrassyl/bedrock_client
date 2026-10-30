import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getMissingRequirementsMock,
  getIdRelatedMock,
  getByFUNMock,
  getLastCubMock,
} = vi.hoisted(() => ({
  getMissingRequirementsMock: vi.fn(),
  getIdRelatedMock: vi.fn(),
  getByFUNMock: vi.fn(),
  getLastCubMock: vi.fn(),
}));

vi.mock('../../../api/fun.service', () => ({
  __esModule: true,
  default: {
    update_law: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_law: vi.fn(() => Promise.resolve({ data: 'OK' })),
    gen_doc_incomplete: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('@/features/expediente/api/documentaryOperations.service', () => ({
  getMissingRequirements: getMissingRequirementsMock,
}));

vi.mock('../../../../ventanilla/api/submit.service', () => ({
  __esModule: true,
  default: {
    getIdRelated: getIdRelatedMock,
  },
}));

vi.mock('../../../api/cubXvr.service', () => ({
  __esModule: true,
  default: {
    getByFUN: getByFUNMock,
    updateCubVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
    createCubXVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../../pqrs/api/pqrs_main.service', () => ({
  __esModule: true,
  default: {
    getlascub: getLastCubMock,
  },
}));

vi.mock('@/shared/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import FUN_DOC_CONFIRM_INCOMPLETE from './fun_doc_confirminc.jsx';

function buildCurrentItem(overrides = {}) {
  return {
    id: 77,
    id_public: 'FUN26-2330',
    fun_1s: [{ tipo: 'D', tramite: 'Licencia', m_urb: '', m_sub: '', m_lic: 'A' }],
    fun_53s: [{ id: 53, name: 'Ana', surname: 'Pérez', id_number: '1', role: 'Propietaria', number: '3000000', email: 'ana@test.com', address: 'Calle 1 # 2-3' }],
    fun_rs: [{ code: 'OLD-01', checked: '0' }],
    fun_clocks: [{ state: 3, date_start: '2026-06-01' }],
    fun_law: null,
    ...overrides,
  };
}

const swaMsg = {
  title_wait: 'Espere',
  text_wait: 'Procesando',
  publish_success_title: 'OK',
  publish_success_text: 'OK',
  text_footer: 'OK',
  generic_eror_title: 'Error',
  generic_error_text: 'Error',
};

function requirement(code, name, status) {
  return { documentId: `C-${code}`, code, name, required: true, standaloneRequired: true, groupCode: null, status };
}

function canonical(requirements) {
  const missing = requirements.filter((item) => item.status === 'missing').length;
  return {
    schemaVersion: 'dovela-backoffice/documentary-missing/v1',
    project: { fun0Id: 77, idPublic: 'FUN26-2330' },
    mode: 'canonical',
    applicable: true,
    state: 'current',
    allRequirementsSatisfied: missing === 0,
    requirements,
    groups: [],
    summary: { total: requirements.length, missing, present: requirements.length - missing },
    refresh: { allowed: false, path: null, expectedInputRevision: 1 },
    warnings: [],
  };
}

function renderForm() {
  return render(
    <FUN_DOC_CONFIRM_INCOMPLETE
      currentItem={buildCurrentItem()}
      currentVersion={1}
      edit={false}
      requestUpdate={vi.fn()}
      swaMsg={swaMsg}
    />,
  );
}

describe('FUN_DOC_CONFIRM_INCOMPLETE', () => {
  beforeEach(() => {
    getIdRelatedMock.mockReset();
    getByFUNMock.mockReset();
    getMissingRequirementsMock.mockReset();
    getLastCubMock.mockReset();

    getIdRelatedMock.mockResolvedValue({ data: [{ id: 1, id_public: 'VR26-2330' }] });
    getByFUNMock.mockResolvedValue({ data: [] });
    getLastCubMock.mockResolvedValue({ data: [{ cub: 'CUB-1' }] });
  });

  it('autocompleta 5.11 con los requisitos faltantes solo cuando el campo estaba vacío', async () => {
    getMissingRequirementsMock.mockResolvedValue(canonical([
      requirement('D1', 'Formulario único nacional', 'missing'),
      requirement('D2', 'Certificado de libertad', 'present'),
      requirement('D3', 'Certificado de libertad físico', 'missing'),
    ]));

    renderForm();

    await waitFor(() => expect(getMissingRequirementsMock).toHaveBeenCalledWith(77));
    await waitFor(() => expect(document.getElementById('geni_missing').value).toBe('1. Solicitar Formulario único nacional.\n2. Solicitar Certificado de libertad físico.'));

    expect(screen.queryByText(/Sugerencia calculada/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserva el texto manual y muestra la sugerencia calculada aparte cuando cambian los faltantes', async () => {
    const user = userEvent.setup();

    getMissingRequirementsMock
      .mockResolvedValueOnce(canonical([requirement('D1', 'Formulario único nacional', 'missing')]))
      .mockResolvedValueOnce(canonical([requirement('D3', 'Certificado de libertad físico', 'missing')]));

    const { rerender } = renderForm();

    await waitFor(() => expect(document.getElementById('geni_missing').value).toBe('1. Solicitar Formulario único nacional.'));

    await user.clear(document.getElementById('geni_missing'));
    await user.type(document.getElementById('geni_missing'), 'Texto manual de prueba');

    rerender(
      <FUN_DOC_CONFIRM_INCOMPLETE
        currentItem={buildCurrentItem({ id: 78, id_public: 'FUN26-2331' })}
        currentVersion={1}
        edit={false}
        requestUpdate={vi.fn()}
        swaMsg={swaMsg}
      />,
    );

    await waitFor(() => expect(getMissingRequirementsMock).toHaveBeenLastCalledWith(78));
    await waitFor(() => expect(document.getElementById('geni_missing').value).toBe('Texto manual de prueba'));

    expect(screen.getByText(/Sugerencia calculada/i)).toBeInTheDocument();
    expect(screen.getByText('1. Solicitar Certificado de libertad físico.')).toBeInTheDocument();
  });

  it('advierte cuando la evaluación de requisitos no está vigente', async () => {
    getMissingRequirementsMock.mockResolvedValue({ ...canonical([requirement('D1', 'Formulario único nacional', 'missing')]), state: 'stale', allRequirementsSatisfied: null });

    renderForm();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no está vigente/));
    expect(document.getElementById('geni_missing').value).toBe('1. Solicitar Formulario único nacional.');
  });

  it('muestra una nota informativa sin error cuando el expediente no aplica (tradicional)', async () => {
    getMissingRequirementsMock.mockResolvedValue({ ...canonical([]), mode: 'traditional', applicable: false, state: 'not_applicable', allRequirementsSatisfied: null });

    renderForm();

    await waitFor(() => expect(screen.getByRole('note')).toHaveTextContent(/no tiene configuración documental de Dovela Central/i));
    expect(screen.queryByText('No fue posible consultar los documentos faltantes.')).not.toBeInTheDocument();
    expect(screen.queryByText(/Sugerencia calculada/i)).not.toBeInTheDocument();
    expect(document.getElementById('geni_missing').value).toBe('');
  });

  it('muestra el error cuando la consulta falla', async () => {
    getMissingRequirementsMock.mockRejectedValue({ response: { status: 503 } });

    renderForm();

    await waitFor(() => expect(screen.getByText('No fue posible consultar los documentos faltantes.')).toBeInTheDocument());
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
