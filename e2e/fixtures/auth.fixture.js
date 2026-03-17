// @ts-check
import { test as base, expect } from '@playwright/test';

/**
 * Auth fixture for Dovela E2E tests.
 *
 * Provides an `authenticatedPage` that injects a valid session into
 * localStorage + window.user, bypassing the ReCAPTCHA-guarded login form.
 *
 * Usage in specs:
 *   import { test, expect } from '../fixtures/auth.fixture';
 *   test('my test', async ({ authenticatedPage }) => { ... });
 *
 * For tests that need to test the login flow itself, import from
 * '@playwright/test' directly and interact with the login form.
 */

/** Canonical test user matching the backend seed. */
const TEST_USER = {
  id: 1,
  name: 'Admin',
  surname: 'Test',
  role: 'ADMINISTRADOR',
  role_short: 'ADM',
  roleDesc: 'Admin completo',
  active: 1,
  roleId: 1,
  name_short: 'Admin Test',
  name_full: 'Admin Test',
};

/** Dummy JWT (the real backend validates this; for route-intercepted tests any string works). */
const TEST_TOKEN = 'e2e-test-jwt-token';

const E2E_SUBMIT_ENTRIES = [
  {
    id: 1,
    id_public: 'VR26-0001',
    id_related: '68001-1-26-0001',
    type: 'RADICACION SOLICITUD',
    list_type: 1,
    date: '2026-03-10',
    time: '08:30',
    owner: 'Propietario Test',
    name_retriever: 'Admin Test',
    sub_doc: 1,
    details: 'Entrada de prueba para E2E',
  },
];

const E2E_FUN_RECORDS = [
  {
    id: 1,
    id_sistem: 1,
    id_public: '68001-1-26-0001',
    version: 1,
    state: 5,
    type: 'ii',
    date: '2026-03-10',
    rules: '0;0',
    clock_payment: '2026-03-10',
    owner: 'Propietario Test',
  },
  {
    id: 2,
    id_sistem: 2,
    id_public: '68001-1-26-0002',
    version: 1,
    state: 70,
    type: 'ii',
    date: '2026-03-12',
    rules: '0;0',
    clock_payment: '2026-03-12',
    owner: 'Propietario Expedicion',
  },
];

const E2E_FUN_DETAILS = {
  1: {
    ...E2E_FUN_RECORDS[0],
    fun_1s: [{ id: 11, tramite: 'ii', tipo: 'Licencia', m_urb: '0', m_sub: '0', m_lic: 'ii', usos: 'VIVIENDA', area: '120', description: 'Solicitud de prueba activa' }],
    fun_2: { id: 21, direccion: 'Calle 10 # 11-12', direccion_ant: '', matricula: '300-001', catastral: '001', catastral_2: '', suelo: 'URBANO', lote_pla: 'SI', barrio: 'Centro', vereda: '', comuna: '1', sector: 'A', corregimiento: '', lote: '1', estrato: '3', manzana: 'A' },
    fun_51s: [],
    fun_52s: [],
    fun_53s: [],
    fun_clocks: [
      { id: 1, fun_id: 1, state: 0, date_start: '2026-03-10', version: '1', description: 'Radicacion' },
      { id: 2, fun_id: 1, state: 5, date_start: '2026-03-12', version: '1', description: 'Legal y debida forma' },
    ],
    fun_6s: [],
    fun_rs: [],
    fun_law: null,
    record_review: null,
  },
  2: {
    ...E2E_FUN_RECORDS[1],
    fun_1s: [{ id: 12, tramite: 'ii', tipo: 'Licencia', m_urb: '0', m_sub: '0', m_lic: 'ii', usos: 'VIVIENDA', area: '180', description: 'Proyecto para expedicion E2E' }],
    fun_2: { id: 22, direccion: 'Carrera 20 # 30-40', direccion_ant: '', matricula: '300-002', catastral: '002', catastral_2: '', suelo: 'URBANO', lote_pla: 'SI', barrio: 'Cabecera', vereda: '', comuna: '2', sector: 'B', corregimiento: '', lote: '2', estrato: '4', manzana: 'B' },
    fun_51s: [],
    fun_52s: [],
    fun_53s: [],
    fun_clocks: [
      { id: 3, fun_id: 2, state: 0, date_start: '2026-03-12', version: '1', description: 'Radicacion' },
      { id: 4, fun_id: 2, state: 3, date_start: '2026-03-13', version: '1', description: 'Pago' },
      { id: 5, fun_id: 2, state: 5, date_start: '2026-03-15', version: '1', description: 'Legal y debida forma' },
      { id: 6, fun_id: 2, state: 70, date_start: '2026-04-10', version: '1', description: 'Resolucion' },
      { id: 7, fun_id: 2, state: 99, date_start: '2026-04-20', version: '1', description: 'Ejecutoria' },
    ],
    fun_6s: [],
    fun_rs: [],
    fun_law: null,
    record_review: null,
  },
};

