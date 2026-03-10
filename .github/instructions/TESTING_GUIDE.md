# Guía de Testing — Dovela Frontend

Documento de referencia para agentes que implementen tests. Describe el estado actual, patrones establecidos, deuda técnica identificada, y un plan de acción priorizado con énfasis en **tests de flujos de trabajo**.

**Fecha:** 2026-03-05
**Branch:** `feat/react-19-migration`
**Tests actuales:** ~149 en 10 suites

---

## 1. Estado actual del testing

### 1.1 Infraestructura

| Pieza | Tecnología | Archivo |
|---|---|---|
| Runner | Vitest 4.x + jsdom 24 | `vitest.config.mjs` |
| Rendering | @testing-library/react 16 | `package.json` |
| DOM matchers | @testing-library/jest-dom 6 | `src/__tests__/setup.js` |
| User events | @testing-library/user-event 14 | Disponible, **infrautilizado** |
| Setup global | Setup de env vars + `globalThis.React` | `src/__tests__/setup.js` |
| CSS mock | Plugin `cssNoop` en vitest config | `vitest.config.mjs` |
| JSX en .js | Plugin `jsxInJs` comparte con vite | `vitest.config.mjs` |

### 1.2 Inventario de tests

| Archivo | Tests | Tipo | Qué valida |
|---|---|---|---|
| `App.smoke.test.js` | 6 | Smoke | App shell, ThemeProvider, Footer, Navbar, ReCAPTCHA |
| `Login.smoke.test.js` | 4 | Smoke | Formulario login, submit llama API, error handling |
| `Navigation.smoke.test.js` | 23 | Smoke | 7 rutas públicas renderizan, 15 privadas redirigen a login |
| `FunLicenses.smoke.test.js` | 33 | Smoke | `import()` dinámico de ~33 módulos FUN (solo importación) |
| `Modules.smoke.test.js` | 13 | Smoke | Import de Clocks, Records, Services |
| `Expedition.integration.test.js` | 12 | Integración | Loading, service calls, CRUD, version switching |
| `FunManage.integration.test.js` | 12 | Integración | Tabs, breadcrumbs, secciones, service calls |
| `Submit.integration.test.js` | 14 | Integración | DataTable, búsqueda, modal, CSV, columnas |
| `Archive.integration.test.js` | 17 | Integración | Role-gating, CRUD cajas, búsqueda, expandable rows |
| `mdb-debug.test.js` | 12 | Debug | Validación de wrappers UI post-migración |

### 1.3 Helpers compartidos (preparados pero infrautilizados)

Los siguientes archivos existen en `src/__tests__/helpers/` pero **no son importados** por ningún test de integración actual. Los 4 tests de integración duplican sus mocks inline (~100 líneas idénticas cada uno).

| Archivo | Contenido | Estado |
|---|---|---|
| `mockExternals.js` | `vi.mock()` para i18next, recaptcha, http-common, sweetalert2, rsuite, react-modal, vars, GlobalStyles | **No usado** |
| `mockServices.js` | Factorías: `createMockService()`, `createMockFunService()`, `createMockSubmitService()`, `createMockArchiveService()`, `createMockRecordService()` | **No usado** |
| `mockPages.js` | `vi.mock()` para las ~20 páginas de App.js (stubs con `data-testid`) | **No usado** |
| `renderHelpers.js` | `defaultProps`, `setWindowUser()`, `clearWindowUser()`, `renderWithRouter()`, `setTestEnv()` | **No usado** |

### 1.4 Fixtures (preparadas pero no usadas)

Existen en `src/__tests__/fixtures/` pero **ningún test las importa**:

| Archivo | Contenido |
|---|---|
| `users.json` | 4 perfiles: admin (role 1), professional (role 2), archivist (role 3), ventanilla (role 4) |
| `fun_license.json` | `license_complete`, `license_minimal`, `license_list` (3 licencias) |
| `submit_entry.json` | `entry_complete`, `entry_linked` (con fun_id), `entry_list` (3 entradas) |
| `clocks_timeline.json` | `full_timeline` (8 pasos), `with_suspension` (5 pasos), `with_desistimiento` (4 pasos), `empty` |

### 1.5 Deuda técnica identificada

