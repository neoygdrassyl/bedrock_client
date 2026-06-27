import { describe, expect, it } from 'vitest';

import { extractConfirmLegalProcessData, normalizeDateInputValue } from '../app/pages/user/fun_forms/components/fun_doc_confirmlegal';

describe('extractConfirmLegalProcessData', () => {
  it('devuelve un payload vacio cuando no existe la relacion legal esperada', () => {
    expect(extractConfirmLegalProcessData([])).toEqual({
      cub: '',
      id: null,
      vr: '',
    });
  });

  it('extrae solo el proceso de carta legal y debida forma', () => {
    expect(extractConfirmLegalProcessData([
      { id: 1, process: 'OTRO', vr: 'VR-0', cub: 'CUB-0' },
      { id: 2, process: 'CARTA LEGAL Y DEBIDA FORMA', vr: 'VR-1', cub: 'CUB-1' },
    ])).toEqual({
      cub: 'CUB-1',
      id: 2,
      vr: 'VR-1',
    });
  });
});

describe('normalizeDateInputValue', () => {
  it('convierte null a string vacio para inputs controlados de fecha', () => {
    expect(normalizeDateInputValue(null)).toBe('');
  });

  it('conserva el valor original cuando ya existe una fecha', () => {
    expect(normalizeDateInputValue('2026-06-23')).toBe('2026-06-23');
  });
});
