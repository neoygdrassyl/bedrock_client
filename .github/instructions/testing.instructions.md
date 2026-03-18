---
applyTo: 'src/__tests__/**'
---

# Instrucciones para el Agente de Testing — Dovela Frontend

## Contexto

Este documento configura un agente especializado en testing para la aplicación Dovela (Curaduría Urbana). El agente debe seguir estas instrucciones al crear, modificar o analizar tests.

---

## 1. Stack de Testing

| Herramienta | Versión | Uso |
|---|---|---|
| **Vitest** | 4.x | Runner + assertions (`vi.fn()`, `vi.mock()`, `vi.spyOn()`) |
| **@testing-library/react** | 16.x | Renderizado + queries (`render`, `screen`, `fireEvent`, `waitFor`) |
| **@testing-library/jest-dom** | 6.x | Matchers DOM (`.toBeInTheDocument()`, `.toHaveTextContent()`) |
| **@testing-library/user-event** | 14.x | Interacciones realistas (`userEvent.click()`, `.type()`) |
| **jsdom** | 24.x | Entorno DOM simulado |
| **Playwright MCP** | — | Tests E2E visuales con navegador real (screenshots, clicks, navegación) |

## 1.1 Preflight preventivo (antes de E2E o debugging de crash)

Ejecutar siempre estos comandos antes de atribuir un fallo a Playwright o a datos de backend:

```bash
npm run audit:ast
npm run audit:arrays
```

Modo estricto opcional (CI o gates de merge):

```bash
npm run audit:arrays:strict
```

Interpretación:
- `audit:ast`: debe devolver `OK`; detecta errores de sintaxis/estructura (llaves asimétricas, bloques mal cerrados) que pueden causar pantalla en blanco.
- `audit:arrays`: reporta llamadas potencialmente inseguras a `.map/.filter/.reduce/...` sobre valores no validados; en modo normal no bloquea.
- `audit:arrays:strict`: mismo análisis, pero retorna exit code `1` cuando hay hallazgos para usar como gate en CI.

Regla operativa:
- Si hay crash silencioso o `TypeError` tipo "map is not a function", revisar primero los hallazgos de `audit:arrays` del módulo afectado.

### NO usar API de Jest — usar API de Vitest:
```js
// ✅ Correcto
vi.fn(), vi.mock(), vi.spyOn(), vi.useFakeTimers()

// ❌ Incorrecto
jest.fn(), jest.mock(), jest.spyOn(), jest.useFakeTimers()
```

---

## 2. Estructura de archivos de test

```
src/__tests__/
  setup.js                          ← Setup global (jest-dom matchers, env vars)
  {Modulo}.smoke.test.js           ← Tests de humo (importación, render básico)
  {Modulo}.integration.test.js     ← Tests de integración (interacciones, API mocks)
  {Modulo}.unit.test.js            ← Tests unitarios (hooks, utils, services)
  {Modulo}.e2e.test.js             ← Tests E2E con Playwright MCP (flujos completos)
```

### Convención de nombres:
- **Smoke**: `{Modulo}.smoke.test.js` — Verifica que el módulo importa y renderiza sin crash
- **Unit**: `{Modulo}.unit.test.js` — Prueba funciones puras, hooks aislados, services
- **Integration**: `{Modulo}.integration.test.js` — Renderiza componentes con mocks de API, verifica interacciones
- **E2E**: Usar Playwright MCP directamente contra la app corriendo en dev server

---

## 3. Patrón de mocks reutilizable

### Mock base para tests que renderizan App.js completo

Muchos tests repiten los mismos ~20 mocks de páginas. Crear un archivo compartido:
```
src/__tests__/helpers/
  mockPages.js         ← vi.mock() para todas las páginas de App.js
  mockExternals.js     ← vi.mock() para i18next, sweetalert2, rsuite, recaptcha, etc.
  mockServices.js      ← Factorías de mock para services
  renderHelpers.js     ← Wrappers de render con MemoryRouter, ThemeProvider, etc.
```

### Ejemplo de mock de service:
```js
// helpers/mockServices.js
export function createMockService(methods = {}) {
  return {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    ...methods,
  };
}
```

### Ejemplo de helper de render:
```js
// helpers/renderHelpers.js
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export const defaultProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    text_btn: 'OK',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: { id: '1' },
};

export function renderWithRouter(Component, props = {}, { route = '/' } = {}) {
  window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Component {...defaultProps} {...props} />
    </MemoryRouter>
  );
}
```

---

## 4. Tipos de test y cuándo usar cada uno

### 4.1 Tests de Humo (Smoke)
**Objetivo**: Detectar que un módulo no explota al importarse o renderizarse.
**Cuándo**: Todo módulo nuevo DEBE tener al menos un smoke test.
**Valor**: Alto para detectar regresiones de imports/exports rotos.

