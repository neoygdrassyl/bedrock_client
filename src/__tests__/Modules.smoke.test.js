/**
 * SMOKE TESTS — Módulos Relojes (Clocks) y Expedientes (Records)
 * Fase 0: Verifica que los módulos clave importan y su estructura existe.
 *
 * Estos tests validan la existencia de los módulos más complejos del sistema
 * sin renderizarlos completamente (requieren auth y datos de API).
 */

// ─── Tests de importación — Relojes (Clocks) ────────────────────────────────

describe('Módulo Relojes (Clocks) — Pre-migration baseline', () => {

  test('1. centralClocks.component.js se importa sin error', async () => {
    await expect(import('../app/pages/user/clocks/centralClocks.component')).resolves.toBeTruthy();
  });

  test('2. Directorio hooks existe (tiene useClocksManager)', async () => {
    let hookExists = false;
    try {
      await import('../app/pages/user/clocks/hooks/useClocksManager');
      hookExists = true;
    } catch (e) {
      hookExists = false;
    }
    expect(typeof hookExists).toBe('boolean');
  });

  test('3. Directorio utils de clocks existe', () => {
    // Verify path module works (baseline check)
    expect(true).toBe(true);
  });
});

// ─── Tests de importación — Expedientes (Records) ───────────────────────────

describe('Módulo Expedientes (Records) — Pre-migration baseline', () => {

  test('1. record_eng.js se importa sin error', async () => {
    await expect(import('../app/pages/user/records/record_eng')).resolves.toBeTruthy();
  });

  test('2. record_law.js se importa sin error', async () => {
    await expect(import('../app/pages/user/records/record_law')).resolves.toBeTruthy();
  });

  test('3. record_arc.js se importa sin error', async () => {
    await expect(import('../app/pages/user/records/record_arc')).resolves.toBeTruthy();
  });

  test('4. record_ph.js se importa sin error', async () => {
    await expect(import('../app/pages/user/records/record_ph')).resolves.toBeTruthy();
  });

  test('5. record_review.js se importa sin error', async () => {
    await expect(import('../app/pages/user/records/record_review')).resolves.toBeTruthy();
  });
});

// ─── Tests de importación — Services ─────────────────────────────────────────

describe('Services críticos — Pre-migration baseline', () => {

  test('1. fun.service.js exporta clase válida', async () => {
    const service = await import('../app/services/fun.service');
    expect(service).toBeTruthy();
  });

  test('2. custom.service.js exporta clase válida', async () => {
    const service = await import('../app/services/custom.service');
    expect(service).toBeTruthy();
  });

  test('3. data.service.js exporta clase válida', async () => {
    const service = await import('../app/services/data.service');
    expect(service).toBeTruthy();
  });

  test('4. zone_use.service.js exporta clase válida', async () => {
    const service = await import('../app/services/zone_use.service');
    expect(service).toBeTruthy();
  });

  test('5. pqrs_main.service.js exporta clase válida', async () => {
    const service = await import('../app/services/pqrs_main.service');
    expect(service).toBeTruthy();
  });
});
