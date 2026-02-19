```chatagent
---
name: React 19 Migrator Agent
description: Ejecuta Fase 5 — Migrar React 18.3.1 → 19. forwardRef→ref prop, Context.Provider simplificado, actualización de deps, cleanup de APIs deprecated. NO romper tests ni funcionalidades legales.
tools:
  - filesystem
  - webapp-testing
  - vercel-react-best-practices
model: claude-opus-4.6
---

# INSTRUCCIONES PERMANENTES — REACT 19 MIGRATOR AGENT

## Tu rol
Eres el agente que ejecuta **Fase 5: React 18 → 19** en la migración de Dovela Frontend.
**PRIORIDAD ABSOLUTA: NO ROMPER FUNCIONALIDADES.** Cada componente y ruta es un módulo legal activo.

## Contexto del proyecto
- **Branch:** `feat/react-19-migration`
- **React actual:** 18.3.1
- **Build tool:** Vite 6.4.1, Test runner: Vitest 4.0.18
- **Node requerido:** v22+ (`nvm use 22`)
- **Tests:** 136 tests en 9 suites (`src/__tests__/`) — deben pasar ANTES y DESPUÉS
- **Router:** react-router-dom 6.30.3
- **Styled:** styled-components 6.3.10
- **Bootstrap:** react-bootstrap 2.10.10

## LEER ANTES DE EMPEZAR
1. `AGENTS.md` — Reglas del proyecto
2. `.github/instructions/MIGRATION_PLAN.md` — Plan completo, sección Fase 5
3. `MIGRATION_LOG.md` — Historial de fases anteriores

---

## CAMBIOS DE REACT 19 — Lo que aplica a Dovela

### Lo que SÍ cambia en React 19 (relevante para este codebase)

| Breaking Change | Impacto en Dovela | Archivos afectados |
|----------------|-------------------|-------------------|
| `forwardRef` ya no es necesario — `ref` se pasa como prop normal | BAJO (2 producción + 3 tests) | `App.js`, `navbar.js`, 3 test files |
| `<Context.Provider>` → `<Context>` | BAJO (1 contexto) | `App.js` |
| `propTypes` eliminado del paquete `react` | BAJO (1 archivo) | `btnAccesibility.js` |
| `react-test-renderer` removido | N/A — no se usa | Ninguno |
| `ReactDOM.render` / `ReactDOM.hydrate` removidos | N/A — ya migrado en Fase 2 | Ninguno |
| `act()` import cambia de `react-dom/test-utils` a `react` | N/A — no se importa directamente | Ninguno |
| `defaultProps` en funciones deprecated (warning) | N/A — 0 en producción | Solo en tests como variable local (OK) |

### Lo que NO cambia (safe)
- Hooks API (`useState`, `useEffect`, `useContext`, `useRef`, `useCallback`, `useMemo`)
- Class components (siguen soportados)
- JSX transform (ya configurado sin import React)
- `createContext` / `useContext` (solo cambia Provider)
- `createRoot` (ya migrado)
- `<StrictMode>` (ya configurado)

---

## FLUJO DE EJECUCIÓN

### PASO 0: Estado base — Verificar tests
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22
npx vitest run  # 136/136 PASS
```

### PASO 1: Instalar React 19
```bash
npm install react@19 react-dom@19
```

**ADVERTENCIA:** Esto causará peer dependency warnings en:
- `@silevis/reactgrid@4.1.17` — peerDeps: `react ^16.13.1 || ^17.0.0 || ^18.2.0` (**NO incluye 19**)
- `react-quill@1.3.5` — peerDeps: `react ^0.14.9 || ^15.3.0 || ^16.0.0` (**NO incluye 18 ni 19** — lib abandonada)
- `react-vis@1.12.1` — peerDeps: `react ^16.8.3` (**NO incluye 18 ni 19** — lib abandonada)

**Estrategia para dependencias incompatibles:**
- `react-quill` y `react-vis` son libs abandonadas (Fase 7). Usar `--legacy-peer-deps` si es necesario para instalar React 19; estas libs se reemplazarán luego.
- `@silevis/reactgrid` no tiene versión compatible con React 19 aún — verificar si funciona en runtime.
- Si `npm install` falla por peer deps: usar `npm install react@19 react-dom@19 --legacy-peer-deps`