| Problema | Impacto | Dónde |
|---|---|---|
| Mocks duplicados inline (~100 líneas × 4 archivos) | Mantenimiento costoso, inconsistencias | Los 4 `*.integration.test.js` |
| Fixtures preparadas sin uso | Datos realistas disponibles pero ignorados | `src/__tests__/fixtures/` |
| Helpers preparados sin uso | Factorías y render wrappers listos pero no integrados | `src/__tests__/helpers/` |
| 0 tests unitarios de hooks | La lógica legal más crítica no tiene cobertura | `clocks/hooks/`, `utils/` |
| 0 tests de flujos de trabajo | No se validan secuencias multi-step de negocio | N/A |
| `fireEvent` en vez de `userEvent` | Interacciones menos realistas | Todos los integration tests |
| Smoke tests de import dan falsa cobertura | Solo prueban que no hay syntax errors, no funcionalidad | `FunLicenses.smoke`, `Modules.smoke` |
| 0 módulos con cobertura: Clocks, Records, PQRS, Dashboard, Nomenclature, Zone Use, Certifications, Norms, Profesionals | 9 módulos sin ningún test funcional | N/A |

---

## 2. Patrones establecidos

Estos son los patrones que ya existen en los tests actuales. **Todo test nuevo debe seguirlos** para mantener consistencia.

### 2.1 Estructura de un test de integración

```
src/__tests__/{Modulo}.integration.test.js

1. Bloque de mocks de services  (vi.mock)
2. Bloque de mocks de sub-componentes  (vi.mock → stubs con data-testid)
3. Bloque de mocks de externos  (vi.mock — i18next, sweetalert2, etc.)
4. Import del componente bajo test
5. Helper de render local  (renderWithRouter o función custom)
6. describe() con beforeEach/afterAll para window.user
7. Tests numerados secuencialmente
```

### 2.2 Patrón de mock de service

```js
vi.mock('../app/services/archive.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    // ... solo los métodos que usa el componente
  },
}));
```

### 2.3 Patrón de mock de sub-componente

```js
vi.mock('../app/pages/user/archive/archive_manage.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="archive-manage-stub">ARCHIVE_MANAGE</div>,
}));
```

### 2.4 Patrón de render con router

```js
function renderArchive(props = {}, userRole = 1) {
  window.user = { roleId: userRole, name: 'Admin Test', id: 1 };
  return render(
    <MemoryRouter>
      <ARCHIVE {...defaultProps} {...props} />
    </MemoryRouter>
  );
}
```

### 2.5 Patrón de verificación de service call

```js
test('SERVICE.getAll() se llama al montar', async () => {
  const SERVICE = (await import('../app/services/mi.service')).default;
  SERVICE.getAll.mockClear();

  await act(async () => {
    renderMiComponente();
  });

  expect(SERVICE.getAll).toHaveBeenCalled();
});
```

### 2.6 Patrón de loading state

```js
test('Muestra "CARGANDO..." antes de datos', async () => {
  const SERVICE = (await import('../app/services/mi.service')).default;
  SERVICE.getAll.mockReturnValueOnce(new Promise(() => {})); // Never resolves

  await act(async () => {
    renderMiComponente();
  });

  expect(screen.getByText(/CARGANDO/i)).toBeInTheDocument();
});
```

### 2.7 Patrón de DataTable con datos mock

```js
test('DataTable con datos', async () => {
  const SERVICE = (await import('../app/services/mi.service')).default;
  SERVICE.getAll.mockResolvedValueOnce({
    data: [{ id: 1, field: 'valor' }],
  });

  await act(async () => {
    renderMiComponente();
  });

  await waitFor(() => {
    expect(screen.getByText('valor')).toBeInTheDocument();
  });
});
```

### 2.8 Patrón de role-gating

```js
test('Botón visible para admin (role 1)', async () => {
  await act(async () => {
    renderMiComponente({}, 1);
  });
  expect(screen.getByText(/MI BOTÓN/i)).toBeInTheDocument();
});

test('Botón oculto para profesional (role 2)', async () => {
  await act(async () => {
    renderMiComponente({}, 2);
  });
  expect(screen.queryByText(/MI BOTÓN/i)).toBeNull();
});
```

---

## 3. Plan de acción priorizado

### Fase A: Consolidar infraestructura (prerequisito)

**Objetivo:** Eliminar duplicación, establecer base sólida para tests nuevos.

