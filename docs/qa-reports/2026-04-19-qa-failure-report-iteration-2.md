## QA Failure Report — 2026-04-19 (iteracion 2)

### Summary
- P0 (Critical): 0 findings
- P1 (Functional): 1 finding
- P2 (Contract): 1 finding
- P3 (Visual): 1 finding
- P4 (Debt): 0 findings

### Scope audited
- Delta reciente sobre `d91e5b30` hasta `c89910b6`
- Areas tocadas: TabPane, LegacyModal, swalAdapter en FUN/FUN Manage, Collapsible, legacy bridge dark mode, tabs/macrotable, submit_x_fun
- Verificacion ejecutada: audit estatico, preflight, Vitest completo, build Vite, Playwright no-intermediate

### Findings

| # | Priority | Category | File(s) | Description | Reproduction | Suggested Fix |
|---|----------|----------|---------|-------------|--------------|---------------|
| 1 | P1 | Functional Regression | `src/components/ui/tab-pane.jsx`, `src/app/pages/user/fun.js`, `src/app/pages/user/pqrs/pqrsadmin.js`, `src/app/pages/user/pqrs/pqrsadmin.functional.js`, `src/app/pages/user/dictionary.page.js` | `TabPane` cambio el contrato historico de `MDBTabsPane`: al ocultarse desmontaba el contenido por defecto. En modulos migrados esto implica perdida de estado, recargas innecesarias y side-effects al cambiar de pestana. **Resuelto en esta iteracion.** | 1. Revisar `src/app/components/ui/index.js:500-502`: `MDBTabsPane` siempre renderizaba children. 2. Revisar `src/components/ui/tab-pane.jsx` previo a la correccion: `if (!show && !keepMounted) return null;` con `keepMounted=false` por defecto. 3. En vistas migradas (`FUN`, `PQRS`, `Dictionary`), cambiar de pestana re-montaba el subtree oculto. | Mantener compatibilidad por defecto (`keepMounted=true`) y usar lazy-mount explicito solo en pantallas que lo controlen deliberadamente (`mountedTabs` en `funmanage.page.js`). |
| 2 | P2 | Contract Violation | `src/components/legacy-modal.jsx`, `src/app/pages/user/funmanage.page.js` | `LegacyModal` declaraba compatibilidad con `react-modal` pero ignoraba `overlayClassName`. Las macro-modales de FUN Manage ya dependen de ese prop (`macro-modal-overlay`), por lo que el estilo de overlay no se aplicaba y el prop se filtraba al nodo equivocado. **Resuelto en esta iteracion.** | 1. Buscar `overlayClassName` en el repo: `funmanage.page.js:1057` y `1083`. 2. Revisar `legacy-modal.jsx` antes de la correccion: el prop no se destructuraba ni se asignaba a `.ReactModal__Overlay`. 3. El test de compatibilidad demostraba que `.ReactModal__Overlay` no recibia la clase esperada. | Destructurar `overlayClassName` y aplicarlo directamente al contenedor `.ReactModal__Overlay`, manteniendo intacto el click-to-close del backdrop interno. |
| 3 | P3 | Visual Inconsistency | `src/components/ui/collapsible.jsx`, `src/app/pages/user/fun_forms/components/fun_macro_filterList.component.js`, `src/app/pages/user/expeditions/exp_docs.component.js`, `src/app/pages/user/records/arc/record_arc_areas.component.js`, `src/app/pages/user/records/arc/record_arc_areas_2.component.js` | El nuevo `CollapsibleContent` promete una transicion (`transition-all duration-200`) pero el estado cerrado usa `hidden`, lo que cancela cualquier animacion real. El resultado visual es snap open/close, no colapso progresivo. **Pendiente.** | 1. Revisar `src/components/ui/collapsible.jsx:37-40`. 2. El branch cerrado aplica `hidden`; `display:none` impide transicionar altura/opacidad. 3. Abrir/cerrar `CONFIGURAR TABLA` en `record_arc_areas*` o los bloques de `exp_docs` muestra un salto instantaneo. | Reemplazar `hidden` por una estrategia transicionable (por ejemplo `grid-rows-[0fr]/[1fr]` o `max-h-* + opacity`) y envolver el contenido interno para animar sin desmontar ni usar `display:none` durante la transicion. |

### Iteration notes
- El patron repetido en esta iteracion fue **romper contratos de componentes bridge/drop-in replacements** para ganar “modernizacion” visual o performance. Es el mismo error de capa de codigo detectado antes con DataTableBridge y otros wrappers del rediseño.
- En capa de diseno, la iteracion si avanzo en los temas repetidos de dark mode y jerarquia visual (`list-group` dark mode, section headers), por lo que **la repeticion principal sigue siendo de contrato/comportamiento, no de identidad visual**.
- Lo resuelto en esta pasada: compatibilidad de `TabPane`, compatibilidad de `LegacyModal.overlayClassName`, y nuevas regresiones cubiertas por tests.
- Lo que sigue pendiente de esta auditoria: el colapso sin transicion real en `ui/collapsible.jsx`.
