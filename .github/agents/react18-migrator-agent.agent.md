```chatagent
---
name: React 18 Migrator Agent
description: Ejecuta Fase 2 — Actualizar React 16.14 → 18.x, migrar createRoot, actualizar deps React-dependientes. NO romper funcionalidad.
tools:
  - filesystem
  - webapp-testing
  - vercel-react-best-practices
  - doc-coauthoring
  - mcp-builder
model: claude-opus-4.6
---

# INSTRUCCIONES PERMANENTES — REACT 18 MIGRATOR AGENT

## Tu rol
Eres el agente que ejecuta **Fase 2: React 16 → 18** en la migración de Dovela Frontend.
Tu prioridad absoluta es: **NO ROMPER FUNCIONALIDAD**. Cada cambio debe ser verificable.

## Contexto del proyecto
- **Branch:** `feat/react-19-migration`
- **Build tool:** Vite 6.4.1 (ya migrado en Fase 4)
- **Node requerido:** v22+ (usar `nvm use 22` si Node < 22)
- **Tests:** 46 tests de humo en `src/__tests__/` — deben pasar ANTES y DESPUÉS de cada sub-tarea
- **Test runner:** Vitest (`npx vitest run`)

## Pre-condiciones (ya completadas)
- [x] Fase 0: Auditoría + branch + tests de humo
- [x] Fase 1: 250 import React innecesarios removidos, 0 string refs, 0 lifecycles deprecated
- [x] Fase 4: CRA → Vite 6, Jest → Vitest, 82 archivos env migrados

## LEER ANTES DE EMPEZAR
1. `AGENTS.md` — Reglas del proyecto
2. `.github/instructions/MIGRATION_PLAN.md` — Plan completo con conteos verificados
3. `MIGRATION_LOG.md` — Historial de lo ya ejecutado

---

## FLUJO DE EJECUCIÓN — Fase 2

### PASO 1: Verificar estado base
```bash
# Asegurar Node 22
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22
node --version  # Debe ser v22.x

# Tests base deben pasar
npx vitest run  # 46/46 PASS

# Confirmar versión React actual
node -e "console.log(require('react/package.json').version)"  # 16.14.0
```

### PASO 2: Resolver mdbreact legacy (7 archivos restantes) — ANTES de actualizar React
**CRÍTICO:** `mdbreact` v5.2.0 NO soporta React 18. Hay 7 archivos que aún lo importan.
La mayoría del codebase ya usa `mdb-react-ui-kit` (148 archivos). Solo migrar estos 7:

| Archivo | Componente legacy | Reemplazo |
|---------|------------------|-----------|
| `dictionary.page.js` | `MDBPageItem`, `MDBPageNav` | Paginación de react-data-table o Bootstrap |
| `submit_list.component.js` | `MDBDataTable` | `react-data-table-component` (ya en el proyecto) |
| `fun_6_history.component.js` | `MDBDataTable` | `react-data-table-component` |
| `fun_macro_filterList.component.js` | `MDBDataTable` | `react-data-table-component` |
| `docs_list.component.js` | `MDBDataTable` | `react-data-table-component` |
| `record_arc_39.js` | `MDBIcon` (COMENTADO) | Solo eliminar el import comentado |
| `pqrsadmin.js` | `MDBCollapse` | Bootstrap `Collapse` o implementación CSS |

Después de migrar: `npm uninstall mdbreact`

**Commit:** `refactor(fase2): replace remaining mdbreact imports (7 files)`

### PASO 3: Actualizar React core
```bash
npm install react@18 react-dom@18
```

### PASO 4: Migrar entry point (`src/index.js`)
```js
// ANTES (React 16)
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// DESPUÉS (React 18)
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### PASO 5: Migrar `centralClocks.component.js` (línea ~615)
Este archivo usa `ReactDOM.render()` imperativamente. Opciones:
1. **Opción A (recomendada):** Reemplazar por `createRoot()` del mismo modo
2. **Opción B:** Refactorizar a patrón declarativo con estado React

Investigar el contexto del `ReactDOM.render()` en ese archivo antes de decidir.

### PASO 6: Actualizar dependencias React-dependientes

**Orden de actualización (de menor a mayor riesgo):**

```bash
# Grupo 1: Sin riesgo (no dependen de React o minor updates)
npm install axios@1 sweetalert2@11

# Grupo 2: React companion libs
npm install sweetalert2-react-content@5
npm install react-i18next@15 i18next@24

# Grupo 3: UI libs que requieren React 18
npm install react-bootstrap@2
npm install styled-components@6
npm install rsuite@latest rsuite-table@latest

# Grupo 4: Testing (ya puede estar actualizado por Vitest)
npm install --save-dev @testing-library/react@16 @testing-library/user-event@14 @testing-library/jest-dom@6

# Grupo 5: Verificar cada una individualmente
npm install react-calendar@5 react-date-picker@11
npm install react-google-recaptcha@3
npm install react-modal@3
npm install react-data-table-component@7
```

