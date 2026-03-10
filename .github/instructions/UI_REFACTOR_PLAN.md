# Plan de Refactorización UI — Dovela Frontend

> **Objetivo**: Modernizar toda la interfaz de Dovela usando exclusivamente Bootstrap 5, corregir el Modo Oscuro, y lograr una estética limpia y minimalista — con **riesgo cero** de romper lógica de negocio.

---

## Diagnóstico del Estado Actual

### Problemas Identificados

| Área | Problema | Impacto |
|------|----------|---------|
| **Modo Oscuro** | Usa `styled-components ThemeProvider` con colores hardcodeados (`#4d4d4d`, `#808080`, `lightgrey`). NO usa `data-bs-theme="dark"` de BS5. | Muchos componentes no reaccionan al cambio de tema; sidebar, navbar, footer y cards se rompen visualmente. |
| **Sistema de Temas** | `theme.js` define 2 objetos (light/dark) con 13 tokens custom. `global.js` inyecta ~115 líneas de CSS-in-JS vía `createGlobalStyle`. | Duplica lo que BS5 ya resuelve con variables CSS nativas. Doble capa = inconsistencias. |
| **Colores Hardcodeados** | ~50+ instancias de colores inline (`#1B83C4`, `#5bc0de`, `Crimson`, `MediumSeaGreen`, `#667eea`, etc.) repartidos en 15+ archivos. | Imposible mantener consistencia. Ignorados por el cambio de tema. |
| **Inline Styles** | `home.js` (40+), `navbar.js` (20+), `dashboard.js` (10+), `exp_clocks_diagram.js` (15+). | Sin dark mode, sin responsividad, difícil mantenimiento. |
| **DashBoardCards** | CSS con gradientes hardcodeados (`linear-gradient(145deg, #e6e6e6, #ffffff)`), texto negro fijo (`color: black`). | Completamente roto en dark mode. |
| **Footer** | `style={{ backgroundColor: '#7A7A7A', color: '#e5e5e5' }}` inline + mezcla `class=` con `className=`. | No responde al tema. Problemas de React (`class` vs `className`). |
| **Sidebar** | Colores fijos en CSS (`#f8f9fa`, `#dee2e6`, `#333`) + inline styles en JS (`backgroundColor: '#e9ecef'`, `color: '#495057'`). | Completamente blanco en dark mode. Tooltips con colores fijos. |
| **Navbar (RSuite)** | Usa `<Navbar>` de RSuite + inline `backgroundColor: '##F7F7FA'` (doble `#`). | Conflictos de estilos RSuite vs BS5. Bug de color. |
| **DataTables** | `react-data-table-component` en 13 archivos. Tema controlado solo parcialmente por `GlobalStyles` (`.rdt_Table`). | Rows, headers y pagination no respetan dark mode. |
| **Tablas HTML** | Mezcla de `<MDBTable>` wrappers con tablas HTML puras. Bordes pesados (`border: 3px solid`), fieldsets legacy. | Inconsistencia visual entre módulos. |
| **Formularios** | `.form-control` y `.form-select` sobreescritos por `GlobalStyles` con colores del tema custom. Inputs con fondo `lightgrey` en dark. | Campos de formulario no usan los tokens nativos de BS5. |

### Métricas del Código

| Métrica | Valor |
|---------|-------|
| Archivos de página bajo `pages/user/` | ~269 |
| Archivos CSS standalone | 10 |
| Archivos con inline styles | ~40% (~15 pesados) |
| Archivos usando `.bg-card` / `.bg-card-2` | 14 (30 instancias) |
| Archivos usando `.container-primary` | 17 |
| Archivos con DataTable | 13 |
| Colores hardcodeados únicos | ~20+ |
| `data-bs-theme` usage | **0** (inexistente) |

---

## Arquitectura de la Solución

### Principio Central: BS5 Native Dark Mode

