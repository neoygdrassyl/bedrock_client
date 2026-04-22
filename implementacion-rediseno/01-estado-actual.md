# 01 — Estado actual del rediseno

## Que se ha hecho

### Infraestructura (Fase 0 — Foundation)

1. **Design tokens** definidos como CSS custom properties en `src/index.css`
   - 30+ tokens para light mode, 30+ para dark mode
   - Tokens de sidebar, warning, accent adicionales al set estandar de shadcn
   - Tailwind configurado para consumir estos tokens via `tailwind.config.js`

2. **18 componentes shadcn/ui** instalados y configurados
   - alert, avatar, badge, breadcrumb, button, card, dialog, dropdown-menu, input, label, scroll-area, select, separator, sheet, skeleton, table, tooltip, sonner
   - Config en `components.json`, componentes en `src/components/ui/`

3. **ThemeProvider** funcional (`src/components/theme-provider.jsx`)
   - Sincroniza clase `.dark` de Tailwind con `data-bs-theme` de Bootstrap 5
   - Persistencia en localStorage
   - Respeta preferencia del sistema

4. **Icon Bridge** (`src/components/icon.jsx` + `src/lib/icon-map.js`)
   - Wrapper sobre Lucide que acepta nombre string → componente
   - Fallback a CircleAlert para iconos no mapeados (corregido: antes retornaba null)

5. **Reset de botones sin preflight** (`src/index.css`)
   - Selector `:where()` de especificidad cero resetea borders nativos de `<button>`
   - Excluye `.btn`, `[class*="btn-"]` y `.Collapsible__trigger` para no afectar legacy
   - Necesario porque `preflight: false` en Tailwind no resetea elementos nativos

