import { describe, expect, it } from 'vitest';

import {
  CLOCK_COLUMN_WIDTHS,
  DEFAULT_CLOCK_COLUMN_VISIBILITY,
  getClockColumnCount,
  getClockGridTemplate,
  getClockTableWidth,
} from '../features/expediente/clocks/components/ClockRow';

const W = CLOCK_COLUMN_WIDTHS;
const BASE_WIDTH = W.EVENT + W.DATE + W.LEGAL_LIMIT + W.LEGAL_ALARM;
const ALL_VISIBLE = { scheduledLimit: true, scheduledAlarm: true, nextStep: true };
const tracks = (template) => template.split(/ (?![^(]*\))/);

describe('columnas opcionales de la tabla de tiempos', () => {
  it('oculta por defecto siguiente paso, alarma programada y limite programado', () => {
    expect(DEFAULT_CLOCK_COLUMN_VISIBILITY).toEqual({
      scheduledLimit: false,
      scheduledAlarm: false,
      nextStep: false,
    });

    expect(getClockTableWidth(DEFAULT_CLOCK_COLUMN_VISIBILITY)).toBe(BASE_WIDTH);
    expect(getClockTableWidth()).toBe(BASE_WIDTH);
    expect(getClockColumnCount()).toBe(4);
  });

  it('suma ancho solo cuando el usuario muestra columnas opcionales', () => {
    expect(getClockTableWidth({ ...DEFAULT_CLOCK_COLUMN_VISIBILITY, scheduledLimit: true })).toBe(BASE_WIDTH + W.SCHEDULED_LIMIT);
    expect(getClockTableWidth({ ...DEFAULT_CLOCK_COLUMN_VISIBILITY, nextStep: true })).toBe(BASE_WIDTH + W.NEXT_STEP);
    expect(getClockTableWidth(ALL_VISIBLE)).toBe(BASE_WIDTH + W.SCHEDULED_LIMIT + W.SCHEDULED_ALARM + W.NEXT_STEP);
    expect(getClockColumnCount(ALL_VISIBLE)).toBe(7);
  });

  it('la plantilla de la grilla tiene una pista por columna visible y la ultima toma el ancho libre', () => {
    const base = tracks(getClockGridTemplate());
    expect(base).toHaveLength(getClockColumnCount());
    expect(base[0]).toMatch(new RegExp(`^minmax\\(${W.EVENT}px,`));
    expect(base.slice(1, -1)).toEqual([`${W.DATE}px`, `${W.LEGAL_LIMIT}px`]);
    expect(base.at(-1)).toBe(`minmax(${W.LEGAL_ALARM}px, 1fr)`);

    const all = tracks(getClockGridTemplate(ALL_VISIBLE));
    expect(all).toHaveLength(getClockColumnCount(ALL_VISIBLE));
    expect(all.at(-1)).toBe(`minmax(${W.NEXT_STEP}px, 1fr)`);
    expect(all).toContain(`${W.LEGAL_ALARM}px`);
  });
});
