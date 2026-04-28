import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CLOCK_COLUMN_VISIBILITY,
  getClockTableWidth,
} from '../app/pages/user/clocks/components/ClockRow';

describe('columnas opcionales de la tabla de tiempos', () => {
  it('oculta por defecto siguiente paso, alarma programada y limite programado', () => {
    expect(DEFAULT_CLOCK_COLUMN_VISIBILITY).toEqual({
      scheduledLimit: false,
      scheduledAlarm: false,
      nextStep: false,
    });

    expect(getClockTableWidth(DEFAULT_CLOCK_COLUMN_VISIBILITY)).toBe(750);
  });

  it('suma ancho solo cuando el usuario muestra columnas opcionales', () => {
    expect(getClockTableWidth({ scheduledLimit: true, scheduledAlarm: true, nextStep: true })).toBe(1270);
  });
});