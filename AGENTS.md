# AGENTS.md — Frontend Dovela (Curaduría Urbana)

Guía operativa para agentes de código. Léela completa antes de modificar cualquier archivo.

---

## 1. Qué es este proyecto

SPA que modela el proceso de **curaduría urbana**: expedientes, licencias, resoluciones, relojes de tiempo legales, PQRS, nomenclaturas, zonas de uso y documentos jurídicos.

- **Instancia real:** Curaduría Urbana 1 de Bucaramanga — `https://curaduria1bucaramanga.com.co/`
- **Cada componente, service y ruta representa una relación legal real.** No elimines ni desconectes funcionalidades sin que se pida explícitamente.
- **Backend:** PHP/MySQL en `C:\xampp\htdocs\dovela-backend` (inspeccionar vía MCP Filesystem para entender contratos de API).

### Stack

| Pieza | Tecnología |
|---|---|
| Framework | React 19 (`react@19.2.4`) — componentes funcionales + hooks |
| Build | Vite 6 (`vite@6.4.1`) + 3 plugins custom en `vite.config.mjs` |
| Tests | Vitest 4 (`vitest@4.0.18`) + `@testing-library/react@16` |
| Routing | `react-router-dom` v6 (`Routes`, `Route element={}`, `useNavigate`) |
| Estado | Local con `useState`/`useReducer` — no hay store global |
| HTTP | `axios@1.13` — instancia central en `src/http-common.js` |
| UI | Bootstrap 5 + wrappers locales en `src/app/components/ui/` + RSuite 5 + `styled-components@6` |
| Temas | `ThemeProvider` (styled-components) — tokens en `src/app/components/theme.js` |
| i18n | `i18next@24` + `react-i18next@15` (ES por defecto, EN disponible) |
| PDF | `jsPDF`, `pdf-lib`, `react-pdf@9` + motor de plantillas en `src/app/utils/` |
| Alertas | `sweetalert2@11` (`Swal`) |
| Fechas | `moment` + `moment-business-days` |
| Node | **v22+** obligatorio (`.nvmrc` = 22) — Vite 6 requiere OpenSSL 3 |

---

## 2. Comandos

```bash
nvm use 22              # OBLIGATORIO antes de cualquier operación

npm start               # Dev server en :3000 (alias: vite)
npm run build           # Build de producción → build/
npm test                # vitest run (una sola pasada)
npm run test:watch      # vitest en modo watch
npm run preview         # Preview del build
npm run audit:ast       # Auditoría estructural AST (llaves/sintaxis en src)
npm run audit:arrays    # Auditoría preventiva NO bloqueante (reporte)
npm run audit:arrays:strict # Modo bloqueante para CI
npm run audit:preflight # Ejecuta audit:ast + audit:arrays
```

### Variables de entorno (`.env` o `.env.local`)

```env
VITE_API_URL=http://localhost/dovela-backend/public
VITE_GLOBAL_ID=<id_de_curaduria>
```

Prefijo `VITE_`, acceso con `import.meta.env.VITE_*`. **No usar `process.env`.**

---

## 3. Estructura del proyecto

