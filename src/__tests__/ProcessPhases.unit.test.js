import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProcessPhases } from '../app/pages/user/clocks/hooks/useProcessPhases';

const baseItem = {
  id: 1,
  type: 'ii',
  date: '2026-01-16',
};

const baseSuspension = {
  exists: false,
  start: null,
  end: null,
  days: 0,
  isActive: false,
};

const baseExtension = {
  exists: false,
  start: null,
  end: null,
  days: 0,
  isActive: false,
};

const basePhaseOptions = {
  phase_estudio: { notificationType: 'notificar', byAviso: false },
  phase_correcciones: { notificationType: 'notificar', byAviso: false },
};

describe('useProcessPhases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.user = null;
  });

  it('con flujo base sin clocks deja phase0 ACTIVO y phase1 PENDIENTE', () => {
    const { result } = renderHook(() =>
      useProcessPhases({
        clocksData: [],
        currentItem: baseItem,
        today: '2026-02-10',
        suspensionPreActa: baseSuspension,
        suspensionPostActa: baseSuspension,
        extension: baseExtension,
        phaseOptions: basePhaseOptions,
      })
    );

    const phase0 = result.current.find((p) => p.id === 'phase0');
    const phase1 = result.current.find((p) => p.id === 'phase1');

    expect(Array.isArray(result.current)).toBe(true);
    expect(phase0?.status).toBe('ACTIVO');
    expect(phase1?.status).toBe('PENDIENTE');
    expect(result.current.debugInfo.desistimiento.active).toBe(false);
  });

  it('completa phase0 cuando existe reloj LDF (state 5)', () => {
    const clocksData = [{ id: 1, state: 5, date_start: '2026-01-20', version: '1' }];

    const { result } = renderHook(() =>
      useProcessPhases({
        clocksData,
        currentItem: baseItem,
        today: '2026-02-10',
        suspensionPreActa: baseSuspension,
        suspensionPostActa: baseSuspension,
        extension: baseExtension,
        phaseOptions: basePhaseOptions,
      })
    );

    const phase0 = result.current.find((p) => p.id === 'phase0');
    expect(phase0?.status).toBe('COMPLETADO');
    expect(phase0?.endDate).toBe('2026-01-20');
  });

  it('marca phase1 como PAUSADO cuando hay suspension pre-acta activa', () => {
    const clocksData = [{ id: 1, state: 5, date_start: '2026-01-20', version: '1' }];
    const suspensionPreActa = {
      exists: true,
      start: { date_start: '2026-01-25' },
      end: null,
      days: 0,
      isActive: true,
    };

    const { result } = renderHook(() =>
      useProcessPhases({
        clocksData,
        currentItem: baseItem,
        today: '2026-02-10',
        suspensionPreActa,
        suspensionPostActa: baseSuspension,
        extension: baseExtension,
        phaseOptions: basePhaseOptions,
      })
    );

    const phase1 = result.current.find((p) => p.id === 'phase1');
    expect(phase1?.status).toBe('PAUSADO');
  });

  it('genera flujo de desistimiento cuando existe version -5', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: -50, date_start: '2026-01-25', version: '-5' },
      { id: 3, state: -6, date_start: '2026-01-28', version: '-5' },
      { id: 4, state: -5, date_start: '2026-01-29', version: '-5' },
    ];

    const { result } = renderHook(() =>
      useProcessPhases({
        clocksData,
        currentItem: baseItem,
        today: '2026-02-10',
        suspensionPreActa: baseSuspension,
        suspensionPostActa: baseSuspension,
        extension: baseExtension,
        phaseOptions: basePhaseOptions,
      })
    );

    const desistPhase = result.current.find((p) => p.id === 'desist_-5_res');
    expect(result.current.debugInfo.desistimiento.active).toBe(true);
    expect(result.current.debugInfo.desistimiento.version).toBe('-5');
    expect(desistPhase).toBeTruthy();
  });

  it('si estudio es comunicar no agrega phase2 de notificacion observaciones', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 30, date_start: '2026-01-30', version: '1', desc: 'ACTA PARTE 1 OBSERVACIONES: NO CUMPLE' },
      { id: 3, state: 33, date_start: '2026-02-03', version: '1' },
    ];

    const { result } = renderHook(() =>
      useProcessPhases({
        clocksData,
        currentItem: baseItem,
        today: '2026-02-10',
        suspensionPreActa: baseSuspension,
        suspensionPostActa: baseSuspension,
        extension: baseExtension,
        phaseOptions: {
          ...basePhaseOptions,
          phase_estudio: { notificationType: 'comunicar', byAviso: false },
        },
      })
    );

    const phase2 = result.current.find((p) => p.id === 'phase2');
    expect(phase2).toBeUndefined();
  });
});
