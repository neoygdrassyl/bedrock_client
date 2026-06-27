import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { previewRequirementsMock, documentRequirementServiceMock } = vi.hoisted(() => {
  const previewRequirementsMock = vi.fn();
  return {
    previewRequirementsMock,
    documentRequirementServiceMock: {
      previewRequirements: previewRequirementsMock,
    },
  };
});

vi.mock('@/app/services/document_requirement.service.js', () => ({
  __esModule: true,
  default: documentRequirementServiceMock,
}));

import { INSUFFICIENT_REQUIREMENT_PREVIEW_MESSAGE, useRequirementPreview } from './useRequirementPreview.js';

const completeActuacion = {
  tipo: ['D'],
  tramite: 'A',
  m_urb: '',
  m_sub: '',
  m_lic: ['A'],
  usos: ['B'],
  area: 'A',
  vivienda: 'C',
  cultural: 'B',
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

describe('useRequirementPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('muestra el estado insuficiente sin consultar el endpoint cuando faltan campos base', () => {
    const { result } = renderHook(() => useRequirementPreview({ tipo: [], tramite: '' }));

    expect(result.current.status).toBe('insufficient');
    expect(result.current.message).toBe(INSUFFICIENT_REQUIREMENT_PREVIEW_MESSAGE);
    expect(previewRequirementsMock).not.toHaveBeenCalled();
  });

  it('espera 500ms y consulta preview publicado con los valores actuales sin guardar', async () => {
    previewRequirementsMock.mockResolvedValue(previewResponse);

    const { result } = renderHook(() => useRequirementPreview(completeActuacion));

    expect(previewRequirementsMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(previewRequirementsMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });

    expect(previewRequirementsMock).toHaveBeenCalledTimes(1);
    expect(previewRequirementsMock).toHaveBeenCalledWith({
      configStatus: 'published',
      actuacion: expect.objectContaining(completeActuacion),
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe('ready');
    expect(result.current.preview.requiredDocuments).toHaveLength(1);
    expect(result.current.preview.sourceLabel).toBe('Publicada');
    expect(result.current.preview.configVersion).toBe(8);
  });

  it('convierte fallas del endpoint en advertencia no bloqueante', async () => {
    previewRequirementsMock.mockRejectedValue({
      response: {
        data: { message: 'Fallo interno del preview documental.' },
      },
    });

    const { result } = renderHook(() => useRequirementPreview(completeActuacion));

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe('warning');
    expect(result.current.message).toContain('Fallo interno del preview documental.');
    expect(result.current.preview.requiredDocuments).toEqual([]);
  });
});