6. **Tokens semanticos corregidos en shadcn**
   - `--accent` (green #059669) reservado para exito/aprobacion de dominio
   - Hover/focus en ghost/outline buttons, dropdown, command, select, dialog usan `bg-muted` (gris sutil)
   - Elimina el flash verde en hover que causaba la convencion original de shadcn

7. **DataTable wrapper** (`src/components/data-table.jsx`)
   - Basado en @tanstack/react-table
   - Sorting, filtering, pagination integrados con shadcn/ui
   - Usado por funmanage_new.page.js y FunmanageDataTable.jsx

8. **DataTable Bridge** (`src/components/data-table-bridge.jsx`)
   - Drop-in replacement para react-data-table-component
   - Acepta la API completa de RDT (columns, pagination, conditionalRowStyles, expandableRows, etc.)
   - Convierte columnas RDT → tanstack ColumnDef automaticamente
   - 83 archivos migrados (import swap)

9. **LegacyModal** (`src/components/legacy-modal.jsx`)
   - Drop-in replacement para react-modal
   - Portal-based dialog con design tokens, ESC key, overlay click, body scroll lock
   - 30 archivos migrados

10. **Icon Bridge expandido** (`src/lib/icon-map.js`)
    - ~180 iconos FA → Lucide mapeados
    - 170 archivos migrados de `<i className="fas fa-*">` a `<Icon name="*" />`

### Shell (Fase 1 — Application Shell)

6. **AppShell** como layout principal con estructura:
   ```
   [IconRail 48px] [ContextPanel 180px] [Content area]
                                         [HeaderBar 48px]
                                         [Main content]
                                         [Footer ~24px]
   ```

7. **IconRail** — navegacion vertical con iconos Lucide, tooltips, active state, hover glow, group separators
8. **ContextPanel** — submenu contextual con animacion smooth, iconos en sub-items
9. **HeaderBar** — breadcrumb automatico con iconos de modulo + theme toggle + dropdown de usuario + search placeholder + shadow-sm
10. **AppFooter** — version + nombre curaduria + ciudad + NIT
11. **navigation-config.js** — fuente unica de verdad para rutas, roles, redirects legacy, iconos en children

### Paginas (Fase 2 — Login + Dashboard)

12. **LoginPage** rediseñada — split-screen con panel institucional gradiente + formulario + animacion fadeInUp
13. **Dashboard** rediseñado — grid de cards con iconos, contadores, bordes laterales de color por modulo, hover con elevacion
14. **Dashboard pulido** — saludo dinamico (Buenos dias/tardes/noches), fecha en español, secciones con linea divisora decorativa y badge de conteo, cards stat-ready con prop `count` opcional

### Refactors estructurales

14. **App.js reescrito** (de ~500 lineas a 318) — layout routes, ThemeProvider, rutas en espanol
15. **Rutas renombradas**: `/fun` → `/licencias`, `/pqrsadmin` → `/peticiones`, etc.
16. **Redirects legacy** preservan URLs viejas bookmarkeadas

### Polish visual (Fase 2.5)

17. **LegacyPageWrapper** (`src/app/layouts/LegacyPageWrapper.jsx`) — bridge CSS que envuelve todas las paginas legacy en `.legacy-bridge`, alineando colores Bootstrap con tokens del redeseno (botones, tablas, cards, badges, alerts, formularios, tabs, accordions)
18. **ContextPanel mejorado** — soporte para secciones agrupadas (`item.group`), badges/contadores opcionales (`item.badge`), padding mas compacto, separadores visuales entre grupos
19. **Dashboard pulido** — saludo dinamico segun hora del dia, fecha formateada en español, secciones con linea divisora decorativa, cards stat-ready con prop `count` para futura integracion backend
20. **FontAwesome CDN eliminado** — cero dependencias de FA en runtime
21. **Navigation config expandido** — `Gestion nueva` agregado como hijo de Licencias en el context panel

### Limpieza estructural (Fase 2.5+)

22. **styled-components eliminado completamente** — GlobalStyles migrado a `src/index.css`, font scales hardcodeados (solo se usaba `fontZise3`), StyleSheetManager/SCThemeProvider removidos de App.js, paquete desinstalado. Build paso de ~34s a ~26s.
23. **SweetAlert2 CSS theme** (`src/app/styles/swal-theme.css`) — tema CSS que alinea ~2330 llamadas Swal en ~100 archivos con los design tokens sin tocar JavaScript. Popup, botones, iconos, inputs y dark mode con tokens.
24. **App.css limpiado** — eliminadas reglas muertas (`.bg-image`, `ReactModal__*` overrides, `.Collapsible` base duplicado). Reducido de 251 a 189 lineas.
25. **Archivos muertos eliminados** — `global.js` (styled-components GlobalStyles), `font.js` (escalas de fuente, ya no importado)
26. **Paquetes desinstalados** — `react-modal`, `react-data-table-component`, `styled-components`, `@emotion/is-prop-valid` (bridges no los importan, solo docs los referencian)

### UX estructural (Fase 2.7)

27. **Navegacion SPA corregida** — eliminado `key={pathname}` en ErrorBoundary que remontaba todo el arbol en cada cambio de ruta. Ahora el shell (sidebar, header, footer) persiste y solo cambia el area de contenido. Suspense movido dentro del shell para que la carga lazy no reemplace toda la pantalla.
28. **Sidebar colapsable** — boton de toggle en HeaderBar (PanelLeftClose/PanelLeft), atajo Ctrl+B / Cmd+B, estado persistido en localStorage. Transicion suave de 200ms en IconRail + ContextPanel.
29. **Contraste modo oscuro mejorado** — tokens `--border` y `--input` ajustados de 17.5% a 25% luminosidad en modo oscuro. Antes eran identicos a `--card`, haciendo bordes e inputs invisibles.
30. **Breadcrumbs sin recarga** — `<a href>` reemplazados por `<Link to>` en HeaderBar para navegacion SPA sin refrescar pagina.

### Polish visual (Fase 2.8)

31. **Legacy bridge CSS expandido** (`src/app/styles/legacy-bridge.css`) — de 285 a 489 lineas. Cobertura ampliada:
    - Input groups: addon con tokens, border alignment (136 archivos)
    - Form checks: checkbox/radio/switch con colores del sistema (69 archivos)
    - Paginacion: links, active state, disabled state (42 archivos)
    - List groups: colores, hover, active (18 archivos)
    - Modals: background/border con tokens, esquinas redondeadas
    - Progress bars: track muted, fills primary/accent/destructive/warning
    - Dropdowns: popover bg, hover states, dividers
    - Breadcrumbs legacy: links primary, active muted
    - Form labels: foreground color, tamaño 0.875rem, peso medium
    - Tooltips: sidebar bg, texto pequeño, rounded
    - Dark mode: cobertura completa para todos los nuevos overrides

32. **Skeleton loading** — LoadingFallback reemplazado: de un spinner centrado a un grid de cards skeleton con `animate-pulse` y delays escalonados. Simula la estructura del dashboard para continuidad visual.

33. **DataTable bridge mejorado** — estado vacio con icono FileX + mensaje estilizado. Paginacion compacta con botones h-7, indicadores de pagina para ≤7 paginas, contador de registros totales.

### Fase 3 — FUN (Licencias) Module

34. **Dashboard real-time counts** — conteos en vivo desde 5 APIs del backend (FUN, PQRS, Submit, Mailbox, Appointments) con Skeleton loading. FUN activas filtradas por state>0 && <100, pendientes por state==1 || ==-1.

35. **FUN.js status badges** — `_GET_MISSING_CONTEXT` y `_GET_STATE_STR` reescritos: de `<label text-danger>` a `<Badge variant="destructive">`. 15+ estados con badges color-coded (primary, accent, secondary, outline, destructive).

36. **FUN.js row styles tokenizados** — `var(--bs-info-bg-subtle)` → `hsl(var(--primary)/0.08)`, `var(--bs-warning-bg-subtle)` → `hsl(var(--warning)/0.12)`. Compatible dark mode.

37. **FUN.js column headers limpios** — 7 sets de columnas: `<label className="text-center">` → strings planos. Cell renderers: `<label>`/`<h6>` → `<span className="text-sm">` con font-mono para IDs/fechas. Categoria usa `<Badge variant="outline">`. Tiempo restante color-coded (destructive <0, warning ≤5).

38. **funmanage.page.js visual alignment** — FECHA PENDIENTE → Badge destructive, titulo H1 ALL CAPS → H2 title case tracking-tight, tabs labels → span font-medium uppercase tracking-wide.

### Fase 4 — PQRS Module

39. **pqrsadmin.js status badges** — `_STATUS_COMPONENT` reescrito: 4 estados (ACTIVO, CERRADO, REVISIÓN, ARCHIVADO) → `<Badge>` con variantes destructive/accent/primary/secondary. `_CHECK_FOR_REVIEWS`: 3 estados de revisión → Badge components.

40. **pqrsadmin.js column cleanup** — 3 column sets (columns, columnsArchive, columnsSearch): headers `<label>` → strings, cells `<label>` → `<span>` con font-mono para IDs/fechas. Tiempo restante color-coded.

41. **pqrsadmin.functional.js** — misma migración completa que admin view (archivo casi idéntico, código separado).

42. **pqrs_manage.view.js** — columnas de asignación de trabajadores, columnas de adjuntos, badges de retroalimentación (SI/NO → Badge accent/secondary).

43. **pqrs_macrotable.js** — 20 column headers limpios, BlanchedAlmond → token, fecha límite header.

### Fase 5 — Submit, Expeditions, Records, y Bulk Cleanup

44. **Submit module** — submit.js, submit_view, submit_x_fun, submit_anex, submit_list: todos los headers y cells limpios. Tiempo restante con color-coded destructive.

45. **Expeditions** — exp_areas: 7 headers + 5 cells limpios, action header modernizado.

46. **Módulos auxiliares** — archive, dictionary, zone_use, fun_worker_asign: headers limpios.

47. **Bulk column header cleanup** — Script automatizado limpió 211 headers `<label>` → string en 47 archivos (fun_forms, records arc/law/ph/eng, norms, nomenclature, pqrs subcomponents).

48. **Bulk cell renderer cleanup** — 259 cell renderers `<label>{expr}</label>` → `<span className="text-sm">{expr}</span>` en 38 archivos.

49. **Row style tokenization global** — `BlanchedAlmond` → `hsl(var(--warning) / 0.12)` en 4 archivos (pqrs_macrotable, fun_macrotable, fun_macro_clocks, record_ph_floor).

50. **CSV export compatibility** — `c.name.props.children` → fallback que acepta strings Y React elements en fun.js, appointments, fun_macrotable (3 archivos).

51. **Tab labels modernizados** — fun_macrotable: GENERAL/OTRAS ACTUACIONES/DESISTIMIENTOS → Title Case con tracking-wide.

## Que falta (resumen)

| Area | Estado |
|---|---|
| Brecha visual del shell | **COMPLETADO — IconRail hover glow, ContextPanel con grupos/badges, HeaderBar con search/bell/breadcrumb, Footer VS Code-style con conectividad** |
| Visual polish v1 (shell+dash+login) | **COMPLETADO — shell compactado (h-11 header, h-[22px] footer, w-9/h-9 rail buttons), dashboard max-w-6xl + Badge counts, login gradient profundo + h-9 inputs, legacy bridge +116 lineas, font scale reducida** |
| Regression fixes | **COMPLETADO — 7 regresiones corregidas: lazy route imports, Vite optimizeDeps, DataTable bridge rdt_* classes, LegacyModal z-index, FUN heading/action menu/search empty state. 7 tests de regresion agregados.** |
| Paginas de modulos legacy (FUN, PQRS, etc.) | **FUN migrado (badges, columns, row tokens). PQRS migrado (3 archivos principales + macrotable). Submit, Expeditions, Archive, Dictionary, Zone Use migrados. Records/Norms: headers y cells limpios en bulk.** |
| Tablas legacy (react-data-table-component) | **MIGRADO — 83 archivos usan DataTableBridge** |
| Modales legacy (react-modal) | **MIGRADO — 30 archivos usan LegacyModal** |
| Alertas (SweetAlert2) | **CSS THEME APLICADO — dialogs visualmente alineados con tokens. Migracion JS completa en Fase 6** |
| Iconos (FontAwesome CDN) | **MIGRADO — 220+ archivos usan Lucide Icon bridge, CDN eliminado** |
| Dashboard | **COMPLETO — saludo dinamico, fecha, secciones, cards con conteos en vivo (5 APIs), max-w-6xl, Badge counts** |
| Login | **COMPLETO — split-screen rediseñado, gradient profundo, inputs h-9 con focus ring, mobile-responsive** |
| Legacy bridge CSS | **EXPANDIDO — 600+ lineas: typography density, table density, form controls, links, badges, rdt_* tables, dark mode completo** |
| Font scale global | **REDUCIDA — h1:22px h2:18px h3:15px p:14px (antes h1:32px h2:24px)** |
| Forms | Todos manuales, sin sistema unificado |
| Styled-components restantes | **ELIMINADO — global.js/font.js borrados, paquete desinstalado, bundle reducido** |
| Bootstrap como dependencia | Grid/utilidades aun necesarias |
| MDB wrappers | 24 archivos usan wrappers locales (no MDB directo) — limpios |
| E2E selectors | **ALINEADOS — 5 archivos E2E actualizados para DOM del rediseño. 31 E2E pass, 4 skipped** |

## Clases CSS legacy que NO se pueden eliminar aun

Estas clases siguen usandose en componentes activos:

- `container-primary` — 12 archivos
- `bg-card` — 20 archivos (CONFLICTO: tambien es clase Tailwind de shadcn)
- `Collapsible*` — submit_manage, appointments
- `btn-navpqrs` — 8 archivos de formularios FUN
- `fung_nav` / `fun_nav` — formularios FUN internos
- `chart-clock` — 5 archivos de charts
- `container-sh` — fun_gen.report, record_arc_areas
- `fun-action-*` — acciones de FUN

### Clases CSS eliminadas en esta fase

- `react-modal` — ya no se usa (LegacyModal no depende de clases react-modal)
- `ReactModal__*` — overrides de react-modal eliminados
- `bg-image` — imagen de fondo no usada por ningun componente
- `.Collapsible` base — duplicado con index.css (migrado de styled-components)

### Paquetes eliminados en esta fase

- `styled-components` + `@emotion/is-prop-valid` — estilos migrados a CSS puro
- `react-modal` — reemplazado por LegacyModal bridge
- `react-data-table-component` — reemplazado por DataTable bridge
