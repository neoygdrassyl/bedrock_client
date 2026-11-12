import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { formatDisplayDate } from './formatDisplayDate';

describe('formatDisplayDate', () => {
  it('formats an ISO date as dd/mm/yyyy without shifting the day', () => {
    expect(formatDisplayDate('2026-02-25')).toBe('25/02/2026');
    expect(formatDisplayDate('2026-01-01')).toBe('01/01/2026');
    expect(formatDisplayDate('2026-02-25', { withTime: true })).toBe('25/02/2026');
  });

  it('formats an ISO datetime with timezone in local time', () => {
    const value = '2026-02-25T12:00:00.000Z';
    expect(formatDisplayDate(value)).toBe(dayjs(value).format('DD/MM/YYYY'));
    expect(formatDisplayDate(value, { withTime: true })).toBe(dayjs(value).format('DD/MM/YYYY HH:mm'));
    expect(formatDisplayDate('2026-02-25 08:05:00', { withTime: true })).toBe('25/02/2026 08:05');
  });

  it('returns already formatted or free text unchanged', () => {
    expect(formatDisplayDate('25/02/2026')).toBe('25/02/2026');
    expect(formatDisplayDate('Sin fecha')).toBe('Sin fecha');
  });

  it('returns the empty placeholder for empty values', () => {
    expect(formatDisplayDate('')).toBe('—');
    expect(formatDisplayDate(null)).toBe('—');
    expect(formatDisplayDate(undefined)).toBe('—');
    expect(formatDisplayDate('null')).toBe('—');
    expect(formatDisplayDate('', { empty: '' })).toBe('');
  });

  it('returns invalid dates as the original text', () => {
    expect(formatDisplayDate('2026-13-45T99:99')).toBe('2026-13-45T99:99');
    expect(formatDisplayDate('abc')).toBe('abc');
    expect(formatDisplayDate(new Date('invalid'))).toBe('—');
  });
});
