import { describe, expect, test } from 'vitest';

import {
  getLicenseCompletionClock,
  getPaymentDateRows,
  getPrimaryPaymentDate,
} from '../app/pages/user/shared/processClosure.helpers';

describe('process closure helpers', () => {
  test('prioritizes ejecutoria clock 99 over delivery clock 98', () => {
    const result = getLicenseCompletionClock({
      fun_clocks: [
        { state: 98, date_start: '2026-05-02' },
        { state: 99, date_start: '2026-05-01' },
      ],
    });

    expect(result.state).toBe(99);
    expect(result.dateStart).toBe('2026-05-01');
    expect(result.label).toBe('Ejecutoria - Licencia');
  });

  test('uses delivery clock 98 when ejecutoria clock 99 is missing', () => {
    const result = getLicenseCompletionClock({
      fun_clocks: [{ state: 98, date_start: '2026-05-02' }],
    });

    expect(result.state).toBe(98);
    expect(result.dateStart).toBe('2026-05-02');
    expect(result.label).toBe('Entrega de Licencia');
  });

  test('returns every payment date with visible fallbacks', () => {
    const rows = getPaymentDateRows({
      clock_payment: '2026-01-01',
      clock_pay_62: '2026-02-01',
      clock_pay_63: null,
      clock_pay_64: '2026-03-01',
      clock_pay_65: undefined,
      clock_pay_69: '2026-04-01',
    });

    expect(rows.map(row => row.key)).toEqual(['fixed', 'variable', 'municipal', 'uis', 'duties', 'last']);
    expect(rows.map(row => row.value)).toEqual([
      '2026-01-01',
      '2026-02-01',
      '—',
      '2026-03-01',
      '—',
      '2026-04-01',
    ]);
    expect(getPrimaryPaymentDate({ clock_pay_69: '2026-04-01', clock_payment: '2026-01-01' })).toBe('2026-04-01');
  });
});