```
index.html                  ← Entry point de Vite (raíz, NO en public/)
vite.config.mjs             ← Plugins: jsxInJs, cjsToEsm, fix-moment-business-days
vitest.config.mjs            ← Config Vitest (plugins: cssNoop, jsxInJs)
src/
  index.js                  ← createRoot() de React 19
  http-common.js            ← Instancia Axios global (baseURL desde VITE_API_URL)
  __tests__/                ← 268 tests en 27 suites + setup.js
  e2e/                      ← 35 tests E2E Playwright (28 pass, 7 skip)
  app/
    App.js                  ← Router principal + ProvideAuth + ThemeProvider
    components/
      ui/index.js           ← Wrappers Bootstrap 5 (reemplazo de mdb-react-ui-kit, 909 líneas)
      theme.js              ← lightTheme / darkTheme
      global.js             ← GlobalStyles + clases CSS reutilizables
      font.js               ← Sistema de escala de fuente (5 niveles)
      navbar.js             ← Navegación principal
      jsons/vars.js         ← Datos sensibles de instancia (NIT, emails) — NO loguear
    pages/user/             ← Módulos de la aplicación:
      clocks/               ← Relojes legales (el más complejo; tiene hooks propios)
      records/              ← Radicados / expedientes (ARC, ENG, LAW, PH)
      fun_forms/            ← Formularios FUN + gráficas (usa react-vis — legacy)
      pqrs/                 ← PQRS (usa react-quill — legacy)
      submit/               ← Ventanilla única
      expeditions/          ← Expediciones de documentos
      archive/              ← Archivo documental
      nomenclature/         ← Nomenclatura urbana
      zone_use/             ← Zonas de uso del suelo
      certifications/       ← Certificaciones laborales
      norms/                ← Normatividad legal
      profesionals/         ← Directorio de profesionales
      guide_user/           ← Guía de usuario
      dev_guide/            ← Guía de desarrollo
    services/               ← Un service por dominio, todos usan http-common.js
    utils/                  ← Motor de plantillas (TemplateEngine, ResoEngineTemplate, etc.)
    translation/            ← Archivos i18n (es/, en/)
public/templates/           ← Plantillas HTML de resoluciones — NO editar sin entender TemplateEngine.js
```

### Rutas (App.js)

24 rutas totales: 7 públicas (`/login`, `/home`, `/norms`, `/certs`, `/zone_use`, `/dev-guide`, `/`) y 15 privadas protegidas por `PrivateRoute` (verifica `auth.user`, redirige a `/login` si es null).

### Servicios principales

27 archivos de service en `src/app/services/`. Los más relevantes:

| Módulo | Service |
|---|---|
| Auth/usuarios | `custom.service.js`, `users.service.js`, `data.service.js` |
| FUN/licencias | `fun.service.js` (el más extenso, 200+ métodos) |
| Radicados | `record_eng.js`, `record_law.js`, `record_arc.js`, `record_ph.js` |
| PQRS | `pqrs_main.service.js` |
| Archivo | `archive.service.js` |
| Expediciones | `expedition.service.js` |
| Ventanilla | `submit.service.js` |
| Nomenclatura | `nomeclature.service.js` |
| Zona de uso | `zone_use.service.js` |

---

## 4. Estándares de código

### Componentes

- **Funcionales con hooks** para todo código nuevo. Existen ~178 class components legacy — no repliques ese patrón.
- Si tocas un class component para un bugfix, **no lo conviertas** a funcional a menos que se pida.
- En React 19 `ref` es una prop normal — **no usar `React.forwardRef()`** en código nuevo:
  ```js
  // ✅ React 19
  const MyComp = ({ ref, children }) => <div ref={ref}>{children}</div>;
  // ❌ Obsoleto
  const MyComp = React.forwardRef((props, ref) => <div ref={ref} />);
  ```
- **No usar `defaultProps`** en funcionales — React 19 lo ignora. Usar valores por defecto en parámetros.
- Encapsular lógica reutilizable en hooks (`useXxx`). Modelo: `src/app/pages/user/clocks/hooks/useClocksManager.js`.

### HTTP y servicios

- **Toda llamada HTTP** va en un service de `src/app/services/`, no directamente en componentes.
- Manejar errores con `.catch()` + `Swal.fire(...)` — nunca silenciar errores.

```js
// Patrón correcto
import MiService from '../../../services/mi.service';
useEffect(() => {
  MiService.getAll()
    .then(res => setData(res.data))
    .catch(() => Swal.fire('Error', 'No se pudo cargar', 'error'));
}, []);
```

### UI

- **No instalar `mdb-react-ui-kit`** — fue eliminada intencionalmente. Los componentes MDB (`MDBCard`, `MDBBtn`, `MDBModal`, etc.) están reimplementados en `src/app/components/ui/index.js` como wrappers de Bootstrap 5.
- Usar clases de `GlobalStyles` (`.container-primary`, `.bg-card`, `.app-text-primary`) en vez de colores inline.
- Alertas: `Swal`. Tablas: `react-data-table-component`. Selects/pickers: RSuite 5.
- **No introducir** nueva librería UI sin consenso.

### Routing (v6)

