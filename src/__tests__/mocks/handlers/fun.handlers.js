import { http, HttpResponse } from 'msw';

function nextFunIdPublic(funRecords) {
  const last = funRecords.at(-1);
  if (!last || !last.id_public) {
    return 'LC26-0001';
  }

  const match = /^(.*-)(\d+)$/.exec(last.id_public);
  if (!match) {
    return 'LC26-0001';
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

export function buildFunHandlers(store) {
  return [
    http.get('*/fun/getall/fun', () => HttpResponse.json(store.funRecords)),

    http.get('*/fun/getclockdata/:funId', ({ params }) => {
      const funId = Number(params.funId);
      const clocks = store.clocks.filter((clock) => clock.fun_id === funId);
      return HttpResponse.json(clocks);
    }),

    http.post('*/fun', async ({ request }) => {
      const payload = await parseRequestBody(request);
      const id = store.funRecords.length + 1;
      const created = {
        id,
        id_public: payload.id_public || nextFunIdPublic(store.funRecords),
        submit_id: payload.submit_id ? Number(payload.submit_id) : null,
        type: payload.type || 'ii',
        status: payload.status || 'RADICADO',
      };

      store.funRecords.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),

    http.post('*/fun/createclock', async ({ request }) => {
      const payload = await parseRequestBody(request);
      const id = store.clocks.length + 1;
      const state = Number(payload.state);

      const created = {
        id,
        fun_id: Number(payload.fun_id),
        state,
        date_start: payload.date_start || '2026-03-11',
        date_end: payload.date_end || null,
        description: payload.description || '',
        version: payload.version || '1',
      };

      store.clocks.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),

    http.put('*/fun/updateclock/:clockId', async ({ params, request }) => {
      const clockId = Number(params.clockId);
      const clock = store.clocks.find((item) => item.id === clockId);

      if (!clock) {
        return HttpResponse.json({ message: 'Clock no encontrado' }, { status: 404 });
      }

      const payload = await parseRequestBody(request);
      Object.assign(clock, {
        ...payload,
        state: payload.state ? Number(payload.state) : clock.state,
      });

      return HttpResponse.json(clock);
    }),
  ];
}