| Tarea | Descripción | Archivos afectados |
|---|---|---|
| A.1 | Refactorizar los 4 tests de integración para importar `mockExternals.js` en vez de definir mocks inline | `Expedition`, `FunManage`, `Submit`, `Archive` `.integration.test.js` |
| A.2 | Refactorizar para usar `renderHelpers.js` (`defaultProps`, `setWindowUser`, `renderWithRouter`) | Los mismos 4 archivos |
| A.3 | Verificar que las factorías de `mockServices.js` cubren los métodos usados en cada test y completar si faltan | `mockServices.js` |
| A.4 | Validar que los 149 tests siguen pasando después de la refactorización | `npm test` |

**Criterio de éxito:** 0 mocks duplicados, mismos 149 tests pasando, helpers compartidos son la fuente única.

### Fase B: Tests unitarios de lógica legal (mayor ROI)

**Objetivo:** Cubrir la lógica de negocio más crítica y con más riesgo de regresión.

| Tarea | Archivo nuevo | Componente bajo test |
|---|---|---|
| B.1 | `Clocks.unit.test.js` | `useClocksManager` — plazos legales, suspensiones, extensiones |
| B.2 | `Clocks.unit.test.js` | `useProcessPhases` — mapeo de fases (radicación → resolución) |
| B.3 | `Clocks.unit.test.js` | `useAlarms` — alarmas de vencimiento |
| B.4 | `Utils.unit.test.js` | `calcularDiasHabiles` — días hábiles excluyendo festivos colombianos |
| B.5 | `TemplateEngine.unit.test.js` | `TemplateEngine` — generación de documentos legales |

**Usar fixtures:** `clocks_timeline.json` con los 4 escenarios preparados.

### Fase C: Tests de integración de módulos sin cobertura

**Objetivo:** Cada módulo crítico tiene al menos un test de integración con render, service call, y DataTable.

| Prioridad | Archivo nuevo | Módulo | Service |
|---|---|---|---|
| 1 | `Clocks.integration.test.js` | Relojes legales | `fun.service.js` |
| 1 | `Records.integration.test.js` | Radicados (ENG/LAW/ARC/PH) | `record_*.service.js` |
| 1 | `PQRS.integration.test.js` | Peticiones ciudadanas | `pqrs_main.service.js` |
| 2 | `Dashboard.integration.test.js` | Panel principal | `data.service.js` |
| 2 | `Nomenclature.integration.test.js` | Nomenclatura urbana | `nomeclature.service.js` |
| 2 | `ZoneUse.integration.test.js` | Zonas de uso del suelo | `zone_use.service.js` |
| 3 | `Certifications.integration.test.js` | Certificaciones | `certifications.service.js` |
| 3 | `Norms.integration.test.js` | Normatividad | `norm.service.js` |
| 3 | `Profesionals.integration.test.js` | Directorio profesionales | `profesionals.service.js` |

### Fase D: Tests de flujos de trabajo (el foco principal) {#fase-d}

Detallado en la sección 4.

### Fase E: Migrar a MSW (opcional, alto valor)

**Objetivo:** Reemplazar `vi.mock()` de services por Mock Service Worker para interceptar a nivel de red.

**Ventajas:** Valida URLs, headers, serialización. Código HTTP real (axios) se ejecuta completo.

---

## 4. Tests de flujos de trabajo — Diseño detallado

Los tests de flujos de trabajo validan **secuencias completas de negocio** dentro de jsdom. No son E2E (no necesitan backend real), pero van más allá de la integración simple porque involucran:

- Múltiples interacciones de usuario encadenadas
- Múltiples llamadas a services en secuencia
- Transiciones de estado del componente
- Validación de formularios
- Modales que abren → se llenan → se envían → se cierran

### 4.1 Diferencia con los tests de integración actuales

| Aspecto | Integración actual | Flujo de trabajo |
|---|---|---|
| **Scope** | Un componente con mocks de sub-componentes | Un componente con algunos sub-componentes **reales** |
| **Interacciones** | 1-2 clicks aislados | Secuencia de 5-15 interacciones |
| **State transitions** | Verificar estado inicial | Verificar transición: inicial → loading → datos → acción → resultado |
| **Service calls** | Verificar que se llama 1 vez | Verificar secuencia: `getAll` → user fills form → `create` → `getAll` refresh |
| **User simulation** | `fireEvent.click(btn)` | `userEvent.click` → `userEvent.type` → `userEvent.selectOptions` → `userEvent.click` |
| **Mock granularity** | Sub-componentes todos stubbed | Sub-componentes clave renderizados reales (ej: formulario modal) |