```js
// ✅ Patrones actuales
<Route path='/ruta' element={<PrivateRoute><Pagina /></PrivateRoute>} />
const navigate = useNavigate();
navigate('/ruta');                    // push
navigate('/home', { replace: true }); // replace
navigate(-1);                         // back

// ❌ API v5 — NO existe en el proyecto
Switch, Redirect, useHistory, component={}, render={}
```

### i18n

Usar `useTranslation()` para todo texto visible. Agregar claves en `src/app/translation/es/translations.js` y `en/`.

### Nomenclatura de archivos

| Tipo | Patrón |
|---|---|
| Página | `nombreModulo.page.js` o `nombreModulo.js` |
| Componente | `nombreComponente.component.js` |
| Service | `dominio.service.js` |
| Hook | `useNombreHook.js` |

---

## 5. Testing

**268 tests unitarios/integración en 27 suites + 35 tests E2E con Playwright.** Todos deben pasar antes de hacer merge.

```bash
nvm use 22                  # obligatorio
npm run audit:ast           # gate rápido de estructura antes de tests
npm run audit:arrays        # detecta riesgos de "map is not a function" (solo reporte)
npm test                    # vitest run (unit + integration, 268 tests — 100% verde)
npx playwright test         # E2E en Chromium (35 tests; requiere backend :3001 y datos reales)
npx playwright test --ui    # UI interactiva de Playwright
```

### Preflight de estabilidad (obligatorio para agentes)

Antes de ejecutar E2E o de depurar un crash de pantalla blanca, correr en este orden:

1. `npm run audit:ast` → valida integridad de sintaxis/estructura del árbol React.
2. `npm run audit:arrays` → detecta llamadas de métodos de array potencialmente inseguras (no bloquea por defecto).
3. Para gate estricto en CI usar `npm run audit:arrays:strict`.

Notas:
- `audit:ast` debe terminar en `OK` para considerar estable el código fuente.
- `audit:arrays` devuelve `0` salvo errores de parseo; es modo suave para revisión continua.
- `audit:arrays:strict` devuelve `1` cuando encuentra riesgos; usar solo cuando quieras bloquear merges.

### Marco de 4 opciones anticrash (herramienta oficial de detección temprana)

Este proyecto usa un marco de 4 opciones para prevenir "pantalla blanca" y errores de render antes de que lleguen a producción.

1. **Opción 1 — Auditoría AST estructural (`audit:ast`)**
  - Qué cubre: llaves asimétricas, bloques mal cerrados, sintaxis rota y parse errors en `src/`.
  - Por qué existe: muchos crashes silenciosos vienen de estructura JS/JSX dañada tras cambios grandes.
  - Cuándo usar: siempre antes de tests E2E o al depurar un crash que deja la app en blanco.

2. **Opción 2 — Auditoría de métodos de array (`audit:arrays`)**
  - Qué cubre: llamadas potencialmente inseguras a `.map/.filter/.reduce/.find/.some/.every/...` sobre datos no validados.
  - Por qué existe: evita `TypeError: ... is not a function` cuando APIs devuelven `null`, `false`, `object` o payloads incompletos.
  - Filosofía: modo suave por defecto para diagnóstico continuo sin frenar al equipo.

3. **Opción 3 — Error Boundary granular por subárbol de rutas**
  - Qué cubre: si un módulo falla en render, se aísla el error y se muestra fallback local.
  - Por qué existe: evita que colapse toda la interfaz (navbar/layout), facilitando recuperación y diagnóstico.
  - Implementación actual: `RouteErrorBoundary` en `src/app/App.js` alrededor del árbol de `<Routes>`.

4. **Opción 4 — Endurecimiento gradual de quality gates**
  - Qué cubre: transición controlada de reporte informativo a bloqueo estricto cuando el proyecto esté más limpio.
  - Por qué existe: reducir errores sin crear fricción excesiva en etapas tempranas.
  - Cómo aplicar: usar `audit:arrays` (suave) en desarrollo y `audit:arrays:strict` en CI solo para ramas/etapas acordadas.

#### Escalamiento recomendado (sin rigidez excesiva)

1. **Fase A (actual):** `audit:preflight` obligatorio local + reportes.
2. **Fase B:** `audit:arrays:strict` solo en CI nocturno o rama de release.
3. **Fase C:** activar `strict` en PRs cuando el volumen de hallazgos baje a un umbral acordado.

