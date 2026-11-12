import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAlarms } from '../features/expediente/clocks/hooks/useAlarms';
import { FUN_0_TYPE_TIME } from '../features/expediente/clocks/hooks/useClocksManager';
import { ALARM_SUGGESTIONS } from '../features/expediente/clocks/config/alarms.definitions';
import { calculateLegalLimit } from '../features/expediente/clocks/utils/scheduleUtils';

vi.mock('../features/expediente/clocks/utils/scheduleUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, calculateLegalLimit: vi.fn(actual.calculateLegalLimit) };
});

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

  it('usa la sugerencia de vencido para una actividad binaria vencida', () => {
    const manager = makeManager({
      clocksMap: { 70: { state: 70, date_start: '2026-02-05' } },
    });
    const clocksToShow = [{ state: 504, name: 'Comunicación a vecinos', hasLegalAlarm: true }];

    const { result } = renderHook(() => useAlarms(manager, null, clocksToShow, '2026-02-10'));

    const alarm504 = result.current.notificationAlarms.find((a) => a.state === 504);
    // remainingDays is 0 for the binary overdue case, yet the copy must be the overdue one.
    expect(alarm504.remainingDays).toBe(0);
    expect(alarm504.statusText).toBe('Vencida');
    const expected = ALARM_SUGGESTIONS[504]?.legal?.vencido ?? ALARM_SUGGESTIONS.default.legal.vencido;
    expect(alarm504.suggestion).toBe(expected.suggestion);
  });
});

describe('useAlarms - alarmas legales con días hábiles firmados', () => {
  // Feb 2026 has no Colombian holidays. 2026-02-09 is Monday, 2026-02-10 Tuesday.
  const legalClock = [{ state: 3, name: 'Legal y debida forma', hasLegalAlarm: true }];

  afterEach(() => {
    vi.mocked(calculateLegalLimit).mockReset();
  });

  const renderLegal = ({ limit, today, clocksMap = {} }) => {
    vi.mocked(calculateLegalLimit).mockReturnValue(limit);
    const manager = makeManager({ clocksMap, curaduriaDetails: { status: 'ACTIVO', remaining: 50 } });
    const { result } = renderHook(() => useAlarms(manager, null, legalClock, today));
    return result.current.notificationAlarms.find((a) => a.state === 3 && a.type === 'legal');
  };

  it('reporta -1 para un evento pendiente vencido hace un día hábil', () => {
    const alarm = renderLegal({ limit: '2026-02-09', today: '2026-02-10' });
    expect(alarm.remainingDays).toBe(-1);
    expect(alarm.severity).toBe('danger');
    expect(alarm.completedLate).toBe(false);
    expect(alarm.suggestion).toBe(ALARM_SUGGESTIONS.default.legal.vencido.suggestion);
  });

  it('reporta -N días hábiles para un evento pendiente vencido hace varios días', () => {
    // Business days after Mon 2026-02-02 up to Tue 2026-02-10: 3,4,5,6,9,10 = 6.
    const alarm = renderLegal({ limit: '2026-02-02', today: '2026-02-10' });
    expect(alarm.remainingDays).toBe(-6);
    expect(alarm.severity).toBe('danger');
  });

  it('reporta 0 cuando el límite es hoy (sin marcarlo como vencido)', () => {
    const alarm = renderLegal({ limit: '2026-02-10', today: '2026-02-10' });
    expect(alarm.remainingDays).toBe(0);
    expect(alarm.suggestion).toBe(ALARM_SUGGESTIONS.default.legal.porVencer.suggestion);
  });

  it('marca completedLate y no pide registrar la fecha para un evento completado tarde', () => {
    const alarm = renderLegal({
      limit: '2026-02-09',
      today: '2026-02-20',
      clocksMap: { 3: { state: 3, date_start: '2026-02-11' } },
    });
    expect(alarm.remainingDays).toBe(-2);
    expect(alarm.completedLate).toBe(true);
    expect(alarm.suggestion).toContain('2 día(s) hábil(es) después del límite legal');
  });
});
