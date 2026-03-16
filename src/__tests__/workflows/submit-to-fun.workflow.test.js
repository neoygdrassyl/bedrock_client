import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import SubmitService from '../../app/services/submit.service';
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

workflowDescribe('Workflow Fase 3 - Submit a FUN', () => {
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

  it('radica en ventanilla y vincula la solicitud a una licencia FUN', async () => {
    // Arrange
    const submitPayload = new FormData();
    submitPayload.append('type_doc', 'SOLICITUD');
    submitPayload.append('sender_name', 'Ciudadano de prueba');
    submitPayload.append('subject', 'Licencia de construccion');

    const funPayload = new FormData();
    funPayload.append('type', 'ii');
    funPayload.append('status', 'RADICADO');

    // Act
    const createdSubmit = await SubmitService.create(submitPayload);

    funPayload.append('submit_id', String(createdSubmit.data.id));
    const createdFun = await FunService.create(funPayload);

    const linkPayload = new FormData();
    linkPayload.append('fun_id', String(createdFun.data.id));
    linkPayload.append('type_doc', 'RADICACION');
    await SubmitService.update(createdSubmit.data.id, linkPayload);

    const updatedSubmit = await SubmitService.get(createdSubmit.data.id);
    const funList = await FunService.getAll_fun();

    // Assert
    expect(createdSubmit.data.id_public).toBe('VR26-0001');
    expect(createdFun.data.id_public).toBe('LC26-0001');
    expect(updatedSubmit.data.fun_id).toBe(createdFun.data.id);
    expect(updatedSubmit.data.type_doc).toBe('RADICACION');
    expect(funList.data).toHaveLength(1);
    expect(funList.data[0].submit_id).toBe(createdSubmit.data.id);
  });
});
