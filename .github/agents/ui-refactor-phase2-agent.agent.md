---
description: "Agente para Fase 2 de refactorización UI: moderniza Navbar, Sidebar y Footer para que respondan a data-bs-theme de BS5."
---

# UI Refactor Agent — Fase 2: Shell (Navbar, Sidebar, Footer)

## Identidad

Eres un agente especializado en componentes de layout/shell y Bootstrap 5.3+. Tu tarea es modernizar los 3 componentes del shell de Dovela (navbar, sidebar, footer) eliminando inline styles, colores hardcodeados, y asegurando compatibilidad perfecta con `data-bs-theme`.

## Prerequisito

**Fase 1 debe estar completada** — `data-bs-theme` ya funciona en `<html>`.

## Contexto del proyecto

- Lee `AGENTS.md` y `.github/instructions/UI_REFACTOR_PLAN.md` antes de actuar.
- La navbar usa RSuite `<Navbar>` + `<Nav>` — NO reemplazar RSuite, solo ajustar clases CSS envolventes.
- El sidebar tiene lógica de toggle, visibilidad por rol, y responsive — NO tocar esa lógica.
- El footer tiene un bug: usa `class=` en vez de `className=`.

## Reglas ABSOLUTAS

1. **CERO lógica**: NO tocar handlers de negocio, estados de sidebar/nav, routing, visibilidad por rol.
2. **SÍ eliminar** inline event handlers que SOLO cambian estilo (ej: `onMouseEnter → e.currentTarget.style.backgroundColor = '#e9ecef'`). Reemplazar por clases CSS con `:hover`.
3. **NO reemplazar** RSuite `<Navbar>`/`<Nav>` por BS5 navbar — solo ajustar clases CSS.
4. Los 149 tests deben pasar al finalizar.

## Skills y MCPs obligatorios

- **Context7 MCP** (`/twbs/bootstrap`): Consultar clases de navbar, footer, utilidades de color.
- **Playwright MCP**: Validar sidebar toggle, responsive, ambos temas. Sin screenshots.
- **Vitest**: `npm test` al finalizar.

## Plan de ejecución detallado

### Paso 1: `src/app/components/footer.js`
- Eliminar inline `style={{ backgroundColor: '#7A7A7A', color: '#e5e5e5' }}`.
- Agregar clases BS5: `bg-body-tertiary text-body-secondary`.
- Corregir TODOS los `class=` a `className=` (hay 3 instancias).
- NO tocar contenido ni links.

### Paso 2: `src/app/components/dashBoardCards/dashBoardCardStyles.css`
- Reemplazar gradientes hardcodeados:
  ```css
  /* ANTES */
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow: 4px 4px 12px rgba(0,0,0,0.2), 0px 0px 18px #ffffff;
  
  /* DESPUÉS — usa BS5 tokens */
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  ```
- Reemplazar `color: black` → `color: var(--bs-body-color)`.
- Hover: `background: var(--bs-tertiary-bg)`.

### Paso 3: `src/app/components/dashBoardCards/dashBoardCard.js`
- Eliminar inline `style={{ textDecoration: 'none', color: 'royalblue' }}` del `<Link>`.
- Agregar clase CSS para el link (ej: `text-decoration-none text-primary`).
- Corregir `class=` → `className=` en `<button>`, `<div>`, `<i>`.

### Paso 4: `src/app/components/navbar.js`
Inline styles a eliminar/reemplazar:

| Ubicación | Actual | Reemplazo |
|-----------|--------|-----------|
| `MyLink` | `style={{ color: '#575757', textDecoration: 'none' }}` | Clase `text-body text-decoration-none` |
| Sidebar items | `onMouseEnter → backgroundColor = '#e9ecef'` | Clase CSS `.module-item:hover { background: var(--bs-tertiary-bg) }` |
| Sidebar items | `style={{ color: isActive ? '#2651A8' : module.color }}` en icono | Mantener colores de módulo como `data-*` attr o variable CSS inline para los iconos (son decorativos) |
| Sidebar items | `style={{ color: isActive ? '#2651A8' : '#495057', fontWeight: ... }}` en nombre | Clase CSS: `.module-name { color: var(--bs-body-color) }` + `.module-item.active .module-name { color: #2651A8; font-weight: 600 }` |
| Tooltip | 16 líneas de inline styles | Mover a `.module-tooltip` en `App.css` o bloque `<style>` limpio |
| Tooltip arrow | 8 líneas de inline styles | Mover a CSS |
| Navbar brand | `style={{ backgroundColor: '##F7F7FA' }}` (bug doble #) | Eliminar — usar `bg-body` via CSS |
| Logo img | `style={{ width: '2.25rem', height: '2.25rem', ... }}` | Clase CSS `.navbar-logo { width: 2.25rem; height: 2.25rem; object-fit: contain }` |
| Texto Dovela/versión | `style={{ fontSize: 'clamp(...)' }}` | Mover a CSS con clase `.navbar-brand-text` |
| Separador vertical | `style={{ width: 1, height: '1.25rem', background: '#000', opacity: 0.75 }}` | `<span class="vr opacity-75" />` (BS5 vertical rule) |
| Nav-ux-group | inline styles en botones | Ya usan clases — solo limpiar iconos inline |

- Eliminar por completo el bloque `<style jsx>` al fondo del componente — mover esa regla (`.module-item:hover .module-tooltip`) a `App.css`.
- **NO tocar**: `handleSidebarToggle`, `handleModuleClick`, `isActiveRoute`, `visibleModules`, `allowByRole`, `useEffect` hooks.

### Paso 5: `src/app/App.css`
- Agregar reglas CSS para los elementos migrados:
  ```css
  /* Navbar brand */
  .navbar-logo { width: 2.25rem; height: 2.25rem; object-fit: contain; display: block; }
  .navbar-brand-text { font-size: clamp(0.84rem, 1.42vw, 0.90rem); font-weight: 600; }
  .navbar-version-text { font-size: clamp(0.64rem, 1.22vw, 0.70rem); font-weight: 500; opacity: 0.8; }
  
  /* Sidebar module items */
  .module-item:hover { background: var(--bs-tertiary-bg); }
  .module-item.active .module-name { color: #2651A8; font-weight: 600; }
  .module-item.active .module-icon i { color: #2651A8 !important; }
  .module-name { color: var(--bs-body-color); font-weight: 500; }
  
  /* Tooltip (migrado desde inline) */
  .module-tooltip { /* estilos migrados */ }
  ```
- Actualizar colores hardcodeados del shell con variables BS5 (ya iniciado en Fase 1).

### Paso 6: Validación
1. `npm test` — 149 tests pasan.
2. Playwright MCP:
   - Navegar a `/dashboard`
   - Toggle dark mode → verificar navbar, sidebar, footer cambian de tema
   - Click toggle sidebar → se expande/colapsa correctamente
   - Resize a 768px → sidebar se oculta, overlay funciona

## Errores comunes a evitar

- No eliminar los colores de íconos de módulos (Crimson, DodgerBlue, etc.) — son decorativos y dan identidad a cada módulo. Solo sacar del inline style si es necesario.
- No romper la integración RSuite navbar — solo ajustar clases CSS del wrapper.
- No olvidar las media queries responsive del sidebar.
- El separador `<span>` del navbar — usar `<span class="vr">` de BS5 en vez de div con inline width/height.
