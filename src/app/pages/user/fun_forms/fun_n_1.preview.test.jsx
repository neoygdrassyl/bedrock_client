import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { previewRequirementsMock } = vi.hoisted(() => ({
  previewRequirementsMock: vi.fn(),
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
    create_fun1: vi.fn(),
    update_1: vi.fn(),
  },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
  swalError: vi.fn(),
}));

import FUNN1 from './fun_n_1.js';

const currentItem = {
  id: 77,
  id_public: '68001-1-26-0016',
  model: 2022,
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
  },
};

function renderFunn1() {
  return render(
    <FUNN1
      translation={{}}
      swaMsg={{}}
      globals={{}}
      currentItem={currentItem}
      currentVersion={1}
      requestUpdate={vi.fn()}
    />
  );
}

describe('FUNN1 requirement preview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    previewRequirementsMock.mockResolvedValue(previewResponse);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('previsualiza requisitos publicados desde valores no guardados de Actualizar', async () => {
    const { container } = renderFunn1();

    await act(async () => {
      fireEvent.click(container.querySelector('input[name="f_11"][value="D"]'));
      fireEvent.click(container.querySelector('input[name="f_12"][value="A"]'));
      fireEvent.click(container.querySelector('input[name="f_15"][value="A"]'));
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(previewRequirementsMock).toHaveBeenCalledWith({
      configStatus: 'published',
      actuacion: expect.objectContaining({
        tipo: ['D'],
        tramite: 'A',
        m_lic: ['A'],
        area: 'A',
        vivienda: 'C',
        cultural: 'B',
      }),
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('Publicada')).toBeInTheDocument();
    expect(screen.getByText('Documento técnico backend')).toBeInTheDocument();
  });
});
