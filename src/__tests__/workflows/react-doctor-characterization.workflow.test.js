import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import ExpeditionService from '../../app/services/expedition.service';
import FunService from '../../app/services/fun.service';
import RecordLawService from '../../app/services/record_law.service';
import SubmitService from '../../app/services/submit.service';

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

function makeFormData(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }
  return form;
}

workflowDescribe('React Doctor characterization workflow', () => {
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

  it('keeps fun_id traceability from submit to record and expedition', async () => {
    const submitEntry = await SubmitService.create(
      makeFormData({
        type_doc: 'SOLICITUD',
        sender_name: 'Cliente React Doctor',
        subject: 'Caracterizacion previa a mitigacion',
      }),
    );

    const funEntry = await FunService.create(
      makeFormData({ type: 'ii', status: 'RADICADO', submit_id: submitEntry.data.id }),
    );
    const funId = funEntry.data.id;

    await SubmitService.update(
      submitEntry.data.id,
      makeFormData({ fun_id: funId, type_doc: 'RADICACION' }),
    );

    const lawRecord = await RecordLawService.create(
      makeFormData({ fun_id: funId, concept: 'CARACTERIZACION' }),
    );
    const expedition = await ExpeditionService.create(
      makeFormData({ fun_id: funId, doc_type: 'RESOLUCION', status: 'GENERADO' }),
    );

    const submitById = await SubmitService.get(submitEntry.data.id);
    const lawByFun = await RecordLawService.getRecord(funId);
    const expeditionByFun = await ExpeditionService.getRecord(funId);

    expect(submitById.data.fun_id).toBe(funId);
    expect(funEntry.data.submit_id).toBe(submitEntry.data.id);
    expect(lawRecord.data.fun_id).toBe(funId);
    expect(expedition.data.fun_id).toBe(funId);
    expect(lawByFun.data).toHaveLength(1);
    expect(lawByFun.data[0].concept).toBe('CARACTERIZACION');
    expect(expeditionByFun.data).toHaveLength(1);
    expect(expeditionByFun.data[0].doc_type).toBe('RESOLUCION');
  });
});
