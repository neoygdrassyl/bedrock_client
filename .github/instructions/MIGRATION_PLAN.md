---
applyTo: '**'
---

# Plan de Migración React 16 → 19 — Referencia Técnica para Agentes

> **Estado actual:** Branch `feat/react-19-migration`  
> **Fase activa:** FASE 6 — Class → Functional (incremental)  
> **Fases completadas:** Fase 0, Fase 1, Fase 4 (CRA→Vite), Fase 2 (React 18), Fase 3 (Router v6), Fase 5 (React 19)  
> **Última actualización:** 2026-02-19  
> **Node requerido:** v22+ (.nvmrc = 22) — Vite 6 requiere OpenSSL 3  
> **Build tool:** Vite 6.4.1 + Vitest 4.0.18 (CRA eliminado)  
> **React:** 19.2.4 | **styled-components:** 6.3.10 | **react-bootstrap:** 2.10.10 | **react-router-dom:** 6.30.3

---

## Mapa de Fases

| # | Fase | Estado | Agente | Descripción corta |
|---|------|--------|--------|--------------------|
| 0 | Auditoría + baseline | ✅ COMPLETADA | @auditor-agent | Branch, audit deps, tests de humo, MIGRATION_LOG.md |
| 1 | Limpieza legacy pre-migración | ✅ COMPLETADA | @migrator-agent | Removidos 250 `import React` innecesarios. String refs verificados (0 reales). Lifecycles deprecated: 0 |
| 2 | React 16 → 18 | ✅ COMPLETADA | @react18-migrator-agent | React 18.3.1, createRoot, styled-components 6, react-bootstrap 2, mdbreact eliminado |
| **3** | **react-router-dom v5 → v6** | **✅ COMPLETADA** | **@router-migrator-agent** | Switch→Routes, useHistory→useNavigate, Redirect→Navigate, react-router-dom 6.30.3 |
| 4 | CRA 4 → Vite 6 | ✅ COMPLETADA | @vite-migrator-agent | Vite 6.4.1, Vitest 4, 82 archivos env migrados, Node 22 |
| **5** | **React 18 → 19** | **✅ COMPLETADA** | **@react19-migrator-agent** | React 19.2.4, forwardRef cleanup, createRef→useRef, MDB mock, 136/136 tests |
| 6 | Class → Functional (incremental) | 🔲 CONTINUA | @migrator-agent | 177 class components → funcionales con hooks. Por módulo |
| 7 | Reemplazar libs abandonadas | 🔲 CONTINUA | @migrator-agent | react-quill, react-vis, mdbreact → alternativas modernas |

---

## Estado Actual del Codebase (post-Fase 1)

### Conteos verificados de patrones

| Patrón | Conteo actual | Fase donde se resuelve | Bloqueante |
|--------|---------------|----------------------|------------|
| `ReactDOM.render()` | ~~2~~ **0** | ~~Fase 2~~ ✅ | Resuelto — migrado a `createRoot` |
| `extends Component` (clases) | **177** archivos | Fase 6 | NO — React 19 soporta clases |
| `componentDidMount` | **87** archivos | Fase 6 | NO |
| `componentDidUpdate` | **41** archivos | Fase 6 | NO |
| `componentWillUnmount` | **1** archivo | Fase 6 | NO |
| `this.setState` | **107** archivos | Fase 6 | NO |
| `<Switch>` (router v5) | ~~1~~ **0** | ~~Fase 3~~ ✅ | Resuelto — migrado a `<Routes>` |
| `useHistory` | ~~3~~ **0** | ~~Fase 3~~ ✅ | Resuelto — migrado a `useNavigate` |
| `<Redirect>` | ~~1~~ **0** | ~~Fase 3~~ ✅ | Resuelto — migrado a `<Navigate>` |
| `forwardRef` | **2** reales (`navbar.js`, `App.js`) + 3 tests | Fase 5 | NO — se simplifica |
| `withRouter` | **0** | — | — |
| `import React` (explícito) | **24** archivos (usan React APIs) | — | NO — correctos |
| `process.env.REACT_APP_*` | ~~82~~ **0** archivos | ~~Fase 4~~ ✅ | ~~SÍ para Vite~~ Resuelto |
| `<Route>` definitions | **24** en `App.js` (migradas a v6 `element` prop) | ~~Fase 3~~ ✅ | Cada una es módulo legal activo — todas verificadas |

