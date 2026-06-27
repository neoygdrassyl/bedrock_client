import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlarms } from '../app/pages/user/clocks/hooks/useAlarms';
import { FUN_0_TYPE_TIME } from '../app/pages/user/clocks/hooks/useClocksManager';

const makeManager = (overrides = {}) => {
  const clocksMap = overrides.clocksMap || {};

  return {
    curaduriaDetails: {
      status: 'ACTIVO',
      remaining: 5,
      activePhaseName: 'Estudio y Observaciones',
      ...overrides.curaduriaDetails,
    },
    getClock: (state) => clocksMap[state] || null,
    getClockVersion: (state) => clocksMap[state] || null,
    phaseOptions: {
      phase_estudio: { notificationType: 'notificar', byAviso: false },
      phase_correcciones: { notificationType: 'notificar', byAviso: false },
      ...(overrides.phaseOptions || {}),
    },
    FUN_0_TYPE_TIME,
    suspensionPreActa: { exists: false, start: null, end: null, days: 0, isActive: false },
    suspensionPostActa: { exists: false, start: null, end: null, days: 0, isActive: false },
    extension: { exists: false, start: null, end: null, days: 0, isActive: false },
    currentItem: { type: 'ii' },
    viaTime: 10,
    ...overrides,
  };
};

describe('useAlarms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.user = null;
  });

  it('genera alarma de proceso cuando el proceso esta activo y cerca a vencer', () => {
    const manager = makeManager({
      curaduriaDetails: {
        status: 'ACTIVO',
        remaining: 3,
        activePhaseName: 'Revisión y Viabilidad',
      },
    });

    const { result } = renderHook(() =>
      useAlarms(manager, null, [], '2026-02-10')
    );

    expect(result.current.processAlarms.length).toBe(1);
    expect(result.current.processAlarms[0].type).toBe('process');
    expect(result.current.processAlarms[0].eventName).toContain('Viabilidad');
  });

  it('crea alarma legal binaria para state 504 cuando no esta completado', () => {
    const manager = makeManager({
      clocksMap: {
        70: { state: 70, date_start: '2026-02-05' },
      },
    });

    const clocksToShow = [
      { state: 504, name: 'Comunicación a vecinos', hasLegalAlarm: true },
    ];

    const { result } = renderHook(() =>
      useAlarms(manager, null, clocksToShow, '2026-02-10')
    );

    const alarm504 = result.current.notificationAlarms.find((a) => a.state === 504);
    expect(alarm504).toBeTruthy();
    expect(alarm504.isBinaryActivity).toBe(true);
    expect(alarm504.alarmType).toBe('overdue');
  });

  it('no crea alarma para state 504 cuando ya tiene fecha de ejecucion', () => {
    const manager = makeManager({
      clocksMap: {
        504: { state: 504, date_start: '2026-02-01' },
      },
    });

    const clocksToShow = [
      { state: 504, name: 'Comunicación a vecinos', hasLegalAlarm: true },
    ];

    const { result } = renderHook(() =>
      useAlarms(manager, null, clocksToShow, '2026-02-10')
    );

    const alarm504 = result.current.notificationAlarms.find((a) => a.state === 504);
    expect(alarm504).toBeUndefined();
  });

  it('no duplica alarmas del mismo state y tipo', () => {
    const manager = makeManager({
      clocksMap: {
        70: { state: 70, date_start: '2026-02-05' },
      },
    });

    const clocksToShow = [
      { state: 504, name: 'Comunicación a vecinos', hasLegalAlarm: true },
      { state: 504, name: 'Comunicación a vecinos duplicada', hasLegalAlarm: true },
    ];

    const { result } = renderHook(() =>
      useAlarms(manager, null, clocksToShow, '2026-02-10')
    );

    const alarms504 = result.current.notificationAlarms.filter((a) => a.state === 504 && a.type === 'legal');
    expect(alarms504).toHaveLength(1);
  });

  it('separa notificationAlarms y processAlarms correctamente', () => {
    const manager = makeManager({
      clocksMap: {
        70: { state: 70, date_start: '2026-02-05' },
      },
      curaduriaDetails: {
        status: 'ACTIVO',
        remaining: 2,
        activePhaseName: 'Estudio',
      },
    });

    const clocksToShow = [
      { state: 504, name: 'Comunicación a vecinos', hasLegalAlarm: true },
    ];

    const { result } = renderHook(() =>
      useAlarms(manager, null, clocksToShow, '2026-02-10')
    );

    expect(result.current.notificationAlarms.every((a) => a.type !== 'process')).toBe(true);
    expect(result.current.processAlarms.every((a) => a.type === 'process')).toBe(true);
    expect(result.current.allAlarms.length).toBe(
      result.current.notificationAlarms.length + result.current.processAlarms.length
    );
  });
});