const E2E_ARCHIVE_BOXES = [];

const E2E_EXPEDITION_RECORDS = [];

const E2E_RECORD_ARC = {
  record_arc: null,
  record_arc_steps: [],
  record_arc_33_areas: [],
  record_arc_34_ks: [],
  record_arc_34_gens: [],
  record_arc_35_parkings: [],
  record_arc_36_infos: [],
  record_arc_37s: [],
  record_arc_35_locations: [],
  record_arc_38s: [],
};

const E2E_CLOCKS = Object.values(E2E_FUN_DETAILS).flatMap((item) => item.fun_clocks || []);

function jsonResponse(route, data, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });
}

function filterSubmitEntries(pathname) {
  const searchToken = pathname.split('/submit/getsearch/')[1] || '';
  const [field, rawQuery = ''] = searchToken.split('&');
  const query = decodeURIComponent(rawQuery).toLowerCase();

  if (!query) {
    return E2E_SUBMIT_ENTRIES;
  }

  return E2E_SUBMIT_ENTRIES.filter((entry) => {
    if (field === '1') return entry.id_public.toLowerCase().includes(query);
    if (field === '2') return entry.id_related.toLowerCase().includes(query);
    if (field === '3') return entry.owner.toLowerCase().includes(query);
    if (field === '4') return entry.name_retriever.toLowerCase().includes(query);
    return false;
  });
}

function filterFunRecords(pathname) {
  const searchToken = pathname.split('/fun/getsearch/')[1] || '';
  const [, rawQuery = ''] = searchToken.split('&');
  const query = decodeURIComponent(rawQuery).toLowerCase();

  if (!query) {
    return E2E_FUN_RECORDS;
  }

  return E2E_FUN_RECORDS.filter((entry) => entry.id_public.toLowerCase().includes(query));
}

