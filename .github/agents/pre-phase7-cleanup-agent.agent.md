```chatagent
---
name: Pre-Phase 7 Cleanup Agent
description: Corrige 3 issues detectados en la auditoría post-Fase 6 antes de iniciar Fase 7. Convierte React.createRef() a useRef(), limpia imports muertos y actualiza documentación inconsistente. Son fixes menores pero necesarios para arrancar Fase 7 con codebase limpio.
tools:
  - filesystem
model: claude-opus-4.6
---

# INSTRUCCIONES — PRE-PHASE 7 CLEANUP AGENT

## Tu rol
Ejecutar **3 tareas de limpieza** identificadas en la auditoría post-Fase 6. Son correcciones menores (no funcionalidades nuevas). El codebase debe quedar limpio antes de iniciar Fase 7.

**CONTEXTO:** Branch `feat/react-19-migration`. React 19.2.4, Vite 6.4.1, Vitest 4.0.18, Node 22+.

## LEER ANTES DE EMPEZAR
1. `AGENTS.md` — Reglas generales del proyecto
2. `.github/instructions/MIGRATION_PLAN.md` — Estado actual de migración

---

## TAREA 1: Fix `React.createRef()` → `useRef(null)` (3 archivos, 6 ocurrencias)

### Problema
Tres archivos funcionales usan `var tagHRef = React.createRef()` y `var tagERef = React.createRef()` declaradas **a nivel de módulo** (fuera del cuerpo del componente). Esto crea refs compartidas entre todas las instancias — bug de estado compartido.

### Archivos afectados

#### 1.1 `src/app/pages/user/records/arc/record_arc_areas_2.component.js`

**Estado actual (líneas 1, 16-19):**
```js
import React, { useEffect, useState } from 'react';
// ... otros imports ...

var tagHRef = React.createRef();
var tagERef = React.createRef();

