# 07 — Guía de Estándares del Rediseño Dovela

> **Fuente de verdad consolidada** para cualquier agente, desarrollador o sesión que trabaje en el rediseño UI/UX de Dovela. Este documento reemplaza la necesidad de leer 6+ archivos dispersos — contiene el estado real, las reglas, los patrones y las métricas verificadas.

**Última actualización:** 2026-04-20
**Branch:** `feat/ui-redesign-phases-0-2`
**Tests:** 495/495 | **Build:** ✅ | **E2E:** 6 specs

---

## 1. ¿Qué es Dovela?

SPA institucional para Curadurías Urbanas colombianas. Modela procesos de curadurías urbanas: licencias de construcción (FUN), relojes legales (Clocks), PQRS, expediciones, archivo, nomenclatura, usos del suelo y documentos jurídicos. **Cada ruta, botón y flujo de datos representa una relación legal real.** Romper funcionalidad = perder un trámite urbano.

---

## 2. Estado actual del rediseño — Métricas verificadas

### 2.1 Lo que se eliminó (deuda técnica resuelta)

| Dependencia eliminada | Método | Archivos afectados |
|---|---|---|
| `styled-components` + `@emotion/is-prop-valid` | Migrado a CSS puro en `index.css` | GlobalStyles, font scales |
| `react-modal` | Reemplazado por `LegacyModal` (portal + tokens) | 30 archivos |
| `react-data-table-component` | Reemplazado por `DataTableBridge` (@tanstack) | 83 archivos |
| `sweetalert2-react-content` | swalAdapter centralizado | ~155 archivos, ~1,450 calls |
| FontAwesome CDN | Lucide Icon bridge | 220+ archivos, 0 `<i class="fa*">` |
| `MDBPopover` en páginas | shadcn Popover/DropdownMenu | 84 refs en 5 archivos → 0 |
| `MDBCollapse` en páginas | Collapsible CSS-transition component | 5 archivos → 0 |
| Bootstrap `nav nav-tabs` | TabPane component | Todas las tabs migradas |
| Bootstrap `btn-*` classes | shadcn `<Button>` | ~435 botones en 146 archivos → 0 Bootstrap btns |
| `MySwal.fire` directo | swalAdapter API | 0 llamadas directas restantes |

### 2.2 Lo que se construyó (infraestructura nueva)

| Componente | Ubicación | Propósito |
|---|---|---|
| Design Tokens | `src/index.css` (210 líneas) | 35+ tokens HSL light + dark |
| 27 componentes shadcn/ui | `src/components/ui/` | Buttons, Cards, Dialog, etc. |
| ThemeProvider | `src/components/theme-provider.jsx` | Dark/light sync Bootstrap↔Tailwind |
| Icon Bridge | `src/components/icon.jsx` + `src/lib/icon-map.js` | FA name → Lucide, ~186 mappings |
| getIconSvg | `src/app/utils/iconSvgString.js` | SVG strings para template literals |
| DataTable | `src/components/data-table.jsx` | @tanstack/react-table nativo |
| DataTableBridge | `src/components/data-table-bridge.jsx` | Drop-in para RDT API |
| LegacyModal | `src/components/legacy-modal.jsx` | Drop-in para react-modal |
| Collapsible | `src/components/collapsible.jsx` | CSS-transition, sin Radix |
| EmptyState | `src/components/empty-state.jsx` | FileX icon + mensaje |
| swalAdapter | `src/app/components/swalAdapter.js` | API semántica sobre Swal2 |
| AppShell | `src/app/layouts/AppShell.jsx` | IconRail + ContextPanel + Content |
| IconRail | `src/app/layouts/IconRail.jsx` | Nav vertical 48px dark |
| ContextPanel | `src/app/layouts/ContextPanel.jsx` | Submenu contextual 180px |
| HeaderBar | `src/app/layouts/HeaderBar.jsx` | Breadcrumb + theme toggle + user |
| AppFooter | `src/app/layouts/AppFooter.jsx` | Versión + entidad + NIT |
| navigation-config | `src/app/layouts/navigation-config.js` | Rutas, roles, redirects, iconos |
| LegacyPageWrapper | `src/app/layouts/LegacyPageWrapper.jsx` | Bridge CSS container `.legacy-bridge` |
| Legacy Bridge CSS | `src/app/styles/legacy-bridge.css` (1,577 líneas) | Bootstrap → tokens override |
| Swal Theme CSS | `src/app/styles/swal-theme.css` (243 líneas) | SweetAlert2 → tokens |

