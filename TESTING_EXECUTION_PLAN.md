# Plan Maestro: Estabilización Post-Migración React 19

> Generado: 2026-03-18 | Branch: `feat/react-19-migration` | Versión: 1.20.95
> Estado: Fase 7 completada. Este documento guía todas las actividades pendientes antes de producción.

---

## Diagnóstico General

### Datos del proyecto
| Métrica | Valor |
|---------|-------|
| Archivos fuente (src/) | 366 JS/JSX |
| Archivos de páginas (pages/) | 271 |
| Servicios (services/) | 27 |
| Componentes compartidos (components/) | 42 |
| Dependencias de producción | 52 |
| Tests unitarios/integración | 288 (37 suites) - 100% pasan |
| Tests E2E (Playwright) | 6 suites (requieren backend) |
| Workflows | 6 suites |
| Módulos de la app (rutas) | 21 |
| Ambientes de producción activos | 3 (CUB1, CUP1, FLD2) |

### Hallazgos Críticos

1. **BUILD OOM (RESUELTO)**: `vite build` fallaba con "JavaScript heap out of memory" al procesar 4270 módulos con sourcemaps completos. Se corrigió con:
   - `sourcemap: 'hidden'` en vez de `true`
   - `manualChunks` para dividir vendor bundles
   - `--max-old-space-size=4096` en el script de build
   - Build ahora completa en ~45s exitosamente

2. **COBERTURA DE TESTS PARCIAL**: Solo 11 de 271 páginas tienen tests directos (4%). Los módulos core del negocio (fun_forms: 84 archivos, records: 70, pqrs: 44) carecen de tests individuales para sub-componentes.

3. **UI DEGRADADA**: mdb-react-ui-kit eliminado, reemplazado con wrapper de 909 líneas sobre Bootstrap 5. Funcional pero visualmente inferior.

4. **WARNINGS EN CONSOLA**: Keys faltantes en 5 componentes, atributos HTML incorrectos (`class` vs `className`).

### Tamaño del proyecto (997MB)
| Directorio | Tamaño | % | Nota |
|-----------|--------|---|------|
| node_modules/ | 782MB | 78% | Normal para 52 deps. Top: react-icons (83MB), rsuite (76MB), jodit-pro (69MB), pdf-* (112MB) |
| .git/ | 129MB | 13% | 340 commits, normal para migración extensa |
| src/ | 70MB | 7% | Código fuente + imágenes |
| .agents/ | 11MB | 1% | Configuración de agentes |
| build/ | 46MB | ~5% | Output de producción (con sourcemaps hidden) |

---

## Arquitectura de Tests Existente

### Infraestructura (ya montada, reutilizable)
- **Framework**: Vitest 4.0.18 + @testing-library/react 16.3.2
- **Mocking HTTP**: MSW 2.12.10 con handlers por módulo
- **Helpers**: `src/__tests__/helpers/` (renderHelpers, mockExternals, mockServices)
- **Fixtures**: `src/__tests__/fixtures/` (users, clocks, licenses, submissions)
- **Mock Handlers**: `src/__tests__/mocks/handlers/` (submit, fun, records, expedition, pqrs)
- **E2E**: Playwright 1.58.2, Page Objects en `e2e/pages/`

### Cobertura actual por módulo

| Módulo | Archivos | Test Unit/Integ | Test Workflow | Test E2E | Estado |
|--------|----------|----------------|---------------|----------|--------|
| Dashboard | 1 | Dashboard.integration | - | - | CUBIERTO |
| FUN (solicitudes) | 84 | FunManage.integration, FunLicenses.smoke | submit-to-fun, legal-process | radicar-proyecto | PARCIAL - sub-formularios sin tests |
| Records (expedientes) | 70 | Records.integration | legal-process, submit-fun-records | - | PARCIAL - sub-formularios sin tests |
| PQRS (peticiones) | 44 | PQRS.integration | pqrs-full-cycle | - | PARCIAL - 30+ componentes sin tests |
| Clocks (relojes) | 17 | Clocks.integration, ClocksManager.unit, Alarms.unit, ProcessPhases.unit | clocks-legal-flow | relojes | BIEN CUBIERTO |
| Expeditions | 14 | Expedition.integration | submit-fun-records-expedition | expedition-modules | PARCIAL |
| Submit (ventanilla) | 6 | Submit.integration | submit-to-fun, legal-process | ventanilla | BIEN CUBIERTO |
| Archive | 4 | Archive.integration | - | archivo | CUBIERTO |
| Nomenclature | 3 | Nomenclature.integration | - | - | CUBIERTO |
| ZoneUse | 2 | ZoneUse.integration | - | - | CUBIERTO |
| **Publish** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Seals** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Appointments** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Mail** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **OSHA** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Dictionary** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Profesionals** | **4** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Norms** | **8** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Certifications** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| **Liquidator** | **1** | **NINGUNO** | **-** | **-** | **SIN TESTS** |
| Login/Auth | 1 | Login.smoke, App.smoke | - | login | CUBIERTO |
| HttpCommon | 1 | HttpCommon.unit | - | - | CUBIERTO |
| BusinessDays | 1 | BusinessDays.unit | - | - | CUBIERTO |
| TemplateEngine | 1 | TemplateEngine.unit | - | - | CUBIERTO |