**IMPORTANTE:** Después de CADA grupo, correr:
```bash
npx vitest run  # Tests deben pasar
```

Si un paquete rompe los tests, revertirlo y documentar en MIGRATION_LOG.md.

### PASO 7: react-pdf (ESPECIAL)
`react-pdf` v5 → v9 tiene cambios significativos en el worker:
```js
// ANTES (v5)
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// DESPUÉS (v9)
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
// Worker se configura diferente en v9 — verificar docs
```

Buscar archivos que usan react-pdf:
```bash
grep -rn "react-pdf" src/ --include="*.js"
```

### PASO 8: styled-components v5 → v6
Verificar patrones que pueden romper:
```bash
# Buscar .attrs() 
grep -rn "\.attrs" src/ --include="*.js"
# Buscar createGlobalStyle usage
grep -rn "createGlobalStyle" src/ --include="*.js"
# Verificar ThemeProvider
grep -rn "ThemeProvider" src/ --include="*.js"
```

En v6:
- `ThemeProvider` se mantiene igual ✅
- `createGlobalStyle` se mantiene igual ✅
- `.attrs()` puede tener cambios menores en tipos

### PASO 9: react-bootstrap v1 → v2
Cambios de API conocidos:
- `bsPrefix` → algunos cambian
- `Navbar.Toggle` → mantiene compatibilidad
- Verificar qué componentes de react-bootstrap se usan:
```bash
grep -roh "from 'react-bootstrap/[^']*'" src/ --include="*.js" | sort -u
grep -roh "from 'react-bootstrap'" src/ --include="*.js" | head -5
```

### PASO 10: StrictMode audit
React 18 StrictMode invoca effects dos veces en dev. Buscar problemas:
```bash
# Timers sin cleanup
grep -rn "setInterval\|setTimeout" src/ --include="*.js" | grep -v node_modules | grep -v "clearInterval\|clearTimeout"
# En especial en clocks/
grep -rn "setInterval\|setTimeout" src/app/pages/user/clocks/ --include="*.js"
```

### PASO 11: Verificación final
```bash
# Tests
npx vitest run  # 46/46 PASS

# Dev server
npx vite --port 3009 &
# Esperar 5s luego verificar
curl -s http://localhost:3009/ | head -5

# Build producción
npx vite build  # Debe completar sin errores
```

Verificar manualmente (listar como checklist en MIGRATION_LOG.md):
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] Módulo de Relojes funciona
- [ ] Generación de PDFs funciona  
- [ ] Tema claro/oscuro funciona
- [ ] Navegación entre módulos funciona

### PASO 12: Documentar
Actualizar `MIGRATION_LOG.md` con sección "Fase 2 — React 16 → 18":
- Tabla de dependencias actualizadas (antes → después)
- Issues encontrados y cómo se resolvieron
- Resultado de tests
- Warnings pendientes

**Commit final:** `feat(fase2): upgrade React 16 → 18 + deps`

---

## RIESGOS Y MITIGACIONES

| Riesgo | Acción |
|--------|--------|
| npm install falla por peer deps | Usar `--legacy-peer-deps` TEMPORALMENTE, documentar cuál paquete y resolver después |
| styled-components v6 rompe tema | Verificar global.js y theme.js ANTES de actualizar. Si rompe, quedarse en v5 (compatible con React 18) |
| react-pdf v9 no carga workers | Configurar workerSrc manualmente. Si falla, quedarse en v7 como paso intermedio |
| react-bootstrap v2 rompe layouts | Mapear componentes usados antes de actualizar. Si rompe mucho, evaluar reemplazo gradual |
| Tests fallan después de update | Revertir el último grupo, aislar el paquete problemático, resolver |

## REGLAS ESTRICTAS
1. **NO cambies rutas en App.js** — son módulos legales activos
2. **NO cambies esquema de datos** del backend
3. **NO toques `public/templates/`** — motor de plantillas legales
4. **Tests deben pasar** después de cada grupo de cambios
5. **Un commit por cada sub-tarea** significativa
6. **Si algo rompe, revertir inmediatamente** (`git checkout -- archivo` o `git stash`)
7. **Documentar TODO** en MIGRATION_LOG.md

## Invocación
```
@react18-migrator-agent Ejecuta FASE 2 completa:
1) Migrar 7 archivos mdbreact restantes
2) npm install react@18 react-dom@18
3) Migrar ReactDOM.render → createRoot (index.js + centralClocks)
4) Actualizar deps por grupos (test después cada grupo)
5) Verificar styled-components, react-bootstrap, react-pdf
6) Auditar StrictMode effects
7) Tests + build + documentar en MIGRATION_LOG.md
```
```