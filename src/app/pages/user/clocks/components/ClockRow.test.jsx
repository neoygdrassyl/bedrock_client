import { describe, expect, it } from 'vitest';

import { formatClockDate, getClockRowAlarmInfo } from './ClockRow';

describe('ClockRow date and alarm display', () => {
  it.each([0, 1, new Date(0), new Date(1)])('does not render epoch sentinels as dates: %s', (value) => {
    expect(formatClockDate(value)).toBe('- -');
  });

  it('keeps valid dates visible', () => {
    expect(formatClockDate('2026-07-24')).toBe('24/07/2026');
  });

  it('keeps state 504 alarm independent from a legal limit date', () => {
    expect(getClockRowAlarmInfo({
      state: 504,
      isCompleted: false,
      hasAdministrativeAct: false,
    })).toEqual({ text: 'Pendiente', color: '#f08c00', icon: 'Hourglass' });

    expect(getClockRowAlarmInfo({
      state: 504,
      isCompleted: false,
      hasAdministrativeAct: true,
    })).toEqual({ text: 'Vencida', color: '#e03131', icon: 'XCircle' });
  });
});
