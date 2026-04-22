import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import FunService from '../../app/services/fun.service';

let server;
let resetWorkflowDb;
let hasMsw = true;

try {
  const serverModule = await import('../mocks/server');
  server = serverModule.server;
  resetWorkflowDb = serverModule.resetWorkflowDb;
} catch {
  hasMsw = false;
}

const workflowDescribe = hasMsw ? describe : describe.skip;

function getLegalClockStatus(clockData) {
  const hasSuspensionStart = clockData.some((clock) => clock.state === 300);
  const hasSuspensionEnd = clockData.some((clock) => clock.state === 350);

  if (hasSuspensionStart && !hasSuspensionEnd) {
    return 'PAUSADO';
  }

  return 'ACTIVO';
}

workflowDescribe('Workflow Fase 3 - Reloj legal', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, role: 'ADMIN_TEST' };
  });

  afterEach(() => {
    server.resetHandlers();
    resetWorkflowDb();
    window.user = null;
  });

  afterAll(() => {
    server.close();
  });

  it('inicia, suspende y reanuda un reloj legal conservando el historial', async () => {
    // Arrange
    const funPayload = new FormData();
    funPayload.append('type', 'ii');
    funPayload.append('status', 'RADICADO');
    const createdFun = await FunService.create(funPayload);

    const startPayload = new FormData();
    startPayload.append('fun_id', String(createdFun.data.id));
    startPayload.append('state', '0');
    startPayload.append('date_start', '2026-03-11');

    const suspensionPayload = new FormData();
    suspensionPayload.append('fun_id', String(createdFun.data.id));
    suspensionPayload.append('state', '300');
    suspensionPayload.append('date_start', '2026-03-15');

    const resumePayload = new FormData();
    resumePayload.append('fun_id', String(createdFun.data.id));
    resumePayload.append('state', '350');
    resumePayload.append('date_start', '2026-03-20');

    // Act
    await FunService.create_clock(startPayload);
    await FunService.create_clock(suspensionPayload);

    const pausedTimeline = await FunService.getclockData(createdFun.data.id);
    const pausedStatus = getLegalClockStatus(pausedTimeline.data);

    await FunService.create_clock(resumePayload);
    const resumedTimeline = await FunService.getclockData(createdFun.data.id);
    const resumedStatus = getLegalClockStatus(resumedTimeline.data);

    // Assert
    expect(pausedTimeline.data.map((row) => row.state)).toEqual([0, 300]);
    expect(pausedStatus).toBe('PAUSADO');

    expect(resumedTimeline.data.map((row) => row.state)).toEqual([0, 300, 350]);
    expect(resumedStatus).toBe('ACTIVO');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2 — Proceso de desistimiento (ruta negativa del proceso)
  // Estados: 0 (radicación) → 5 (LDF) → -50 (inicio desistimiento) → -5 (citación)
  // ═══════════════════════════════════════════════════════════════════════════
  it('proceso de desistimiento: radicación → LDF → inicio → citación registra la secuencia completa', async () => {
    // Arrange
    const funPayload = new FormData();
    funPayload.append('type', 'ii');
    funPayload.append('status', 'RADICADO');
    const fun = await FunService.create(funPayload);

    const DESISTIMIENTO_SEQUENCE = [
      { state: '0',   date_start: '2026-03-11' }, // Radicación
      { state: '5',   date_start: '2026-03-12' }, // Legal y Debida Forma
      { state: '-50', date_start: '2026-03-20' }, // Inicio de desistimiento
      { state: '-5',  date_start: '2026-03-27' }, // Citación desistimiento
    ];

    // Act: registrar la secuencia completa de desistimiento
    for (const entry of DESISTIMIENTO_SEQUENCE) {
      const payload = new FormData();
      payload.append('fun_id', String(fun.data.id));
      payload.append('state', entry.state);
      payload.append('date_start', entry.date_start);
      await FunService.create_clock(payload);
    }

    const timeline = await FunService.getclockData(fun.data.id);

    // Assert: secuencia exacta de estados
    expect(timeline.data).toHaveLength(4);
    expect(timeline.data.map((c) => c.state)).toEqual([0, 5, -50, -5]);

    // Assert: todos los relojes pertenecen al mismo fun_id
    expect(timeline.data.every((c) => c.fun_id === fun.data.id)).toBe(true);

    // Assert: los estados clave de desistimiento están presentes
    const hasDesistimientoStart = timeline.data.some((c) => c.state === -50);
    const hasCitacion           = timeline.data.some((c) => c.state === -5);
    expect(hasDesistimientoStart).toBe(true);
    expect(hasCitacion).toBe(true);

    // Assert: el proceso queda en estado ACTIVO (no hay suspensión activa)
    // — el desistimiento no es una suspensión, tienen estados distintos
    expect(getLegalClockStatus(timeline.data)).toBe('ACTIVO');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3 — Ciclo completo de suspensión: inicio → fin verifica conteo correcto
  // ═══════════════════════════════════════════════════════════════════════════
  it('suspensión completada (300→350) con múltiples estados previos no afecta el conteo del proceso', async () => {
    // Arrange
    const funPayload = new FormData();
    funPayload.append('type', 'i');
    funPayload.append('status', 'RADICADO');
    const fun = await FunService.create(funPayload);

    const FULL_SEQUENCE = [
      { state: '0',   date_start: '2026-03-01' }, // Radicación
      { state: '5',   date_start: '2026-03-02' }, // LDF
      { state: '50',  date_start: '2026-03-05' }, // Inicio estudio
      { state: '300', date_start: '2026-03-10' }, // Inicio suspensión
      { state: '350', date_start: '2026-03-25' }, // Fin suspensión
      { state: '70',  date_start: '2026-04-10' }, // Resolución (proceso continúa)
    ];

    // Act
    for (const entry of FULL_SEQUENCE) {
      const payload = new FormData();
      payload.append('fun_id', String(fun.data.id));
      payload.append('state', entry.state);
      payload.append('date_start', entry.date_start);
      await FunService.create_clock(payload);
    }

    const timeline = await FunService.getclockData(fun.data.id);

    // Assert: línea de tiempo completa
    expect(timeline.data).toHaveLength(6);
    expect(timeline.data.map((c) => c.state)).toEqual([0, 5, 50, 300, 350, 70]);

    // Assert: suspensión completa (inicio Y fin presentes) → no está pausado
    const status = getLegalClockStatus(timeline.data);
    expect(status).toBe('ACTIVO');

    // Assert: el reloj de resolución está en la posición final
    const lastClock = timeline.data.at(-1);
    expect(lastClock.state).toBe(70);
    expect(lastClock.date_start).toBe('2026-04-10');
  });
});