#### Orden de actuación ante crash silencioso

1. Ejecutar `npm run audit:ast`.
2. Ejecutar `npm run audit:arrays` y revisar el módulo afectado.
3. Validar que el crash quede contenido por el Error Boundary (opción 3).
4. Solo después correr E2E para confirmar regresión cero.

### Estructura de tests

| Capa | Ubicación | Tecnología | Qué valida |
|---|---|---|---|
| Unit | `src/__tests__/*.unit.test.js` | Vitest + jsdom | Lógica de negocio pura (días hábiles, alarmas, fases, TemplateEngine) |
| Integración | `src/__tests__/*.integration.test.js` | Vitest + Testing Library | Render + service calls + DataTable + role-gating |
| Workflow | `src/__tests__/workflows/*.workflow.test.js` | Vitest + userEvent | Flujos CRUD multi-step con mocks MSW-like |
| E2E | `e2e/flows/*.e2e.spec.js` | Playwright | Flujos reales contra backend + browser |

Tests unitarios/integración: `src/__tests__/NombreModulo.tipo.test.js`. Usar `vi.fn()`, `vi.mock()`, `vi.spyOn()` (API de Vitest, no Jest). CSS se mockea automáticamente vía `cssNoop` en `vitest.config.mjs`.

Los 7 tests E2E que hacen `skip` dependen de datos en la BD (cajas en archivo, licencias con relojes). Son correctos — se ejecutan si hay datos reales.

Reglas técnicas de testing: `.github/instructions/testing.instructions.md`.

Usuario para tests con inicios de sesión: `test@gmail.com` (contraseña: `test123`).

### Protocolo de Resolución de Errores E2E (Playwright) para Agentes

Al desarrollar, ejecutar o depurar tests E2E, los agentes **DEBEN** seguir este procedimiento estricto para garantizar trazabilidad y no generar "cajas negras":

1. **Detección de Crash vs. Alertas:** En la Curaduría es normal que falten datos y aparezcan alertas ("no hay información"). Esto NO es un test failure. El test debe descartar estas alertas no fatales de SweetAlert2 y seguir. Un error real ("crash") es una **pantalla en blanco** sin UI funcional o un error fatal en consola `TypeError`.
2. **Instrumentación de Diagnóstico:** Inyectar detectores en el spec `(page.on('pageerror'), page.on('console'), page.on('requestfailed'))` y rutinas como `detectWhiteScreenCrash()`.
3. **Lectura de Resultados y Trazabilidad:** El agente lee directamente los logs arrojados en consola, o descarga/analiza los archivos adjuntados en el reporte de la ejecución (o el `trace.zip` usando Playwright CLI) para entender el verdadero origen (ej. un modal-swap mal sincronizado o un defecto de React).
4. **PAUSA Y REPORTE AL USUARIO (¡OBLIGATORIO!):**
   - Antes de modificar el código fuente de la aplicación para resolver el fallo, el agente **DEBE DETENERSE y explicar en el chat qué está fallando**.
   - No debes intentar arreglar cosas en silencio. Primero describe la causa raíz descubierta (ej: *"El archivo X tiene un problema de llaves asimétricas..."*), detalla la solución propuesta, y luego procede.
5. **Limpieza de Residuos (Clean-up Obligatorio):**
   - Al finalizar el diagnóstico o la reparación, **tienes que limpiar toda la basura**. Elimina archivos de log temporales (ej: `temp_log.txt`, `raw_braces.txt`), carpetas de Playwright residuales (`test-results/`, `playwright-report/`) y confirma siempre que dejas el entorno en un estado limpio mediante `git status`.

---

## 6. Motor de plantillas de documentos

Genera PDFs de resoluciones y actos administrativos a partir de plantillas HTML en `public/templates/`.

- **No modificar** `public/templates/` sin entender `src/app/utils/TemplateEngine.js`.
- Modelos disponibles: `open`, `des`, `delete`, `return`, `transfer`, `eje_open`, `eje_des`, `eje_neg`.
- Operaciones comunes: `src/app/utils/BaseDocumentUtils.js`.