---

## PLAN DE EJECUCIÓN

### FASE 8: Estabilización Pre-Producción

#### 8.1 - Build y configuración (COMPLETADO)
- [x] Fix OOM en `vite build` (sourcemap: 'hidden', manualChunks, max-old-space-size)
- [x] Verificar build exitoso con `npm run build`
- [x] Tests siguen pasando (268/268)

#### 8.2 - Smoke tests para módulos sin cobertura (COMPLETADO)
**Completado: 2026-03-18** | Tests creados: 10 archivos, 25 tests nuevos | Resultado: 288/288 pasan (37 suites)

Módulos que necesitan al menos un smoke test (renderiza sin crash):

| # | Test a crear | Archivo objetivo | Prioridad | Complejidad |
|---|-------------|-----------------|-----------|-------------|
| 1 | ✅ `Publish.smoke.test.js` | `pages/user/publish.js` | MEDIA | Baja |
| 2 | ✅ `Seals.smoke.test.js` | `pages/user/seal.js` | MEDIA | Baja |
| 3 | ✅ `Appointments.smoke.test.js` | `pages/user/appointments.js` | MEDIA | Baja |
| 4 | ✅ `Mail.smoke.test.js` | `pages/user/mail.js` | MEDIA | Baja |
| 5 | ✅ `OSHA.smoke.test.js` | `pages/user/osha.js` | BAJA | Baja |
| 6 | ✅ `Dictionary.smoke.test.js` | `pages/user/dictionary.page.js` | BAJA | Baja |
| 7 | ✅ `Profesionals.smoke.test.js` | `pages/user/profesionals/profesionals.page.js` | MEDIA | Baja |
| 8 | ✅ `Norms.smoke.test.js` | `pages/user/norms/norms.page.js` | MEDIA | Media |
| 9 | ✅ `Certifications.smoke.test.js` | `pages/user/certifications/certification.page.js` | BAJA | Baja |
| 10 | ✅ `Liquidator.smoke.test.js` | `pages/liquidator/liquidator.js` | MEDIA | Media |

**Patrón de smoke test**: import dinámico con `resolves.toBeTruthy()`, sin render, sin mocks. Todos 25 tests pasan.

#### 8.3 - Tests de regresión para sub-formularios críticos
**Prioridad: ALTA** | Foco: los módulos core del negocio

##### 8.3.1 - fun_forms (84 archivos, módulo más grande)
Tests a crear para verificar renderizado de formularios individuales:

| # | Test a crear | Archivos que cubre | Prioridad |
|---|-------------|-------------------|-----------|
| 1 | `FunForms.render.test.js` | fun_n_1, fun_n_2, fun_n_3, fun_n_4 | CRITICA |
| 2 | `FunForms51-53.render.test.js` | fun_n_51, fun_n_52, fun_n_53 | CRITICA |
| 3 | `FunComponents.render.test.js` | fun_docs, fun_checklist_n, fun_asign, fun_archive | ALTA |
| 4 | `FunClocks.render.test.js` | fun_clock, fun_c_clocks, fun_clock_control, fun_clocks_events | ALTA |
| 5 | `FunReports.render.test.js` | fun_g_reports, fun_g_reportMaster, fun_report_data | MEDIA |