```js
test('MiModulo se importa sin error', async () => {
  await expect(import('../app/pages/user/miModulo')).resolves.toBeTruthy();
});
```

### 4.2 Tests Unitarios (Unit)
**Objetivo**: Probar funciones puras, hooks y lógica de negocio aislada del DOM.
**Cuándo**: Para hooks custom (`useClocksManager`, `useProcessPhases`, `useAlarms`), utilidades (`TemplateEngine`, `calcularDiasHabiles`), y services.
**Valor**: Máximo — son rápidos, estables, y prueban la lógica legal del sistema.

```js
// Hook testing con renderHook
import { renderHook } from '@testing-library/react';
import { useClocksManager } from '../app/pages/user/clocks/hooks/useClocksManager';

test('calcula días hábiles correctamente', () => {
  const { result } = renderHook(() => 
    useClocksManager(mockItem, mockClocks, 1, '2026-03-01')
  );
  expect(result.current.daysRemaining).toBe(45);
});
```

### 4.3 Tests de Integración (Integration)
**Objetivo**: Verificar que componentes se renderizan con datos mockeados y responden a interacciones.
**Cuándo**: Para flujos CRUD (crear/editar/eliminar), modales, búsquedas, DataTables.
**Valor**: Alto — valida el contrato UI ↔ Service.

### 4.4 Tests E2E con Playwright MCP
**Objetivo**: Validar flujos completos contra la app corriendo, incluyendo navegación, formularios, y respuestas visuales.
**Cuándo**: Para flujos críticos de negocio (radicación, ventanilla única, relojes).
**Valor**: Máximo para regresiones visuales y flujos multi-paso.

---

## 5. Módulos prioritarios para testing

### Prioridad 1 — Módulos SIN tests unitarios/integración (riesgo alto)
| Módulo | Descripción | Service | Complejidad |
|---|---|---|---|
| **Clocks** | Relojes legales — cálculos de plazos | `fun.service.js` | 🔴 Máxima |
| **Records** (ENG/LAW/ARC/PH) | Radicados por disciplina | `record_*.service.js` | 🔴 Alta |
| **PQRS** | Peticiones/quejas ciudadanas | `pqrs_main.service.js` | 🟡 Media |
| **Dashboard** | Panel principal | `data.service.js` | 🟡 Media |
| **Nomenclature** | Nomenclatura urbana | `nomeclature.service.js` | 🟡 Media |
| **Zone Use** | Zonas de uso del suelo | `zone_use.service.js` | 🟡 Media |
| **Certifications** | Certificaciones laborales | `certifications.service.js` | 🟢 Baja |
| **Norms** | Normatividad | `norm.service.js` | 🟢 Baja |
| **Profesionals** | Directorio profesionales | `profesionals.service.js` | 🟢 Baja |

### Prioridad 2 — Módulos CON tests pero insuficientes
| Módulo | Tests existentes | Falta |
|---|---|---|
| **FUN** | 33 smoke (import) + 12 integration | Tests CRUD, validaciones de formulario, flujo completo |
| **Archive** | 17 integration | Tests de edición de items, expandable rows funcionales |
| **Submit** | 14 integration | Test de flujo de creación completa, CSV export |
| **Expedition** | 12 integration | Tests de generación de documentos |

### Prioridad 3 — Lógica de negocio crítica sin tests
| Componente | Archivo | Por qué es crítico |
|---|---|---|
| `useClocksManager` | `clocks/hooks/useClocksManager.js` | Calcula plazos legales, suspensiones, extensiones |
| `useProcessPhases` | `clocks/hooks/useProcessPhases.js` | Mapea fases del proceso (radicación → resolución) |
| `useAlarms` | `clocks/hooks/useAlarms.js` | Alarmas de vencimiento de plazos |
| `TemplateEngine` | `utils/TemplateEngine.js` | Genera documentos legales (resoluciones) |
| `calcularDiasHabiles` | `clocks/utils/` | Cálculo de días hábiles excluyendo festivos |

---

## 6. Estrategia de base de datos volátil

Para tests de integración y E2E, la app necesita datos predecibles:

### Opción A: Mock en Vitest (actual, mejorable)
- Usar `vi.mock()` para services con datos realistas fixture-based
- Crear `src/__tests__/fixtures/` con datos JSON representativos

```
src/__tests__/fixtures/
  fun_license.json       ← Licencia completa con todos los campos
  clocks_timeline.json   ← Timeline de relojes para un proceso completo
  submit_entry.json      ← Entrada de ventanilla única
  archive_box.json       ← Caja de archivo con items
  user_admin.json        ← Usuario admin completo
  user_professional.json ← Usuario profesional
```

### Opción B: Base de datos de test en backend (recomendada para E2E)
- Crear endpoint PHP `POST /test/reset` que:
  1. Trunca tablas de test
  2. Inserta seed data predecible
  3. Retorna OK