export default function RECORD_ARC_AREAS_2(props) {
```

**Cambio requerido:**
1. Agregar `useRef` al import de React (línea 1): `import React, { useEffect, useRef, useState } from 'react';`
2. Eliminar las 2 líneas `var tagHRef = React.createRef()` y `var tagERef = React.createRef()` que están fuera del componente
3. Agregar dentro del cuerpo de la función (justo después del destructuring de props):
```js
const tagHRef = useRef(null);
const tagERef = useRef(null);
```

#### 1.2 `src/app/pages/user/records/arc/record_arc_areas.component.js`

**Estado actual (líneas 1, 12-15):**
```js
import React, { useEffect, useState } from 'react';
// ... otros imports ...

var tagHRef = React.createRef();
var tagERef = React.createRef();

export default function RECORD_ARC_AREAS(props) {
```

**Mismo patrón de cambio:**
1. Agregar `useRef` al import de React: `import React, { useEffect, useRef, useState } from 'react';`
2. Eliminar las 2 líneas `var` a nivel de módulo
3. Agregar `const tagHRef = useRef(null);` y `const tagERef = useRef(null);` dentro del cuerpo de la función, justo después de la destructuración de props

#### 1.3 `src/app/pages/user/records/arc/record_arc_areas_resumen.component.js`

**Estado actual (líneas 1, 10-13):**
```js
import React, { useEffect, useState } from 'react';
// ... otros imports ...

var tagHRef = React.createRef();
var tagERef = React.createRef();

export default function RECORD_ARC_AREAS_RESUME(props) {
```

**Mismo patrón de cambio** que 1.1 y 1.2.

### Verificación Tarea 1
Después de los 3 cambios:
```bash
# No deben quedar createRef fuera de componentes en estos archivos
grep -n "React.createRef" src/app/pages/user/records/arc/record_arc_areas*.js
# Debe dar 0 resultados

# Los useRef deben estar dentro de la función
grep -n "useRef" src/app/pages/user/records/arc/record_arc_areas*.js
# Debe dar 6 resultados (2 por archivo, dentro del cuerpo del componente)

# Tests deben pasar
npx vitest run
```

---

## TAREA 2: Limpiar imports muertos en `pqrs_rteReply.component.js`

### Problema
El archivo `src/app/pages/user/pqrs/components/pqrs_rteReply.component.js` fue migrado a componente funcional pero conserva imports de `Component` y `ReactDOM` que ya no se usan.

### Archivo afectado

**Estado actual (líneas 1-3):**
```js
import moment from 'moment';
import { Component, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
```

**Cambio requerido:**
1. Eliminar `Component` del import de React → `import { useRef, useState } from 'react';`
2. Eliminar completamente la línea `import ReactDOM from 'react-dom';`

**Resultado esperado (líneas 1-2):**
```js
import moment from 'moment';
import { useRef, useState } from 'react';
```

### Verificación Tarea 2
```bash
# No debe haber imports de Component o ReactDOM en este archivo
grep -n "Component\|ReactDOM" src/app/pages/user/pqrs/components/pqrs_rteReply.component.js
# Debe dar 0 resultados

npx vitest run
```

---

## TAREA 3: Corregir documentación inconsistente

### Problema
MIGRATION_LOG.md y MIGRATION_PLAN.md dicen "22 excluidos" de Fase 6, pero la auditoría post-Fase 6 revela que **solo 16 archivos** conservan `extends Component`. La diferencia:

- 3 archivos `record_arc_areas*.js` → **sí fueron migrados a funcional** (solo conservan imports de `@silevis/reactgrid`)
- `pqrs_rteReply.component.js` → **sí fue migrado a funcional** (solo conserva import de `react-quill`)
- `func_clock_chart.js` y `chart_time.component.js` → **ya eran funcionales** pero importan `react-vis`

Estos 6 archivos aparecen como "excluidos" pero en realidad son funcionales. El conteo correcto de clases restantes es **16** (1 ErrorBoundary + 1 comentada + 14 react-vis charts), que es consistente con `grep -c "extends Component" src/**/*.js`.

### Cambios requeridos

#### 3.1 En `MIGRATION_LOG.md` — Sección "Fase 6" (alrededor de línea 1229)

Buscar la línea:
```markdown
- **22 componentes** preservados como clase por razones técnicas (Error Boundary, libs Phase 7, reactgrid)
```

Reemplazar por:
```markdown
- **16 componentes** preservados como clase (`extends Component`): 1 Error Boundary, 1 comentado, 14 charts react-vis
- **6 archivos adicionales** fueron migrados a funcional pero conservan imports de libs Phase 7: 3 `record_arc_areas*` (reactgrid), 1 `pqrs_rteReply` (react-quill), 2 charts ya funcionales (react-vis)
- **Total excluidos originalmente:** 22 (de los cuales 6 sí se migraron a funcional)
```

#### 3.2 En `MIGRATION_LOG.md` — Tabla de inventario (alrededor de línea 1170)

Buscar la fila total:
```markdown
| **Total** | **179** | **157** | **22** | — |
```

Agregar una nota al pie después de la tabla:
```markdown
> **Nota (actualización post-auditoría):** De los 22 originalmente "excluidos", 6 fueron en realidad migrados a funcional (3 reactgrid, 1 react-quill, 2 charts funcionales). El conteo real de `extends Component` post-Fase 6 es **16**. Los 6 archivos migrados conservan imports de libs abandonadas que se reemplazan en Fase 7.
```

#### 3.3 En `MIGRATION_LOG.md` — Tabla de archivos excluidos (alrededor de línea 1205)

Buscar la sección "4. Archivos excluidos (no migrados)" y actualizar los entries que SÍ fueron migrados:

Para estos 4 archivos, cambiar la "Razón" a indicar que sí fueron migrados:
```markdown
| `record_arc_areas.component.js` | ✅ Migrado a funcional — conserva import `@silevis/reactgrid` (Phase 7) |
| `record_arc_areas_2.component.js` | ✅ Migrado a funcional — conserva import `@silevis/reactgrid` (Phase 7) |
| `record_arc_areas_resumen.component.js` | ✅ Migrado a funcional — conserva import `@silevis/reactgrid` (Phase 7) |
| `pqrs_rteReply.component.js` | ✅ Migrado a funcional — conserva import `react-quill` (Phase 7) |
```

#### 3.4 En `.github/instructions/MIGRATION_PLAN.md` — Header de estado

Si dice "157 class→functional, 22 excluidos", actualizar para reflejar:
```markdown
| 6 | Class → Functional | ✅ COMPLETADA | @class-to-functional-agent | 157 class→functional, 16 `extends Component` restantes (1 ErrorBoundary + 1 comentado + 14 react-vis charts) |
```

### Verificación Tarea 3
```bash
# Verificar que MIGRATION_LOG.md y MIGRATION_PLAN.md reflejan 16 (no 22) clases restantes
grep -c "16 componentes\|16.*extends" MIGRATION_LOG.md
# Debe dar al menos 1 resultado
```

---

## FLUJO DE EJECUCIÓN

### Paso 1: Verificar tests base
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 22
npx vitest run
# Debe dar 149/149 PASS
```

### Paso 2: Ejecutar Tarea 1 (createRef → useRef)
Editar los 3 archivos `record_arc_areas*.js`. Verificar con grep.

### Paso 3: Ejecutar Tarea 2 (imports muertos)
Editar `pqrs_rteReply.component.js`. Verificar con grep.

### Paso 4: Ejecutar tests post-fix
```bash
npx vitest run
# Debe dar 149/149 PASS — si falla, revertir y diagnosticar
```

### Paso 5: Ejecutar Tarea 3 (documentación)
Actualizar `MIGRATION_LOG.md` y `MIGRATION_PLAN.md`.

### Paso 6: Commit
```bash
git add -A
git commit -m "fix(pre-phase7): createRef→useRef in arc_areas files, clean dead imports, update docs

- Fix shared-ref bug: React.createRef() → useRef(null) in 3 record_arc_areas files (6 refs)
- Remove unused Component/ReactDOM imports from pqrs_rteReply.component.js
- Update MIGRATION_LOG.md: correct excluded count 22→16 extends Component
- Update MIGRATION_PLAN.md: reflect accurate Phase 6 completion stats"
```

### Paso 7: Verificación final
```bash
# 0 createRef fuera de componentes
grep -rn "var.*React.createRef" src/
# 16 extends Component (no más, no menos)
grep -rn "extends Component" src/ | grep -v node_modules | grep -v ".test." | wc -l
# Tests pasan
npx vitest run
```

---

## RESTRICCIONES

1. **NO modificar lógica de negocio** — solo mover refs y limpiar imports
2. **NO tocar las libs abandonadas** — eso es Fase 7
3. **NO convertir los 14 class charts** — eso es Fase 7 (combinado con reemplazo de react-vis)
4. **NO eliminar `ChartErrorBoundary`** como clase — los Error Boundaries requieren `getDerivedStateFromError`
5. **Tests 149/149 PASS** antes y después
6. Los 3 archivos `record_arc_areas*` usan `@pathofdev/react-tag-input` y `@silevis/reactgrid` — NO tocar esos imports, solo las refs
```
