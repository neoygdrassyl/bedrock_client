# Fase 7 — Reemplazo de Librerías Legacy ✅ CERRADA (2026-03-18)

> Este archivo fue el prompt de agente para Fase 7. Se conserva como registro histórico.
> Ver trazabilidad completa en `REFACTOR_TRACKING_REACT19.md` → Sección 3.

---

## Resumen de cierre

**Objetivo:** Eliminar todas las dependencias con peer deps incompatibles con React 19. `npm install` sin `--legacy-peer-deps`.
**Resultado:** 7 librerías removidas/reemplazadas · 268/268 tests verdes · 0 peer conflicts.

| Librería | Acción | Reemplazo |
|---|---|---|
| `react-google-maps@9.4.5` | Reemplazada | `@react-google-maps/api@^2.20.8` |
| `@pathofdev/react-tag-input@1.0.7` | Reemplazada | `src/app/components/TagInput.js` (custom) |
| `react-html-datalist@2.0.4` | Reemplazada | `src/app/components/HTMLDatalist.js` (nativo) |
| `@silevis/reactgrid@4.1.17` | Reemplazada | Tabla HTML nativa + Bootstrap sticky |
| `react-collapsible@2.10.0` | Reemplazada | `src/app/components/Collapsible.js` (custom) |
| `@wojtekmaj/react-daterange-picker@3.4.0` | Eliminada (no usada) | — |
| `react-moment@1.2.2` | Eliminada (no usada) | — |

**Herramientas de validación:** `audit:ast` (403 arch, 0 err) · `audit:arrays` (364 arch, 0 err) · `npm test` 268/268 · Playwright 1 pass/35 skip · `vite dev` limpio en ~376ms.

**Próxima fase (Fase 8):** Migrar 14 charts `react-vis` → `recharts` (ya instalado) como funcionales. Convertir `pqrs_rteReply.component.js` a funcional.

---

## Prompt original del agente

**Rol:** Eres un Agente Experto en refactorización de React 19, Vite 6 y modernización de interfaces. Estás trabajando en el "Frontend de Dovela", un software de naturaleza Jurídico-Administrativa para Curadurías Urbanas.

**Contexto Actual:** 
El proyecto completó su migración principal de React 16 a React 19 (Fases 0 a 6 listas), incluyendo la remediación de seguridad de renderizado ante arreglos vacíos (Prioridad 1 completada, usando `Array.isArray() ? x : []` en vez de ocultar componentes completos, para preservar la fidelidad legal de la UI).
Ahora debes ejecutar la **Fase 7: Reemplazo de Librerías Abandonadas**. Estas dependencias legacy funcionan a duras penas pero generan advertencias severas de *peer dependencies* y obligan al uso de *Class Components*.

**Tus Objetivos Principales (En orden de prioridad):**

1. 📊 **Reemplazo de `react-vis` por `recharts`**
   - **Ubicación:** `src/app/pages/user/fun_forms/charts_components.js/` (o los componentes donde se usen gráficas dentro de `fun_forms` / dashboard).
   - **Acción:** Reescribir los ~14 componentes de clase (Class Components) que utilizan `react-vis` convirtiéndolos a **Componentes Funcionales con Hooks**.
   - **Librería de Destino:** Instalar y usar `recharts` (que es 100% compatible con React 19 y altamente estable). Mantén el estilo visual y los tooltips.

2. 📝 **Reemplazo de `react-quill` por `react-quill-new`**
   - **Ubicación:** `src/app/pages/user/pqrs/components/pqrs_rteReply.component.js` (y donde se use el editor Rich Text para respuestas PQRS). 
   - **Acción:** Cambiar los imports a `react-quill-new`. Aprovechar para refactorizar la clase a un componente funcional si aún no lo es.

3. 🗺️ **Reemplazo de mapas (Opcional si hay ancho de banda)**
   - Pasar de `react-google-maps` (obsoleto) a `@react-google-maps/api`. 

**Reglas Críticas de Ingeniería (¡NO OMITIR!):**
- **Restricción Legal UI:** NUNCA uses `if (!data) return null;` para ocultar bloques enteros si el componente padre espera ver un reporte vacío. Usa fallbacks visuales como `<label>No hay datos disponibles</label>`.
- **Estructura React 19:** No uses `React.forwardRef` anticuados, ni `defaultProps`. Usa destructuración de parámetros nativa.
- **Validación Defensiva:** Al procesar datos para los charts o listas, siempre usa `const safeData = Array.isArray(data) ? data : []` antes de ejecutar `.map`, `.filter` o pasarlo a los charts.
- **Herramientas de Auditoría:** Si aplicas cambios masivos, corre `npm run audit:ast` en la terminal para confirmar que no has roto el árbol sintáctico del JSX antes de entregar.

**Instrucción de Inicio:**
Por favor, lee el archivo `AGENTS.md` si necesitas más contexto de los comandos del proyecto. Luego, inicia instalando `recharts` y `react-quill-new` (desinstalando sus versiones viejas) y ataca el primer objetivo (Gráficas del dashboard de radicados). Haz un informe de los archivos tocados al terminar cada objetivo.

---