### 4.2 Convenciones para archivos de flujo

```
src/__tests__/{Modulo}.workflow.test.js
```

- **Sufijo:** `.workflow.test.js` para distinguirlos de `.integration.test.js`
- **Usar `userEvent`** en vez de `fireEvent` (más realista, simula secuencia mousedown→focus→mouseup→click)
- **Usar fixtures** de `src/__tests__/fixtures/` para datos de entrada y respuestas de servicio
- **Importar helpers compartidos** de `src/__tests__/helpers/`

### 4.3 Patrón base para un test de flujo

```js
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ─── Shared mocks ─────────────────────────────────────────────────────────
import './helpers/mockExternals';

// ─── Service mocks ────────────────────────────────────────────────────────
const MOCK_SERVICE = { /* métodos con vi.fn() */ };
vi.mock('../app/services/mi.service', () => ({
  __esModule: true,
  default: MOCK_SERVICE,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────
import fixtures from './fixtures/mi_fixture.json';

// ─── Helpers ──────────────────────────────────────────────────────────────
import { defaultProps, setWindowUser, clearWindowUser } from './helpers/renderHelpers';

// ─── Sub-components: solo stub los que NO participan en el flujo ──────────
vi.mock('../app/pages/user/modulo/sub_comp_irrelevante', () => ({
  __esModule: true,
  default: () => <div data-testid="irrelevant-stub" />,
}));
// NOTA: el formulario modal NO se stubbea — se renderiza real para testear el flujo

// ─── Component under test ─────────────────────────────────────────────────
import MiComponente from '../app/pages/user/modulo/mi_componente';

describe('Flujo: [nombre del flujo de negocio]', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    setWindowUser({ roleId: 1 });
    vi.clearAllMocks();
  });

  afterAll(() => {
    clearWindowUser();
  });

  function renderComponent(props = {}) {
    return render(
      <MemoryRouter>
        <MiComponente {...defaultProps} {...props} />
      </MemoryRouter>
    );
  }

  test('Flujo completo: [descripción del flujo]', async () => {
    // ARRANGE — Configurar respuestas de service
    MOCK_SERVICE.getAll.mockResolvedValue({ data: fixtures.list });
    MOCK_SERVICE.create.mockResolvedValue({ data: 'OK' });

    // ACT 1 — Render y esperar carga inicial
    await act(async () => {
      renderComponent();
    });
    await waitFor(() => {
      expect(screen.getByText(fixtures.list[0].id_public)).toBeInTheDocument();
    });

    // ACT 2 — Abrir modal de creación
    await user.click(screen.getByText(/NUEVO/i));
    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    // ACT 3 — Llenar formulario
    const modal = screen.getByTestId('mock-modal');
    await user.type(within(modal).getByLabelText(/nombre/i), 'Juan Pérez');
    await user.selectOptions(within(modal).getByLabelText(/tipo/i), 'CONSTRUCCIÓN');

    // ACT 4 — Submit del formulario
    await user.click(within(modal).getByText(/GUARDAR/i));

    // ASSERT — Verificar que el service fue llamado con los datos correctos
    expect(MOCK_SERVICE.create).toHaveBeenCalledTimes(1);
    expect(MOCK_SERVICE.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Juan Pérez', type: 'CONSTRUCCIÓN' })
    );
  });
});
```

### 4.4 Los 8 flujos de trabajo prioritarios

---

#### Flujo 1: Ventanilla — Recepción de documento nuevo

**Archivo:** `Submit.workflow.test.js`
**Módulo:** `src/app/pages/user/submit/submit.js`
**Sub-componente real:** `submit_manage` (el modal de creación)
**Service:** `submit.service.js`
**Fixture:** `submit_entry.json`
**Roles:** admin (1), ventanilla (4)

**Secuencia:**

```
1. Render Submit → esperar DataTable con data de getAll()
2. Click "NUEVA ENTRADA" → modal se abre
3. Llenar: tipo documento, remitente, CC, teléfono, asunto, páginas, anexos
4. Click "GUARDAR" → service.create() llamado con datos correctos
5. Modal se cierra → DataTable se refresca (getAll se llama de nuevo)
6. Verificar que la nueva entrada aparece en la tabla
```