##### 8.3.2 - records (70 archivos, 4 disciplinas)
| # | Test a crear | Archivos que cubre | Prioridad |
|---|-------------|-------------------|-----------|
| 1 | `RecordsLaw.render.test.js` | record_law_step1, record_law_fun_1, fun_2, fun_51-53, review | CRITICA |
| 2 | `RecordsArc.render.test.js` | record_arc_31-39, areas, control, review | CRITICA |
| 3 | `RecordsEng.render.test.js` | record_eng_43, 430, 433, 44, sismic, fuego, review | ALTA |
| 4 | `RecordsPH.render.test.js` | record_ph_gen, building, floor, blueprint, review | ALTA |

##### 8.3.3 - pqrs (44 archivos)
| # | Test a crear | Archivos que cubre | Prioridad |
|---|-------------|-------------------|-----------|
| 1 | `PQRSComponents.render.test.js` | pqrs_gen, pqrs_manage_info, pqrs_manage_contact, pqrs_manage_fun | ALTA |
| 2 | `PQRSReplies.render.test.js` | pqrs_replies_1, replies_2, replies_3, rteReply, setReply | ALTA |

##### 8.3.4 - expeditions (14 archivos)
| # | Test a crear | Archivos que cubre | Prioridad |
|---|-------------|-------------------|-----------|
| 1 | `ExpeditionComponents.render.test.js` | exp_1, exp_2, exp_docs, exp_lic, exp_areas, exp_calc | ALTA |

#### 8.4 - Corregir warnings de consola
**Prioridad: MEDIA** | Prevent errores silenciosos en producción

| # | Archivo | Warning | Fix |
|---|---------|---------|-----|
| 1 | `fun_forms/components/icon_progress.compoennt.js` | Missing key prop | Agregar key a elementos de lista |
| 2 | `fun_forms/components/fun_checklist_n.js` | Missing key prop | Agregar key a elementos de lista |
| 3 | `fun_forms/components/fun_g_reports.component.js` | Missing key prop | Agregar key |
| 4 | `fun_forms/components/fun_doc_abdicate.component.js` | Missing key prop | Agregar key |
| 5 | `fun_forms/components/fun_c_clocks.component.js` | Missing key prop | Agregar key |
| 6 | `pages/user/publish.js` | HTML: class → className, enctype → encType | Fix atributos |
| 7 | Multiple files | `selected` en `<option>` | Usar `defaultValue` en `<select>` |

#### 8.5 - Limpieza de código legacy
**Prioridad: BAJA** | Opcional antes de producción

| # | Tarea | Archivo |
|---|-------|---------|
| 1 | Eliminar archivo OLD | `expeditions/exp_clocks.component_OLD.js` |
| 2 | TODOs vacíos en seal.js | `pages/user/seal.js` (líneas 184, 206, 265) |
| 3 | TODOs vacíos en publish.js | `pages/user/publish.js` (líneas 391, 440) |

---

### FASE 9: Rediseño UI/UX Integral

> Fase activa. Referencia de dolores: `docs/UI_PAIN_POINTS.md` | Plan completo: `.claude/plans/radiant-crunching-elephant.md`
> Estrategia: Bootstrap 5 mejorado + Mantine selectivo | Eliminar rsuite, styled-components, react-bootstrap

#### 9.0 - Fundación (tokens, limpieza de dependencias)
**Objetivo:** Establecer sistema de tokens de diseño y eliminar dependencias redundantes sin cambiar nada visible.

| # | Tarea | Archivos | Prioridad |
|---|-------|----------|-----------|
| 1 | Crear `tokens.css` con custom properties (colores, tipografía, espaciado, sombras, radios) | `src/app/components/dovela/tokens/tokens.css` | CRITICA |
| 2 | Crear `font-scale.css` reemplazando font.js + styled-components ThemeProvider | `src/app/components/dovela/tokens/font-scale.css` | CRITICA |
| 3 | Convertir `global.js` (GlobalStyles) a CSS puro | `src/app/components/dovela/tokens/global-overrides.css` | CRITICA |
| 4 | Modificar App.js: eliminar styled-components, usar `data-font-scale` attr | `src/app/App.js` | CRITICA |
| 5 | Agregar fuente Inter en index.html, actualizar index.css | `index.html`, `src/index.css` | ALTA |
| 6 | Crear `DataTableStandard.jsx` wrapper estandarizado | `src/app/components/dovela/data/DataTableStandard.jsx` | ALTA |
| 7 | Override BS5 primary con `--dvl-primary-500` | `tokens.css` | ALTA |
| 8 | Eliminar `styled-components`, `@emotion/is-prop-valid` de package.json | `package.json` | ALTA |