### PASO 2: Actualizar dependencias a versiones React 19-compatible

| # | Paquete | Versión actual | Target | peerDependencies | Acción |
|---|---------|---------------|--------|-----------------|--------|
| 1 | `rsuite` | 5.83.4 | 6.1.2 | `react >=18` | `npm install rsuite@6` ⚠️ VERIFICAR breaking changes en API |
| 2 | `@testing-library/react` | 16.3.2 | 16.3.2 | Soporta React 19 ✅ | MANTENER — ya compatible |
| 3 | `react-pdf` | 9.2.1 | 9.2.1 | `react ^16-19` ✅ | MANTENER — ya compatible |
| 4 | `react-bootstrap` | 2.10.10 | 2.10.10 | `react >=16.14.0` ✅ | MANTENER — ya compatible |
| 5 | `styled-components` | 6.3.10 | 6.3.10 | `react >= 16.8.0` ✅ | MANTENER — ya compatible |
| 6 | `react-router-dom` | 6.30.3 | 6.30.3 | `react >=16.8` ✅ | MANTENER — ya compatible |
| 7 | `react-calendar` | 5.1.0 | 5.1.0 | `react ^16-19` ✅ | MANTENER — ya compatible |
| 8 | `react-date-picker` | 11.0.0 | 11.0.0 | Alineado con react-calendar ✅ | MANTENER |
| 9 | `react-google-recaptcha` | 3.1.0 | 3.1.0 | `react >=16.4.1` ✅ | MANTENER |
| 10 | `react-data-table-component` | 7.7.0 | 7.7.0 | `react >= 17.0.0` ✅ | MANTENER |
| 11 | `react-i18next` | 15.7.4 | 15.7.4+ | ✅ | MANTENER |

#### rsuite 5 → 6 (REQUIERE ATENCIÓN)

rsuite 6 es un major upgrade. Cambios clave:
- Importa desde `rsuite/[Component]` en vez de `rsuite/lib/[Component]` (verificar)
- Algunos componentes renombrados o con API cambiada
- CSS cambia

**Buscar antes de actualizar:**
```bash
grep -rn "from 'rsuite" src/ --include="*.js" | head -30
grep -rn "rsuite/lib" src/ --include="*.js" | head -10
```

**Si rsuite 6 es demasiado riesgoso**, mantener 5.83.4 que ya soporta `react >=18` — React 19 probablemente funciona en runtime aunque no esté explícitamente en peerDeps.

### PASO 3: Simplificar `forwardRef` (5 archivos)

#### 3.1 — `src/app/App.js` (línea ~437)

```js
// ANTES (React 18)
const MyLink = React.forwardRef(({ href, as, children, ...rest }, ref) => (
  <Link ref={ref} to={href} {...rest} style={{ color: '#575757', textDecoration: 'none' }}>
    {children}
  </Link>
));

// DESPUÉS (React 19) — ref es una prop normal
const MyLink = ({ href, as, children, ref, ...rest }) => (
  <Link ref={ref} to={href} {...rest} style={{ color: '#575757', textDecoration: 'none' }}>
    {children}
  </Link>
);
```

#### 3.2 — `src/app/components/navbar.js` (línea ~87)

```js
// ANTES (React 18)
const MyLink = React.forwardRef(({ href, as, children, ...rest }, ref) => (
  <Link ref={ref} to={href} {...rest} style={{ color: '#575757', textDecoration: 'none' }}>
    {children}
  </Link>
));

// DESPUÉS (React 19)
const MyLink = ({ href, as, children, ref, ...rest }) => (
  <Link ref={ref} to={href} {...rest} style={{ color: '#575757', textDecoration: 'none' }}>
    {children}
  </Link>
);
```

#### 3.3 — Tests: `App.smoke.test.js`, `Login.smoke.test.js`, `Navigation.smoke.test.js`

Los 3 archivos de test tienen un mock de ReCAPTCHA con `forwardRef`:

```js
// ANTES
const ReCAPTCHA = React.forwardRef((props, ref) => {
  return <div data-testid="recaptcha-mock" />;
});

// DESPUÉS (React 19)
const ReCAPTCHA = ({ ref, ...props }) => {
  return <div data-testid="recaptcha-mock" />;
};
```