**Tests dentro del flujo:**

| # | Test | Tipo de verificación |
|---|---|---|
| 1 | Render con datos existentes muestra DataTable completa | Estado inicial con fixture `entry_list` |
| 2 | Click "NUEVA ENTRADA" abre modal con formulario vacío | Transición UI |
| 3 | Formulario requiere campos obligatorios (remitente, asunto) | Validación |
| 4 | Llenar formulario completo y guardar llama `service.create()` con FormData correcta | Service contract |
| 5 | Después de guardar, modal se cierra y tabla se refresca | Ciclo completo |
| 6 | Buscar por radicado filtra la tabla | Búsqueda funcional |
| 7 | Buscar por CC de remitente filtra correctamente | Búsqueda por campo |
| 8 | Solo role admin y ventanilla ven botón "NUEVA ENTRADA" | Role-gating |

---

#### Flujo 2: Licencias — Consulta y navegación de licencia existente

**Archivo:** `FunView.workflow.test.js`
**Módulo:** `src/app/pages/user/fun.js`
**Sub-componentes reales:** tabs de navegación interna (fun_g, fun_n, fun_docs, etc.)
**Service:** `fun.service.js`
**Fixture:** `fun_license.json`

**Secuencia:**

```
1. Render FUN con DataTable → getAll_fun() retorna license_list (3 licencias)
2. Verificar que las 3 licencias aparecen con id_public, tipo, propietario
3. Click en una licencia → se carga licencia completa (get() con license_complete)
4. Verificar que los tabs de navegación aparecen (General, Normas, Documentos, etc.)
5. Click entre tabs → verificar que cada tab muestra su sub-componente
6. Verificar que datos del propietario se muestran correctamente
```

**Tests:**

| # | Test |
|---|---|
| 1 | DataTable carga y muestra 3 licencias de la fixture |
| 2 | Columnas correctas: Nr Licencia, Tipo, Propietario, Dirección, Estado |
| 3 | Seleccionar licencia carga datos completos via `get()` |
| 4 | Tabs de navegación visibles después de seleccionar licencia |
| 5 | Datos del propietario (nombre, CC, teléfono, email) renderizados correctamente |
| 6 | Estado "ESTUDIO" muestra badge/tag correcto |

---

#### Flujo 3: Relojes legales — Visualización de timeline y states

**Archivo:** `Clocks.workflow.test.js`
**Módulo:** `src/app/pages/user/clocks/` (componente principal de relojes)
**Sub-componentes reales:** timeline visual, indicadores de fase
**Service:** `fun.service.js` (métodos de clocks)
**Fixture:** `clocks_timeline.json`

**Secuencia:**

```
1. Render Clocks con licencia mock → cargar timeline full_timeline (8 pasos)
2. Verificar que se muestran los 8 estados: Radicación → Resolución
3. Verificar cálculo de días entre estados
4. Render con timeline with_suspension → verificar que suspensión se muestra diferente
5. Verificar que el conteo de días excluye período de suspensión
6. Render con timeline with_desistimiento → verificar estados negativos
7. Render con timeline empty → verificar estado vacío
```

**Tests:**

| # | Test |
|---|---|
| 1 | Timeline completo muestra 8 fases en orden correcto |
| 2 | Cada fase muestra fecha y descripción |
| 3 | Timeline con suspensión marca visualmente los estados 300/350 |
| 4 | Días hábiles se calculan excluyendo suspensión |
| 5 | Timeline con desistimiento muestra estados negativos |
| 6 | Timeline vacío muestra estado apropiado (sin fases) |
| 7 | Fechas se formatean correctamente con moment |

---

#### Flujo 4: Archivo — Creación de caja y asignación de items

**Archivo:** `Archive.workflow.test.js`
**Módulo:** `src/app/pages/user/archive/archive.page.js`
**Sub-componente real:** `archive_manage.component` (el formulario de caja)
**Service:** `archive.service.js`
**Fixture:** Datos inline (compatible con los del `Archive.integration.test.js` actual)

**Secuencia:**

```
1. Render Archive como admin → DataTable vacía ("NO HAY CAJAS")
2. Click "NUEVA CAJA" → modal se abre con formulario
3. Llenar: estante, entrepaño, número de caja
4. Click "GUARDAR" → service.create() llamado
5. Modal se cierra → tabla se refresca
6. Verificar que la nueva caja aparece en DataTable
7. Click en caja → se abren opciones (Modificar Items, Modificar caja, Eliminar)
8. Click "Eliminar" → confirmación Swal → service.delete() llamado
```