---

## 7. Plugins custom de Vite

Tres plugins en `vite.config.mjs` que mantienen compatibilidad post-migración CRA → Vite:

| Plugin | Qué hace | Por qué |
|--------|----------|---------|
| `jsxInJs()` | Trata `.js` en `src/` como JSX vía esbuild | CRA permitía JSX en `.js`; renombrar 357 archivos era inviable |
| `cjsToEsm()` | Convierte `require()` en `src/` a `import` ESM | CRA proveía shim de `require`; Vite es ESM-native |
| `fix-moment-business-days` | Parchea `moment-business-days` en pre-bundle | La lib usa `require('moment')` que rompe el interop CJS/ESM |

Si un archivo nuevo usa `require()`, el plugin lo convierte automáticamente. Pero preferir escribir `import` directamente.

---

## 8. Librerías legacy

**Fase 7 completada (2026-03-18).** Todas las dependencias incompatibles con React 19 eliminadas. `npm install` funciona sin `--legacy-peer-deps`.

### Componentes custom drop-in (creados en Fase 7)

| Componente | Reemplaza | API pública |
|---|---|---|
| `src/app/components/TagInput.js` | `@pathofdev/react-tag-input` | `tags`, `onChange`, `placeholder`, `removeOnBackspace`, `ref` |
| `src/app/components/HTMLDatalist.js` | `react-html-datalist` | `name`, `onChange`, `classNames`, `options[{text,value}]` |
| `src/app/components/Collapsible.js` | `react-collapsible` | `trigger`, `className`, `openedClassName`, `lazyRender`, `open`, `children` |

### Librerías con class components pendientes (deuda técnica, no bloquean runtime)

| Librería | Archivos | Estado | Próxima acción |
|---|---|---|---|
| `react-vis@1.11.7` | 14 charts en `fun_forms/charts_components.js/` | Funciona en runtime | Migrar a `recharts` (ya instalado) en Fase 8 — implica convertir class→functional |
| `react-quill-new@3.8.3` | 1 (`pqrs/components/pqrs_rteReply.component.js`) | Actualizado en F7, funciona | Convertir class→functional en Fase 8 |

Ver historial completo en `REFACTOR_TRACKING_REACT19.md` → sección 3.

---

## 9. Restricciones absolutas

1. **No eliminar rutas** de `App.js` sin confirmación — cada ruta es un módulo legal activo.
2. **No cambiar el esquema de datos** del backend sin verificar en `C:\xampp\htdocs\dovela-backend`.
3. **No usar `process.env`** — usar `import.meta.env.VITE_*`.
4. **No usar `React.forwardRef()`** ni `defaultProps` en código nuevo.
5. **No usar `react-scripts`** — el proyecto usa Vite.
6. **No introducir estado global** (Redux, Zustand) sin discutirlo.
7. **No introducir nueva librería UI** sin consenso.
8. Los 268 tests unitarios (`npm test`) y los E2E (`npx playwright test`) deben pasar antes de cualquier merge.
9. `public/templates/` no se modifica sin entender el motor de plantillas.
10. Datos sensibles en `src/app/components/jsons/vars.js` — no exponer en logs.

---

## 10. Contexto de migración

El proyecto fue migrado de **React 16 + CRA 4** a **React 19 + Vite 6** en el branch `feat/react-19-migration` (feb 2026). Para el detalle completo de las 7 fases, conteos y decisiones:

- `REFACTOR_TRACKING_REACT19.md` — Libro maestro del proceso de migración

**Estado actual (2026-03-18):** Fases 0–7 completadas.
- 157 class components migrados a funcionales con hooks en Fases 0–6.
- Quedan 15 clases (1 Error Boundary + 14 charts `react-vis`) — pendientes para Fase 8.
- **Fase 7 cerrada:** 7 librerías legacy eliminadas/reemplazadas. `npm install` funciona limpio.

**Testing:** Suite completa — 268 tests unitarios/integración/workflow (Vitest, **100% verde**) + 35 E2E (Playwright). Cobertura incluye: Clocks, Records, PQRS, Dashboard, Nomenclature, ZoneUse, Submit, Archive, Expedition, FunManage.

