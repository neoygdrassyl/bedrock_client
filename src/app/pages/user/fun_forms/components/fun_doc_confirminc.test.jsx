import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getMissingDocumentsMock,
  getIdRelatedMock,
  getByFUNMock,
  getLastCubMock,
} = vi.hoisted(() => ({
  getMissingDocumentsMock: vi.fn(),
  getIdRelatedMock: vi.fn(),
  getByFUNMock: vi.fn(),
  getLastCubMock: vi.fn(),
}));

vi.mock('../../../../services/fun.service', () => ({
  __esModule: true,
  default: {
    getMissingDocuments: getMissingDocumentsMock,
    update_law: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_law: vi.fn(() => Promise.resolve({ data: 'OK' })),
    gen_doc_incomplete: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../../services/submit.service', () => ({
  __esModule: true,
  default: {
    getIdRelated: getIdRelatedMock,
  },
}));

vi.mock('../../../../services/cubXvr.service', () => ({
  __esModule: true,
  default: {
    getByFUN: getByFUNMock,
    updateCubVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
    createCubXVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../../services/pqrs_main.service', () => ({
  __esModule: true,
  default: {
    getlascub: getLastCubMock,
  },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import FUN_DOC_CONFIRM_INCOMPLETE from './fun_doc_confirminc.js';

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

describe('FUN_DOC_CONFIRM_INCOMPLETE', () => {
  beforeEach(() => {
    getIdRelatedMock.mockReset();
    getByFUNMock.mockReset();
    getMissingDocumentsMock.mockReset();
    getLastCubMock.mockReset();

    getIdRelatedMock.mockResolvedValue({ data: [{ id: 1, id_public: 'VR26-2330' }] });
    getByFUNMock.mockResolvedValue({ data: [] });
    getLastCubMock.mockResolvedValue({ data: [{ cub: 'CUB-1' }] });
  });

  it('autocompleta 5.11 con la sugerencia calculada solo cuando el campo estaba vacío', async () => {
    getMissingDocumentsMock.mockResolvedValue({
      data: {
        source: 'snapshot',
        missingDocuments: [
          { suggestedText: 'Solicitar Formulario único nacional.' },
          { suggestedText: 'Digitalizar o cargar Certificado de libertad físico.' },
        ],
      },
    });

    render(
      <FUN_DOC_CONFIRM_INCOMPLETE
        currentItem={buildCurrentItem()}
        currentVersion={1}
        edit={false}
        requestUpdate={vi.fn()}
        swaMsg={swaMsg}
      />,
    );

    await waitFor(() => expect(getMissingDocumentsMock).toHaveBeenCalledWith(77, 'FUN26-2330'));
    await waitFor(() => expect(document.getElementById('geni_missing').value).toBe('1. Solicitar Formulario único nacional.\n2. Digitalizar o cargar Certificado de libertad físico.'));

    expect(screen.queryByText(/Sugerencia calculada/i)).not.toBeInTheDocument();
  });

  it('preserva el texto manual y muestra la sugerencia calculada aparte cuando cambian los faltantes', async () => {
    const user = userEvent.setup();

    getMissingDocumentsMock
      .mockResolvedValueOnce({
        data: {
          source: 'snapshot',
          missingDocuments: [{ suggestedText: 'Solicitar Formulario único nacional.' }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          source: 'snapshot',
          missingDocuments: [{ suggestedText: 'Digitalizar o cargar Certificado de libertad físico.' }],
        },
      });

    const { rerender } = render(
      <FUN_DOC_CONFIRM_INCOMPLETE
        currentItem={buildCurrentItem()}
        currentVersion={1}
        edit={false}
        requestUpdate={vi.fn()}
        swaMsg={swaMsg}
      />,
    );

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

    await waitFor(() => expect(getMissingDocumentsMock).toHaveBeenLastCalledWith(78, 'FUN26-2331'));
    await waitFor(() => expect(document.getElementById('geni_missing').value).toBe('Texto manual de prueba'));

    expect(screen.getByText(/Sugerencia calculada/i)).toBeInTheDocument();
    expect(screen.getByText('1. Digitalizar o cargar Certificado de libertad físico.')).toBeInTheDocument();
  });
});
