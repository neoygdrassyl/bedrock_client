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

### Refactors estructurales

14. **App.js reescrito** (de ~500 lineas a 318) — layout routes, ThemeProvider, rutas en espanol
15. **Rutas renombradas**: `/fun` → `/licencias`, `/pqrsadmin` → `/peticiones`, etc.
16. **Redirects legacy** preservan URLs viejas bookmarkeadas

## Que falta (resumen)

| Area | Estado |
|---|---|
| Brecha visual del shell | **EN PROGRESO — bordes y transiciones corregidos, polish aplicado** |
| Paginas de modulos legacy (FUN, PQRS, etc.) | Intactas con estilo viejo Bootstrap |
| Tablas legacy (react-data-table-component) | **MIGRADO — 83 archivos usan DataTableBridge** |
| Modales legacy (react-modal) | **MIGRADO — 30 archivos usan LegacyModal** |
| Alertas (SweetAlert2) | ~100 archivos, ~2330 lineas sin migrar (Fase 6) |
| Iconos (FontAwesome CDN) | **MIGRADO — 170 archivos usan Lucide Icon bridge** |
| Forms | Todos manuales, sin sistema unificado |
| Styled-components restantes | global.js + componentes puntuales |
| Bootstrap como dependencia | Grid/utilidades aun necesarias |
| MDB wrappers | 24 archivos usan wrappers locales (no MDB directo) — limpios |

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