**Tests:**

| # | Test |
|---|---|
| 1 | Estado vacío muestra "NO HAY CAJAS" |
| 2 | Click "NUEVA CAJA" abre modal |
| 3 | Formulario valida campos requeridos |
| 4 | Guardar caja llama `service.create()` con datos correctos |
| 5 | Después de crear, tabla se refresca mostrando caja nueva |
| 6 | Eliminar caja muestra confirmación Swal |
| 7 | Confirmar eliminación llama `service.delete()` |
| 8 | Role 2 (profesional) no ve botón "NUEVA CAJA" |

---

#### Flujo 5: Expedición — Generación de expedición para licencia

**Archivo:** `Expedition.workflow.test.js`
**Módulo:** `src/app/pages/user/expeditions/expedition.page.js`
**Service:** `expedition.service.js`, `fun.service.js`, `record_law.service.js`
**Fixture:** `fun_license.json`

**Secuencia:**

```
1. Render con licencia seleccionada → carga expedición via getRecord()
2. Si no existe expedición → muestra "GENERAR EXPEDICIÓN EN BLANCO"
3. Click generar → service.create() llamado
4. Después de crear, aparecen las 6 secciones de expedición
5. Verificar que cada sección muestra su sub-componente
6. Verificar navegación de versiones (si aplica)
```

---

#### Flujo 6: Gestión FUN — Navegación por tabs y secciones

**Archivo:** `FunManage.workflow.test.js`
**Módulo:** `src/app/pages/user/funmanage.page.js`
**Service:** `fun.service.js`, `users.service.js`

**Secuencia:**

```
1. Render → muestra título "GESTION DE SOLICITUDES"
2. Tab "PROCESOS DIARIOS" activo por defecto → muestra sub-componente diario
3. Click tab "ENTRADA DE DOCUMENTOS" → muestra sub-componente de entrada
4. Click tab "CARGA PROFESIONAL" → muestra asignación de profesionales
5. Sección ACCIONES: MACROTABLA y REPORTES visibles
6. Campos de fecha (inicio/fin) aceptan input y filtran
```

---

#### Flujo 7: PQRS — Creación y gestión de petición ciudadana

**Archivo:** `PQRS.workflow.test.js`
**Módulo:** `src/app/pages/user/pqrs/` (componente principal)
**Service:** `pqrs_main.service.js`

**Secuencia:**

```
1. Render PQRS con datos existentes → DataTable con peticiones
2. Click "NUEVA PQRS" → formulario de creación
3. Llenar datos del ciudadano + tipo de petición + descripción
4. Guardar → service.create()
5. PQRS aparece en tabla con estado "PENDIENTE"
6. Abrir PQRS → ver detalle
7. Agregar respuesta → service.update() con nuevo estado
```

---

#### Flujo 8: Records — Creación de radicado por disciplina

**Archivo:** `Records.workflow.test.js`
**Módulo:** `src/app/pages/user/records/` (record_eng, record_law, record_arc, record_ph)
**Service:** `record_eng.js`, `record_law.js`, `record_arc.js`, `record_ph.js`

**Secuencia:**

```
1. Render Records con licencia vinculada → cargar radicados existentes via getByFun()
2. Si no hay radicados → botón de crear visible
3. Click crear radicado de ingeniería → formulario
4. Llenar datos técnicos
5. Guardar → service.create()
6. Radicado aparece en la lista
7. Repetir para las 4 disciplinas (ENG, LAW, ARC, PH)
```

---

### 4.5 Decisiones clave para sub-componentes reales vs stubbed

En un test de flujo, **no todos los sub-componentes se stubbean**. La regla:

| Sub-componente | Real o Stub | Por qué |
|---|---|---|
| **Formulario modal** (el que el usuario llena) | **REAL** | Es el core del flujo: inputs, validación, submit |
| **DataTable** | **REAL** (via react-data-table-component) | Necesario para verificar que datos aparecen |
| **Tabs de navegación** | **REAL** | Parte de la interacción |
| Sub-módulos laterales (charts, PDFs, mapas) | **STUB** | Fuera del scope del flujo |
| Componentes de librerías legacy (react-vis, react-quill) | **STUB** | Pueden fallar por incompatibilidad |