Bootstrap 5.3+ provee dark mode nativo mediante el atributo `data-bs-theme="dark"` en `<html>`. Todo componente que use variables CSS semánticas de BS5 (`--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, etc.) se adapta automáticamente.

**Estrategia de transición:**

1. Mantener `ThemeProvider` de styled-components SOLO para el sistema de escalas de fuente (accesibilidad) — ya que BS5 no tiene un equivalente nativo.
2. Migrar TODOS los colores del tema custom (`theme.js`) a clases utilitarias de BS5 (`text-body`, `bg-body`, `bg-body-secondary`, `border-subtle`).
3. El toggle de tema (`toggleTheme`) pasará de cambiar el objeto `theme` de styled-components a cambiar el atributo `data-bs-theme` en `<html>`.
4. Eliminar `GlobalStyles` progresivamente, reemplazando sus reglas por clases BS5.

---

## Fases de Ejecución

### Fase 1: Cimientos — Variables CSS, Dark Mode Nativo y Theme Toggle
### Fase 2: Shell — Navbar, Sidebar y Footer
### Fase 3: Componentes Compartidos — Cards, Breadcrumbs, Botones y Formularios
### Fase 4: Estandarización de Tablas y DataTables
### Fase 5: Páginas Internas — Limpieza de Inline Styles y Polish Final

---

## Fase 1: Cimientos — Variables CSS, Dark Mode Nativo y Theme Toggle

**Scope**: Archivos core del sistema de temas. NO se tocan páginas individuales.

**Objetivo**: Establecer `data-bs-theme` de BS5 como motor de dark mode. Mantener styled-components solo para escalas de fuente.

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `src/app/App.js` | Cambiar `toggleTheme` para que haga `document.documentElement.setAttribute('data-bs-theme', theme)` en lugar de cambiar el objeto theme de styled-components. Mantener `ThemeProvider` SOLO para el objeto `font`. |
| `src/app/components/theme.js` | Eliminar `lightTheme` y `darkTheme` (sus colores migran a variables BS5). Mantener solo exportaciones de font scales si se necesitan. |
| `src/app/components/global.js` | Reescribir `GlobalStyles`: eliminar TODAS las reglas de color (`.container-primary`, `.bg-card`, `.form-control` override, etc.). Mantener SOLO reglas de font-size (que dependen del theme de font) y reglas puramente estructurales que BS5 no cubra. |
| `src/app/components/font.js` | Sin cambios. Se mantiene íntegro. |
| `index.html` | Agregar `data-bs-theme="light"` al `<html>`. |
| `src/app/App.css` | Actualizar variables CSS del sidebar/navbar para usar variables BS5 (`--bs-body-bg`, `--bs-border-color`). |

### Reglas para el agente

1. **NO tocar** hooks, rutas, services, ni imports de páginas en `App.js`.
2. **NO renombrar** clases que se usen en páginas (`.container-primary`, `.bg-card`). En su lugar, redefinirlas en `GlobalStyles` como aliases a clases BS5:
   ```css
   .container-primary { /* ahora usa BS5 tokens automáticamente */ }
   .bg-card { /* mapped to bs5 card styles */ }
   ```
3. Consultar Context7 para `data-bs-theme` API de Bootstrap 5.3.
4. Validar con Playwright MCP: toggle dark/light en login y dashboard.
5. Los 149 tests deben seguir pasando.

### Criterio de aceptación

- [ ] `data-bs-theme="dark"` se aplica al `<html>` cuando el usuario cambia tema
- [ ] `data-bs-theme="light"` es el valor por defecto
- [ ] Las variables font-size de accesibilidad siguen funcionando
- [ ] `.container-primary` y `.bg-card` siguen existiendo como clases pero ahora resolven a colores BS5
- [ ] No hay regresiones visuales en light mode
- [ ] Dark mode muestra backgrounds oscuros en body y cards (vía BS5)
- [ ] Los 149 tests pasan

---

## Fase 2: Shell — Navbar, Sidebar y Footer

**Scope**: Los 3 componentes del shell (layout fijo). NO se tocan páginas internas.

**Objetivo**: Que navbar, sidebar y footer se vean modernos, limpios y respondan perfectamente al dark mode nativo de BS5.

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `src/app/components/navbar.js` | Eliminar TODOS los inline styles. Reemplazar colores hardcodeados (`#575757`, `#495057`, `#333`, `#e9ecef`, `##F7F7FA`) por clases BS5 (`text-body`, `bg-body`, `bg-body-tertiary`, `text-body-secondary`). Eliminar los `onMouseEnter/Leave` que hacen `style.backgroundColor = '#e9ecef'`. Usar `:hover` con BS5 en CSS. Eliminar tag `<style jsx>` inline. |
| `src/app/components/footer.js` | Eliminar inline style del `div` contenedor. Usar clases BS5 (`bg-body-tertiary`, `text-body-secondary`). Corregir `class=` → `className=`. |
| `src/app/App.css` | Actualizar `.work-sidebar`, `.app-navbar`, `.sidebar-toggle-btn` para usar variables CSS de BS5 en lugar de colores hardcodeados. Ejemplo: `background: var(--bs-body-bg)` en vez de `#f8f9fa`. |
| `src/app/components/dashBoardCards/dashBoardCardStyles.css` | Migrar gradientes hardcodeados a tokens BS5. Reemplazar `color: black` por `color: var(--bs-body-color)`. |
| `src/app/components/dashBoardCards/dashBoardCard.js` | Eliminar inline style en `<Link>` (`color: 'royalblue'`). Corregir `class=` → `className=`. |

### Reglas para el agente

1. **NO tocar** la lógica del sidebar (toggle, visibilidad por rol, routing).
2. **NO tocar** la integración con RSuite `<Navbar>` y `<Nav>` — solo ajustar clases CSS envolventes.
3. Reemplazar **inline event handlers de estilo** (`onMouseEnter/Leave` que solo cambian `backgroundColor`) por clases CSS con `:hover`.
4. Consultar Context7 para clases BS5 de navbar (`navbar-expand`, `bg-body-tertiary`).
5. Validar con Playwright: toggle tema en dashboard, expandir/colapsar sidebar, responsive 768px.
6. Los 149 tests deben seguir pasando.

### Criterio de aceptación

- [ ] Navbar tiene fondo que responde a `data-bs-theme`
- [ ] Sidebar usa `bg-body`/`border-subtle` y responde a dark mode
- [ ] Footer usa clases BS5 y responde a dark mode
- [ ] DashBoardCards se ven correctas en light Y dark mode
- [ ] No hay inline styles en navbar.js, footer.js ni dashBoardCard.js
- [ ] Todos los `class=` corregidos a `className=`
- [ ] Tooltips del sidebar funcionan en ambos temas
- [ ] Sidebar responsive sigue funcionando (mobile overlay)
- [ ] Los 149 tests pasan

---

## Fase 3: Componentes Compartidos — Cards, Breadcrumbs, Botones y Formularios

**Scope**: Wrappers UI (`ui/index.js`), componentes reutilizables, y las secciones de acciones/formularios que se repiten en todos los módulos.

**Objetivo**: Que todos los cards, botones, badges, breadcrumbs y campos de formulario tengan un look uniforme, minimalista y dark-mode-aware.

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `src/app/components/ui/index.js` | Auditar los 60+ wrappers. Asegurar que todos usan clases BS5 semánticas correctas. Eliminar `React.forwardRef` en `MDBBtn` y `MDBCard` (React 19 no lo necesita). Agregar `shadow-sm`, `rounded-3` y clases modernas donde sea apropiado como defaults. |
| Páginas con `.bg-card` (14 archivos, 30 instancias) | Migrar de `.bg-card` (styled-components) a clases BS5 nativas: `card bg-body border-subtle shadow-sm`. Esto se hace por lotes modulares. |
| Páginas con `.container-primary` (17 archivos) | Verificar que después de Fase 1 estas clases resuelven correctamente. Donde sea posible, reemplazar por `bg-body text-body`. |
| Modules con `<fieldset>` + `<legend>` | Modernizar bordes: de `border: 3px solid #ddd` a `border border-subtle rounded-3 p-3`. |
| Páginas con botones de acción | Estandarizar: botón principal = `btn btn-primary`, secundario = `btn btn-outline-secondary`, peligroso = `btn btn-outline-danger`. Eliminar botones con colores inline. |

### Archivos específicos prioritarios

| Archivo | Razón |
|---------|-------|
| `src/app/pages/user/fun.js` | Módulo principal — patrón de "ACCIONES" que se replica en submit, pqrs, archive |
| `src/app/pages/user/submit/submit.js` | Ventanilla única — high traffic |
| `src/app/pages/user/pqrs/pqrsadmin.js` y `pqrsadmin.functional.js` | PQRS — usa tabs + DataTable |
| `src/app/pages/user/archive/archive.page.js` | Archivo — usa DataTable + search |
| `src/app/pages/user/nomenclature/nomenclature.js` | Nomenclatura — card + DataTable |

### Reglas para el agente

1. **NO tocar** hooks, estados, llamadas API, handlers de eventos (excepto los puramente estilísticos como `onMouseEnter → backgroundColor`).
2. Trabaja archivo por archivo. Cada archivo es un commit lógico aislado.
3. Sigue este patrón de limpieza por archivo:
   - Leer el archivo completo
   - Identificar inline styles → reemplazar por clases BS5
   - Identificar `.bg-card` → evaluar si se puede usar `card bg-body-tertiary shadow-sm`
   - Identificar botones → estandarizar colores semánticos
   - Verificar que no se tocó lógica
4. Consultar Context7 para componentes BS5 (cards, buttons, forms, badges).
5. Los 149 tests deben seguir pasando tras cada archivo.

### Criterio de aceptación

- [ ] `React.forwardRef` eliminado de `MDBBtn` y `MDBCard` en `ui/index.js`
- [ ] Todos los cards usan clases BS5 nativas y responden a dark mode
- [ ] Formularios (inputs, selects) usan tokens BS5 y no tienen overrides de color en `GlobalStyles`
- [ ] Breadcrumbs usan estilo BS5 nativo
- [ ] Botones de acción siguen convención semántica (primary/outline-secondary/outline-danger)
- [ ] `fieldset`/`legend` modernizados con bordes sutiles
- [ ] Los 5 archivos prioritarios están limpios de inline styles de color
- [ ] Los 149 tests pasan

---

## Fase 4: Estandarización de Tablas y DataTables

**Scope**: Todas las tablas HTML (`<MDBTable>`, `<table>`) y los 13 archivos con `react-data-table-component`.

**Objetivo**: Tablas limpias, modernas, con hover, alineación vertical centrada, sin bordes pesados. DataTables con tema oscuro nativo.

### Archivos a modificar

| Archivo | Acción |
|---------|--------|
| `src/app/components/ui/index.js` (`MDBTable`) | Verificar que el wrapper genera `table table-hover align-middle` por defecto. Eliminar `table-bordered` como default (solo si se pasa prop). |
| 13 archivos con DataTable | Crear un tema custom para `react-data-table-component` que lea `data-bs-theme` y aplique paleta BS5. Exportar desde un archivo compartido (ej: `src/app/components/ui/dataTableTheme.js`). Aplicar el tema en cada instancia de `<DataTable>`. |
| `src/app/components/global.js` | Eliminar la regla `.rdt_Table` de `GlobalStyles` — el tema custom del DataTable la reemplaza. |
| `src/app/App.css` | Eliminar reglas legacy de tablas (`fieldset { border: 3px solid #ddd }`, `legend { border: 3px solid #ddd }`). |
| Tablas con filas de colores fuertes | Buscar `style={{backgroundColor: '...'}}` en filas `<tr>`/`<td>` de tablas. Reemplazar colores de fondo fuertes por `table-light`/`table-warning`/`table-danger` (clases BS5 semánticas). |

### Archivos específicos con DataTable

```
src/app/components/emails.component.js
src/app/pages/user/seal.js
src/app/pages/user/appointments.js                (3 instancias)
src/app/pages/user/fun_forms/fun_macrotable..js    (3 instancias)
src/app/pages/user/fun_forms/fun_n_4.js
src/app/pages/user/fun_forms/fun_n_51.js
src/app/pages/user/fun_forms/fun_n_52.js
src/app/pages/user/fun_forms/fun_g.js              (3 instancias)
src/app/pages/user/fun_forms/fun_g_checklist.js
src/app/pages/user/expeditions/exp_areas.component.js
src/app/pages/user/archive/archive.page.js
src/app/pages/user/nomenclature/nomenclature.js
src/app/pages/user/pqrs/pqrsadmin.functional.js   (3 instancias)
```

### Reglas para el agente

1. **NO tocar** las columnas, selectores de datos (`selector: row => row.xxx`), ni la lógica de filtrado/paginación.
2. Solo cambiar: `theme` prop del DataTable, clases CSS envolventes, estilos de tabla HTML.
3. El tema custom de DataTable debe ser un archivo único importable — no duplicar configuración en 13 archivos.
4. Consultar Context7 para clases de tablas BS5 (`table-hover`, `table-striped`, `align-middle`).
5. Los 149 tests deben seguir pasando.

### Criterio de aceptación

- [ ] Todas las tablas HTML usan `table table-hover align-middle` sin bordes pesados
- [ ] Existe `src/app/components/ui/dataTableTheme.js` con tema light/dark para DataTable
- [ ] Los 13 archivos con DataTable importan y usan el tema compartido
- [ ] DataTables se ven correctos en light Y dark mode
- [ ] No hay filas con colores de fondo fuertes (celeste/naranja) en tablas — solo semánticos BS5
- [ ] `fieldset` y `legend` usan bordes modernos y sutiles
- [ ] Los 149 tests pasan

---

## Fase 5: Páginas Internas — Limpieza de Inline Styles y Polish Final

**Scope**: Las ~25 páginas restantes con inline styles significativos, CSS files standalone recuperables, y el home/login público.

**Objetivo**: Eliminar los últimos restos de inline styles de color/layout. Pulir la estética. Asegurar consistencia total en dark mode.

### Archivos a modificar

**Prioridad Alta (muchos inline styles):**

| Archivo | Inline styles | Acción |
|---------|--------------|--------|
| `src/app/pages/home.js` | 40+ | Migrar todos los inline styles a clases BS5. Eliminar `#1B83C4` hardcodeado (usar `btn-primary`). Migrar carousel a BS5 nativo. |
| `src/app/pages/home.css` | ~50 líneas | Auditar. Migrar lo posible a BS5 utilities. Eliminar reglas redundantes. |
| `src/app/pages/user/dashboard.js` | 10+ | Eliminar colores de iconos hardcodeados (`Crimson`, `MediumSeaGreen`, `Khaki`, remplazar con CSS variables). |
| `src/app/pages/user/expeditions/exp_clocks_diagram.component.js` | 15+ | Eliminar inline styles de modales (`#667eea`), leyendas de colores. Solo ajustar clases envolventes — **NO tocar** la lógica del diagrama. |
| `src/app/pages/user/expeditions/exp_act_desist.component.js` | 18+ | Migrar anchos de columnas de inline `style={{width: '...'}}` a clases CSS. |
| `src/app/pages/user/certifications/certification.page.js` | ~5 | Eliminar `backgroundColor: 'lightgrey'` inline. |

**Prioridad Media (cleanup general):**

| Archivo | Acción |
|---------|--------|
| `src/app/pages/user/fun_forms/sideBar.js` | Verificar que sidebar de FUN usa BS5 tokens |
| `src/app/pages/user/fun_forms/components/fun_moduleNav.js` + CSS | Auditar `fun_moduleNav_enhanced.css` — migrar a BS5 donde se pueda |
| `src/app/pages/user/fun_forms/components/fun_modal_shared.css` | Auditar — migrar estilos de modales a BS5 |
| `src/app/pages/user/pqrs/components/editorStyles.css` | Solo auditar — NO tocar estilos de react-quill |
| `src/app/pages/user/clocks/centralClocks.css` | Solo auditar — **NO tocar** estilos del Gantt/timeline |
| `src/app/pages/user/clocks/gantt.css` | **NO TOCAR** — componente protegido |
| `src/styles/docs-expediente.css` | Solo auditar — estilos de impresión |

**Componentes shared:**

| Archivo | Acción |
|---------|--------|
| `src/app/components/emails.component.js` | Eliminar inline styles de layout |
| `src/app/components/MermaidDiagram.component.js` | Solo ajustar clases envolventes |
| `src/app/components/title.js` | Verificar compatibilidad dark mode |
| `src/app/components/carousel.component.js` | Verificar estilos post-migración |

### Reglas para el agente

1. **PROTEGER** los siguientes archivos — solo ajustar clases envolventes, NUNCA la estructura interna:
   - `clocks/` (Gantt, timeline, hooks)
   - `charts_components.js/` (14 archivos react-vis)
   - `pqrs_rteReply.component.js` (react-quill)
   - `record_arc_areas*.component.js` (@silevis/reactgrid)
   - `map.js` (react-google-maps)
2. **NO tocar** lógica, hooks, API calls, routing en ningún archivo.
3. Los colores de íconos del dashboard (`Crimson`, `MediumSeaGreen`, etc.) pueden moverse a un CSS class o CSS variable — no eliminarlos, solo sacarlos del inline style.
4. Para `home.js`: es la página pública, cuidar el branding. Colores de marca → CSS custom properties.
5. Los 149 tests deben seguir pasando.
6. Validación final con Playwright: recorrer login, dashboard, fun, submit, pqrs, archive en ambos temas.

### Criterio de aceptación

- [ ] `home.js` y `home.css` sin inline styles de color
- [ ] `dashboard.js` sin colores inline en iconos
- [ ] `exp_clocks_diagram.component.js` sin inline styles (solo clases)
- [ ] Todos los módulos CSS standalone auditados
- [ ] Dark mode funciona correctamente en TODAS las páginas
- [ ] No quedan instancias de `style={{backgroundColor: ...}}` con colores hardcodeados fuera de componentes protegidos
- [ ] Los 149 tests pasan
- [ ] Validación visual con Playwright en al menos 6 rutas (login, dashboard, fun, submit, pqrs, archive) en ambos temas

---

## Resumen de Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Regresión visual en light mode al migrar tema | Media | Cada fase tiene validación Playwright. Las clases legacy (`.bg-card`, `.container-primary`) se mantienen como aliases. |
| Romper lógica al tocar componentes | Baja | Regla estricta: SOLO clases CSS y atributos de estilo. NO hooks/state/API. Tests deben pasar. |
| DataTable no soporta tema dinámico | Baja | `react-data-table-component` acepta prop `theme` que se puede condicionar al atributo `data-bs-theme`. |
| Componentes legacy (react-vis, react-quill) se rompen | Baja | Están marcados como PROTEGIDOS. Solo se tocan clases envolventes. |
| styled-components `ThemeProvider` en conflicto con BS5 | Media | Se mantiene ThemeProvider SOLO para font scales. Se elimina para colores. Transición gradual. |

---

## Orden de Ejecución y Dependencias

```
Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4 ──→ Fase 5
  │           │           │           │           │
  │           │           │           │           └── Polish + validación final
  │           │           │           └── DataTables (depende de Fase 1 para dark mode)
  │           │           └── Cards/Forms (depende de Fase 1 para tokens BS5)
  │           └── Shell (depende de Fase 1 para data-bs-theme)
  └── Cimientos (base para todo lo demás)
```

Cada fase es un bloque aislado que puede ser mergeado independientemente. Si una fase falla, las anteriores siguen siendo válidas.

---

## Herramientas y Skills a Usar

| Herramienta/Skill | Uso |
|-------------------|-----|
| **Context7 MCP** (`/twbs/bootstrap`) | Consulta obligatoria antes de usar clases BS5. Verificar `data-bs-theme`, variables CSS, utilidades. |
| **Playwright MCP** | Validación visual: navegar rutas, toggle dark mode, verificar responsive. NO tomar screenshots (ahorro de tokens). |
| **Vitest** (`npm test`) | Validar que los 149 tests pasan tras cada fase. |
| **Explore Agent** | Búsqueda de patrones de inline styles/clases antes de cada fase. |
| **webapp-testing skill** | Para la validación E2E con Playwright en la fase de polish. |

---

## Tracking

| Fase | Estado | Archivos Modificados | Tests |
|------|--------|---------------------|-------|
| 1 - Cimientos | ⬜ Pendiente | — | — |
| 2 - Shell | ⬜ Pendiente | — | — |
| 3 - Componentes | ⬜ Pendiente | — | — |
| 4 - Tablas | ⬜ Pendiente | — | — |
| 5 - Pages/Polish | ⬜ Pendiente | — | — |