### Tests de humo (red de seguridad)

| Suite | Tests | Estado |
|-------|-------|--------|
| App.smoke | 6 | ✅ PASS |
| Login.smoke | 4 | ✅ PASS |
| Navigation.smoke | 23 | ✅ PASS |
| Modules.smoke | 13 | ✅ PASS |
| FunLicenses.smoke | 6 | ✅ PASS |
| FunManage.integration | 10 | ✅ PASS |
| Submit.integration | 10 | ✅ PASS |
| Archive.integration | 12 | ✅ PASS |
| Expedition.integration | 12 | ✅ PASS |
| **TOTAL** | **136** | **✅ ALL PASS** |

Los tests están en `src/__tests__/`. Deben pasar antes y después de cada fase.

---

## FASE 2 — React 16 → 18 (ACTIVA)

### Objetivo

Subir React de ^16.9.0 a ^18.x, migrar el entry point a `createRoot()`, y actualizar las dependencias que requieren React 18 como peer dependency.

### Pre-condiciones

- [x] Branch `feat/react-19-migration` activo
- [x] String refs eliminados (0 reales)
- [x] Lifecycles deprecated eliminados (0 encontrados)
- [x] Import React innecesarios removidos (250 archivos)
- [x] 46 tests de humo pasando

### Tareas ordenadas

#### 2.1 — Actualizar React core

```bash
npm install react@18 react-dom@18
```

#### 2.2 — Migrar entry point (`src/index.js`)

