import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calcularDiasHabiles,
  FUN_0_TYPE_TIME,
  sumarDiasHabiles,
} from '../app/pages/user/clocks/hooks/useClocksManager';

describe('BusinessDays utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.user = null;
  });

  describe('calcularDiasHabiles', () => {
    it.each([
      ['2026-03-02', '2026-03-02', false, 0, 'mismo dia sin incluir inicio'],
      ['2026-03-02', '2026-03-02', true, 1, 'mismo dia incluyendo inicio'],
      ['2026-03-02', '2026-03-06', false, 4, 'lunes a viernes'],
      ['2026-03-06', '2026-03-09', false, 1, 'viernes a lunes salta fin de semana'],
      ['2026-05-01', '2026-05-01', true, 0, 'festivo no se cuenta'],
      ['2026-04-01', '2026-04-06', false, 1, 'rango con jueves y viernes santo'],
    ])(
      'de %s a %s (include=%s) retorna %s: %s',
      (start, end, include, expected) => {
        expect(calcularDiasHabiles(start, end, include)).toBe(expected);
      }
    );

    it('retorna 0 cuando la fecha fin es anterior a la inicial', () => {
      expect(calcularDiasHabiles('2026-03-10', '2026-03-05')).toBe(0);
    });

    it('retorna 0 cuando faltan fechas', () => {
      expect(calcularDiasHabiles(null, '2026-03-10')).toBe(0);
      expect(calcularDiasHabiles('2026-03-10', null)).toBe(0);
    });
  });

  describe('sumarDiasHabiles', () => {
    it.each([
      ['i', 20],
      ['ii', 25],
      ['iii', 35],
      ['iv', 45],
      ['oa', 15],
    ])('suma exactamente los dias habiles de tipo %s', (type, expectedDays) => {
      const start = '2026-03-02';
      const resultDate = sumarDiasHabiles(start, FUN_0_TYPE_TIME[type]);

      expect(calcularDiasHabiles(start, resultDate, false)).toBe(expectedDays);
    });

    it('salta festivos al sumar dias', () => {
      const start = '2026-04-01';
      const resultDate = sumarDiasHabiles(start, 1);

      expect(resultDate).toBe('2026-04-06');
    });

    it('si dias es 0 retorna la misma fecha', () => {
      expect(sumarDiasHabiles('2026-03-02', 0)).toBe('2026-03-02');
    });

    it('si fechaInicio es null retorna null', () => {
      expect(sumarDiasHabiles(null, 5)).toBeNull();
    });

    it('si dias es negativo delega a resta de dias habiles', () => {
      expect(sumarDiasHabiles('2026-03-10', -3)).toBe('2026-03-05');
    });
  });
});
