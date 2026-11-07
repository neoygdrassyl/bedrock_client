import { describe, expect, it } from 'vitest';

import { certifiedDuration, formatFullDuration } from './experienceDuration';

const span = (years, months, days) => ({ years, months, days });

describe('certifiedDuration (same rule as the server)', () => {
  it('counts the end date as a worked day', () => {
    expect(certifiedDuration('2020-01-01', '2020-12-31')).toEqual(span(1, 0, 0));
    expect(certifiedDuration('2021-03-01', '2021-03-31')).toEqual(span(0, 1, 0));
    expect(certifiedDuration('2021-03-01', '2021-03-01')).toEqual(span(0, 0, 1));
    expect(certifiedDuration('2019-12-31', '2020-01-01')).toEqual(span(0, 0, 2));
    expect(certifiedDuration('2020-02-01', '2020-02-29')).toEqual(span(0, 1, 0));
    expect(certifiedDuration('2010-05-01', '2026-10-29')).toEqual(span(16, 5, 29));
  });

  it('is null for a missing or unreal date and for an end before the start', () => {
    expect(certifiedDuration('', '2021-01-01')).toBeNull();
    expect(certifiedDuration('2021-02-30', '2021-03-01')).toBeNull();
    expect(certifiedDuration('2021-03-02', '2021-03-01')).toBeNull();
  });

  it('writes every part, zeros included', () => {
    expect(formatFullDuration(span(1, 0, 0))).toBe('1 año 0 meses 0 días');
    expect(formatFullDuration(span(2, 1, 1))).toBe('2 años 1 mes 1 día');
    expect(formatFullDuration(null)).toBe('—');
  });
});