```js
// ANTES (React 16)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// DESPUÉS (React 18)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

#### 2.3 — Migrar `centralClocks.component.js` (segundo `ReactDOM.render`)

Este archivo usa `ReactDOM.render` directamente en `src/app/pages/user/clocks/centralClocks.component.js:615`. Debe migrarse a `createRoot()` o refactorizarse para usar un patrón React declarativo en lugar de render imperativo.

#### 2.4 — Actualizar dependencias React-dependientes

**Orden recomendado** (de menos a más riesgo):

| # | Paquete | Versión actual | Target | Notas |
|---|---------|---------------|--------|-------|
| 1 | `scheduler` | ^0.20.2 | Alinear con React 18 | Peer dep automático |
| 2 | `styled-components` | ^5.3.0 | ^6.x | ThemeProvider se mantiene. Verificar `.attrs()` en `global.js` |
| 3 | `sweetalert2` | ^10.16.7 | ^11.x | API mejora, no rompe |
| 4 | `sweetalert2-react-content` | ^3.3.2 | ^5.x | Alineado con swal v11 |
| 5 | `react-bootstrap` | ^1.6.8 | ^2.x | v1 NO soporta React 18. Cambio de API en algunos componentes |
| 6 | `@testing-library/react` | ^11.2.6 | ^16.x | Necesita React 18+ |
| 7 | `@testing-library/user-event` | ^12.8.3 | ^14.x | API async cambia |
| 8 | `@testing-library/jest-dom` | ^5.12.0 | ^6.x | Matchers actualizados |
| 9 | `rsuite` | ^5.15.0 | ^5.74+ | v5 soporta React 18, verificar latest |
| 10 | `rsuite-table` | ^5.3.1 | ^5.20+ | Alineado con rsuite |
| 11 | `react-pdf` | ^5.3.0 | ^9.x | Worker config cambia: `pdfjs.GlobalWorkerOptions.workerSrc` |
| 12 | `react-i18next` | ^11.8.13 | ^15.x | API mantiene compatibilidad |
| 13 | `i18next` | ^20.2.2 | ^24.x | Alineado |
| 14 | `react-calendar` | ^3.4.0 | ^5.x | API cambia |
| 15 | `react-date-picker` | ^8.2.0 | ^11.x | Alineado con react-calendar |
| 16 | `react-google-recaptcha` | ^2.1.0 | ^3.x | Verificar compat |
| 17 | `react-data-table-component` | ^7.4.6 | ^7.6+ | Minor update |
| 18 | `react-modal` | ^3.14.3 | ^3.16+ | Minor update |
| 19 | `axios` | ^0.21.4 | ^1.7+ | Fix CVEs. NO depende de React |

#### 2.5 — Resolver `mdbreact` (RIESGO ALTO)

`mdbreact` v5.2.0 es un **proyecto abandonado** que NO soporta React 18. Opciones:

1. **Reemplazar con `mdb-react-ui-kit` v8+** — Es el sucesor oficial. Requiere cambiar imports y API.
2. **Reemplazar con Bootstrap puro + RSuite** — Los componentes MDB usados probablemente tienen equivalente.
3. **Mantener temporalmente con `--legacy-peer-deps`** — Funciona pero genera warnings y riesgo de runtime errors.

**Decisión requerida antes de ejecutar.** Recomendación: opción 2 (Bootstrap + RSuite ya están en el proyecto).

#### 2.6 — StrictMode: auditar efectos con cleanup

React 18 StrictMode invoca effects dos veces en desarrollo. Verificar:
- `useEffect` con timers (`setTimeout`, `setInterval`) — especialmente en módulo de relojes
- `useEffect` que crean suscripciones sin cleanup
- `useEffect` que hacen llamadas HTTP sin cancelación

#### 2.7 — Verificación

```bash
npm test                    # 46 tests deben pasar
npm start                   # Verificar que la app levanta sin errores en consola
```

Verificar manualmente:
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Módulo de Relojes funciona
- [ ] Generación de PDFs funciona
- [ ] Tema claro/oscuro funciona

#### Commit: `feat(fase2): upgrade React 16 → 18 + deps`

### Riesgos Fase 2

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| `mdbreact` rompe con React 18 | ALTA | ALTO | Reemplazar por Bootstrap puro antes de actualizar React |
| `styled-components` v6 cambia API de `.attrs()` | MEDIA | MEDIO | Verificar `src/app/components/global.js` y `theme.js` |
| `react-pdf` worker no carga | MEDIA | MEDIO | Configurar workerSrc manualmente |
| StrictMode double-effect en relojes/timers | MEDIA | MEDIO | Auditar `useEffect` en `clocks/` |
| `react-bootstrap` v2 cambia nombres de componentes | MEDIA | MEDIO | Buscar imports de react-bootstrap y mapear cambios |
| Tests se rompen por `@testing-library` update | BAJA | BAJO | Actualizar tests junto con la librería |

---

## FASE 3 — react-router-dom v5 → v6 (PENDIENTE)

### Objetivo

Migrar el routing completo de v5 a v6. Solo afecta `App.js`, `navbar.js` y 2 archivos adicionales.

### Alcance (verificado)

| Archivo | Patrones v5 a migrar |
|---------|---------------------|
| `src/app/App.js` | `<Switch>` (1), `useHistory` (2), `<Redirect>` (1), 11 `<Route>` definitions |
| `src/app/components/navbar.js` | `useHistory` (1), `useLocation` (se mantiene en v6) |

### Tabla de migración API

| v5 | v6 | Contexto en Dovela |
|----|----|--------------------|
| `<Switch>` | `<Routes>` | `App.js:128` |
| `<Route component={X}>` | `<Route element={<X />}>` | 11 definiciones en App.js |
| `<Route render={() => ...}>` | `<Route element={...}>` | Si existe en App.js |
| `useHistory()` | `useNavigate()` | `App.js:424`, `App.js:484`, `navbar.js:22` |
| `history.push('/x')` | `navigate('/x')` | Buscar en los 3 archivos |
| `history.replace('/x')` | `navigate('/x', { replace: true })` | Si existe |
| `history.goBack()` | `navigate(-1)` | Si existe |
| `<Redirect to="/x">` | `<Navigate to="/x" replace />` | `App.js:468` |

### Consideraciones críticas

- **CADA `<Route>` es un módulo legal activo.** No omitir ni reordenar sin verificar.
- Las 11 rutas deben funcionar idénticamente post-migración.
- Rutas protegidas (auth) usan un patrón custom — verificar que el guard funcione en v6.
- En v6, las rutas son relativas por defecto — verificar paths.

```bash
npm install react-router-dom@6
```

### Commit: `feat(fase3): migrate react-router-dom v5 → v6`

---

## FASE 4 — CRA 4 → Vite 6 (✅ COMPLETADA)

### Objetivo

Reemplazar `react-scripts` por Vite como build tool y dev server.

### Alcance

| Concepto | CRA (actual) | Vite (target) |
|----------|---------|------|
| Dev server | `react-scripts start` | `vite` |
| Build | `react-scripts build` | `vite build` |
| Test runner | Jest (built-in CRA) | Vitest |
| Env vars prefix | `REACT_APP_` | `VITE_` |
| Env vars acceso | `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| index.html | `public/index.html` | Raíz del proyecto |
| SVG como componente | Built-in CRA | `vite-plugin-svgr` |