### 2.3 Métricas cuantitativas (verificadas 2026-04-20)

```
Tests unitarios:         495/495 passing (83 archivos)
Tests E2E:               6 specs
Build producción:        ✅ (~41s)
Archivos en src/app/pages: 287
Archivos en src/components: 32
Services:                28
Total source files:      531

shadcn components:       27
Icon mappings FA→Lucide: ~186 (icon-map.js)
getIconSvg SVG paths:    30+ (iconSvgString.js)
Legacy bridge CSS rules: 316
swalAdapter consumers:   189 archivos
shadcn Button consumers: 171 archivos
Lucide Icon consumers:   212 archivos

Bootstrap btn-* en páginas: 0
MDBPopover en páginas:      0
MDBCollapse en páginas:     0
nav nav-tabs en páginas:    0
FontAwesome <i> tags:       0
MySwal.fire directos:       0 (1 en swalAdapter wrapper)
styled-components:          0 (desinstalado)
react-modal:                0 (desinstalado)
react-data-table-component: 0 (desinstalado)
```

### 2.4 Capas CSS actuales (en orden de prioridad)

```
Capa 1 (activa, destino): Tailwind CSS + shadcn/ui + CSS custom properties
Capa 2 (legacy, activa):  Bootstrap 5 (grid + utilidades, necesario aún)
Capa 3 (bridge, activa):  legacy-bridge.css (1,577 líneas — overrides Bootstrap→tokens)
Capa 4 (bridge, activa):  swal-theme.css (243 líneas — SweetAlert2→tokens)
Capa 5 (legacy, activa):  App.css (245 líneas — reducido de 555)
Capa 6 (legacy, muerta):  RSuite 5 (no importado, pendiente desinstalar)
```

**Meta:** Cada fase debe reducir las capas 2-6. Bootstrap es la última en caer (Fase 6).

---

## 3. Design System — Especificación técnica

