import { http, HttpResponse } from 'msw';

function getNextPublicId(entries) {
  const last = entries.at(-1);
  if (!last || !last.id_public) {
    return 'VR26-0001';
  }

  const match = /^(.*-)(\d+)$/.exec(last.id_public);
  if (!match) {
    return 'VR26-0001';
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

export function buildSubmitHandlers(store) {
  return [
    http.get('*/submit', () => HttpResponse.json(store.submitEntries)),

    http.get('*/submit/getid/lastid', () => {
      return HttpResponse.json(getNextPublicId(store.submitEntries));
    }),

    http.get('*/submit/:id', ({ params }) => {
      const id = Number(params.id);
      const entry = store.submitEntries.find((row) => row.id === id);

      if (!entry) {
        return HttpResponse.json({ message: 'Submit no encontrado' }, { status: 404 });
      }

      return HttpResponse.json(entry);
    }),

    http.get('*/submit/getlist/:relatedId', ({ params }) => {
      const relatedId = Number(params.relatedId);
      const list = store.submitEntries.filter((row) => row.id_related === relatedId);
      return HttpResponse.json(list);
    }),

    http.post('*/submit', async ({ request }) => {
      const payload = await parseRequestBody(request);
      const nextId = store.submitEntries.length + 1;

      const created = {
        id: nextId,
        id_public: payload.id_public || getNextPublicId(store.submitEntries),
        type_doc: payload.type_doc || 'SOLICITUD',
        sender_name: payload.sender_name || 'CIUDADANO TEST',
        subject: payload.subject || 'Radicacion de solicitud',
        fun_id: payload.fun_id ? Number(payload.fun_id) : null,
        id_related: payload.id_related ? Number(payload.id_related) : null,
        state: payload.state || 'RADICADO',
      };

      store.submitEntries.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),

    http.put('*/submit/:id', async ({ params, request }) => {
      const id = Number(params.id);
      const entry = store.submitEntries.find((row) => row.id === id);

      if (!entry) {
        return HttpResponse.json({ message: 'Submit no encontrado' }, { status: 404 });
      }

      const payload = await parseRequestBody(request);
      Object.assign(entry, {
        ...payload,
        fun_id: payload.fun_id ? Number(payload.fun_id) : entry.fun_id,
      });

      return HttpResponse.json(entry);
    }),
  ];
}
