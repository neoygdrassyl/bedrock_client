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

// Accept `store` and `key` (e.g. 'law') instead of the raw array so that
// resetWorkflowDb's Object.assign replacement is always seen by the handlers.
function buildRecordRouteHandlers(route, store, key) {
  return [
    http.get(`*/${route}`, () => HttpResponse.json(store.records[key])),

    http.get(`*/${route}/findrecord/:funId`, ({ params }) => {
      const funId = Number(params.funId);
      const list = store.records[key].filter((item) => Number(item.fun_id) === funId);
      return HttpResponse.json(list);
    }),

    http.post(`*/${route}`, async ({ request }) => {
      const payload = await parseRequestBody(request);
      const created = {
        id: store.records[key].length + 1,
        fun_id: payload.fun_id ? Number(payload.fun_id) : null,
        concept: payload.concept || 'APROBADO',
      };
      store.records[key].push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
  ];
}

export function buildRecordsHandlers(store) {
  return [
    ...buildRecordRouteHandlers('recordlaw', store, 'law'),
    ...buildRecordRouteHandlers('recordarc', store, 'arc'),
    ...buildRecordRouteHandlers('recordeng', store, 'eng'),
  ];
}