**Siguiente fase (Fase 8 — cuando se requiera):** Migrar los 14 charts `react-vis` (class components) a `recharts` (ya instalado) como componentes funcionales. Convertir `pqrs_rteReply.component.js` a funcional.

---

## 11. Context7 — Documentación actualizada obligatoria

Antes de implementar o modificar código que use librerías externas, consulta la documentación actualizada vía **Context7 MCP** usando `resolve-library-id` y luego `get-library-docs`.

### Consulta obligatoria (siempre)

Estas librerías tienen cambios de API fuertes entre versiones. Los LLMs frecuentemente generan código de versiones anteriores:

| Librería | Library ID | Errores típicos sin consultar |
|----------|------------|-------------------------------|
| **React 19** | `/reactjs/react.dev` | Generar `forwardRef`, `defaultProps`, `createRef` en funcionales |
| **react-router v6** | `/remix-run/react-router` | Generar `Switch`, `useHistory`, `Redirect`, `component={}` |
| **Vite 6** | `/vitejs/vite` | Usar `process.env`, configurar plugins con API de webpack |
| **Vitest** | `/vitest-dev/vitest` | Usar `jest.fn()`, `jest.mock()` en vez de `vi.*` |
| **styled-components 6** | `/styled-components/styled-components` | API antigua de `.attrs()`, patrones de v5 |

### Consulta recomendada (cuando se trabaje en el módulo)

| Librería | Library ID | Cuándo consultar |
|----------|------------|-----------------|
| **Bootstrap 5** | `/twbs/bootstrap` | Al modificar wrappers UI (`ui/index.js`) o crear componentes con clases BS5 |
| **RSuite 5** | `/rsuite/rsuite` | Al usar SelectPicker, DatePicker, TagPicker u otros componentes RSuite |
| **@testing-library/react** | `/testing-library/testing-library-docs` | Al escribir o modificar tests |
| **react-i18next** | `/i18next/react-i18next` | Al configurar i18n o usar hooks de traducción |
| **react-pdf 9** | `/wojtekmaj/react-pdf` | Al tocar el visor de PDFs (API cambió completamente desde v5) |
| **sweetalert2** | `/sweetalert2/sweetalert2` | Al crear alertas complejas (confirmaciones, inputs, timers) |
| **axios** | `/axios/axios-docs` | Al configurar interceptors o instancias custom |

---

## 12. Política de uso autónomo de Skills y MCPs (OBLIGATORIA)

Para maximizar calidad y evitar respuestas desactualizadas, el agente debe operar con esta política por defecto, **sin esperar que el usuario lo pida explícitamente en cada prompt**.

### 12.1 Regla base

- Antes de implementar cambios no triviales, el agente **debe evaluar** qué Skills y MCPs disponibles aplican al problema.
- Si existe una herramienta aplicable (Skill o MCP), el agente **debe priorizar su uso** frente a responder “de memoria”.
- Si no usa una herramienta aplicable, debe tener una razón concreta (p. ej. tarea puramente local sin dependencia externa) y continuar con la mejor alternativa.

### 12.2 Prioridad operativa

1. **Entender el contexto del repo** (`AGENTS.md`, instrucciones del módulo, restricciones legales y de arquitectura).
2. **Seleccionar Skills aplicables** según dominio (testing, diseño UI, Vite, documentación, etc.).
3. **Consultar documentación oficial vía MCP** cuando se use librería externa.
4. **Implementar cambios mínimos y precisos** alineados al código existente.
5. **Validar con pruebas/build** cuando aplique.

### 12.3 Context7 como fuente preferente para librerías

- Cuando la tarea toque APIs de librerías, usar Context7 como referencia principal para evitar API legacy u obsoleta.
- Flujo esperado: `resolve-library-id` → `get-library-docs` antes de codificar.
- Aplicar especialmente a: React 19, React Router v6, Vite 6, Vitest, styled-components 6, y librerías del módulo intervenido.

### 12.4 Criterio de calidad de salida

- No asumir versiones antiguas ni patrones deprecados.
- No inventar APIs.
- Mantener compatibilidad con arquitectura actual del proyecto.
- Si hay ambigüedad, elegir la interpretación más simple y segura, o pedir aclaración puntual.
