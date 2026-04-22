import { afterEach, describe, expect, it, vi } from 'vitest';

const importVarsModule = async (globalId) => {
  vi.resetModules();

  if (globalId === undefined) {
    delete import.meta.env.VITE_GLOBAL_ID;
  } else {
    import.meta.env.VITE_GLOBAL_ID = globalId;
  }

  return import('../app/components/jsons/vars');
};

describe('vars environment fallback', () => {
  afterEach(() => {
    import.meta.env.VITE_GLOBAL_ID = 'cb1';
  });

  it('falls back to cb1 when VITE_GLOBAL_ID is missing', async () => {
    const mod = await importVarsModule(undefined);

    expect(mod.infoCud.city).toBe('Bucaramanga');
    expect(mod.axisVar).toContain('Eje Cra. 33');
  });

  it('falls back to cb1 when VITE_GLOBAL_ID is unknown', async () => {
    const mod = await importVarsModule('unknown-id');

    expect(mod.infoCud.city).toBe('Bucaramanga');
  });
});
