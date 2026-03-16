import { http, HttpResponse } from 'msw';

function normalizeStatus(value) {
  const status = String(value || '').toUpperCase();
  if (status === 'CLOSED' || status === '3') {
    return 'CLOSED';
  }
  if (status === 'REPLIED' || status === '2') {
    return 'REPLIED';
  }
  if (status === 'ASSIGNED' || status === '1') {
    return 'ASSIGNED';
  }
  return 'PENDING';
}

function getNextPublicId(items) {
  const last = items.at(-1);
  if (!last || !last.id_public) {
    return 'PQRS-0001';
  }

  const match = /^(.*-)(\d+)$/.exec(last.id_public);
  if (!match) {
    return 'PQRS-0001';
  }

  const prefix = match[1];
  const nextValue = String(Number.parseInt(match[2], 10) + 1).padStart(match[2].length, '0');
  return `${prefix}${nextValue}`;
}

async function parseRequestBody(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }

  return {};
}

function findByPublicId(store, idPublic) {
  return store.pqrs.items.find((row) => String(row.id_public) === String(idPublic));
}

function findById(store, id) {
  return store.pqrs.items.find((row) => Number(row.id) === Number(id));
}

function buildGetAll(store) {
  return HttpResponse.json(store.pqrs.items);
}

function buildGetAllPending(store) {
  const pending = store.pqrs.items.filter((row) => normalizeStatus(row.status) !== 'CLOSED');
  return HttpResponse.json(pending);
}

function buildGetById(store, params) {
  const record = findById(store, params.id);
  if (!record) {
    return HttpResponse.json({ message: 'PQRS no encontrada' }, { status: 404 });
  }
  return HttpResponse.json(record);
}

function buildSearchByPublicId(store, params) {
  const record = findByPublicId(store, params.idPublic);
  if (!record) {
    return HttpResponse.json([]);
  }
  return HttpResponse.json([record]);
}

async function buildCreate(store, request) {
  const payload = await parseRequestBody(request);

  const created = {
    id: store.pqrs.items.length + 1,
    id_public: payload.id_public || getNextPublicId(store.pqrs.items),
    globalId: payload.globalId || payload.global_id || payload.id_global || '1',
    subject: payload.subject || 'PQRS de prueba',
    description: payload.description || 'Sin descripcion',
    status: 'PENDING',
    workers: [],
    replies: [],
    created_at: payload.created_at || '2026-03-13',
    closed_at: null,
  };

  store.pqrs.items.push(created);
  return HttpResponse.json(created, { status: 201 });
}

async function buildAssign(store, request) {
  const payload = await parseRequestBody(request);
  return applyAssign(store, payload);
}

function applyAssign(store, payload) {
  const record = findById(store, payload.id);

  if (!record) {
    return HttpResponse.json({ message: 'PQRS no encontrada' }, { status: 404 });
  }

  const worker = {
    worker_id: payload.worker_id ? Number(payload.worker_id) : null,
    worker_name: payload.worker_name || 'SIN_ASIGNAR',
    assigned_at: payload.assigned_at || '2026-03-13',
  };

  record.workers.push(worker);
  record.status = 'ASSIGNED';
  return HttpResponse.json(record);
}

async function buildReply(store, request) {
  const payload = await parseRequestBody(request);
  return applyReply(store, payload);
}

function applyReply(store, payload) {
  const record = findById(store, payload.id);

  if (!record) {
    return HttpResponse.json({ message: 'PQRS no encontrada' }, { status: 404 });
  }

  if (!payload.reply_text || String(payload.reply_text).trim() === '') {
    return HttpResponse.json({ message: 'reply_text es obligatorio' }, { status: 422 });
  }

  const reply = {
    text: payload.reply_text,
    reply_by: payload.reply_by || 'ADMIN_TEST',
    replied_at: payload.replied_at || '2026-03-13',
  };

  record.replies.push(reply);
  record.status = 'REPLIED';
  return HttpResponse.json(record);
}

async function buildClose(store, request) {
  const payload = await parseRequestBody(request);
  return applyClose(store, payload);
}

function applyClose(store, payload) {
  const record = findById(store, payload.id);

  if (!record) {
    return HttpResponse.json({ message: 'PQRS no encontrada' }, { status: 404 });
  }

  if (!payload.close_reason || String(payload.close_reason).trim() === '') {
    return HttpResponse.json({ message: 'close_reason es obligatorio' }, { status: 422 });
  }

  record.status = 'CLOSED';
  record.close_reason = payload.close_reason;
  record.closed_at = payload.closed_at || '2026-03-13';
  return HttpResponse.json(record);
}

export function buildPqrsHandlers(store) {
  return [
    // Requested workflow endpoints (legacy naming)
    http.get('*/pqrsmain/getall/:globalId', ({ params }) => {
      const list = store.pqrs.items.filter((row) => String(row.globalId) === String(params.globalId));
      return HttpResponse.json(list);
    }),
    http.get('*/pqrsmain/getallpending/:globalId', ({ params }) => {
      const list = store.pqrs.items.filter(
        (row) => String(row.globalId) === String(params.globalId) && normalizeStatus(row.status) !== 'CLOSED'
      );
      return HttpResponse.json(list);
    }),
    http.get('*/pqrsmain/get/:id', ({ params }) => buildGetById(store, params)),
    http.get('*/pqrsmain/search/:idPublic', ({ params }) => buildSearchByPublicId(store, params)),
    http.post('*/pqrsmain/create', async ({ request }) => buildCreate(store, request)),
    http.post('*/pqrsmain/asign', async ({ request }) => buildAssign(store, request)),
    http.post('*/pqrsmain/reply', async ({ request }) => buildReply(store, request)),
    http.post('*/pqrsmain/close', async ({ request }) => buildClose(store, request)),

    // Service-compatible endpoints (pqrs_main)
    http.get('*/pqrs_main/pqrs/all', () => buildGetAll(store)),
    http.get('*/pqrs_main/pqrs/pending', () => buildGetAllPending(store)),
    http.get('*/pqrs_main/:id', ({ params }) => buildGetById(store, params)),
    http.post('*/pqrs_main/search', async ({ request }) => {
      const payload = await parseRequestBody(request);
      if (payload.id_public) {
        const record = findByPublicId(store, payload.id_public);
        return HttpResponse.json(record ? [record] : []);
      }
      if (payload.id) {
        const record = findById(store, payload.id);
        return HttpResponse.json(record ? [record] : []);
      }
      return HttpResponse.json([]);
    }),
    http.post('*/pqrs_main', async ({ request }) => buildCreate(store, request)),
    http.put('*/pqrs_main/process/worker/:id', async ({ params, request }) => {
      const payload = await parseRequestBody(request);
      return applyAssign(store, { ...payload, id: Number(params.id) });
    }),
    http.post('*/pqrs_main/process/formalreply/', async ({ request }) => {
      const payload = await parseRequestBody(request);
      return applyReply(store, payload);
    }),
    http.post('*/pqrs_main/process/close/', async ({ request }) => {
      const payload = await parseRequestBody(request);
      return applyClose(store, payload);
    }),
  ];
}