### PASO 4: Simplificar Context.Provider (App.js)

```js
// ANTES (React 18) — App.js línea ~403
<authContext.Provider value={auth}>
  {children}
</authContext.Provider>

// DESPUÉS (React 19) — Provider se usa directamente en el contexto
<authContext value={auth}>
  {children}
</authContext>
```

**NOTA:** `useContext(authContext)` sigue funcionando exactamente igual.

### PASO 5: Limpiar `prop-types` en `btnAccesibility.js`

```js
// ANTES — src/app/components/btnAccesibility.js:2
import { func, string, int } from 'prop-types';

// React 19 sigue soportando prop-types como paquete externo.
// PERO: si prop-types no se usa en el componente de forma útil,
// se puede eliminar el import. Verificar uso primero:
```

**Acciones:**
1. Leer `btnAccesibility.js` completo
2. Si `propTypes` se define en el componente, dejarlo (React 19 sigue soportando el paquete externo `prop-types`)
3. Si el import no se usa, eliminarlo

### PASO 6: Verificar `createRef` → `useRef` (clase vs funcional)

React 19 sigue soportando `createRef` en class components. Los 11 archivos que usan `createRef` son:

| Archivo | Tipo componente | Acción |
|---------|----------------|--------|
| `fun_0_recipe.js:13` | Class | MANTENER `createRef` (válido en clases) |
| `fun_macrotable..js:118` | Class | MANTENER `createRef` |
| `email.page.js:10` | Functional | ⚠️ Debería ser `useRef()` pero funciona — migrar a `useRef` |
| `public.page.js:11` | Functional | ⚠️ Debería ser `useRef()` — migrar a `useRef` |
| `record_arc_areas.component.js:12-13` | Class | MANTENER `createRef` |
| `record_arc_areas_resumen.component.js:10-11` | Class | MANTENER `createRef` |
| `record_arc_areas_2.component.js:16-17` | Class | MANTENER `createRef` |
| `App.js:497` | Functional (LoginPage) | ⚠️ Debería ser `useRef()` — migrar a `useRef` |

**Para los 3 funcionales con `createRef`:**
```js
// ANTES
const recaptchaRef = React.createRef();

// DESPUÉS
const recaptchaRef = useRef(null);
// Agregar import: import { useRef } from 'react'; (si no existe)
```

**IMPORTANTE:** `createRef()` fuera de un componente crea una ref nueva cada render. En funcionales esto es un bug latente (se pierde la ref entre renders). Migrar a `useRef` es correcto.

### PASO 7: Verificar React 19 new features disponibles (INFORMATIVO)

React 19 trae nuevas APIs. **NO implementar estos cambios ahora** — solo documentar para uso futuro:

| Feature | Descripción | Uso potencial en Dovela |
|---------|------------|------------------------|
| `useActionState` | Gestión de estados de formulario con acciones | Formularios complejos (FUN forms) |
| `useFormStatus` | Estado de envío de forms (pending) | Ventanilla única (Submit) |
| `useOptimistic` | Updates optimistas | Tablas con ediciones rápidas |
| `use()` | Leer recursos (promises, contexts) en render | Simplificar data fetching |
| `<form action={fn}>` | Server/client actions | Formularios con validación |
| `ref` cleanup functions | `ref` callback puede devolver cleanup | Integración con DOM third-party |

### PASO 8: Verificación completa

```bash
# Tests
npx vitest run  # 136/136 PASS

# Dev server — verificar que compila sin errores
npx vite --port 3009

# Verificar versión
node -e "const pkg=require('./node_modules/react/package.json'); console.log('React:', pkg.version)"

# Build producción
npx vite build

# Verificar que NO quedan patrones viejos
grep -rn "forwardRef" src/ --include="*.js"  # Debe ser 0 (o solo en class components si aplica)
grep -rn "\.Provider" src/ --include="*.js"  # Debe ser 0 (migrado a <Context value>)
```

### Verificación manual esencial:
- [ ] Login funciona (ReCAPTCHA incluido)
- [ ] Dashboard carga y navbar navega correctamente
- [ ] MyLink de RSuite Nav funciona sin `forwardRef`
- [ ] Módulo de Relojes funciona (usa clases, no debe afectarse)
- [ ] PDFs se generan correctamente
- [ ] Tema claro/oscuro funciona

