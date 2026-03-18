# Trazabilidad de Refactorización React 19 (Protección de Arrays y UI Legal)

Este documento mantiene el registro de los archivos intervenidos y los pendientes durante la remediación de la "Prioridad 1". El objetivo principal es eliminar los falsos encubrimientos en la UI (`return null` o desplomes por `.map is not a function`) y utilizar en su lugar destructuring nativo con fallbacks visuales útiles (`<label>No hay elementos...</label>`).

## 🟢 ESTADO ACTUAL: EN PROGRESO

### 📁 Módulo `fun_forms` (Licencias / FUN)
**Completados:**
- [x] `src/app/pages/user/fun_forms/fun_alertn.js`
- [x] `src/app/pages/user/fun_forms/components/fun_alertNeighbour.js`
- [x] `src/app/pages/user/fun_forms/components/fun_6_datalist.js` (Analizado, iteraciones no provenían de backend sino de Object.entries local constante).
- [x] `src/app/pages/user/fun_forms/components/fun_c_clocks.component.js` (Analizado, iteraciones provienen de un Array Constante estático `record_clocks`, no hay riesgo de null).

**Pendientes Relevantes en fun_forms (Aislados del Audit):**
- [ ] `clocks_control.component.js`
- [ ] `fun_asign.component.js`
- [ ] `fun_doc_confirmlegal.js`
- [ ] `fun_docs.js`
- [ ] `fun_moduleNav.js`
- [ ] `fun_checklist_n.js`

### 📁 Módulo `records` (Expedientes y Radicados)
**Pendientes (Cola de trabajo priorizada después de FUN):**
*Jurídico:*
- [ ] `law/record_law_docs_check.js`
- [ ] `law/record_law_fun_52.component.js`, `law/record_law_fun_53.component.js`
- [ ] `law/record_law_review.js`

*Estructural:*
- [ ] `eng/record_eng_review.component.js`
- [ ] `eng/record_eng_sismic.component.js` 
- [ ] `eng/record_eng_docs_check.component.js`

*Arquitectónico & Propiedad Horizontal:*
- [ ] `arc/record_arc_areas.component.js`, `arc/record_arc_33.js` - `arc_38.js`
- [ ] `ph/record_ph_check_list.component.js`, `ph/record_ph_review.component.js`

### 📁 Módulo `clocks` (Relojes Legales)
**Pendientes (Cola de trabajo):**
- [ ] `clocks/utils/scheduleUtils.js`
- [ ] `clocks/components/ClockRow.js`
- [ ] `clocks/components/SidebarInfo.js`
- [ ] Hooks y utilidades varias según `audit-array-method-safety.mjs`.

---
*Nota: Este archivo será la base para el documento técnico final una vez concluidas las Fases 1, 2 y 3 del plan de remediación.*
