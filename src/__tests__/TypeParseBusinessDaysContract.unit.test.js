import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  dateParser_dateDiff,
  dateParser_timeLeft,
  dateParser_timePassed,
} from '../app/components/customClasses/typeParse';

describe('typeParse legacy business day contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dateParser_dateDiff mantiene el signo historico para rangos ascendentes y descendentes', () => {
    expect(dateParser_dateDiff('2026-01-20', '2026-01-28')).toBe(6);
    expect(dateParser_dateDiff('2026-01-28', '2026-01-20')).toBe(-6);
    expect(dateParser_dateDiff('2026-01-28', '2026-01-20', true)).toBe(6);
  });

  it('dateParser_timePassed es positivo para fechas pasadas y negativo para fechas futuras', () => {
    expect(dateParser_timePassed('2026-01-20')).toBe(6);
    expect(dateParser_timePassed('2026-02-05')).toBe(-6);
  });

  it('dateParser_timeLeft conserva signo positivo antes del vencimiento y negativo al vencerse', () => {
    expect(dateParser_timeLeft('2026-01-20', 10)).toBe(4);
    expect(dateParser_timeLeft('2026-01-22', 2)).toBe(-2);
  });
});