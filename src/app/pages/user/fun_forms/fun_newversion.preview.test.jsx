import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  previewRequirementsMock,
  updateVersionMock,
  createVersionMock,
  swalLoadingMock,
  swalSuccessMock,
  swalErrorMock,
} = vi.hoisted(() => ({
  previewRequirementsMock: vi.fn(),
  updateVersionMock: vi.fn(),
  createVersionMock: vi.fn(),
  swalLoadingMock: vi.fn(),
  swalSuccessMock: vi.fn(),
  swalErrorMock: vi.fn(),
}));

vi.mock('@/app/services/document_requirement.service.js', () => ({
  __esModule: true,
  default: {
    previewRequirements: previewRequirementsMock,
  },
}));

vi.mock('../../../services/fun.service', () => ({
  __esModule: true,
  default: {
    update_version: updateVersionMock,
    create_version: createVersionMock,
  },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalLoading: swalLoadingMock,
  swalSuccess: swalSuccessMock,
  swalError: swalErrorMock,
}));

import FUN_NEWVERSION from './fun_newversion.js';

const swaMsg = {
  title_wait: 'Espere',
  text_wait: 'Procesando',
  generic_eror_title: 'Error',
  generic_error_text: 'Error genérico',
  publish_success_title: 'Éxito',
  publish_success_text: 'Operación exitosa',
  text_footer: 'Footer',
};

const baseCurrentItem = {
  id: 77,
  id_public: '68001-1-26-0016',
  version: 1,
  state: 1,
  fun_1s: [
    {
      id: 10,
      tipo: '',
      tramite: '',
      m_urb: '',
      m_sub: '',
      m_lic: '',
      usos: '',
      area: 'A',
      vivienda: 'C',
      cultural: 'B',
      regla_1: '',
      regla_2: '',
    },
  ],
  fun_2: { id: 20 },
  fun_53s: [{ id: 53 }],
  fun_cs: [{ id: 61 }],
  fun_rs: [{ id: 71, checked: '', code: '' }],
  fun_law: { id: 81, new_type: true },
};

const previewResponse = {
  data: {
    configVersion: 8,
    status: 'published',
    requiredDocuments: [
      { code: '6601', label: 'Documento técnico backend', groupKey: 'construccion', groupLabel: 'Construcción' },
    ],
    matchedRules: [
      { key: 'rule-construction', groupKey: 'construccion', documentCodes: ['6601'], conditionSummary: 'tipoAny=D' },
    ],
    diagnostics: [],
  },
};

function renderActualizar(props = {}) {
  return render(
    <FUN_NEWVERSION
      translation={{}}
      swaMsg={swaMsg}
      globals={{}}
      currentItem={baseCurrentItem}
      currentVersion={1}
      toCreate={{ fun_1_type: true }}
      aim="NT"
      requestUpdate={vi.fn()}
      {...props}
    />
  );
}

describe('FUN_NEWVERSION version save', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    previewRequirementsMock.mockResolvedValue(previewResponse);
    updateVersionMock.mockResolvedValue({ data: 'OK' });
    createVersionMock.mockResolvedValue({ data: 'OK' });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('guarda una nueva version sin romperse al armar el formulario', async () => {
    // Regression: manage_version still called setSnapshotInfo() after the state
    // it belonged to was removed with the inline requirement preview, so the
    // handler threw a ReferenceError and the save never reached the service.
    const { container } = renderActualizar({ requestUpdate: vi.fn() });

    await act(async () => {
      fireEvent.click(container.querySelector('input[name="f_11"][value="D"]'));
      fireEvent.click(container.querySelector('input[name="f_12"][value="A"]'));
      fireEvent.click(container.querySelector('input[name="f_15"][value="A"]'));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Actualizar versión/i }));
      await Promise.resolve();
    });

    expect(updateVersionMock).toHaveBeenCalledTimes(1);
    expect(swalErrorMock).not.toHaveBeenCalled();
  });
});
