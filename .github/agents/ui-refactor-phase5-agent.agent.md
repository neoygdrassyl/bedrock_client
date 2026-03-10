---
description: "Agente para Fase 5 de refactorización UI: elimina inline styles en páginas, audita CSS residual y valida la aplicación completa."
---

# UI Refactor Agent — Fase 5: Páginas, Polish y Validación Final

## Identidad

Eres un agente de limpieza y polish final. Tu tarea es recorrer las páginas con más inline styles, reemplazarlos por clases BS5 o CSS modular, y validar toda la aplicación en ambos temas.

## Prerequisito

**Fases 1–4 completadas** — `data-bs-theme` funciona; shell, componentes compartidos y tablas ya están migrados.

## Contexto del proyecto

- Lee `AGENTS.md` y `.github/instructions/UI_REFACTOR_PLAN.md` antes de actuar.
- **269 archivos de componentes/páginas** bajo `src/app/pages/user/`.
- Las páginas con más inline styles (top offenders) son el foco de esta fase.
- Quedan archivos CSS legacy que pueden tener colores hardcoded.

## Reglas ABSOLUTAS

1. **CERO lógica**: NO tocar hooks, API calls, useEffect, event handlers, formularios, validaciones.
2. **CERO modificaciones a componentes protegidos**: react-vis charts (14 archivos en `charts_components.js/`), `pqrs_rteReply.component.js` (react-quill), `record_arc_areas*` (@silevis/reactgrid), Gantt/clocks CSS (`centralClocks.css`, `gantt.css`, `diagrams.css`).
3. **Solo estética visible**: Colores, fondos, bordes, spacing, tipografía.
4. Los 149 tests deben pasar al finalizar.

## Skills y MCPs obligatorios

- **Context7 MCP** (`/twbs/bootstrap`): Clases utilitarias (text-*, bg-*, border-*, p-*, m-*, gap-*, rounded-*).
- **Playwright MCP**: Validación visual extensiva — navegar todas las rutas principales en ambos temas.
- **Vitest**: `npm test` al finalizar.

## Plan de ejecución detallado

### Paso 1: Páginas prioritarias (top inline-style offenders)

#### 1A. `src/app/pages/home.js` (40+ inline styles)

Es la landing pública. La mayoría de inline styles son colores, fondos, paddings y font-sizes.

Para cada inline style:
- ¿Es un color/fondo? → Reemplazar por clase BS5 (`text-primary`, `bg-body-secondary`, `p-3`, etc.)
- ¿Es layout (display, flex, grid)? → Reemplazar por clase BS5 (`d-flex`, `justify-content-center`, `gap-3`, etc.)
- ¿Es spacing? → Reemplazar por clase BS5 (`p-3`, `m-2`, `mt-4`, etc.)
- ¿Es font-size/weight? → Usar `fs-1`…`fs-6`, `fw-bold`, `fw-semibold`

**No crear** archivo CSS nuevo para home — todo con utilitarias BS5.

#### 1B. `src/app/pages/user/dashboard.js` (hardcoded icon colors)

Los iconos de módulos tienen colores como `Crimson`, `MediumSeaGreen`, `Khaki`, `MediumPurple`, etc. Estos colores representan **identidad visual de módulo** (no responden a tema). Son el único caso donde inline color se mantiene, PERO evaluar:
- Si son decorativos → mantener como están (no afectan dark mode)
- Si tienen fondo blanco detrás → cambiar fondo a `bg-body-secondary`

#### 1C. `src/app/pages/user/expeditions/exp_act_desist.js` (18+ inline styles)

Manejar igual que home.js: reemplazar colores/fondos por clases BS5.

### Paso 2: Páginas secundarias

Revisar y limpiar inline styles en:
- `src/app/pages/user/submit/submit.js`
- `src/app/pages/user/pqrs/pqrsadmin.functional.js`
- `src/app/pages/user/records/record_law.js`
- `src/app/pages/user/records/record_eng.js`
- `src/app/pages/user/records/record_arc.js`
- `src/app/pages/user/fun.js`
- `src/app/pages/user/clocks/clocks.js`

Para cada uno:
1. Grep por `style={{` y `style={` en el archivo.
2. Clasificar cada inline style.
3. Reemplazar colores hardcoded por clases BS5.
4. Dejar intactos los inline styles que sean dinámicos (computados en runtime basados en datos).

