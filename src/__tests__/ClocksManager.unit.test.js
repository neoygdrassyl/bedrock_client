import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClocksManager } from '../app/pages/user/clocks/hooks/useClocksManager';

const baseItem = {
  id: 1,
  type: 'ii',
  date: '2026-01-16',
};

const baseSystemDate = '2026-02-10';

describe('useClocksManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.user = null;
  });

  it('retorna ACTIVO en radicacion cuando no hay clocks pero existe fecha base', () => {
    const { result } = renderHook(() =>
      useClocksManager(baseItem, [], 1, baseSystemDate)
    );

    expect(result.current.curaduriaDetails.status).toBe('ACTIVO');
    expect(result.current.curaduriaDetails.notStarted).toBe(false);
    expect(result.current.canAddSuspension).toBe(false);
  });

  it('retorna DESISTIDO cuando existe evento negativo', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: -50, date_start: '2026-01-25', version: '-5' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    expect(result.current.curaduriaDetails.status).toBe('DESISTIDO');
    expect(result.current.isDesisted).toBe(true);
  });

  it('detecta suspension pre-acta activa cuando existe 300 sin 350', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 3, state: 300, date_start: '2026-01-25', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    expect(result.current.suspensionPreActa.exists).toBe(true);
    expect(result.current.suspensionPreActa.isActive).toBe(true);
  });

  it('calcula dias de suspension cuando hay 300 y 350', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 3, state: 300, date_start: '2026-01-25', version: '1' },
      { id: 4, state: 350, date_start: '2026-02-05', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    expect(result.current.suspensionPreActa.days).toBeGreaterThan(0);
    expect(result.current.totalSuspensionDays).toBe(result.current.suspensionPreActa.days);
  });

  it('bloquea nueva extension cuando ya existe extension', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 3, state: 400, date_start: '2026-01-28', version: '1' },
      { id: 4, state: 401, date_start: '2026-01-30', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    expect(result.current.extension.exists).toBe(true);
    expect(result.current.canAddExtension).toBe(false);
  });

  it('getClock y getClockVersion devuelven el reloj correcto', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-22', version: '2' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 2, baseSystemDate)
    );

    expect(result.current.getClock(5)?.id).toBe(1);
    expect(result.current.getClockVersion(5, 2)?.id).toBe(2);
  });

  it('calculateDaysSpent usa spentDaysConfig.startState para calcular dias', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 30, date_start: '2026-01-28', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    const spent = result.current.calculateDaysSpent(
      { spentDaysConfig: { startState: 5 } },
      { date_start: '2026-01-28' }
    );

    expect(spent).not.toBeNull();
    expect(spent.days).toBeGreaterThan(0);
    expect(spent.startDate).toBe('2026-01-20');
  });

  it('calculateDaysSpent retorna null cuando falta config o fecha del clock', () => {
    const { result } = renderHook(() =>
      useClocksManager(baseItem, [], 1, baseSystemDate)
    );

    expect(result.current.calculateDaysSpent({}, { date_start: '2026-01-28' })).toBeNull();
    expect(result.current.calculateDaysSpent({ spentDaysConfig: { startState: 5 } }, null)).toBeNull();
  });

  it('marca VENCIDO cuando la fase activa supera los dias permitidos', () => {
    const { result } = renderHook(() =>
      useClocksManager(baseItem, [], 1, '2026-05-15')
    );

    expect(result.current.curaduriaDetails.status).toBe('VENCIDO');
    expect(result.current.curaduriaDetails.remaining).toBeLessThan(0);
  });

  it.each([
    ['i', 20],
    ['ii', 25],
    ['iii', 35],
    ['iv', 45],
    ['oa', 15],
  ])('viaTime usa baseDays por tipo %s', (type, expected) => {
    const item = { ...baseItem, type };
    const clocksData = [{ id: 1, state: 5, date_start: '2026-01-20', version: '1' }];

    const { result } = renderHook(() =>
      useClocksManager(item, clocksData, 1, baseSystemDate)
    );

    expect(result.current.viaTime).toBe(expected);
  });

  it('viaTime suma suspensiones y extension cerradas al total legal', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 30, date_start: '2026-01-27', version: '1' },
      { id: 3, state: 300, date_start: '2026-01-28', version: '1' },
      { id: 4, state: 350, date_start: '2026-02-03', version: '1' },
      { id: 5, state: 400, date_start: '2026-02-04', version: '1' },
      { id: 6, state: 401, date_start: '2026-02-06', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    expect(result.current.totalSuspensionDays).toBeGreaterThan(0);
    expect(result.current.extension.days).toBeGreaterThan(0);
    expect(result.current.viaTime).toBeGreaterThan(0);
  });

  it('permite agregar suspension cuando hay fase de curaduria activa y menos de 10 dias suspendidos', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 3, state: 300, date_start: '2026-01-28', version: '1' },
      { id: 4, state: 350, date_start: '2026-01-29', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, '2026-02-05')
    );

    expect(result.current.totalSuspensionDays).toBeLessThan(10);
    expect(result.current.canAddSuspension).toBe(true);
  });

  it('bloquea agregar suspension cuando ya alcanzo 10 o mas dias suspendidos', () => {
    const clocksData = [
      { id: 1, state: 0, date_start: '2026-01-16', version: '1' },
      { id: 2, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 3, state: 300, date_start: '2026-01-21', version: '1' },
      { id: 4, state: 350, date_start: '2026-02-05', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, '2026-02-10')
    );

    expect(result.current.totalSuspensionDays).toBeGreaterThanOrEqual(10);
    expect(result.current.canAddSuspension).toBe(false);
  });

  it('usa el estado mas reciente en calculateDaysSpent cuando startState es arreglo', () => {
    const clocksData = [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 30, date_start: '2026-01-24', version: '1' },
      { id: 3, state: 35, date_start: '2026-01-29', version: '1' },
    ];

    const { result } = renderHook(() =>
      useClocksManager(baseItem, clocksData, 1, baseSystemDate)
    );

    const spent = result.current.calculateDaysSpent(
      { spentDaysConfig: { startState: [5, 30] } },
      { date_start: '2026-01-29' }
    );

    expect(spent).not.toBeNull();
    expect(spent.startDate).toBe('2026-01-24');
    expect(spent.days).toBeGreaterThan(0);
  });

  it('maneja item sin type usando fallback de 45 dias para viaTime', () => {
    const itemWithoutType = { id: 2, date: '2026-01-16' };
    const clocksData = [{ id: 1, state: 5, date_start: '2026-01-20', version: '1' }];

    const { result } = renderHook(() =>
      useClocksManager(itemWithoutType, clocksData, 1, baseSystemDate)
    );

    expect(result.current.viaTime).toBe(45);
  });
});
