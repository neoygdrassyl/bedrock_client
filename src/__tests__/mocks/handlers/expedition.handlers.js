import { http, HttpResponse } from 'msw';

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

export function buildExpeditionHandlers(store) {
  return [
    http.get('*/expedition', () => HttpResponse.json(store.expeditions)),

    http.get('*/expedition/findrecord/:funId', ({ params }) => {
      const funId = Number(params.funId);
      const list = store.expeditions.filter((item) => Number(item.fun_id) === funId);
      return HttpResponse.json(list);
    }),

    http.post('*/expedition', async ({ request }) => {
      const payload = await parseRequestBody(request);
      const created = {
        id: store.expeditions.length + 1,
        fun_id: payload.fun_id ? Number(payload.fun_id) : null,
        doc_type: payload.doc_type || 'RESOLUCION',
        status: payload.status || 'GENERADO',
      };

      store.expeditions.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),

    http.post('*/expedition/create_exp_area', async ({ request }) => {
      const payload = await parseRequestBody(request);
      const created = {
        id: store.expeditionAreas.length + 1,
        expedition_id: payload.expedition_id ? Number(payload.expedition_id) : null,
        area: payload.area || 'GENERAL',
      };

      store.expeditionAreas.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
  ];
}