**Verificación:** `npm test` (288 tests pasan), `npm run build` (sin OOM), dark mode funciona, 5 escalas de fuente funcionan

#### 9.1 - App Shell (sidebar + topbar unificados)
**Objetivo:** Reemplazar navegación actual con diseño unificado. Eliminar rsuite.

| # | Tarea | Componente | Prioridad |
|---|-------|-----------|-----------|
| 1 | Construir Sidebar.jsx (estilo referencia: secciones, colapsable, perfil) | `src/app/components/dovela/shell/Sidebar.jsx` | CRITICA |
| 2 | Construir Topbar.jsx (breadcrumb, búsqueda, tema, fuente, usuario) | `src/app/components/dovela/shell/Topbar.jsx` | CRITICA |
| 3 | Construir AppShell.jsx (orquestador layout) | `src/app/components/dovela/shell/AppShell.jsx` | CRITICA |
| 4 | Reemplazar navbar.js con nuevos componentes en App.js | `src/app/App.js`, `src/app/components/navbar.js` | CRITICA |
| 5 | Eliminar rsuite de 14 archivos (reemplazos directos BS5/MDB) | 14 archivos específicos | ALTA |
| 6 | Eliminar react-bootstrap de 2 archivos restantes | 2 archivos | ALTA |
| 7 | Eliminar rsuite, rsuite-table, react-bootstrap de package.json | `package.json` | ALTA |
| 8 | Actualizar manualChunks en vite.config.mjs | `vite.config.mjs` | ALTA |

**Verificación:** `npm test`, `npm run build`, sidebar colapsable, dark mode, responsive, módulos accesibles por rol

#### 9.2 - Dashboard Operativo
**Objetivo:** Reemplazar dashboard de iconos con centro de mando operativo.

| # | Tarea | Componente | Prioridad |
|---|-------|-----------|-----------|
| 1 | Instalar @mantine/core y @mantine/charts | `package.json` | CRITICA |
| 2 | Construir KpiCard + KpiStrip | `src/app/components/dovela/dashboard/` | CRITICA |
| 3 | Construir AlertsPanel + ActivityFeed | `src/app/components/dovela/dashboard/` | ALTA |
| 4 | Construir PhaseTable (estado por fases) | `src/app/components/dovela/dashboard/` | ALTA |
| 5 | Construir ChartCard (wrapper Recharts/Mantine) | `src/app/components/dovela/dashboard/` | ALTA |
| 6 | Construir FilterBar + StatusBadge (compartidos) | `src/app/components/dovela/data/` | ALTA |
| 7 | Reescribir dashboard.js con nuevo layout | `src/app/pages/user/dashboard.js` | CRITICA |
| 8 | Crear dashboard.service.js | `src/app/services/dashboard.service.js` | ALTA |

**Referencia visual:** `docs/redesing/dashboard_prinicipal_licencias.png`
**Verificación:** KPIs visibles, gráficos renderizan, alertas muestran, dark mode, responsive

#### 9.3 - Vista Unificada de Licencias
**Objetivo:** Fusionar `/fun` y `/funmanage` en experiencia unificada maestro-detalle.

| # | Tarea | Componente | Prioridad |
|---|-------|-----------|-----------|
| 1 | Construir CaseHeader + PhaseTabs | `src/app/components/dovela/license/` | CRITICA |
| 2 | Construir ChecklistPanel + DetailDrawer | `src/app/components/dovela/license/` | CRITICA |
| 3 | Construir DocumentThumbnails + TimelineMini | `src/app/components/dovela/license/` | ALTA |
| 4 | Crear licenses.page.jsx (vista unificada) | `src/app/pages/user/licenses.page.jsx` | CRITICA |
| 5 | Refactorizar 13+ modales a drawers/paneles | Wrappers sobre fun_forms/ existentes | ALTA |
| 6 | Actualizar routing: /fun y /funmanage → licenses.page.jsx | `src/app/App.js` | ALTA |

**Referencia visual:** `docs/redesing/vista_trabajo_licencia.png`
**CRITICO:** Componentes internos de fun_forms/ (84 archivos) NO se reescriben, solo se cambia el contenedor.
**Verificación:** Lista unificada, filtros, detalle, sub-formularios funcionan, tests existentes pasan

#### 9.4 - Pulido Módulo por Módulo
**Orden:** PQRS → Citas → Buzón → Publicaciones → Sellos → Ventanilla → Archivo → Resto

