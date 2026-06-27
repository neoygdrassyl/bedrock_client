/**
 * Workflow Fase 3 — Proceso Legal Completo
 *
 * Cubre el flujo íntegro de una licencia de construcción desde la radicación
 * en ventanilla (Submit) hasta la ejecutoria, pasando por la creación del FUN,
 * los relojes legales clave, un informe jurídico (record_law) y la expedición.
 *
 * Todos los requests HTTP son interceptados por MSW (nivel de red).
 * Patrón: AAA — Arrange / Act / Assert
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import ExpeditionService from '../../app/services/expedition.service';
import FunService from '../../app/services/fun.service';
import RecordLawService from '../../app/services/record_law.service';
import SubmitService from '../../app/services/submit.service';

// ── Infraestructura MSW ──────────────────────────────────────────────────────
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

// ── Helpers de construcción de FormData ────────────────────────────────────
function makeFormData(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }
  return form;
}

// ── Suite ─────────────────────────────────────────────────────────────────────
workflowDescribe('Workflow Fase 3 — Proceso Legal Completo', () => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 1 — Flujo completo con todos los módulos
  // ═══════════════════════════════════════════════════════════════════════════
  it('radicación → FUN → relojes (5 estados) → informe LAW → expedición → consistencia final', async () => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    const CLOCK_SEQUENCE = [
      { state: '0',  date_start: '2026-03-11', description: 'Radicacion' },
      { state: '5',  date_start: '2026-03-12', description: 'Legal y Debida Forma (LDF)' },
      { state: '50', date_start: '2026-03-15', description: 'Inicio estudio tecnico' },
      { state: '70', date_start: '2026-04-20', description: 'Resolucion' },
      { state: '99', date_start: '2026-04-30', description: 'Ejecutoria' },
    ];

    // ── Act: 1. Radicación en ventanilla ─────────────────────────────────────
    const createdSubmit = await SubmitService.create(
      makeFormData({
        type_doc: 'SOLICITUD',
        sender_name: 'Ciudadano Test',
        subject: 'Licencia de Construcción Tipo II',
      })
    );

    // ── Act: 2. Creación de licencia FUN vinculada al submit ──────────────────
    const createdFun = await FunService.create(
      makeFormData({
        type: 'ii',
        status: 'RADICADO',
        submit_id: createdSubmit.data.id,
      })
    );

    // ── Act: 3. Vincular submit con la licencia (RADICACION) ──────────────────
    await SubmitService.update(
      createdSubmit.data.id,
      makeFormData({ fun_id: createdFun.data.id, type_doc: 'RADICACION' })
    );

    // ── Act: 4. Registrar relojes legales clave ────────────────────────────────
    for (const clockEntry of CLOCK_SEQUENCE) {
      await FunService.create_clock(
        makeFormData({ fun_id: createdFun.data.id, ...clockEntry })
      );
    }

    // ── Act: 5. Informe jurídico (record_law) ──────────────────────────────────
    const createdLawRecord = await RecordLawService.create(
      makeFormData({ fun_id: createdFun.data.id, concept: 'APROBADO' })
    );

    // ── Act: 6. Expedición final (resolución) ─────────────────────────────────
    const createdExpedition = await ExpeditionService.create(
      makeFormData({ fun_id: createdFun.data.id, doc_type: 'RESOLUCION', status: 'GENERADO' })
    );

    // ── Act: 7. Consultar estado final de cada módulo ─────────────────────────
    const finalSubmit     = await SubmitService.get(createdSubmit.data.id);
    const timeline        = await FunService.getclockData(createdFun.data.id);
    const lawRecordsByFun = await RecordLawService.getRecord(createdFun.data.id);
    const expedsByFun     = await ExpeditionService.getRecord(createdFun.data.id);

    // ── Assert: IDs y trazabilidad entre módulos ──────────────────────────────
    expect(createdSubmit.data.id_public).toBe('VR26-0001');
    expect(createdFun.data.id_public).toBe('LC26-0001');
    expect(createdFun.data.submit_id).toBe(createdSubmit.data.id);

    expect(finalSubmit.data.fun_id).toBe(createdFun.data.id);
    expect(finalSubmit.data.type_doc).toBe('RADICACION');

    // ── Assert: línea de tiempo de relojes ───────────────────────────────────
    expect(timeline.data).toHaveLength(5);
    expect(timeline.data.map((c) => c.state)).toEqual([0, 5, 50, 70, 99]);
    expect(timeline.data.every((c) => c.fun_id === createdFun.data.id)).toBe(true);

    // ── Assert: informe LAW ───────────────────────────────────────────────────
    expect(createdLawRecord.data.fun_id).toBe(createdFun.data.id);
    expect(lawRecordsByFun.data).toHaveLength(1);
    expect(lawRecordsByFun.data[0].concept).toBe('APROBADO');

    // ── Assert: expedición ────────────────────────────────────────────────────
    expect(createdExpedition.data.fun_id).toBe(createdFun.data.id);
    expect(expedsByFun.data).toHaveLength(1);
    expect(expedsByFun.data[0].doc_type).toBe('RESOLUCION');
    expect(expedsByFun.data[0].status).toBe('GENERADO');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2 — El reloj LDF (state=5) es la referencia del conteo oficial
  // ═══════════════════════════════════════════════════════════════════════════
  it('reloj LDF (state 5) queda registrado con la fecha de inicio correcta tras radicación', async () => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    const fun = await FunService.create(
      makeFormData({ type: 'i', status: 'RADICADO' })
    );

    // ── Act: Registrar sólo radicación y LDF ────────────────────────────────
    await FunService.create_clock(
      makeFormData({ fun_id: fun.data.id, state: '0', date_start: '2026-03-11' })
    );
    await FunService.create_clock(
      makeFormData({ fun_id: fun.data.id, state: '5', date_start: '2026-03-12' })
    );

    const timeline = await FunService.getclockData(fun.data.id);

    // ── Assert ────────────────────────────────────────────────────────────────
    expect(timeline.data.map((c) => c.state)).toEqual([0, 5]);

    const ldfClock = timeline.data.find((c) => c.state === 5);
    expect(ldfClock).toBeDefined();
    expect(ldfClock.date_start).toBe('2026-03-12');
    expect(ldfClock.fun_id).toBe(fun.data.id);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3 — Ausencia de informe LAW hasta que se crea explícitamente
  // ═══════════════════════════════════════════════════════════════════════════
  it('licencia recién radicada no tiene informe LAW asociado hasta que se registra', async () => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    const fun = await FunService.create(
      makeFormData({ type: 'iii', status: 'RADICADO' })
    );

    // ── Act: consultar informes antes de crear ninguno ────────────────────────
    const lawBeforeCreate = await RecordLawService.getRecord(fun.data.id);

    // ── Assert ────────────────────────────────────────────────────────────────
    expect(lawBeforeCreate.data).toHaveLength(0);
  });
});