- Usar prefijo de tabla `test_` o base de datos separada `dovela_test`
- Llamar antes de cada suite E2E

### Opción C: Interceptor de red con MSW (Mock Service Worker)
- Instalar `msw` como devDependency
- Intercepta llamadas HTTP a nivel de red
- No requiere cambios en backend
- Más realista que `vi.mock()` porque el código HTTP real se ejecuta

---

## 7. Testing E2E con Playwright MCP

### Flujos E2E críticos a implementar:

#### Flujo 1: Radicación desde cero
```
1. Login como admin
2. Ir a /fun (Licencias)
3. Click "NUEVA LICENCIA"
4. Llenar formulario de creación (tipo, propietario, dirección, etc.)
5. Guardar → Verificar que aparezca en DataTable
6. Abrir licencia creada
7. Verificar tabs (General, Normas, Documentos, Relojes)
```

#### Flujo 2: Ventanilla Única → Radicado
```
1. Login como admin
2. Ir a /submit (Ventanilla Única)
3. Click "NUEVA ENTRADA"
4. Llenar datos (tipo documento, remitente, asunto)
5. Guardar → Verificar número de radicación generado
6. Buscar por número → Verificar que aparezca
7. Vincular a licencia existente
```

#### Flujo 3: Relojes legales
```
1. Abrir una licencia con relojes activos
2. Verificar timeline visual
3. Verificar cálculo de días restantes
4. Simular suspensión → Verificar que el conteo se pausa
5. Reanudar → Verificar que el conteo continúa desde donde quedó
```

#### Flujo 4: Archivo documental
```
1. Ir a /archive
2. Crear nueva caja
3. Agregar items a la caja
4. Buscar por número de caja
5. Verificar que los items aparezcan en expandable row
```

### Uso del MCP de Playwright:
```
// Pseudocódigo de flujo E2E usando Playwright MCP tools
1. browser_navigate → http://localhost:3000/login
2. browser_snapshot → Verificar formulario de login
3. browser_fill_form → email + password
4. browser_click → botón submit
5. browser_wait_for → navegación a /dashboard
6. browser_navigate → http://localhost:3000/fun
7. browser_snapshot → Verificar DataTable de licencias
8. browser_console_messages → Verificar que no hay errores JS
```

---

## 8. Reglas para el agente de testing

### Al crear/modificar tests:
1. **SIEMPRE** usar `vi.*` (Vitest), nunca `jest.*`
2. **SIEMPRE** limpiar mocks en `beforeEach` o `afterEach`
3. **SIEMPRE** usar `act()` al renderizar componentes que tienen efectos asíncronos
4. **SIEMPRE** mockear `http-common` y services — nunca hacer llamadas HTTP reales en unit/integration
5. **SIEMPRE** mockear `sweetalert2`, `react-i18next`, `rsuite`, `react-google-recaptcha`
6. **NUNCA** usar `process.env` — usar `import.meta.env.VITE_*`
7. **NUNCA** usar `React.forwardRef()` o `defaultProps` en mocks
8. **PREFERIR** `screen.getByRole()` y `screen.getByText()` sobre `querySelector`
9. **PREFERIR** `userEvent` sobre `fireEvent` para interacciones de usuario
10. **PREFERIR** `waitFor` sobre `setTimeout` para esperas asíncronas

### Al detectar un test roto por una actualización:
1. Leer el error completo
2. Identificar si el cambio fue en el componente, en un service, o en una dependencia
3. Actualizar el mock/assertion correspondiente — NO borrar el test
4. Si el test era frágil (dependía de strings exactos o estructura DOM específica), refactorizarlo a uno más resiliente
5. Documentar la causa del fallo en un comentario

### Principio anti-fragilidad:
- Preferir assertions de **comportamiento** sobre assertions de **estructura**:
  ```js
  // ❌ Frágil — se rompe si cambia el HTML
  expect(container.querySelector('.btn-primary')).toBeInTheDocument();
  
  // ✅ Resiliente — se rompe solo si el botón desaparece
  expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  ```

---

## 9. Checklist pre-merge

Antes de aprobar un PR, el agente de testing debe verificar:

- [ ] Todos los tests existentes pasan (`npm test`)
- [ ] Si se modificó un módulo, su test existe y cubre el cambio
- [ ] Si se creó un módulo nuevo, se creó al menos un smoke test
- [ ] Si se modificó un hook de lógica de negocio, se creó/actualizó un unit test
- [ ] Si se modificó un service, el mock en tests refleja el nuevo contrato
- [ ] No hay `console.error` ni `act()` warnings sin resolver
- [ ] Los datos de test no exponen información sensible (`vars.js`)

---

## 10. Métricas objetivo