Por cada módulo:
- [ ] Aplicar DataTableStandard
- [ ] Aplicar FilterBar
- [ ] Aplicar StatusBadge
- [ ] Aplicar EmptyState
- [ ] Reemplazar colores hardcodeados con tokens
- [ ] Verificar dark mode

#### 9.5 - Login y Sesión
**Paralela a 9.1**

- [ ] Corregir redirect en refresh (verificar restoreSession, agregar /api/auth/verify)
- [ ] Rediseñar login con tokens DVL (violeta/gradiente, card centrada)
- [ ] Agregar opciones: recuperar contraseña, contactar admin, versión
- [ ] Redirect inteligente: si autenticado → dashboard

#### 9.T - Tests de UI Redesign

##### 9.T.1 - Tests de componentes nuevos (dovela/)
| Test | Componentes | Tipo |
|------|------------|------|
| `AppShell.render.test.js` | AppShell, Sidebar, Topbar | Render + interacción |
| `Dashboard.render.test.js` | KpiCard, KpiStrip, PhaseTable, ChartCard | Render + datos mock |
| `LicenseView.render.test.js` | CaseHeader, PhaseTabs, ChecklistPanel, DetailDrawer | Render + interacción |
| `SharedData.render.test.js` | DataTableStandard, StatusBadge, FilterBar, EmptyState | Render + variantes |

##### 9.T.2 - Tests de regresión post-migración
- Re-ejecutar TODOS los 288 tests existentes después de cada sub-fase
- Verificar que los módulos no rediseñados siguen funcionando
- Smoke tests de cada ruta privada

##### 9.T.3 - Tests E2E de flujos críticos
| Test | Flujo |
|------|-------|
| `dashboard-navigation.e2e.js` | Login → Dashboard → KPIs visibles → Click módulo → Volver |
| `license-workflow.e2e.js` | Dashboard → Licencias → Filtrar → Abrir detalle → Tab evaluación → Checklist |
| `sidebar-responsive.e2e.js` | Sidebar colapsable, responsive, rol-based visibility |

#### Reglas para Agentes de Implementación (Fase 9)
1. **Nunca eliminar funcionalidad** - Solo cambiar presentación/layout
2. **Usar tokens DVL** - `var(--dvl-*)` o `var(--bs-*)`, nunca colores hardcodeados
3. **Dark mode** - Todo componente nuevo debe funcionar en light y dark
4. **Font scale** - Todo texto respeta el sistema de 5 niveles
5. **Tests** - Cada componente nuevo tiene al menos un smoke test
6. **Build** - `npm run build` después de cada sub-fase (max 4096MB)
7. **Imports Mantine** - Solo imports selectivos: `import { Paper } from '@mantine/core'`
8. **Componentes existentes** - fun_forms/, records/, pqrs/ NO se reescriben
9. **SweetAlert2 y react-data-table-component** - No reemplazar

#### Endpoints Backend Requeridos (Fase 9)
| Endpoint | Método | Propósito | Sub-fase |
|----------|--------|-----------|----------|
| `/api/dashboard/kpis` | GET | KPIs: activas, alertasSLA, promResolución, cumplimiento | 9.2 |
| `/api/dashboard/phases` | GET | Conteo de licencias por fase del proceso | 9.2 |
| `/api/dashboard/alerts` | GET | Lista priorizada de alertas SLA/vencimiento | 9.2 |
| `/api/dashboard/activity` | GET | Log de actividad reciente (últimos 20 eventos) | 9.2 |
| `/api/dashboard/charts/volume` | GET | Volúmenes mensuales de radicación (6 meses) | 9.2 |
| `/api/dashboard/charts/dist` | GET | Distribución por estado para donut chart | 9.2 |
| `/api/licenses/unified` | GET | Lista normalizada de licencias con filtros | 9.3 |
| `/api/licenses/:id/timeline` | GET | Eventos cronológicos de una licencia | 9.3 |
| `/api/licenses/:id/checklist/:phase` | GET | Checklist por fase con estado de completitud | 9.3 |
| `/api/auth/verify` | GET | Validación ligera del token JWT | 9.5 |

**Nota:** Los endpoints de dashboard pueden inicialmente computarse en frontend desde endpoints existentes de `fun.service.js`. Los endpoints dedicados son optimización posterior.

---

### FASE 10: Optimización del bundle

