import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import ExpeditionService from '../../app/services/expedition.service';
import FunService from '../../app/services/fun.service';
import PqrsMainService from '../../app/services/pqrs_main.service';
import RecordLawService from '../../app/services/record_law.service';
import SubmitService from '../../app/services/submit.service';

let server;
let resetWorkflowDb;
let workflowStore;
let hasMsw = true;

try {
  const serverModule = await import('../mocks/server');
  server = serverModule.server;
  resetWorkflowDb = serverModule.resetWorkflowDb;
  workflowStore = serverModule.workflowStore;
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

workflowDescribe('Workflow Fase 3 - Error resilience', () => {
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

  it('500 en create PQRS no persiste datos', async () => {
    // Arrange
    server.use(
      http.post('*/pqrs_main', () => HttpResponse.json({ message: 'create error' }, { status: 500 }))
    );

    // Act + Assert
    await expect(
      PqrsMainService.create(makeFormData({ global_id: '1', subject: 'Fallo create', description: 'Debe fallar' }))
    ).rejects.toBeTruthy();

    expect(workflowStore.pqrs.items).toHaveLength(0);
  });

  it('timeout/rechazo en asignacion conserva estado previo', async () => {
    // Arrange
    const created = await PqrsMainService.create(
      makeFormData({ global_id: '1', subject: 'Asignacion con timeout', description: 'Prueba rechazo' })
    );

    server.use(
      http.put('*/pqrs_main/process/worker/:id', () => HttpResponse.error())
    );

    // Act + Assert
    await expect(
      PqrsMainService.updateWorker(created.data.id, makeFormData({ worker_id: '9', worker_name: 'Operador' }))
    ).rejects.toBeTruthy();

    const byId = await PqrsMainService.get(created.data.id);
    expect(byId.data.status).toBe('PENDING');
    expect(byId.data.workers).toHaveLength(0);
  });

  it('payload invalido en reply y close retorna error y evita transiciones invalidas', async () => {
    // Arrange
    const created = await PqrsMainService.create(
      makeFormData({ global_id: '1', subject: 'Validacion payload', description: 'No debe cerrar sin datos' })
    );

    // Act + Assert
    await expect(
      PqrsMainService.formalReply(makeFormData({ id: String(created.data.id), reply_text: '' }))
    ).rejects.toBeTruthy();

    await expect(
      PqrsMainService.close(makeFormData({ id: String(created.data.id), close_reason: '' }))
    ).rejects.toBeTruthy();

    const byId = await PqrsMainService.get(created.data.id);
    expect(byId.data.status).toBe('PENDING');
    expect(byId.data.replies).toHaveLength(0);
    expect(byId.data.closed_at).toBeNull();
  });

  it('cross-module submit->fun->records->expedition con falla intermedia mantiene consistencia del store', async () => {
    // Arrange
    const submit = await SubmitService.create(
      makeFormData({ type_doc: 'SOLICITUD', sender_name: 'Ciudadano', subject: 'Tramite integral' })
    );
    const fun = await FunService.create(
      makeFormData({ type: 'ii', status: 'RADICADO', submit_id: submit.data.id })
    );
    await SubmitService.update(submit.data.id, makeFormData({ fun_id: fun.data.id, type_doc: 'RADICACION' }));

    server.use(
      http.post('*/recordlaw', () => HttpResponse.json({ message: 'record_law failed' }, { status: 500 }))
    );

    // Act
    await expect(
      RecordLawService.create(makeFormData({ fun_id: fun.data.id, concept: 'APROBADO' }))
    ).rejects.toBeTruthy();

    // Assert
    expect(workflowStore.submitEntries).toHaveLength(1);
    expect(workflowStore.funRecords).toHaveLength(1);
    expect(workflowStore.records.law).toHaveLength(0);
    expect(workflowStore.expeditions).toHaveLength(0);

    // The process may continue later when the failing dependency is restored.
    await ExpeditionService.create(
      makeFormData({ fun_id: fun.data.id, doc_type: 'RESOLUCION', status: 'GENERADO' })
    );

    expect(workflowStore.expeditions).toHaveLength(1);
    expect(workflowStore.expeditions[0].fun_id).toBe(fun.data.id);
  });
});