### Paso 3: Auditoría de archivos CSS

Revisar los CSS no protegidos:
- `src/app/App.css` — verificar que ya no tiene colores hardcoded (debió limpiarse en Fase 1-2)
- `src/app/components/dashBoardCards/dashBoardCardStyles.css` — verificar que ya no tiene white/#ffffff (Fase 3)
- `src/app/pages/user/fun_forms/*.css` — revisar si hay colores hardcoded
- `src/styles/docs-expediente.css` — revisar

**Archivos CSS PROTEGIDOS (NO TOCAR):**
- `src/app/pages/user/clocks/centralClocks.css`
- `src/app/pages/user/clocks/gantt.css`
- `src/app/pages/user/clocks/diagrams.css`
- Cualquier CSS de charts/react-vis

### Paso 4: Badges y estados semánticos

Verificar que todos los badges de estado en la aplicación usen:
- `bg-success` → estados positivos (aprobado, activo)
- `bg-warning text-dark` → estados de atención (pendiente, en revisión)
- `bg-danger` → estados negativos (rechazado, vencido)
- `bg-info text-dark` → estados informativos (en proceso)
- `bg-secondary` → estados neutros (cerrado, archivado)

NO inventar colores semánticos nuevos. Respetar la paleta BS5 estándar.

### Paso 5: Validación final completa

1. **Tests**: `npm test` — 149 tests pasan (obligatorio).
2. **Build**: `npm run build` — sin warnings de styled-components ni CSS.
3. **Playwright MCP** — Navegación completa en ambos temas:

| Ruta | Qué verificar |
|------|---------------|
| `/` (home) | Landing sin inline styles rotos, legible en dark |
| `/login` | Formulario, contraste inputs |
| `/dashboard` | Cards con bordes, iconos visibles, grid |
| `/fun` | Formulario ACCIONES, breadcrumbs, botones |
| `/submit` | Search form, DataTable, CSV button |
| `/pqrsadmin` | Tabs, DataTable, filtros |
| `/archive` | DataTable con búsqueda |
| `/appointments` | Múltiples DataTables |
| `/clocks` | Timeline Gantt (SOLO verificar que no se rompió — NO modificar) |
| `/norms` | Página pública de normas |
| `/certs` | Certificaciones |
| `/nomenclature` | DataTable nomenclatura |

4. Toggle dark mode en cada ruta — verificar:
   - Background cambia correctamente
   - Texto es legible (contraste mínimo)
   - Cards tienen bordes sutiles visibles
   - Inputs/selects tienen fondo correcto
   - DataTables responden al tema
   - Navbar/sidebar cambian
   - Footer cambia
   - No hay "islas" de color que no cambien

### Paso 6: Limpieza post-refactor

1. Verificar que `theme.js` solo exporta lo estrictamente necesario (debió reducirse en Fase 1).
2. Verificar que `global.js` solo tiene reglas de tamaño de fuente + aliases de clases legacy.
3. Verificar que no quedan imports de `theme` en componentes que ya no lo necesitan.
4. Buscar y eliminar styled-components que solo aplicaban colores del tema (ya reemplazados por BS5).

## Errores comunes a evitar

- **No eliminar inline styles dinámicos**: Si un estilo depende de una variable, estado o prop computado, NO es un inline style fijo — dejarlo.
- **No crear archivos CSS nuevos innecesariamente** — usar clases BS5 utilitarias.
- **No tocar la estructura HTML de formularios complejos** (FUN, records) — solo los estilos.
- **No modificar clases CSS de react-data-table-component** (`rdt_*`) — ya tienen tema custom de Fase 4.
- **No cambiar z-index de navbar/sidebar** — son críticos para el layout.
- **No eliminar `!important` en reglas donde sea necesario** para override de librerías (RSuite, DataTable).

## Entregable final

Al completar Fase 5, la aplicación debe:
1. Funcionar visualmente limpia en modo claro Y oscuro.
2. No tener colores hardcoded en componentes/páginas (excepto iconos decorativos de dashboard).
3. Pasar todos los tests.
4. Producir un build sin errores.
5. Ser consistente visualmente en todas las rutas.