### 3.1 Tokens de color (HSL en CSS custom properties)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--primary` | 221 83% 53% (#2563EB) | 217 91% 60% | Acciones, links, active |
| `--accent` | 160 84% 39% (#059669) | 160 84% 39% | Éxito, aprobación legal |
| `--destructive` | 0 72% 51% (#DC2626) | 0 63% 60% | Errores, rechazos |
| `--warning` | 38 92% 50% (#F59E0B) | 38 92% 50% | Precaución, pendiente |
| `--background` | 210 20% 98% | 222 47% 11% | Fondo principal |
| `--foreground` | 222 47% 11% | 210 40% 98% | Texto principal |
| `--card` | 0 0% 100% | 217 33% 18% | Superficie de cards |
| `--muted` | 210 40% 96% | 217 33% 18% | Fondos secundarios |
| `--muted-foreground` | 215 16% 47% | 215 20% 65% | Texto secundario |
| `--border` | 214 32% 91% | 217 25% 25% | Bordes |
| `--sidebar` | 222 47% 11% | 222 47% 11% | Rail + panel (siempre dark) |
| `--sidebar-foreground` | 210 40% 98% | 210 40% 98% | Texto en sidebar |
| `--ring` | 221 83% 53% | 217 91% 60% | Focus rings |
| `--radius` | 0.5rem | 0.5rem | Border-radius base |

**Regla:** Nunca usar colores Tailwind directos (`bg-blue-500`, `text-slate-600`). Siempre tokens semánticos (`bg-primary`, `text-muted-foreground`).

### 3.2 Tipografía

| Rol | Font | Tailwind class | Tamaño |
|---|---|---|---|
| Cuerpo | Inter | `font-sans` | `text-sm` (14px) |
| Datos técnicos | JetBrains Mono | `font-mono` | `text-sm` |
| Título (h1) | Inter | `text-xl font-bold` | 22px (reducido de 32px) |
| Subtítulo (h2) | Inter | `text-lg font-semibold` | 18px (reducido de 24px) |
| Sección (h3) | Inter | `text-base font-semibold` | 15px |
| Párrafo | Inter | `text-sm` | 14px |
| Metadata | Inter | `text-xs text-muted-foreground` | 12px |

**Regla:** No usar `font.js` (eliminado), no crear escalas custom. Solo la escala de Tailwind.

### 3.3 Layout del shell

```
┌─────────┬──────────────┬──────────────────────────────────────┐
│ IconRail │ ContextPanel │ HeaderBar (breadcrumb + actions)     │
│  48px    │   180px      ├──────────────────────────────────────┤
│  dark bg │   collapsible│ ScrollArea (content area)            │
│  icons   │   sub-items  │   - LegacyPageWrapper                │
│  tooltips│   groups     │   - Lazy-loaded route component      │
│  dividers│   badges     │                                      │
│          │              ├──────────────────────────────────────┤
│          │              │ Footer (version + entidad + NIT)     │
└─────────┴──────────────┴──────────────────────────────────────┘
```

- **Sidebar colapsable:** toggle en HeaderBar, Ctrl+B/Cmd+B, persistido en localStorage
- **Transición:** 200ms ease en IconRail + ContextPanel
- **Suspense:** dentro del shell (solo el contenido muestra skeleton, no el shell entero)

### 3.4 Espaciado

Solo la escala de Tailwind: `p-1` (4px) a `p-8` (32px), `gap-1` a `gap-6`.
No custom spacing, no `style={{ padding: '12px' }}`.

### 3.5 Animaciones registradas

```js
// tailwind.config.js — keyframes disponibles
"fadeInUp"    → animate-fade-in-up    (0.4s ease-out)
"slideInLeft" → animate-slide-in-left (0.3s ease-out)
"scaleIn"     → animate-scale-in      (0.2s ease-out)

// legacy-bridge.css — @keyframes CSS
bridgeFadeIn  (0.3s ease-out)   — page content entrance
bridgePulse   (2s infinite)     — spinner modernizado
bridgeCardIn  (0.4s ease-out)   — card/fieldset entrance
```

### 3.6 Componentes shadcn disponibles (27)

alert, avatar, badge, breadcrumb, button, card, checkbox, collapsible (custom), command, dialog, dropdown-menu, empty-state (custom), input, label, popover, scroll-area, select, separator, sheet, skeleton, sonner, switch, table, tabs, textarea, tooltip, toggle

---

## 4. Patrones de migración — Recetas probadas

### 4.1 Botones: Bootstrap → shadcn

```jsx
// ❌ Antes
<button className="btn btn-primary btn-sm">Guardar</button>

// ✅ Después
import { Button } from '@/components/ui/button';
<Button size="sm">Guardar</Button>

// Variantes equivalentes:
// btn-primary     → variant="default"
// btn-secondary   → variant="secondary"
// btn-danger      → variant="destructive"
// btn-success     → variant="accent" (custom)
// btn-outline-*   → variant="outline"
// btn-link        → variant="link"
// btn-sm          → size="sm"
// btn-lg          → size="lg" (ya no hay btn-lg en pages)
```

### 4.2 Iconos: FontAwesome → Lucide

```jsx
// ❌ Antes
<i className="fas fa-home"></i>

// ✅ Después (en JSX)
import Icon from '@/components/icon';
<Icon name="home" size={16} />

// ✅ Después (en template literals / HTML strings)
import { getIconSvg } from '@/app/utils/iconSvgString';
const html = `<div>${getIconSvg('fa-home')}</div>`;
// También acepta nombres Lucide: getIconSvg('HourglassIcon')
```

**Arquitectura dual de iconos:**
1. `<Icon>` component → acepta FA name O Lucide name → busca en `FA_TO_LUCIDE` map → fallback `CircleAlert`
2. `getIconSvg()` → retorna SVG string → tiene `SVG_ICONS` map (30+ FA keys) + `LUCIDE_TO_FA` reverse map (32 entries)
3. Template literals DEBEN usar `getIconSvg()` porque React components no funcionan en HTML strings

### 4.3 Tablas: react-data-table → DataTableBridge

```jsx
// ❌ Antes
import DataTable from 'react-data-table-component';
<DataTable columns={cols} data={rows} pagination />

// ✅ Después (drop-in, misma API)
import { DataTableBridge } from '@/components/data-table-bridge';
<DataTableBridge columns={cols} data={rows} pagination />
```

### 4.4 Modales: react-modal → LegacyModal

```jsx
// ❌ Antes
import Modal from 'react-modal';
<Modal isOpen={show} onRequestClose={close}>

// ✅ Después (drop-in, misma API)
import LegacyModal from '@/components/legacy-modal';
<LegacyModal isOpen={show} onRequestClose={close}>
```

### 4.5 Alertas: MySwal.fire → swalAdapter

```jsx
// ❌ Antes
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
MySwal.fire({ title: 'Éxito', icon: 'success' });

// ✅ Después
import { swalSuccess, swalError, swalConfirm, swalInfo } from '@/app/components/swalAdapter';
swalSuccess('Guardado exitosamente');
swalError('Error al procesar');
swalConfirm('¿Confirmar acción?').then(r => { if (r.isConfirmed) ... });
swalInfo('Información importante', '<p>Detalle</p>');
```

### 4.6 Tabs: nav nav-tabs → TabPane

```jsx
// ❌ Antes
<ul className="nav nav-tabs">
  <li><a className={active === 0 ? 'active' : ''} onClick={() => set(0)}>Tab 1</a></li>
</ul>

// ✅ Después
import { MDBTabsContent, MDBTabsPane } from '@/app/components/ui';
// (usa los wrappers locales que ya generan Bootstrap correcto)
```

### 4.7 Collapsible sections

```jsx
// ❌ Antes
import { MDBCollapse } from '@/app/components/ui';

// ✅ Después
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/collapsible';
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger>Header</CollapsibleTrigger>
  <CollapsibleContent>Body</CollapsibleContent>
</Collapsible>
```

### 4.8 Column headers en tablas (patrón bulk)

```jsx
// ❌ Antes
{ name: <label className="text-center">ID</label>, selector: r => r.id }

// ✅ Después
{ name: 'ID', selector: r => r.id }
// El DataTableBridge aplica uppercase headers automáticamente
```

### 4.9 Cell renderers en tablas (patrón bulk)

```jsx
// ❌ Antes
cell: r => <label>{r.code}</label>

// ✅ Después
cell: r => <span className="text-sm">{r.code}</span>
// Para IDs/fechas: className="text-sm font-mono"
// Para estados: <Badge variant="destructive">{r.status}</Badge>
```

### 4.10 Row styles tokenizados

```jsx
// ❌ Antes
{ when: r => r.urgent, style: { backgroundColor: 'BlanchedAlmond' } }

// ✅ Después
{ when: r => r.urgent, style: { backgroundColor: 'hsl(var(--warning) / 0.12)' } }
// Soporta dark mode automáticamente
```

---

## 5. Reglas inquebrantables

### Estilo
1. **Solo Tailwind + shadcn** para código nuevo. No styled-components, CSS modules, inline styles, ni archivos CSS nuevos.
2. **Solo tokens semánticos** — nunca colores hardcoded (`bg-blue-500`, `text-[#333]`).
3. **Solo Inter + JetBrains Mono** — no otras fuentes.
4. **Solo escala Tailwind** para spacing.
5. **Dark mode obligatorio** — verificar ambos temas antes de commitear.
6. **`preflight: false`** se mantiene hasta Fase 6.
7. **No CSS `!important`** salvo para overridear reglas legacy que causan el conflicto.

### Funcionalidad
8. **Cero pérdida de funcionalidad** — cada ruta, botón, formulario, modal y flujo de datos sobrevive.
9. **No llamadas HTTP directas** en componentes — usar `src/app/services/`.
10. **No `return null` para datos legales** — usar fallback visible (skeleton, "Sin datos", badge).
11. **No `process.env`** — usar `import.meta.env.VITE_*`.
12. **No `React.forwardRef()`** ni `defaultProps` en código nuevo.
13. **No nueva librería UI** sin aprobación.
14. **Preservar redirects legacy** en `navigation-config.js`.
15. **No exponer datos sensibles** de `vars.js` en logs.

### Proceso
16. **Leer antes de reescribir** — entender props, services, modales, side effects, consumidores.
17. **Un commit = un tipo de cambio** (style, refactor, feat, fix, test).
18. **Cada sesión termina con `npm test` + `npm run build` pasando.**
19. **Comparar contra apps de referencia** (Linear, Notion, Figma) antes de declarar un componente terminado.
20. **No dar por buena documentación vieja** si contradice el código o el runtime.

---

## 6. Antipatrones — Errores que ya se identificaron

| # | Antipatrón | Síntoma | Prevención |
|---|---|---|---|
| AP1 | Template-ish genérico | Se ve como "cualquier template shadcn" | Personalizar defaults, comparar contra Linear/Notion |
| AP2 | Desalineación legacy/nuevo | Shell moderno + contenido 2018 | LegacyPageWrapper + legacy-bridge.css |
| AP3 | 6 fuentes de verdad CSS | Reglas se pisan entre sí | Eliminar CSS legacy al migrar componente |
| AP4 | Tests primero, diseño después | Tests pasan pero UI fea | Diseñar → implementar → verificar visual → LUEGO tests |
| AP5 | Hardcodear valores | Dark mode roto parcialmente | Solo tokens semánticos, nunca colores directos |
| AP6 | Migrar sin entender | Faltan flujos ocultos (PDF, select reload) | Leer componente completo, checklist de funcionalidades |
| AP7 | Romper URLs | 404 para bookmarks viejos | Redirects en navigation-config.js |
| AP8 | Olvidar dark mode | Textos ilegibles, bordes invisibles | Toggle abierto durante desarrollo |
| AP9 | Componentes "isla" | Collage de 3 apps diferentes | Solo tokens del sistema |
| AP10 | Commits gigantes | No se puede aislar qué se rompió | Un commit = un tipo de cambio |

---

## 7. Apps de referencia — Patrones convergentes

Benchmark visual: **Linear**, **Notion**, **Figma**, **Vercel Dashboard**, **Stripe Dashboard**, **GitHub**.

### Patrones que TODAS comparten:
1. Sidebar/rail compacto para nav principal
2. Breadcrumb siempre visible
3. Cards con estado visual en dashboards
4. Tablas limpias con hover actions
5. Detalle lateral (sheet/drawer) para inspección rápida
6. Dark mode impecable como expectativa base
7. Tipografía con jerarquía: título > subtítulo > body > metadata > timestamp
8. Espacio generoso — datos respiran, no están apretados
9. Micro-animaciones: hover, expand, collapse, fade — nunca flash/jump
10. Empty states diseñados — nunca pantalla en blanco

---

## 8. Fases completadas (historial)

### Fase 0 — Foundation (12 commits)
Tokens, shadcn components, ThemeProvider, Icon Bridge, DataTable, navigation-config.

### Fase 1 — Application Shell (4 commits)
AppShell, IconRail, ContextPanel, HeaderBar, AppFooter, LegacyPageWrapper.

### Fase 2 — Login + Dashboard (5 commits)
LoginPage split-screen, Dashboard card grid, saludo dinámico, conteos en vivo (5 APIs).

### Fase 2.5 — Structural Polish (11 commits)
styled-components eliminado, SweetAlert2 CSS theme, App.css limpiado, archivos muertos borrados, paquetes desinstalados, SPA navigation fix, sidebar colapsable, dark mode contrast fix.

### Fase 2.8 — Bridge CSS Expansion (8 commits)
Legacy bridge de 285 → 1,577 líneas. Input groups, form checks, pagination, list groups, modals, progress bars, dropdowns, tooltips, dark mode completo.

### Fase 3 — FUN Module (3 commits)
Dashboard real-time counts, FUN.js status badges + row tokens + column cleanup, funmanage visual alignment.

### Fase 4 — PQRS Module (2 commits)
pqrsadmin status badges + columns, pqrs_manage columns, pqrs_macrotable tokens.

### Fase 5 — Bulk Cleanup (5 commits)
Submit, Expeditions, Records, Norms, Nomenclature. 211 headers + 259 cell renderers + 4 row styles.

### Redesign v1 — Cross-Cutting Polish (8 commits)
TabPane migration, LegacyModal polish, swalAdapter, EmptyState, FUN modal headers, input-group dark mode, tab navigation migration completa.

### Redesign v2 — Legacy Elimination (10 commits)
Collapsible component, MDBPopover → shadcn (84 refs), Swal → swalAdapter en FUN, section headers con chevron, list-group dark mode.

### Redesign v3 — Swal + Popover Sweep (5 commits)
MDBPopover eliminado de páginas (0 restantes), 394 Swal calls migrados en 45 archivos FUN.

### Redesign v4 — All-Module Swal Migration (7 commits)
~1,450 MySwal.fire calls migrados en 155+ archivos. 0 patrones simples de Swal restantes.

### Redesign v5 — Complex Swal Dialogs (3 commits)
0 MySwal.fire restantes. AlarmsWidget → shadcn Dialog. swalAdapter API completa.

### Redesign v6 — Cross-Cutting Visual Polish (3 commits)
legacy-bridge.css consolidado (1,075 líneas), forms/cards/tables/badges/buttons refinados, FUN structural tightening.

### v7-v9 — Secondary Module Polish (3 commits)
Submit, Archive, Appointments, PQRS Admin structural polish. Collapsible fix. btn-close sweep.

### v10-v13 — Massive Button Migration (4 commits)
~435 botones Bootstrap → shadcn Button en 146 archivos. 0 Bootstrap btn classes en páginas.

### v14-v18 — Bridge CSS + Dark Mode Polish (5 commits)
FA icon elimination (9 files), text utilities, heading/border normalization, dark mode coverage total, table consolidation, SweetAlert2 dark mode.

### v19-v23 — Final Polish + Cleanup (7 commits)
Micro-interactions CSS, fieldset hierarchy, FontAwesome CDN elimination (36 files), dead code cleanup, FA data→Lucide conversion, test mock removal, sweetalert2-react-content desinstalado, getIconSvg bugfix, dashboard card uniformity.

**Total: 112 commits en el branch.**

---

## 9. Lo que falta — Roadmap restante

### Pendiente inmediato
- [ ] MDB wrappers en `src/app/components/ui/index.js` (907 líneas) — usado por ~24 archivos legacy
- [ ] App.css (245 líneas) — reducir más reglas muertas
- [ ] RSuite 5 — desinstalar (ya no importado)
- [ ] Bootstrap grid — última dependencia pesada

### Fases futuras (ver `05-fases-futuras.md` para detalle)

| Fase | Descripción | Riesgo |
|---|---|---|
| Fase 3+ | FUN deep migration (formularios, wizards, clocks) | ALTO |
| Fase 4+ | PQRS deep migration (subcomponentes, formularios) | MEDIO |
| Fase 5+ | Módulos restantes (submit, expeditions, archive, etc.) | MEDIO |
| Fase 6 | Limpieza final: eliminar Bootstrap, MDB wrappers, activar preflight | ALTO |

### Criterios de completitud
1. Un observador externo no distingue dónde empieza "diseño nuevo" y dónde está "legacy"
2. Shell al nivel de Linear/Notion en ambos temas
3. Dashboard con visualización atractiva de datos
4. Login con impacto visual institucional
5. Páginas legacy no chocan violentamente con el shell

---

## 10. Archivos clave — Mapa rápido

### Nuevos (rediseño)
```
src/index.css                          → Tokens + resets (210 líneas)
src/components/ui/                     → 27 componentes shadcn
src/components/icon.jsx                → Bridge FA→Lucide
src/components/theme-provider.jsx      → Dark/light sync
src/components/data-table.jsx          → @tanstack nativo
src/components/data-table-bridge.jsx   → Drop-in RDT
src/components/legacy-modal.jsx        → Drop-in react-modal
src/components/collapsible.jsx         → CSS-transition
src/components/empty-state.jsx         → Empty state visual
src/lib/icon-map.js                    → ~186 FA→Lucide mappings
src/app/utils/iconSvgString.js         → SVG strings + reverse map
src/app/components/swalAdapter.js      → API semántica Swal2
src/app/layouts/AppShell.jsx           → Layout principal
src/app/layouts/IconRail.jsx           → Nav vertical dark
src/app/layouts/ContextPanel.jsx       → Submenu contextual
src/app/layouts/HeaderBar.jsx          → Breadcrumb + actions
src/app/layouts/AppFooter.jsx          → Footer status bar
src/app/layouts/LegacyPageWrapper.jsx  → Bridge CSS wrapper
src/app/layouts/navigation-config.js   → Rutas + roles + redirects
src/app/styles/legacy-bridge.css       → 1,577 líneas bridge
src/app/styles/swal-theme.css          → 243 líneas Swal theme
tailwind.config.js                     → Config + tokens (105 líneas)
```

### Legacy (aún activos)
```
src/app/App.js                         → Router + layout (318 líneas)
src/app/App.css                        → Legacy styles (245 líneas)
src/app/components/ui/index.js         → MDB wrappers (907 líneas)
src/app/components/jsons/vars.js       → Datos institucionales
src/app/services/fun.service.js        → Service más crítico
src/app/services/data.service.js       → Service primario
src/http-common.js                     → Axios instance
```

### Documentación del rediseño
```
implementacion-rediseno/README.md      → Índice maestro
implementacion-rediseno/01-estado-actual.md     → Estado detallado
implementacion-rediseno/02-principios-inquebrantables.md → Reglas
implementacion-rediseno/03-apps-referencia.md   → Benchmark visual
implementacion-rediseno/04-antipatrones.md      → Errores a evitar
implementacion-rediseno/05-fases-futuras.md     → Roadmap Fases 3-6
implementacion-rediseno/06-brecha-visual.md     → Análisis de brecha
implementacion-rediseno/07-guia-estandares-rediseno.md → ESTE DOCUMENTO
```

---

## 11. Checklist pre-commit

Antes de cada commit que toque UI o estilos:

- [ ] ¿Se ve bien en light mode?
- [ ] ¿Se ve bien en dark mode?
- [ ] ¿Usa solo tokens semánticos (no colores hardcoded)?
- [ ] ¿No introduce nueva dependencia de estilos?
- [ ] ¿No deja CSS muerto?
- [ ] ¿Los tests pasan (`npm test`)?
- [ ] ¿El build pasa (`npm run build`)?
- [ ] ¿Se comparó visualmente contra las apps de referencia?
- [ ] ¿Se eliminó el CSS legacy que ya no se necesita?
- [ ] ¿El commit es de un solo tipo (style/refactor/feat/fix)?

---

## 12. Comandos esenciales

```bash
nvm use 22
npm start                    # Dev server (:3000)
npm test                     # Vitest (495 tests)
npm run test:e2e             # Playwright (6 specs)
npm run build                # Producción (~41s)
npm run audit:preflight      # Auditoría completa
```