| Métrica | Actual | Objetivo corto plazo | Objetivo largo plazo |
|---|---|---|---|
| Tests totales | ~149 | 300+ | 600+ |
| Suites | 10 | 25+ | 40+ |
| Hooks con unit test | 0/3 | 3/3 | 3/3 |
| Services con unit test | 0/27 | 8/27 | 20/27 |
| Módulos con integration test | 4/23 | 12/23 | 20/23 |
| Flujos workflow testeados | 0 | 5 | 10 |
| Flujos E2E | 0 | 4 | 10 |
| Cobertura estimada | ~15% | 45% | 75% |

---

## 11. Estrategia de Testing Integral (4 Fases)

Para el plan detallado, ver `docs/testing/02-PLAN-ESTRATEGIA-TESTING.md`.

### Resumen de fases:

| Fase | Nombre | Semanas | Herramientas | Tests nuevos |
|------|--------|---------|-------------|-------------|
| **1** | Unit tests de lógica crítica | 1-3 | Vitest + renderHook | +60-80 |
| **2** | Integration tests profundos | 4-6 | @testing-library + userEvent | +50-70 |
| **3** | Workflow tests (flujos completos) | 7-10 | Vitest + MSW v2 | +30-40 |
| **4** | E2E tests (navegador real) | 11-14 | Playwright | +15-20 |

### Estructura de archivos expandida:

```
src/__tests__/
  setup.js                               ← Setup global existente
  {Modulo}.smoke.test.js                ← Smoke tests existentes
  {Modulo}.integration.test.js          ← Integration tests (expandir)
  {Modulo}.unit.test.js                 ← Unit tests (NUEVOS — Fase 1)
  helpers/
    mockExternals.js                    ← Mocks compartidos existentes
    mockPages.js                        ← Mocks de páginas existentes
    mockServices.js                     ← Factorías de mock existentes
    renderHelpers.js                    ← Helpers de render existentes
    clocksMother.js                     ← Object Mother para clocks (NUEVO — Fase 1)
    formDataAssert.js                   ← Helper para FormData assertions (NUEVO — Fase 2)
  fixtures/
    clocks_timeline.json                ← Existente
    clocks_phases.json                  ← NUEVO: datos para fases del proceso
    clocks_alarms.json                  ← NUEVO: datos para alarmas
    fun_license.json                    ← Existente
    submit_entry.json                   ← Existente
    users.json                          ← Existente
    holidays_2026.json                  ← NUEVO: festivos colombianos
  mocks/                                ← NUEVA CARPETA — Fase 3
    server.js                           ← Servidor MSW
    handlers.js                         ← Handlers por defecto
    handlers/
      auth.handlers.js                  ← Login, logout, /me
      fun.handlers.js                   ← CRUD de licencias + clocks
      submit.handlers.js               ← Ventanilla única
      records.handlers.js              ← Radicados por disciplina
  workflows/                            ← NUEVA CARPETA — Fase 3
    RadicarProyecto.workflow.test.js
    VentanillaUnica.workflow.test.js
    ProcesoLegal.workflow.test.js
    RelojesLegales.workflow.test.js
    PQRS.workflow.test.js

e2e/                                    ← NUEVA CARPETA — Fase 4
  fixtures/
    auth.fixture.js
  pages/
    login.page.js
    dashboard.page.js
    fun.page.js
    submit.page.js
    clocks.page.js
  flows/
    login.e2e.spec.js
    radicar-proyecto.e2e.spec.js
    ventanilla.e2e.spec.js
    relojes.e2e.spec.js
```

### Patrones de diseño clave:

- **AAA (Arrange-Act-Assert)** — En todo test
- **Object Mothers** — Generadores de datos (clocksMother.js)
- **Test Matrix** — `it.each` para cubrir festivos/tipos de licencia
- **Page Objects** — Para E2E con Playwright
- **MSW handlers** — Mock de red (no de módulos) para workflows
- **Role-based testing** — Cada módulo testeado con 4 roles (admin, profesional, archivista, ventanilla)

### Scripts NPM propuestos:

```bash
npm run test:unit         # Solo unit tests
npm run test:integration  # Solo integration tests
npm run test:workflow     # Solo workflow tests
npm run test:e2e          # Solo E2E (Playwright)
npm run test:all          # Todo: Vitest + Playwright
npm run test:coverage     # Con cobertura de línea
```

### Documentación de referencia:
- `docs/testing/01-DIAGNOSTICO-ESTADO-ACTUAL.md` — Diagnóstico del estado actual
- `docs/testing/02-PLAN-ESTRATEGIA-TESTING.md` — Plan detallado por fases con ejemplos
- `docs/testing/03-GAP-ANALYSIS.md` — Análisis de brecha y desafíos técnicos
- `docs/testing/04-WORKFLOW-EXAMPLES.md` — Ejemplos completos de tests de workflow