**Principio:** Render real lo que el usuario toca en el flujo. Stub lo que no toca.

### 4.6 Manejo de sub-componentes que no se pueden renderizar reales

Algunos sub-componentes dependen de librerías legacy o tienen dependencias pesadas. Para estos:

```js
// Si el sub-componente usa react-quill (legacy), stubbearlo
vi.mock('../app/pages/user/pqrs/pqrs_rteReply.component', () => ({
  __esModule: true,
  default: ({ onChange, value }) => (
    <textarea
      data-testid="rich-text-mock"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));
```

**El stub debe replicar la interfaz mínima** (props que recibe, callbacks que emite) para que el flujo funcione.

### 4.7 Patrón para verificar secuencia de service calls

```js
test('Flujo CRUD: crear → refrescar lista', async () => {
  // Setup
  MOCK_SERVICE.getAll
    .mockResolvedValueOnce({ data: [] })              // Carga inicial (vacío)
    .mockResolvedValueOnce({ data: [newItem] });      // Refresco post-crear
  MOCK_SERVICE.create.mockResolvedValueOnce({ data: newItem });

  await act(async () => { renderComponent(); });

  // Verificar carga inicial
  await waitFor(() => {
    expect(screen.getByText('NO HAY DATOS')).toBeInTheDocument();
  });

  // Crear
  await user.click(screen.getByText(/NUEVO/i));
  // ... llenar formulario ...
  await user.click(screen.getByText(/GUARDAR/i));

  // Verificar secuencia
  expect(MOCK_SERVICE.create).toHaveBeenCalledTimes(1);
  await waitFor(() => {
    expect(MOCK_SERVICE.getAll).toHaveBeenCalledTimes(2); // inicial + refresco
  });
});
```

### 4.8 Patrón para verificar Swal de confirmación

```js
test('Eliminar muestra confirmación y llama delete', async () => {
  const Swal = (await import('sweetalert2')).default;

  // Render con datos
  MOCK_SERVICE.getAll.mockResolvedValueOnce({ data: [item] });
  await act(async () => { renderComponent(); });

  // Click eliminar
  const deleteBtn = screen.getByRole('button', { name: /eliminar/i });
  await user.click(deleteBtn);

  // Swal fue llamado con confirmación
  expect(Swal.fire).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: 'warning',
      showCancelButton: true,
    })
  );

  // Service delete fue llamado (Swal mock retorna isConfirmed: true)
  await waitFor(() => {
    expect(MOCK_SERVICE.delete).toHaveBeenCalledWith(item.id);
  });
});
```

---

## 5. Fixtures necesarias para los flujos

### 5.1 Fixtures existentes (listas para usar)

| Fixture | Flujos que la usan |
|---|---|
| `users.json` | Todos (role-gating) |
| `fun_license.json` | Flujo 2 (Licencias), Flujo 3 (Clocks), Flujo 5 (Expedición), Flujo 8 (Records) |
| `submit_entry.json` | Flujo 1 (Ventanilla) |
| `clocks_timeline.json` | Flujo 3 (Relojes) |

### 5.2 Fixtures nuevas necesarias

| Fixture nueva | Contenido | Para flujo |
|---|---|---|
| `archive_box.json` | `box_complete`, `box_with_items`, `box_list` | Flujo 4 (Archivo) |
| `pqrs_petition.json` | `petition_complete`, `petition_with_response`, `petition_list` | Flujo 7 (PQRS) |
| `records_radicado.json` | `radicado_eng`, `radicado_law`, `radicado_arc`, `radicado_ph`, `radicado_list` | Flujo 8 (Records) |
| `expedition_data.json` | `expedition_complete`, `expedition_empty` | Flujo 5 (Expedición) |

---

## 6. Orden de implementación recomendado

El orden equilibra dependencias, riesgo, y complejidad:

```
1. Fase A — Consolidar helpers (prerequisito para todo)
   ↓
2. Flujo 1 — Submit (el más simple, patrón CRUD limpio)
   ↓
3. Flujo 4 — Archive (similar a Submit, agrega role-gating)
   ↓
4. Flujo 6 — FunManage (agrega tabs, navegación interna)
   ↓
5. Fase B — Unit tests de Clocks hooks (prerequisito para Flujo 3)
   ↓
6. Flujo 3 — Clocks workflow (depende de unit tests de hooks)
   ↓
7. Flujo 2 — FunView (el más complejo, muchos sub-componentes)
   ↓
8. Flujo 5 — Expedition
   ↓
9. Flujo 7 — PQRS (depende de mock de react-quill)
   ↓
10. Flujo 8 — Records (4 disciplinas, repetitivo)
```

