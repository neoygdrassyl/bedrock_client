import { afterEach, describe, expect, it } from 'vitest';
import holidaysData from '../app/components/jsons/holydaysmoment.json';
import {
  addBusinessCalendarCustomDay,
  DiasHabilesColombia,
  removeBusinessCalendarCustomDay,
  replaceBusinessCalendarCustomDays,
  replaceBusinessCalendarHolidays,
} from '../app/utils/BusinessDaysCol';

describe('dynamic business calendar registry', () => {
  afterEach(() => {
    replaceBusinessCalendarHolidays(holidaysData.holidays);
    replaceBusinessCalendarCustomDays([], Array.from({ length: 20 }, (_, index) => 2020 + index));
  });

  it('invalidates existing calculators when synchronized holidays change', () => {
    const calculator = new DiasHabilesColombia();
    replaceBusinessCalendarHolidays(['2026-07-13']);

    expect(calculator.esHabil('2026-07-13')).toBe(false);
    expect(calculator.sumarDiasHabiles('2026-07-10', 1)).toBe('2026-07-14');
    expect(calculator.esFestivo('2025-12-25')).toBe(true);
  });

  it('continues excluding Saturdays and Sundays after a dynamic update', () => {
    const calculator = new DiasHabilesColombia();
    replaceBusinessCalendarHolidays([]);

    expect(calculator.esHabil('2026-07-11')).toBe(false);
    expect(calculator.esHabil('2026-07-12')).toBe(false);
  });

  it('can clear a synchronized year even when the source contains no holidays', () => {
    const calculator = new DiasHabilesColombia();

    replaceBusinessCalendarHolidays([], [2026]);

    expect(calculator.esFestivo('2026-07-13')).toBe(false);
    expect(calculator.esFestivo('2025-12-25')).toBe(true);
  });

  it('excludes and restores a custom non-business day immediately', () => {
    const calculator = new DiasHabilesColombia();

    addBusinessCalendarCustomDay({ date: '2026-09-04', reason: 'Cierre institucional' });
    expect(calculator.esHabil('2026-09-04')).toBe(false);

    removeBusinessCalendarCustomDay('2026-09-04');
    expect(calculator.esHabil('2026-09-04')).toBe(true);
  });
});