> Post-producción. El bundle principal (`index-*.js`) tiene 7.7MB (1.7MB gzip). Se puede optimizar con:

- [ ] Code splitting con `React.lazy()` + `Suspense` por ruta
- [ ] Evaluar reemplazo de `react-icons` (83MB en node_modules) por imports selectivos
- [ ] Evaluar reemplazo de `moment` por `date-fns` (ya instalado como dep transitiva de rsuite)
- [ ] Evaluar si `jodit-pro` (40MB) puede cargarse lazy solo donde se usa

---

## Orden de Ejecución para Agentes

### Bloque 1 - Smoke Tests (paralelo, ~10 agentes)
Crear smoke tests para los 10 módulos sin cobertura (Fase 8.2).
Cada agente recibe: módulo, archivo objetivo, patrón de test, helpers disponibles.

### Bloque 2 - Render Tests para sub-formularios (paralelo, ~10 agentes)
Crear render tests para sub-componentes de fun_forms, records, pqrs, expeditions (Fase 8.3).
Cada agente recibe: grupo de archivos, servicios a mockear, fixtures disponibles.

### Bloque 3 - Console Warnings Fix (1 agente)
Corregir todos los warnings de consola (Fase 8.4).

### Bloque 4 - Limpieza Legacy (1 agente)
Eliminar archivos OLD, resolver TODOs vacíos (Fase 8.5).

### Bloque 5 - Validación final
- Correr `npm run audit:preflight`
- Correr `npm test` (268+ tests deben pasar)
- Correr `npm run build` (debe completar sin errores)
- Verificar bundle sizes

---

## Métricas de Éxito

| Métrica | Actual | Objetivo Fase 8 | Objetivo Fase 9 |
|---------|--------|-----------------|-----------------|
| Tests pasando | 288 | 400+ | 500+ |
| Módulos con cobertura | 11/21 (52%) | 21/21 (100%) | 21/21 |
| Sub-componentes con tests | ~30 | ~80 | ~120 |
| Build exitoso | SI | SI | SI |
| Console warnings | ~12 | 0 | 0 |
| Bundle size (gzip) | 1.7MB | 1.7MB | <1.2MB |
| Archivos legacy | 3 | 0 | 0 |
| Librerías UI activas | 4 | 4 | 2 (BS5 + Mantine selectivo) |
| Colores hardcodeados | 50+ | 50+ | 0 |
| Dashboard con KPIs | No | No | Si |
| Clics para abrir licencia | 4-5 | 4-5 | 2 |
| Dark mode consistente | Parcial | Parcial | Completo |

---

## Notas Técnicas

### Sobre el OOM del build
- **Causa**: Vite/Rollup con `sourcemap: true` mantiene todo el AST + sourcemaps de 4270 módulos en memoria. Con 52 dependencias de producción (muchas pesadas como pdf-lib, rsuite, jodit-pro), el heap de Node (default ~2GB) se agota durante la fase de minificación terser.
- **Solución aplicada**: `sourcemap: 'hidden'` reduce presión de memoria, `manualChunks` divide el bundle en chunks más pequeños para que Rollup no procese todo junto, y `--max-old-space-size=4096` da margen extra.
- **Impacto en producción**: NINGUNO negativo. Los sourcemaps 'hidden' se generan como archivos `.map` separados pero no se referencian en el JS final (no se exponen al navegador). Se pueden subir a Sentry/error-tracking para debugging sin costo de performance.
- **Impacto en servidor**: NINGUNO. El OOM solo ocurre durante `vite build` (build time), no en runtime. El servidor sirve archivos estáticos sin ejecutar Node.

### Sobre el tamaño del proyecto (997MB)
- **782MB son node_modules** - completamente normal para un proyecto con 52 dependencias de producción. Los top consumers son: react-icons (83MB), rsuite (76MB), jodit-pro (69MB), pdf-related (112MB). Esto NO se sube al servidor.
- **129MB es .git** - 340 commits de migración extensiva. Normal. Se puede reducir con `git gc --aggressive` si se desea.
- **70MB es src/** - código fuente + imágenes embebidas. Normal.
- **NO está relacionado con el OOM** - el OOM es un problema de RAM durante build, no de espacio en disco.
- **El build de producción pesa solo 46MB** (incluyendo sourcemaps hidden). Sin sourcemaps serían ~15MB. Esto es lo que va al servidor.
