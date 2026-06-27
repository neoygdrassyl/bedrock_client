import {
  filterCubDictionary,
  normalizeCubDictionaryPayload,
} from '../app/pages/user/dictionary-cub.utils';

describe('dictionary-cub utils', () => {
  const rows = normalizeCubDictionaryPayload([
    {
      cub: 'OE-0101',
      id: '1',
      vr: 'PQRS-2024-0007',
      res: 'RESPUESTA FORMAL DE LA PETICION',
      date: '2026-06-08',
    },
    {
      cub: 'OE-0102',
      id: 'PQRS-15',
      vr: 'PQRSG-99',
      res: 'Carta de confirmación PQRS',
      date: '2026-06-07',
    },
    {
      cub: 'OE-0103',
      id: 'FUN-2024-0088',
      vr: 'VR-001',
      res: 'CARTA LEGAL Y DEBIDA FORMA',
      date: '2026-06-06',
    },
  ]);

  test('normaliza la relación visible para filas PQRS modernas', () => {
    expect(rows[0].relationValue).toBe('PQRS-2024-0007');
    expect(rows[0].isPqrsLike).toBe(true);
  });

  test('filtra PQRS con búsqueda parcial usando el payload real', () => {
    const filtered = filterCubDictionary(rows, '2024-0007', 'pqrs');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].cub).toBe('OE-0101');
  });

  test('filtra FUN por id sin arrastrar filas PQRS placeholder', () => {
    const filtered = filterCubDictionary(rows, 'FUN-2024-0088', 'id');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].cub).toBe('OE-0103');
  });

  test('filtra por CUB con búsqueda acento-insensible y parcial', () => {
    const filtered = filterCubDictionary(rows, 'oe-010', '');

    expect(filtered).toHaveLength(3);
  });
});