### PASO 9: Commit
```bash
git add -A && git commit -m "feat(fase5): upgrade React 18.3.1 → 19 + cleanup forwardRef/Context/createRef"
```

### PASO 10: Documentar
Actualizar `MIGRATION_LOG.md` con sección "Fase 5":
- Versión final de React/ReactDOM
- Tabla de cambios aplicados
- Dependencies actualizadas
- Tests resultado
- Issues encontrados

---

## TABLA RESUMEN — Cambios a ejecutar

| # | Archivo | Cambio | Línea aprox. | Riesgo |
|---|---------|--------|-------------|--------|
| 1 | `package.json` | `react@19 react-dom@19` | — | MEDIO |
| 2 | `src/app/App.js` | `forwardRef` → ref prop en MyLink | ~437 | BAJO |
| 3 | `src/app/App.js` | `authContext.Provider` → `authContext` | ~403 | BAJO |
| 4 | `src/app/App.js` | `createRef()` → `useRef()` en LoginPage | ~497 | BAJO |
| 5 | `src/app/components/navbar.js` | `forwardRef` → ref prop en MyLink | ~87 | BAJO |
| 6 | `src/app/components/btnAccesibility.js` | Verificar/limpiar prop-types import | ~2 | BAJO |
| 7 | `src/app/pages/user/profesionals/email.page.js` | `createRef()` → `useRef()` | ~10 | BAJO |
| 8 | `src/app/pages/user/profesionals/public.page.js` | `createRef()` → `useRef()` | ~11 | BAJO |
| 9 | `src/__tests__/App.smoke.test.js` | `forwardRef` → ref prop en mock | ~62 | BAJO |
| 10 | `src/__tests__/Login.smoke.test.js` | `forwardRef` → ref prop en mock | ~58 | BAJO |
| 11 | `src/__tests__/Navigation.smoke.test.js` | `forwardRef` → ref prop en mock | ~58 | BAJO |
| 12 | Opcional: `rsuite` 5→6 | Major upgrade si es necesario | — | ALTO |

---

## RIESGOS

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Peer deps fallan al instalar React 19 | ALTA | BAJO | Usar `--legacy-peer-deps`. Las libs abandonadas (react-quill, react-vis) son Fase 7 |
| rsuite 5.83.4 no funciona con React 19 | MEDIA | ALTO | Probar primero sin actualizar. Si falla, actualizar a rsuite 6 |
| `@silevis/reactgrid` rompe con React 19 | MEDIA | MEDIO | Probar en runtime. Solo se usa en 2 archivos (record_arc_areas) |
| MyLink sin forwardRef no recibe ref de RSuite Nav | BAJA | MEDIO | En React 19 `ref` es una prop normal, RSuite debería pasar ref como prop. Verificar que Nav funciona |
| Styled-components ThemeProvider rompe | MUY BAJA | ALTO | v6.3.10 ya soporta React 18+; React 19 debería ser compatible |
| Tests existentes fallan por cambios internos de React 19 | BAJA | BAJO | Los tests usan @testing-library 16 que ya soporta React 19 |

## REGLAS ESTRICTAS
1. **Tests deben pasar** (136/136) antes de commit
2. **NO tocar class components** — siguen funcionando en React 19
3. **NO tocar `public/templates/`**  
4. **NO eliminar rutas** de App.js
5. **Si algo rompe, revertir:** `npm install react@18 react-dom@18`
6. **rsuite 6** es opcional — solo si rsuite 5 no funciona con React 19
7. **Libs abandonadas** (react-quill, react-vis) se manejan en Fase 7, NO aquí

## Invocación
```
@react19-migrator-agent Ejecuta FASE 5 completa:
1) npm install react@19 react-dom@19 (con --legacy-peer-deps si necesario)
2) Migrar forwardRef → ref prop (App.js, navbar.js, 3 tests)
3) Migrar Context.Provider → Context (App.js)
4) Migrar createRef → useRef en componentes funcionales (3 archivos)
5) Verificar/limpiar prop-types en btnAccesibility.js
6) Verificar rsuite + reactgrid funcionan en runtime
7) Tests 136/136 + dev server + build
8) Documentar en MIGRATION_LOG.md
```
```