import { describe, expect, it } from 'vitest';
import { buildMonthGrid, colombiaDate, describeCalendarDay, getDayVisualState, visualStateClasses } from './business-calendar.utils';

describe('business calendar utilities', () => {
  const holidays = new Map([['2026-07-13', 'Festivo extraordinario']]);
  const customDays = new Map([['2026-09-04', { date: '2026-09-04', reason: 'Cierre institucional' }]]);

  it('uses the Colombia civil date near the UTC day boundary', () => {
    expect(colombiaDate(new Date('2026-07-14T03:30:00Z'))).toBe('2026-07-13');
  });

  it('marks July 13 as a holiday and not as a business day', () => {
    const state = getDayVisualState('2026-07-13', holidays, customDays, '2026-07-28');

    expect(state.kind).toBe('holiday');
    expect(state.isBusinessDay).toBe(false);
  });

  it('marks Saturdays and Sundays as non-business weekend days', () => {
    expect(getDayVisualState('2026-07-11', holidays, customDays, '2026-07-28')).toMatchObject({ kind: 'weekend', isBusinessDay: false });
    expect(getDayVisualState('2026-07-12', holidays, customDays, '2026-07-28')).toMatchObject({ kind: 'weekend', isBusinessDay: false });
  });

  it('keeps official and custom colors when those dates are today', () => {
    const official = getDayVisualState('2026-07-13', holidays, customDays, '2026-07-13');
    const custom = getDayVisualState('2026-09-04', holidays, customDays, '2026-09-04');

    expect(official).toMatchObject({ kind: 'holiday', isToday: true });
    expect(custom).toMatchObject({ kind: 'custom', isToday: true, customReason: 'Cierre institucional' });
    expect(visualStateClasses(custom.kind, custom.isToday)).toContain('emerald');
    expect(visualStateClasses(custom.kind, custom.isToday)).toContain('orange');
    expect(describeCalendarDay('2026-07-13', holidays, customDays, '2026-07-13')).toContain('Festivo extraordinario');
  });

  it('marks a normal current day orange and interactive', () => {
    expect(getDayVisualState('2026-07-28', holidays, customDays, '2026-07-28')).toMatchObject({
      kind: 'today', isBusinessDay: true, isInteractive: true,
    });
  });

  it('builds December with adjacent January dates for year navigation continuity', () => {
    const grid = buildMonthGrid(2026, 11);

    expect(grid).toHaveLength(42);
    expect(grid.at(-1).date.startsWith('2027-01-')).toBe(true);
    expect(grid.at(-1).outsideMonth).toBe(true);
  });
});
