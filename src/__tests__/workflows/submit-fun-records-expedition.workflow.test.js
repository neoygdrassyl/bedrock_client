/**
 * Workflow Fase 3 — Trazabilidad Cross-Module: Submit → FUN → Records → Expedition
 *
 * Verifica que el fun_id actúa como clave de trazabilidad al cruzar los módulos
 * Submit, FUN, Informes técnicos (LAW / ARC / ENG) y Expedición.
 *
 * También prueba el aislamiento entre licencias concurrentes (sin contaminación
 * de datos entre fun_ids distintos).
 *
 * Todos los requests HTTP son interceptados por MSW (nivel de red).
 * Patrón: AAA — Arrange / Act / Assert
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import ExpeditionService from '../../app/services/expedition.service';
import FunService from '../../app/services/fun.service';
import RecordArcService from '../../app/services/record_arc.service';
import RecordEngService from '../../app/services/record_eng.service';
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

// ── Helper de construcción de FormData ────────────────────────────────────────
function makeFormData(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }
  return form;
}

// ── Suite ─────────────────────────────────────────────────────────────────────
workflowDescribe('Workflow Fase 3 — Trazabilidad Submit → FUN → Records → Expedition', () => {
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
  // TEST 1 — Trazabilidad completa de extremo a extremo
  // ═══════════════════════════════════════════════════════════════════════════
  it('fun_id es la clave de trazabilidad: submit → fun → 3 informes + expedición con área', async () => {
    // ── Arrange & Act: 1. Entrada en ventanilla ────────────────────────────────
    const submitEntry = await SubmitService.create(
      makeFormData({
        type_doc: 'SOLICITUD',
        sender_name: 'Cliente Omega',
        subject: 'Licencia de Modificación Tipo III',
      })
    );

    // ── Act: 2. Licencia FUN vinculada al submit ────────────────────────────────
    const funEntry = await FunService.create(
      makeFormData({ type: 'iii', status: 'RADICADO', submit_id: submitEntry.data.id })
    );
    const funId = funEntry.data.id;

    // ── Act: 3. Vincular submit con la licencia ────────────────────────────────
    await SubmitService.update(
      submitEntry.data.id,
      makeFormData({ fun_id: funId, type_doc: 'RADICACION' })
    );

    // ── Act: 4. Los tres informes técnicos vinculados al mismo fun_id ──────────
    const lawRecord = await RecordLawService.create(
      makeFormData({ fun_id: funId, concept: 'APROBADO' })
    );
    const arcRecord = await RecordArcService.create(
      makeFormData({ fun_id: funId, concept: 'EN_REVISION' })
    );
    const engRecord = await RecordEngService.create(
      makeFormData({ fun_id: funId, concept: 'APROBADO' })
    );

    // ── Act: 5. Expedición con área vinculada ──────────────────────────────────
    const expedition = await ExpeditionService.create(
      makeFormData({ fun_id: funId, doc_type: 'RESOLUCION', status: 'GENERADO' })
    );
    const expArea = await ExpeditionService.create_exp_area(
      makeFormData({ expedition_id: expedition.data.id, area: 'GENERAL' })
    );

    // ── Act: 6. Consultar cada módulo usando fun_id como llave ─────────────────
    const lawByFun   = await RecordLawService.getRecord(funId);
    const arcByFun   = await RecordArcService.getRecord(funId);
    const engByFun   = await RecordEngService.getRecord(funId);
    const expedByFun = await ExpeditionService.getRecord(funId);
    const submitById = await SubmitService.get(submitEntry.data.id);
    const allFun     = await FunService.getAll_fun();

    // ── Assert: IDs secuenciales y trazabilidad de la cadena ──────────────────
    expect(submitEntry.data.id_public).toBe('VR26-0001');
    expect(funEntry.data.id_public).toBe('LC26-0001');
    expect(funEntry.data.submit_id).toBe(submitEntry.data.id);
    expect(submitById.data.fun_id).toBe(funId);
    expect(submitById.data.type_doc).toBe('RADICACION');

    // ── Assert: informes técnicos vinculados correctamente ────────────────────
    expect(lawRecord.data.fun_id).toBe(funId);
    expect(arcRecord.data.fun_id).toBe(funId);
    expect(engRecord.data.fun_id).toBe(funId);

    expect(lawByFun.data).toHaveLength(1);
    expect(arcByFun.data).toHaveLength(1);
    expect(engByFun.data).toHaveLength(1);

    expect(lawByFun.data[0].concept).toBe('APROBADO');
    expect(arcByFun.data[0].concept).toBe('EN_REVISION');
    expect(engByFun.data[0].concept).toBe('APROBADO');

    // ── Assert: expedición con área ────────────────────────────────────────────
    expect(expedition.data.fun_id).toBe(funId);
    expect(expedByFun.data).toHaveLength(1);
    expect(expedByFun.data[0].doc_type).toBe('RESOLUCION');
    expect(expArea.data.expedition_id).toBe(expedition.data.id);
    expect(expArea.data.area).toBe('GENERAL');

    // ── Assert: licencia visible en la lista general ───────────────────────────
    expect(allFun.data).toHaveLength(1);
    expect(allFun.data[0].submit_id).toBe(submitEntry.data.id);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 2 — Aislamiento: dos licencias no se contaminan
  // ═══════════════════════════════════════════════════════════════════════════
  it('dos licencias independientes no comparten informes ni expediciones', async () => {
    // ── Arrange: Licencia A ───────────────────────────────────────────────────
    const submitA = await SubmitService.create(
      makeFormData({ type_doc: 'SOLICITUD', sender_name: 'Cliente A' })
    );
    const funA = await FunService.create(
      makeFormData({ type: 'i', submit_id: submitA.data.id, status: 'RADICADO' })
    );

    // ── Arrange: Licencia B ───────────────────────────────────────────────────
    const submitB = await SubmitService.create(
      makeFormData({ type_doc: 'SOLICITUD', sender_name: 'Cliente B' })
    );
    const funB = await FunService.create(
      makeFormData({ type: 'ii', submit_id: submitB.data.id, status: 'RADICADO' })
    );

    // ── Act: Sólo crear informe LAW para licencia A ────────────────────────────
    await RecordLawService.create(
      makeFormData({ fun_id: funA.data.id, concept: 'EXCLUSIVO_A' })
    );

    // ── Act: Sólo crear expedición para licencia B ────────────────────────────
    await ExpeditionService.create(
      makeFormData({ fun_id: funB.data.id, doc_type: 'ACTO_ADMINISTRATIVO' })
    );

    // ── Act: Consultar desde cada licencia ────────────────────────────────────
    const lawForA    = await RecordLawService.getRecord(funA.data.id);
    const lawForB    = await RecordLawService.getRecord(funB.data.id);
    const expedForA  = await ExpeditionService.getRecord(funA.data.id);
    const expedForB  = await ExpeditionService.getRecord(funB.data.id);

    // ── Assert: licencia A tiene informe, B no ────────────────────────────────
    expect(lawForA.data).toHaveLength(1);
    expect(lawForA.data[0].concept).toBe('EXCLUSIVO_A');
    expect(lawForB.data).toHaveLength(0);

    // ── Assert: licencia B tiene expedición, A no ─────────────────────────────
    expect(expedForB.data).toHaveLength(1);
    expect(expedForB.data[0].doc_type).toBe('ACTO_ADMINISTRATIVO');
    expect(expedForA.data).toHaveLength(0);

    // ── Assert: IDs de ventanilla y licencias son distintos ───────────────────
    expect(submitA.data.id_public).toBe('VR26-0001');
    expect(submitB.data.id_public).toBe('VR26-0002');
    expect(funA.data.id_public).toBe('LC26-0001');
    expect(funB.data.id_public).toBe('LC26-0002');
    expect(funA.data.id).not.toBe(funB.data.id);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST 3 — Multiple informes del mismo tipo vinculados al mismo FUN
  // ═══════════════════════════════════════════════════════════════════════════
  it('pueden existir múltiples informes LAW del mismo fun_id (revisiones)', async () => {
    // ── Arrange ──────────────────────────────────────────────────────────────
    const fun = await FunService.create(
      makeFormData({ type: 'ii', status: 'RADICADO' })
    );
    const funId = fun.data.id;

    // ── Act: dos informes jurídicos para la misma licencia (revisiones) ────────
    await RecordLawService.create(
      makeFormData({ fun_id: funId, concept: 'EN_REVISION' })
    );
    await RecordLawService.create(
      makeFormData({ fun_id: funId, concept: 'APROBADO' })
    );

    const lawRecords = await RecordLawService.getRecord(funId);

    // ── Assert ────────────────────────────────────────────────────────────────
    expect(lawRecords.data).toHaveLength(2);
    expect(lawRecords.data[0].concept).toBe('EN_REVISION');
    expect(lawRecords.data[1].concept).toBe('APROBADO');
    expect(lawRecords.data.every((r) => r.fun_id === funId)).toBe(true);
  });
});