### Tareas

1. **Instalar Vite + plugins**
2. **Crear `vite.config.js`**
3. **Mover `public/index.html` → `./index.html`** y agregar `<script type="module" src="/src/index.js">`
4. **Migrar 82 archivos** con `process.env.REACT_APP_*` → `import.meta.env.VITE_*`
5. **Actualizar `.env`** — renombrar variables
6. **Migrar tests** de Jest → Vitest
7. **Desinstalar** `react-scripts`, `env-cmd`, `web-vitals`
8. **Verificar** que `public/templates/` sigue accesible como static files
9. **Verificar** que los PDF workers funcionan con Vite

### Los 82 archivos con `process.env.REACT_APP_*`

Archivo principal: `src/http-common.js` (baseURL de axios). Los demás están distribuidos en:
- `src/app/components/` — vars.js, pdfViewer, vizualizer, etc.
- `src/app/pages/user/` — múltiples módulos
- `src/app/services/` — services que construyen URLs
- `src/__tests__/` — test files

**Buscar con:** `grep -rn "process.env.REACT_APP" src/ --include="*.js"`

### Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Env vars no migradas → fallo silencioso HTTP | `grep -rn "process.env" src/` exhaustivo post-migración. Cero coincidencias = OK |
| `public/templates/` no accesible | En Vite, `public/` se sirve estáticamente — verificar que la ruta no cambie |
| CSS imports de node_modules rompen | Vite los resuelve, pero verificar los 9 paquetes configurados en Jest |
| SVG imports como componentes (`ReactComponent`) | Instalar `vite-plugin-svgr` |

### Commit: `build(fase4): migrate CRA → Vite 6`

---

## FASE 5 — React 18 → 19 (PENDIENTE)

### Objetivo

Subir a React 19. Los cambios son menores comparados con 16→18.

### Tareas

1. `npm install react@19 react-dom@19`
2. **Simplificar `forwardRef`** (2 archivos reales: `navbar.js`, `App.js`):
   ```js
   // ANTES
   const Comp = React.forwardRef((props, ref) => <div ref={ref} />);
   // DESPUÉS
   const Comp = ({ ref, ...props }) => <div ref={ref} />;
   ```
3. **Simplificar Context** (opcional):
   ```js
   // ANTES: <MyContext.Provider value={val}>
   // DESPUÉS: <MyContext value={val}>
   ```
4. **Verificar `defaultProps`** — ya confirmado 0 en el codebase
5. **Actualizar deps** a últimas versiones React 19-compatible
6. Tests + verificación manual completa

### Commit: `feat(fase5): upgrade React 18 → 19`

---

## FASE 6 — Class Components → Functional (CONTINUA)

### Objetivo

Migrar 177 class components a funcionales con hooks. Este esfuerzo es **incremental** y no es bloqueante para React 19 (React 19 sigue soportando clases).

### Priorización por módulo

| Prioridad | Módulo | Motivo |
|-----------|--------|--------|
| 1 | `clocks/` | Módulo más complejo. Contiene el segundo `ReactDOM.render` |
| 2 | `records/` | Alto uso. Múltiples class components |
| 3 | `fun_forms/` | Formularios complejos con `createRef` |
| 4 | `submit/` | Tiene el único `componentWillUnmount` |
| 5 | Resto | Incremental según prioridad de desarrollo |

### Patrón de migración

```js
// ANTES (class)
class MyComp extends Component {
  constructor(props) { super(props); this.state = { data: [] }; }
  componentDidMount() { Service.get().then(r => this.setState({ data: r.data })); }
  render() { return <div>{this.state.data.map(...)}</div>; }
}

// DESPUÉS (functional)
function MyComp() {
  const [data, setData] = useState([]);
  useEffect(() => {
    Service.get().then(r => setData(r.data));
  }, []);
  return <div>{data.map(...)}</div>;
}
```

