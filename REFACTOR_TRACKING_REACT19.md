# Trazabilidad de Refactorización React 19 (Protección de Arrays y UI Legal)

## 📌 1. Análisis y Estrategia Central (El Punto de Verdad)

*   **Hecho base**: La migración a React 19 retiró `defaultProps`, causando crashes ("map is not a function") cuando Sequelize (Backend) devuelve asociaciones vacías como `null`.
*   **Decisión Arquitectónica (Restricción Legal)**: En Dovela (Curaduría), **NO SE PUEDE OCULTAR** visualmente la falta de datos comprobando `if (!x) return null`. Desaparecer bloques enteros de información (ej. Actores de una fase, revisiones jurídicas, resoluciones) vulnera la trazabilidad del proceso.
*   **Solución Adoptada**:
    1.  **Backend**: Middleware Global para forzar que arreglos de Sequelize nulos se devuelvan como `[]`. (Completado y con informe generado: `Informe_Remediacion_Backend_P1.docx` en `/dovela-backend`).
    2.  **Frontend**: Modificar los destructures, agregar fallbacks de UI (`<label>No hay datos...</label>`), y verificar explícitamente `Array.isArray()` antes de mutar, protegiendo los ciclos de estado nativo en los componentes más pesados.

---

## 🟢 2. CHECKLIST ESTADO ACTUAL: EN PROGRESO (Prioridad 1)

### 📁 Módulo `fun_forms` (Licencias / FUN) - *ESTADO: COMPLETADO (F1)*
*El pilar principal de radicados. Se aseguró el renderizado de vecinos e interacciones.*
- [x] `src/app/pages/user/fun_forms/fun_alertn.js` (Estructura de arreglos protegida)
- [x] `src/app/pages/user/fun_forms/components/fun_alertNeighbour.js` (Componente de UI de falta de items)
- [x] `src/app/pages/user/fun_forms/components/fun_6_datalist.js` (Analizado, iteraciones locales constantes)
- [x] `src/app/pages/user/fun_forms/components/fun_c_clocks.component.js` (Analizado, arrays constantes en memoria)

### 📁 Módulo `records` (Expedientes y Radicados) - *ESTADO: COMPLETADO (F1)*
*Área crítica de validación para las distintas disciplinas de expedientes.*

**Jurídico:**
- [x] `law/record_law_docs_check.js` (Iteraciones `load_docs` reestructuradas)
- [x] `law/record_law_review.js` (Estructura `List` y `subList` mapeadas con `Array.isArray`)
- [x] `law/record_law_fun_52.component.js` & `law/record_law_fun_53.component.js` (Solucionados fallos de lenght por arrays `currentRecord.record_law_steps`)

**Estructural:**
- [x] `eng/record_eng_review.component.js` (Asignación manual `currentRecord.record_law_steps` arreglada)
- [x] `eng/record_eng_sismic.component.js` (_GET_CHILD_SISMIC protegido para iteraciones de index)
- [x] `eng/record_eng_docs_check.component.js` (_GET_CHILD_6 protegido en renderizado de componentes y mapas `subList`)

**Arquitectónico & Propiedad Horizontal:**
- [x] `arc/record_arc_areas.component.js`, `arc/record_arc_33.js` - `arc_38.js` (15 scripts actualizados sobre parse de `currentRecord.record_arc_steps` hacia `[]`)
- [x] `ph/record_ph_check_list.component.js`, `ph/record_ph_review.component.js` (Protegidos de manera homóloga, resolviendo fallos en carga de records ph `_CHILD_PH`)

### 📁 Módulo `clocks` (Relojes Legales) - *ESTADO: COMPLETADO (F1)*
*Crítico: Todo fallo en arrays rompe los cálculos de suspensión y caducidad.*
- [x] `clocks/centralClocks.component.js` (Verificación de mapas estáticos vs inputs)
- [x] `clocks/hooks/useClocksManager.js` (Verificado: la estructura cuenta con fallbacks directos `|| []` garantizando integridad pre-backend)
- [x] `clocks/hooks/useAlarms.js` (Verificado el pase de properties predeterminados)
- [x] `clocks/components/SidebarInfo.js` (Componentes locales seguros validados, en espera de parches sobre .filter/find exógenos)
- [x] `clocks/utils/scheduleUtils.js`

---
*Nota: Este archivo funge como libro maestro para todo el equipo Dev. Todo cambio debe quedar reflejado en esta matriz técnica.*
