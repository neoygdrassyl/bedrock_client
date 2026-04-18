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
   - Fallback a CircleAlert para iconos no mapeados

5. **DataTable wrapper** (`src/components/data-table.jsx`)
   - Basado en @tanstack/react-table
   - Sorting, filtering, pagination integrados con shadcn/ui
   - Reemplazara progresivamente a react-data-table-component

### Shell (Fase 1 — Application Shell)

6. **AppShell** como layout principal con estructura:
   ```
   [IconRail 48px] [ContextPanel 180px] [Content area]
                                         [HeaderBar 48px]
                                         [Main content]
                                         [Footer ~24px]
   ```

7. **IconRail** — navegacion vertical con iconos Lucide, tooltips, active state
8. **ContextPanel** — submenu contextual con animacion smooth
9. **HeaderBar** — breadcrumb automatico + theme toggle + dropdown de usuario
10. **AppFooter** — version + nombre curaduria + ciudad + NIT
11. **navigation-config.js** — fuente unica de verdad para rutas, roles, redirects legacy

### Paginas (Fase 2 — Login + Dashboard)

12. **LoginPage** rediseñada — split-screen con panel institucional + formulario
13. **Dashboard** rediseñado — grid de cards con iconos y contadores

### Refactors estructurales

14. **App.js reescrito** (de ~500 lineas a 318) — layout routes, ThemeProvider, rutas en espanol
15. **Rutas renombradas**: `/fun` → `/licencias`, `/pqrsadmin` → `/peticiones`, etc.
16. **Redirects legacy** preservan URLs viejas bookmarkeadas

## Que falta (resumen)

| Area | Estado |
|---|---|
| Brecha visual (shell no se ve profesional) | **CRITICO — resolver antes de Fase 3** |
| Paginas de modulos legacy (FUN, PQRS, etc.) | Intactas con estilo viejo Bootstrap |
| Tablas legacy (react-data-table-component) | 71 archivos sin migrar a DataTable |
| Modales legacy (react-modal) | 29 archivos sin migrar a Dialog |
| Alertas (SweetAlert2) | ~100 archivos, ~2330 lineas sin migrar |
| Iconos (FontAwesome CDN) | ~216 archivos con `<i className="fas fa-*">` |
| Forms | Todos manuales, sin sistema unificado |
| Styled-components restantes | global.js + componentes puntuales |
| Bootstrap como dependencia | Grid/utilidades aun necesarias |

## Clases CSS legacy que NO se pueden eliminar aun

Estas clases siguen usandose en componentes activos:

- `container-primary` — 12 archivos
- `bg-card` — 20 archivos (CONFLICTO: tambien es clase Tailwind de shadcn)
- `Collapsible*` — submit_manage, appointments
- `react-modal` — 10 archivos
- `btn-navpqrs` — 8 archivos de formularios FUN
- `fung_nav` / `fun_nav` — formularios FUN internos
- `chart-clock` — 5 archivos de charts
- `container-sh` — fun_gen.report, record_arc_areas
- `fun-action-*` — acciones de FUN
- `ReactModal__*` — overrides de react-modal (incluyen dark mode)
