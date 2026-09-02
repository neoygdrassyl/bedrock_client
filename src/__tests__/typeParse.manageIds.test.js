import { describe, expect, test, vi } from 'vitest';

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    serials: { end: 'CUB' },
  },
}));

describe('_MANAGE_IDS', () => {
  test('incrementa CUB con guion manteniendo formato canonico', async () => {
    const { _MANAGE_IDS } = await import('../app/components/customClasses/typeParse');

    expect(_MANAGE_IDS('CUB26-1608', 'end')).toBe('CUB26-1609');
  });

  test('incrementa CUB compacto sin producir NaN y normaliza con guion', async () => {
    const { _MANAGE_IDS } = await import('../app/components/customClasses/typeParse');

    expect(_MANAGE_IDS('CUB261608', 'end')).toBe('CUB26-1609');
  });

  test('recupera CUB compacto contaminado con sufijo NaN y lo normaliza', async () => {
    const { _MANAGE_IDS } = await import('../app/components/customClasses/typeParse');

    expect(_MANAGE_IDS('CUB261608-NaN', 'end')).toBe('CUB26-1609');
    expect(_MANAGE_IDS('CUB261608-0NaN', 'end')).toBe('CUB26-1609');
  });

  test('evita NaN en CUB canonico contaminado', async () => {
    const { _MANAGE_IDS } = await import('../app/components/customClasses/typeParse');

    expect(_MANAGE_IDS('CUB26-1608abc', 'end')).toBe('CUB26-1609');
    expect(_MANAGE_IDS('CUB26-0NaN', 'end')).toBe('CUB26-0001');
    expect(_MANAGE_IDS('CUB26-NaN', 'end')).toBe('CUB26-0001');
  });
});
