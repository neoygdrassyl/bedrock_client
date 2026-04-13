import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import PqrsMainService from '../../app/services/pqrs_main.service';

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

workflowDescribe('Workflow Fase 3 - PQRS full cycle', () => {
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

  it('crear PQRS -> aparece en getAllPqrsPending', async () => {
    // Arrange
    const payload = makeFormData({
      global_id: '1',
      subject: 'Solicitud de informacion',
      description: 'Necesito estado del tramite',
    });

    // Act
    const created = await PqrsMainService.create(payload);
    const pending = await PqrsMainService.getAllPqrsPending();

    // Assert
    expect(created.data.id).toBe(1);
    expect(created.data.status).toBe('PENDING');
    expect(pending.data).toHaveLength(1);
    expect(pending.data[0].id).toBe(created.data.id);
    expect(pending.data[0].status).toBe('PENDING');
  });

  it('asignar responsable -> cambia estado y deja rastro en workers', async () => {
    // Arrange
    const created = await PqrsMainService.create(
      makeFormData({ global_id: '1', subject: 'Asignacion profesional', description: 'Pendiente asignar' })
    );

    // Act
    await PqrsMainService.updateWorker(
      created.data.id,
      makeFormData({ worker_id: '33', worker_name: 'Abogado QA', assigned_at: '2026-03-13' })
    );
    const byId = await PqrsMainService.get(created.data.id);

    // Assert
    expect(byId.data.status).toBe('ASSIGNED');
    expect(byId.data.workers).toHaveLength(1);
    expect(byId.data.workers[0].worker_id).toBe(33);
    expect(byId.data.workers[0].worker_name).toBe('Abogado QA');
  });

  it('responder -> guarda reply y cambia estado esperado', async () => {
    // Arrange
    const created = await PqrsMainService.create(
      makeFormData({ global_id: '1', subject: 'Derecho de peticion', description: 'Pendiente respuesta' })
    );

    // Act
    await PqrsMainService.formalReply(
      makeFormData({ id: String(created.data.id), reply_text: 'Respuesta formal emitida', reply_by: 'Juridica' })
    );
    const byId = await PqrsMainService.get(created.data.id);

    // Assert
    expect(byId.data.status).toBe('REPLIED');
    expect(byId.data.replies).toHaveLength(1);
    expect(byId.data.replies[0].text).toBe('Respuesta formal emitida');
    expect(byId.data.replies[0].reply_by).toBe('Juridica');
  });

  it('cerrar -> marca cerrado, desaparece de pending y mantiene trazabilidad final', async () => {
    // Arrange
    const created = await PqrsMainService.create(
      makeFormData({ global_id: '1', id_public: 'PQRS-9001', subject: 'Cerrar caso', description: 'Cerrar luego de responder' })
    );

    await PqrsMainService.updateWorker(
      created.data.id,
      makeFormData({ worker_id: '20', worker_name: 'Gestor PQRS' })
    );

    await PqrsMainService.formalReply(
      makeFormData({ id: String(created.data.id), reply_text: 'Se envio respuesta oficial' })
    );

    // Act
    await PqrsMainService.close(
      makeFormData({ id: String(created.data.id), close_reason: 'Caso solucionado', closed_at: '2026-03-13' })
    );

    const pending = await PqrsMainService.getAllPqrsPending();
    const byId = await PqrsMainService.get(created.data.id);

    // Assert
    expect(byId.data.id_public).toBe('PQRS-9001');
    expect(byId.data.status).toBe('CLOSED');
    expect(byId.data.close_reason).toBe('Caso solucionado');
    expect(byId.data.replies).toHaveLength(1);
    expect(byId.data.workers).toHaveLength(1);
    expect(pending.data).toHaveLength(0);
    expect(workflowStore.pqrs.items).toHaveLength(1);
    expect(workflowStore.pqrs.items[0].status).toBe('CLOSED');
  });
});
