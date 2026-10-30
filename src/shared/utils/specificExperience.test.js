import { describe, expect, it } from 'vitest';

import { formatYearsMonths, readSpecificExperience, wholeMonthsBetween } from './specificExperience';

describe('specific experience (5.2.9)', () => {
  it('counts whole calendar months like the server, month ends included', () => {
    expect(wholeMonthsBetween('2010-05-01', '2026-10-30')).toBe(197);
    expect(wholeMonthsBetween('2026-01-31', '2026-02-28')).toBe(1);
    expect(wholeMonthsBetween('2026-01-31', '2026-02-27')).toBe(0);
    expect(wholeMonthsBetween('2026-10-31', '2026-10-30')).toBeNull();
    expect(wholeMonthsBetween('', '2026-10-30')).toBeNull();
  });

  it('reads years and months, blank as empty, and refuses values out of range', () => {
    expect(readSpecificExperience('', ' ')).toEqual({ empty: true });
    expect(readSpecificExperience('3', '')).toEqual({ months: 36 });
    expect(readSpecificExperience('', '4')).toEqual({ months: 4 });
    expect(readSpecificExperience('0', '0')).toEqual({ months: 0 });
    expect(readSpecificExperience('1', '12').problem).toMatch(/meses/);
    expect(readSpecificExperience('-1', '0').problem).toMatch(/años/);
    expect(readSpecificExperience('100', '0').problem).toMatch(/años/);
    expect(readSpecificExperience('1.5', '0').problem).toMatch(/años/);
  });

  it('may reach the general experience since 5.2.7 but not exceed it', () => {
    expect(readSpecificExperience('16', '5', '2010-05-01', '2026-10-30')).toEqual({ months: 197 });
    expect(readSpecificExperience('16', '6', '2010-05-01', '2026-10-30').problem)
      .toBe('La experiencia específica (16 años 6 meses) no puede superar la experiencia general desde la expedición de la matrícula (16 años 5 meses).');
    expect(readSpecificExperience('60', '0', '', '2026-10-30')).toEqual({ months: 720 });
  });

  it('formats months as years and months', () => {
    expect(formatYearsMonths(197)).toBe('16 años 5 meses');
    expect(formatYearsMonths(12)).toBe('1 año');
    expect(formatYearsMonths(1)).toBe('1 mes');
    expect(formatYearsMonths(0)).toBe('0 meses');
  });
});