---

## FASE 7 — Reemplazar Librerías Abandonadas (CONTINUA)

### Librerías a reemplazar

| Librería abandonada | Reemplazo recomendado | Complejidad |
|---------------------|----------------------|-------------|
| `mdbreact` v5.2.0 | Bootstrap 5 puro + RSuite (ya en el proyecto) | MEDIA — buscar qué componentes MDB se usan |
| `react-quill` v1.3.5 | `react-quill-new` o `jodit-pro-react` (ya en el proyecto) | MEDIA |
| `react-vis` v1.11.7 | `recharts` o `visx` (Airbnb) | ALTA — gráficas deben verse igual |
| `react-google-maps` v9.4.5 | `@react-google-maps/api` v2+ | MEDIA |
| `@pathofdev/react-tag-input` v1.0.7 | RSuite `<TagPicker>` o implementar custom | BAJA |
| `react-html-datalist` v2.0.4 | HTML nativo `<datalist>` o RSuite `<AutoComplete>` | BAJA |

---

## Dependencias que NO requieren cambios

Estas dependencias no dependen de React o ya son compatibles:

`bootstrap`, `@popperjs/core`, `jspdf`, `pdf-lib`, `file-saver`, `js-sha256`, `js-file-download`, `written-number`, `quill-to-pdf`, `react-icons` (v5.5 ✅), `i18next-browser-languagedetector`, `markdown-to-jsx`, `jodit-pro`, `moment` (funcional pero legacy)

---

## Reglas para TODOS los agentes durante la migración

1. **NUNCA eliminar rutas de `App.js`** — son módulos legales activos
2. **NUNCA cambiar esquema de datos** del backend sin verificar en `C:\xampp\htdocs\dovela-backend`
3. **Los 46 tests de humo deben pasar** antes y después de cada fase
4. **Commit por sub-tarea** dentro de cada fase
5. **No mezclar fases**: completar una fase antes de iniciar la siguiente
6. **Leer AGENTS.md** y `MIGRATION_LOG.md` antes de ejecutar cualquier cambio
7. **`public/templates/`** no se debe modificar — motor de plantillas de documentos legales
8. **Backup antes de cambios destructivos**: `git stash -u` o commit parcial

---

## Orden de Ejecución Real

```
Fase 0 ✅ → Fase 1 ✅ → Fase 4 ✅ → Fase 2 ✅ → Fase 3 ⏳ → Fase 5 → Fase 6 (paralela) → Fase 7 (paralela)
                                              ^^^^^^^^
                                           ESTÁS AQUÍ
```

> **Nota:** Fase 4 (CRA→Vite) se ejecutó antes de Fase 2 (React 18) porque era independiente y simplificaba las fases posteriores al tener ya Vite como bundler.

### Dependencias entre fases restantes

```
Fase 5 (React 19) ✅ COMPLETADA

Fase 6 (Class→Func) ← puede empezar
Fase 7 (Libs abandon.) ← puede empezar (react-quill, react-vis)

NOTA: mdb-react-ui-kit ya fue eliminada en Fase 5b
```

### Timeline estimado (restante)

| Fase | Días estimados | Acumulado desde ahora |
|------|---------------|----------------------|
| ~~Fase 0~~ | ~~1 día~~ | ✅ completada |
| ~~Fase 1~~ | ~~1 día~~ | ✅ completada |
| ~~Fase 4~~ | ~~2 días~~ | ✅ completada |
| ~~Fase 2~~ | ~~2-3 días~~ | ✅ completada |
| ~~Fase 3~~ | ~~1-2 días~~ | ✅ completada |
| ~~Fase 5~~ | ~~1 día~~ | ✅ completada |
| Fase 6+7 | Continuo (semanas) | — |

---

## Resumen de lo completado (contexto para agentes)

### Fase 0 — Auditoría (commit `c48ef9da`)
- Branch `feat/react-19-migration` creado
- Auditoría completa de 357 archivos JS/JSX
- 46 tests de humo escritos y pasando (App, Login, Navigation, Modules)
- MIGRATION_LOG.md creado con baseline

