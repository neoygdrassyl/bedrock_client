import { describe, expect, it } from 'vitest';

import { formatDuration, formatMonthsDuration } from './durationText';
import { formatFullDuration } from '@/features/professional-registry/experienceDuration';
import { formatDuration as registryFormatDuration } from '@/features/professional-registry/professionalRegistry.utils';
import { formatYearsMonths } from './specificExperience';
import { experienceDuration, registryUtils, specificExperience } from './__fixtures__/calendarReference';

// One formatDuration(duration, options) replaced three formatters; each caller must keep its exact text.

const DURATIONS = [null, undefined, {}, { years: 1 }, { days: 2 }, { years: -1, months: 0, days: 1 }, { years: 0, months: 0, days: 0.5 }];
for (let years = 0; years <= 3; years += 1) {
  for (let months = 0; months <= 13; months += 1) {
    for (let days = 0; days <= 31; days += 1) DURATIONS.push({ years, months, days });
  }
}
DURATIONS.push({ years: 99, months: 11, days: 30 }, { years: '1', months: '0', days: '' });

const MONTH_COUNTS = [null, undefined, NaN, '13', '', 1.5, -1, -12, -13, -0];
for (let months = 0; months <= 1300; months += 1) MONTH_COUNTS.push(months);

const differences = (inputs, current, old) => inputs.filter((input) => current(input) !== old(input));

describe('formatDuration', () => {
  it('reproduces the three old formatters on every input', () => {
    expect(differences(DURATIONS, registryFormatDuration, registryUtils.formatDuration)).toEqual([]);
    expect(differences(DURATIONS, formatFullDuration, experienceDuration.formatFullDuration)).toEqual([]);
    expect(differences(MONTH_COUNTS, formatYearsMonths, specificExperience.formatYearsMonths)).toEqual([]);
    expect(differences(MONTH_COUNTS, formatMonthsDuration, specificExperience.formatYearsMonths)).toEqual([]);
  });

  it('leaves the zeros out by default and shows them on request', () => {
    expect(formatDuration({ years: 2, months: 0, days: 3 })).toBe('2 años 3 días');
    expect(formatDuration({ years: 0, months: 0, days: 0 })).toBe('0 días');
    expect(formatDuration({ years: 1, months: 0, days: 0 }, { zeros: true })).toBe('1 año 0 meses 0 días');
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(null, { missing: 'Sin dato' })).toBe('Sin dato');
    expect(formatDuration({ years: 0, months: 1, days: 5 }, { units: ['years', 'months'], empty: '0 meses' })).toBe('1 mes');
    expect(formatMonthsDuration(0)).toBe('0 meses');
    expect(formatMonthsDuration(27)).toBe('2 años 3 meses');
  });
});
