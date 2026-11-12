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
    const pending = getClockRowAlarmInfo({ state: 504, isCompleted: false, hasAdministrativeAct: false });
    const overdue = getClockRowAlarmInfo({ state: 504, isCompleted: false, hasAdministrativeAct: true });
    const onTime = getClockRowAlarmInfo({ state: 504, isCompleted: true, hasAdministrativeAct: true });

    expect(pending).toMatchObject({ text: 'Pendiente', icon: 'Hourglass' });
    expect(overdue).toMatchObject({ text: 'Vencida', icon: 'XCircle' });
    expect(onTime).toMatchObject({ text: 'A tiempo', icon: 'Check' });

    // Each status keeps its own tone (design tokens, not literal colours).
    const tones = [pending.color, overdue.color, onTime.color];
    expect(new Set(tones).size).toBe(3);
    tones.forEach((tone) => expect(tone).toMatch(/^var\(--/));
  });

  it('gives no alarm of its own to any other state', () => {
    expect(getClockRowAlarmInfo({ state: 30, isCompleted: false, hasAdministrativeAct: true })).toBeNull();
  });
});
