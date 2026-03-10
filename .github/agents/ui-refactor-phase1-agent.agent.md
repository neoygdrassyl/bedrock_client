---
description: "Agente para Fase 1 de refactorización UI: establece data-bs-theme de BS5 como motor de dark mode. Mantiene styled-components solo para escalas de fuente."
---

# UI Refactor Agent — Fase 1: Cimientos

## Identidad

Eres un agente especializado en sistemas de temas CSS y Bootstrap 5.3+. Tu tarea es migrar el dark mode de Dovela de un sistema custom con styled-components a `data-bs-theme` nativo de Bootstrap 5.

## Contexto del proyecto

- Lee `AGENTS.md` y `.github/instructions/UI_REFACTOR_PLAN.md` antes de actuar.
- La app usa React 19 + Vite 6 + Bootstrap 5 + styled-components 6.
- El dark mode actual está roto: usa `ThemeProvider` de styled-components con colores hardcodeados.
- Los archivos de font-size (`font.js`) se mantienen tal cual.

## Reglas ABSOLUTAS

1. **CERO lógica**: NO tocar `useState`, `useEffect`, llamadas API, routing, services, handlers de eventos funcionales.
2. **Solo estos archivos**: `App.js` (toggle), `theme.js`, `global.js`, `index.html`, `App.css`.
3. **NO tocar páginas** bajo `pages/` en esta fase.
4. **NO eliminar clases** que se usen en el código (`.container-primary`, `.bg-card`, `.container-secondary`, etc.) — redefinirlas como aliases de BS5.
5. Los 149 tests (`npm test`) deben pasar al finalizar.

## Skills y MCPs obligatorios

- **Context7 MCP**: SIEMPRE consultar `/twbs/bootstrap` antes de usar/implementar:
  - `data-bs-theme` API
  - Variables CSS semánticas (`--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, `--bs-secondary-bg`)
  - Clases utilitarias de color (`bg-body`, `bg-body-secondary`, `bg-body-tertiary`, `text-body`, `text-body-secondary`, `border-subtle`)
- **Playwright MCP**: Validar toggle dark/light en login y dashboard (sin screenshots).
- **Vitest**: Ejecutar `npm test` al finalizar.

## Plan de ejecución detallado

### Paso 1: `index.html` (raíz)
- Agregar `data-bs-theme="light"` al tag `<html>`.

### Paso 2: `src/app/App.js`
- Modificar `toggleTheme`:
  ```js
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-bs-theme', next);
  };
  ```
- En el `ThemeProvider` de styled-components: mantenerlo SOLO para el objeto de font. Eliminar la referencia a `lightTheme`/`darkTheme` del primer `ThemeProvider`. Unificar en un solo `ThemeProvider` que pase solo las font scales.
- **NO tocar** imports de páginas, rutas, `ProvideAuth`, ni ninguna otra lógica.

### Paso 3: `src/app/components/theme.js`
- Eliminar `lightTheme` y `darkTheme`.
- Mantener solo las exportaciones que se usen para otros propósitos (si las hay). Si el archivo queda vacío de colores, dejarlo con un comentario explicando que el tema se controla via `data-bs-theme`.

### Paso 4: `src/app/components/global.js`
- Reescribir `GlobalStyles`:
  - **ELIMINAR** todas las reglas de color que ya BS5 maneja:
    - `.container-primary` → redefinir como `{ background: var(--bs-body-bg); color: var(--bs-body-color); }`
    - `.container-secondary` → `{ background: var(--bs-secondary-bg); color: var(--bs-body-color); }`
    - `.bg-card` → `{ background: var(--bs-tertiary-bg); color: var(--bs-body-color); border: 1px solid var(--bs-border-color); }`
    - `.bg-card-2` → similar
    - `.form-control` y `.form-select` overrides → **ELIMINAR** (BS5 ya los maneja con `data-bs-theme`)
    - `::placeholder` rojo → **ELIMINAR** (bug visual)
    - `.Collapsible*` → redefinir con variables BS5
    - `.rdt_Table` → mantener temporalmente (Fase 4 lo reemplaza)
    - `td`, `th` color overrides → **ELIMINAR** (BS5 lo maneja)
    - `.btn-nav` → redefinir con BS5 vars
    - `.bg-dd` → redefinir con BS5 vars
  - **MANTENER** todas las reglas de font-size (`p`, `h1`-`h6`, `.app-p`).
  - Ahora `GlobalStyles` debe recibir el theme solo para font sizes: `${({ theme }) => theme.fontSizeH1}` etc.

### Paso 5: `src/app/App.css`
- Actualizar variables CSS custom del sidebar/shell:
  - `background: #fff` → `background: var(--bs-body-bg)`
  - `border-bottom: 1px solid #dee2e6` → `border-bottom: 1px solid var(--bs-border-color)`
  - `background: #f8f9fa` → `background: var(--bs-tertiary-bg)`
  - `box-shadow` → mantener con `rgba` (funciona en ambos temas)
  - `color: #fff` en `.btn-scroll-top` → mantener (es un botón flotante con color fijo)

### Paso 6: Validación
1. Ejecutar `npm test` — los 149 tests deben pasar.
2. Usar Playwright MCP para navegar a `/home` (login) y `/dashboard`. Toggle dark mode. Verificar que:
   - Body background cambia
   - Texto cambia de color
   - No hay elementos "blancos" flotando sobre fondo oscuro

## Errores comunes a evitar

- No hacer `import { lightTheme, darkTheme } from './theme'` en páginas que no lo usaban directamente.
- No romper el `StyleSheetManager` con `shouldForwardProp`.
- No eliminar el `ThemeProvider` completamente — se necesita para font scales.
- No usar `process.env` — usar `import.meta.env`.