async function installE2EMocks(page) {
  await page.route('**/*', async (route) => {
    const request = route.request();
    const resourceType = request.resourceType();
    if (resourceType !== 'fetch' && resourceType !== 'xhr') {
      return route.continue();
    }

    const url = new URL(request.url());
    const { pathname } = url;

    if (request.method() === 'GET' && pathname.endsWith('/users')) {
      return jsonResponse(route, [TEST_USER]);
    }

    if (request.method() === 'GET' && pathname.endsWith('/submit')) {
      return jsonResponse(route, E2E_SUBMIT_ENTRIES);
    }

    if (request.method() === 'GET' && pathname.includes('/submit/getsearch/')) {
      return jsonResponse(route, filterSubmitEntries(pathname));
    }

    if (request.method() === 'GET' && pathname.endsWith('/submit/getid/lastid')) {
      return jsonResponse(route, [{ vr: E2E_SUBMIT_ENTRIES.at(-1)?.id_public || 'VR26-0001' }]);
    }

    if (request.method() === 'GET' && /\/submit\/\d+$/.test(pathname)) {
      return jsonResponse(route, E2E_SUBMIT_ENTRIES[0]);
    }

    if (request.method() === 'GET' && pathname.endsWith('/archive')) {
      return jsonResponse(route, E2E_ARCHIVE_BOXES);
    }

    if (request.method() === 'GET' && /\/archive\/get\/box\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/archive\/get\/fun\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && pathname.endsWith('/fun/getall/fun')) {
      return jsonResponse(route, E2E_FUN_RECORDS);
    }

    if (request.method() === 'GET' && pathname.includes('/fun/getsearch/')) {
      return jsonResponse(route, filterFunRecords(pathname));
    }

    if (request.method() === 'GET' && pathname.endsWith('/fun/getlast/id')) {
      return jsonResponse(route, [{ id: E2E_FUN_RECORDS.at(-1)?.id_public || '68001-1-26-0001' }]);
    }

    if (request.method() === 'GET' && pathname.includes('/fun/loadsubmit2/')) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && pathname.includes('/fun/loadPQRSxFUN/')) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/fun\/getclockdata\/\d+$/.test(pathname)) {
      const funId = Number(pathname.split('/').pop());
      return jsonResponse(route, E2E_CLOCKS.filter((clock) => clock.fun_id === funId));
    }

    if (request.method() === 'GET' && /\/fun\/\d+$/.test(pathname)) {
      const funId = Number(pathname.split('/').pop());
      return jsonResponse(route, E2E_FUN_DETAILS[funId] || E2E_FUN_DETAILS[1]);
    }

    if (request.method() === 'GET' && /\/expedition\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, E2E_EXPEDITION_RECORDS);
    }

    if (request.method() === 'POST' && pathname.endsWith('/expedition')) {
      return jsonResponse(route, 'OK');
    }

    if (request.method() === 'GET' && /\/recordlaw\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/recordarc\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, E2E_RECORD_ARC);
    }

    if (request.method() === 'GET' && /\/recordarc\/getsteps\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/recordeng\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/recordr\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && /\/recordph\/findrecord\/\d+$/.test(pathname)) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && pathname.includes('/cubXVr/getByFUN/')) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && pathname.includes('/consult/consult_cubDictionary/')) {
      return jsonResponse(route, []);
    }

    if (request.method() === 'GET' && pathname.includes('/submit/getlist/')) {
      return jsonResponse(route, []);
    }

    return route.continue();
  });
}

/**
 * Extend the base test with an `authenticatedPage` fixture.
 *
 * The fixture:
 * 1. Navigates to / (to initialize the app's origin so localStorage works).
 * 2. Injects dovela_token + dovela_user into localStorage.
 * 3. Sets window.user (many components read it directly).
 * 4. Navigates to /dashboard to confirm auth took effect.
 */
/**
 * @type {import('@playwright/test').TestType<
 *   { authenticatedPage: import('@playwright/test').Page } &
 *   import('@playwright/test').PlaywrightTestArgs &
 *   import('@playwright/test').PlaywrightTestOptions,
 *   import('@playwright/test').PlaywrightWorkerArgs &
 *   import('@playwright/test').PlaywrightWorkerOptions
 * >}
 */
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await installE2EMocks(page);

    // 1. Navigate to root so we are on the correct origin
    await page.goto('/');

    // 2. Inject session into localStorage and window.user
    await page.evaluate(
      ({ user, token }) => {
        localStorage.setItem('dovela_token', token);
        localStorage.setItem('dovela_user', JSON.stringify(user));
        window.user = user;
      },
      { user: TEST_USER, token: TEST_TOKEN },
    );

    // 3. Reload so the app picks up the restored session
    //    (ProvideAuth checks localStorage on initial render)
    await page.goto('/dashboard');

    // 4. Wait for the dashboard to render (confirms PrivateRoute let us through)
    await page.waitForLoadState('domcontentloaded');

    await use(page);
  },
});

export { expect };
export { TEST_USER, TEST_TOKEN };