---

## 7. Métricas objetivo

| Métrica | Actual | Post Fase A+B | Post Flujos | Largo plazo |
|---|---|---|---|---|
| Tests totales | ~149 | 180+ | 300+ | 500+ |
| Suites | 10 | 13 | 20+ | 35+ |
| Hooks con unit test | 0/3 | 3/3 | 3/3 | 3/3 |
| Módulos con workflow test | 0/23 | 0/23 | 8/23 | 15/23 |
| Modules con integration test | 4/23 | 4/23 | 10/23 | 18/23 |
| Fixtures usadas | 0/4 | 2/4 | 8/8+ | 10+ |
| Helpers compartidos usados | 0/4 | 4/4 | 4/4 | 4/4 |
| Cobertura estimada | ~15% | ~25% | ~45% | 70% |

---

## 8. Reglas para el agente que implemente tests

1. **Leer este documento completo** antes de escribir cualquier test
2. **Leer `testing.instructions.md`** para reglas técnicas (vi.*, act, etc.)
3. **Leer `clocks.instructions.md`** si va a testear relojes
4. **Importar `mockExternals.js`** — nunca duplicar mocks de externos inline
5. **Importar `renderHelpers.js`** — nunca redefinir `defaultProps` inline
6. **Usar factorías de `mockServices.js`** como base y extender con `overrides`
7. **Usar fixtures JSON** para datos — nunca inventar datos inline sin justificación
8. **Usar `userEvent`** para todas las interacciones (no `fireEvent`)
9. **Correr `npm test`** después de cada suite nueva para verificar que nada se rompe
10. **No crear tests que dependan de strings exactos del DOM** cuando se pueda usar `getByRole` o `getByTestId`
11. **Numerar los tests** secuencialmente dentro de cada describe (patrón existente)
12. **Un test por flujo completo** + tests individuales para variaciones (error, empty, role-gating)

---

## 9. Referencia rápida de archivos

```
src/__tests__/
├── setup.js                              ← Setup global
├── helpers/
│   ├── mockExternals.js                  ← Mocks de librerías externas
│   ├── mockServices.js                   ← Factorías de mock de services
│   ├── mockPages.js                      ← Mocks de páginas para App.js
│   └── renderHelpers.js                  ← defaultProps, setWindowUser, renderWithRouter
├── fixtures/
│   ├── users.json                        ← Admin, profesional, archivista, ventanilla
│   ├── fun_license.json                  ← Licencia completa, mínima, lista
│   ├── submit_entry.json                 ← Entrada completa, vinculada, lista
│   └── clocks_timeline.json              ← Full, suspensión, desistimiento, vacío
├── App.smoke.test.js                     ← 6 tests
├── Login.smoke.test.js                   ← 4 tests
├── Navigation.smoke.test.js              ← 23 tests
├── FunLicenses.smoke.test.js             ← 33 tests
├── Modules.smoke.test.js                 ← 13 tests
├── Expedition.integration.test.js        ← 12 tests
├── FunManage.integration.test.js         ← 12 tests
├── Submit.integration.test.js            ← 14 tests
├── Archive.integration.test.js           ← 17 tests
└── mdb-debug.test.js                     ← 12 tests
```

---

## 10. Checklist de validación post-implementación

Después de implementar cada flujo de trabajo, verificar:

- [ ] `npm test` pasa (todos los tests, no solo los nuevos)
- [ ] El test usa `mockExternals.js` (no duplica mocks inline)
- [ ] El test usa `renderHelpers.js` (no redefine `defaultProps`)
- [ ] El test usa fixtures de `fixtures/` (no inventa datos inline sin razón)
- [ ] El test usa `userEvent` (no `fireEvent`)
- [ ] El test verifica: estado vacío, carga, datos, interacción completa, error
- [ ] El test verifica role-gating si el componente lo tiene
- [ ] No hay `console.error` ni warnings de `act()` sin resolver
- [ ] Los tests están numerados secuencialmente
- [ ] El nombre del describe refleja el flujo de negocio, no el nombre técnico