### Fase 1 — Limpieza pre-migración (commit `ec9a9979`)
- 250 archivos: removidos `import React` innecesarios
- 24 archivos mantienen import (usan React APIs directamente)
- string refs: 0 reales (22 eran falsos positivos de `href`)
- lifecycles deprecated: 0 encontrados

### Fase 4 — CRA → Vite (commits `dcbb3761`, `754b0cce`, `99b640e5`)
- `react-scripts` eliminado, `env-cmd` eliminado, `web-vitals` eliminado
- Vite 6.4.1 instalado con 3 plugins custom:
  - `jsxInJs()`: trata `.js` como JSX (evita renombrar 357 archivos)
  - `cjsToEsm()`: convierte `require()` a `import` en src/
  - `fix-moment-business-days`: patch para interop CJS/ESM de moment
- 82 archivos migrados: `process.env.REACT_APP_*` → `import.meta.env.VITE_*`
- 7 variables de entorno renombradas en `.env`
- Jest → Vitest con config dedicada (`vitest.config.mjs`)
- `index.html` movido a raíz del proyecto
- Node actualizado a v22 (requerido por Vite 6 — OpenSSL 3)
- 46 tests siguen pasando bajo Vitest

### Estado actual verificado (2026-02-20)
- React: **19.2.4** ✅
- react-dom: **19.2.4** ✅
- react-router-dom: **6.30.3** ✅
- styled-components: **6.3.10** ✅
- react-bootstrap: **2.10.10** ✅
- rsuite: **5.83.4** ✅
- mdb-react-ui-kit: **ELIMINADA** → `src/app/components/ui/index.js` (wrappers Bootstrap 5) ✅
- Vite: **6.4.1** ✅ (152 líneas, limpio de hacks MDB)
- Vitest: **4.0.18** ✅
- `ReactDOM.render()`: **0** ✅
- `process.env.REACT_APP_*`: **0** ✅
- `<Switch>`/`useHistory`/`<Redirect>`: **0** ✅
- `forwardRef` (producción): **2** (solo en `ui/index.js` — componentes propios) ✅
- `extends Component`: **178** (Fase 6)
- Tests: **149/149 PASS** ✅ (10 suites, requiere Node 22)

### Fase 2 — React 16 → 18 (commits `48343a4f`..`942024a3`)
- React 16.14 → 18.3.1, ReactDOM.render → createRoot (index.js + centralClocks)
- mdbreact eliminado: 9 archivos migr. a mdb-react-ui-kit/bootstrap/react-data-table
- styled-components 5 → 6.3.10, react-bootstrap 1 → 2.10.10
- react-pdf 5 → 9, sweetalert2 10 → 11, react-i18next 11 → 15
- scheduler y popper.js eliminados (redundantes)
- 55 tests de integración nuevos (FunManage, Submit, Archive, Expedition)
- Total tests: 46 → 136 (9 suites)

### Fase 3 — react-router-dom v5 → v6 (commit `0bba9e8e`)
- react-router-dom 5.3.4 → 6.30.3
- Switch→Routes, useHistory→useNavigate (×3), Redirect→Navigate
- 24 Route definitions migradas a `element` prop
- PrivateRoute refactored: render prop → useLocation + Navigate
- certification.page.js: deep CJS import corregido
- Tests sin cambios necesarios (MemoryRouter funciona en v5 y v6)
- v7 future flag warnings informativos (no bloqueantes)

### Fase 5 — React 18 → 19 (commits `91561ff6`..`68bf8986`)
- React 18.3.1 → 19.2.4
- forwardRef simplificado en App.js y navbar.js (ref como prop normal)
- createRef → useRef en componentes funcionales (email.page, public.page, LoginPage)
- mdb-react-ui-kit eliminada completamente (Fase 5b):
  - 909 líneas de wrappers Bootstrap 5 en `src/app/components/ui/index.js`
  - 148 archivos con imports reescritos por codemod automático
  - ~105 líneas de hacks de bundler eliminadas de vite.config.mjs (258→152 lín)
  - Mock global `vi.mock('mdb-react-ui-kit')` eliminado
- 13 tests nuevos (mdb-debug diagnostics)
- Total tests: 136 → 149 (10 suites)
