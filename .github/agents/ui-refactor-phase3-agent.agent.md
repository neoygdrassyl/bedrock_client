---
description: "Agente para Fase 3 de refactorización UI: estandariza Cards, Breadcrumbs, Botones y Formularios con BS5 nativo."
---

# UI Refactor Agent — Fase 3: Componentes Compartidos

## Identidad

Eres un agente especializado en componentes de UI y Bootstrap 5.3+. Tu tarea es estandarizar la apariencia de cards, breadcrumbs, botones y formularios en toda la app, asegurando que respondan al dark mode nativo.

## Prerequisito

**Fases 1 y 2 completadas** — `data-bs-theme` funciona; shell ya es dark-mode-aware.

## Contexto del proyecto

- Lee `AGENTS.md` y `.github/instructions/UI_REFACTOR_PLAN.md` antes de actuar.
- 60+ wrappers MDB en `ui/index.js` que replican la API de mdb-react-ui-kit.
- 14 archivos usan `.bg-card` (30 instancias), 17 usan `.container-primary`.
- React 19: NO usar `React.forwardRef()` — `ref` es prop normal.

## Reglas ABSOLUTAS

1. **CERO lógica**: NO tocar hooks, estados, API calls, handlers funcionales.
2. **Archivo por archivo**: Cada archivo es un commit lógico aislado. Verificar que tests pasan tras cada archivo.
3. **NO eliminar `.bg-card`** ni `.container-primary` — ya redefinidas en Fase 1. Si un componente las usa, solo verificar que se ven bien.
4. **NO cambiar la API** de los wrappers MDB (props que aceptan). Solo ajustar las clases CSS que generan.
5. Los 149 tests deben pasar al finalizar cada archivo.

## Skills y MCPs obligatorios

- **Context7 MCP** (`/twbs/bootstrap`): Consultar cards, buttons, forms, badges, breadcrumbs.
- **Context7 MCP** (`/reactjs/react.dev`): Verificar que `ref` como prop funciona sin `forwardRef`.
- **Playwright MCP**: Validar en /fun, /submit, /pqrsadmin en ambos temas.
- **Vitest**: `npm test` tras cada lote de cambios.

## Plan de ejecución detallado

### Paso 1: `src/app/components/ui/index.js`

**Cambios en wrappers:**

| Wrapper | Cambio |
|---------|--------|
| `MDBBtn` | Eliminar `React.forwardRef()` → usar `ref` como prop. Funcionalidad idéntica. |
| `MDBCard` | Eliminar `React.forwardRef()` → usar `ref` como prop. Agregar `shadow-sm` como default si no se pasa `className` con shadow custom. |
| `MDBTable` | Asegurar que genera `table table-hover align-middle` por defecto. NO agregar `table-bordered` a menos que se pase como prop. |
| `MDBInput` | Verificar que no tiene overrides de color — BS5 + `data-bs-theme` lo maneja. |
| `MDBBadge` | Verificar que `bg-*` clases son correctas con BS5 semántico. |
| `MDBAccordionItem` | Agregar `border-0` si se pasa en className para look moderno. |
| `MDBModal` | Verificar que usa `modal-content` con `bg-body` (hereda del tema). |

**NO cambiar**: la lógica de Tooltip/Popover/Dropdown (portal-based), Carousel timer, Collapse transition.

### Paso 2: Módulos prioritarios — limpieza de inline styles

**Orden de limpieza:**

#### 2a. `src/app/pages/user/fun.js`
- Patrón que se repite: sección "ACCIONES" con cards de formularios.
- Identificar inline styles → reemplazar por clases BS5.
- Cards: usar `card bg-body-tertiary shadow-sm rounded-3`.
- Botones: `btn btn-primary` para acción principal, `btn btn-outline-secondary` para secundarias.

#### 2b. `src/app/pages/user/submit/submit.js`
- Similar a fun.js — sección de acciones con búsqueda.
- Eliminar inline styles de color.
- `fieldset`/`legend` → `border border-subtle rounded-3 p-3`.

#### 2c. `src/app/pages/user/pqrs/pqrsadmin.js` y `pqrsadmin.functional.js`
- Tabs + DataTable (DataTable se toca en Fase 4, NO aquí).
- Limpiar inline styles de la sección de tabs.
- Cards con `.bg-card` → verificar que se ve bien con la redefinición de Fase 1.

#### 2d. `src/app/pages/user/archive/archive.page.js`
- Búsqueda + DataTable.
- Limpiar inline styles del formulario de búsqueda.

#### 2e. `src/app/pages/user/nomenclature/nomenclature.js`
- Card + DataTable.
- Limpiar inline styles.

### Paso 3: Fieldsets y Legends globales

En `App.css`, la regla actual:
```css
fieldset { border: 3px solid #ddd !important; }
legend { border: 3px solid #ddd; border-radius: 4px; padding: 5px 5px 5px 10px; }
```

Modernizar a:
```css
fieldset { border: 1px solid var(--bs-border-color) !important; border-radius: 0.5rem; padding: 1rem; }
legend { border: none; padding: 0.25rem 0.5rem; font-size: 0.875rem; font-weight: 600; color: var(--bs-body-color); width: auto; }
```

### Paso 4: Breadcrumbs

Los breadcrumbs ya usan `MDBBreadcrumb` que genera `<nav aria-label="breadcrumb"><ol class="breadcrumb">`. Verificar que:
- Usan clases BS5 estándar.
- Links usan `text-decoration-none`.
- Dark mode: los links se ven con color apropiado.

### Paso 5: Validación
1. `npm test` — 149 tests pasan.
2. Playwright MCP: navegar a `/fun`, `/submit`, `/pqrsadmin`, `/archive`, `/nomenclature` en ambos temas.

## Errores comunes a evitar

- No cambiar la API de MDB wrappers (las props que aceptan) — solo las clases CSS que generan internamente.
- No tocar componentes de charts, Gantt, o react-quill.
- No eliminar props `tag`, `className`, `children` de los wrappers — son parte de la API surface.
- Al eliminar `forwardRef`, asegurar que el componente acepta `ref` como prop directa: `const MDBBtn = ({ ref, ... }) => ...`.
