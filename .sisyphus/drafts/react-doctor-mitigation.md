# Draft: React Doctor Mitigation

## Requirements (confirmed)
- Usuario: "Necesito que identifiques y generes un informe de lo que vendría siendo el resultado de react doctor en mi aplicacion, ejecutando el comando con detallees y de alguna forma identfiicando todas las causales".
- Usuario: "Posteriormente listalas todas junto a una estrategia de mitigacion teniendo en cuenta que no se puede quitar el problema simplemente omitiendo incluir funciones críticas".
- Usuario: "generame una revisión exhaustiva para verificar comportamiento y estrategia con el plan que vas a escribir de mitigacion".

## Technical Decisions
- Clasificación de intención: Architecture. Alcance transversal: 5381 hallazgos en 399/601 archivos, con impacto potencial en accesibilidad, correctness, state/effects, arquitectura, performance, dead code, server y bundle.
- No se planeará eliminar rutas, services, plantillas, JSONs de dominio ni funcionalidades críticas como estrategia para bajar el score.
- La mitigación debe priorizar preservación de comportamiento legal y operativo sobre reducción cosmética del score.
- Se usará evidencia reproducible de `npx --yes react-doctor@latest . --verbose` como baseline.
- Criterio principal de éxito confirmado por el usuario: "Errores primero". Objetivo: reducir errores React Doctor a cero o dejar waiver explícito, y luego abordar warnings por riesgo/impacto.
- Estrategia de pruebas confirmada por usuario: primero hacer recuento de opciones disponibles; instanciar caso base de prueba; luego validar bajo requerimiento funcional/historia de usuario que el flujo pueda completarse.

## Research Findings
- Comando ejecutado: `npx --yes react-doctor@latest . --verbose` en `/home/diego/dovela/frontend`.
- Resultado actual: React Doctor v0.1.6, Vite, React `^19.2.4`, JavaScript, React Compiler no encontrado, 601 source files.
- Score: `38 / 100 Critical`; score API devolvió `413 Request Entity Too Large`, por lo que React Doctor usó scoring local.
- Diagnóstico actual: `5381 issues across 399/601 files`; `413 errors`, `4968 warnings`.
- Carpeta de detalle generada: `/tmp/react-doctor-d233e0c6-a505-4890-903d-1e28eb1e67bb` con `diagnostics.json` y 76 archivos por regla.
- Distribución por categoría: Accessibility 3131; Architecture 682; Correctness 619; Performance 557; Dead Code 199; State & Effects 143; Server 32; Bundle Size 18.
- Top reglas: `jsx-a11y/label-has-associated-control` 2990; `react-doctor/no-nested-component-definition` 258; `react-doctor/design-no-redundant-size-axes` 182; `react-doctor/js-set-map-lookups` 156; `react/jsx-key` 143; `react-doctor/no-giant-component` 143; `react-doctor/rerender-state-only-in-handlers` 123.
- Top archivos por volumen: `src/app/pages/user/expeditions/exp._res.component.js` 172; `src/app/pages/user/expeditions/exp_docs.component.js` 156; `src/app/pages/user/fun_forms/fun_g_checklist.js` 117; `src/app/pages/user/records/eng/record_eng_4323.component.js` 116; `src/app/pages/user/fun_forms/fun_macrotable..js` 110.
- Oracle recomienda no limpiar en bloque: baseline + risk map, verification harness, correctness React 19, accessibility por abstracciones, luego arquitectura/dead code/performance/diseño.
- Infraestructura de pruebas existente: Vitest + Testing Library + user-event + jest-dom + MSW; Playwright E2E; helpers de render; fixtures; `audit:preflight`; `npm run build`.
- No se encontró CI, coverage configurado ni script dedicado de React Doctor.
- Commands/gates disponibles: `nvm use 22`, `npm run audit:preflight`, `npm test`, `npm run build`, `npm run test:e2e` con specs focalizados.
- Ejemplos representativos por clase: `src/app/components/languageSwitcher.js:20-21` missing alt; `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js:136-154` labels; `src/app/components/Collapsible.js:27-32` role/keyboard; `src/app/pages/user/pqrs/pqrsadmin.functional.js:899` tabs ARIA; `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js:132-160` nested component; `src/app/pages/user/records/eng/recprd_eng_mamporteria.js:365-372` missing keys; `src/app/pages/user/fun_forms/fun_macrotable..js:294-310` mutable state/deps; `src/app/pages/user/fun_forms/components/charts_components.js/chart_time.component.js:198-240` cascading setState; `src/app/pages/user/expeditions/exp._res.component.js` 4072 lines; `src/app/pages/user/fun_forms/fun_macrotable..js:605` includes in loops; `src/app/pages/user/funmanage.page.js:70` state updated/not rendered candidate.

## Open Questions
- Ninguna pregunta bloqueante. Se asumirá que el entregable principal de esta sesión es el plan `.sisyphus/plans/*.md`; el informe ejecutivo/PDF quedará como tarea planificada para ejecución posterior, no generado directamente aquí.

## Scope Boundaries
- INCLUDE: baseline reproducible; clasificación de causales; matriz de mitigación por regla/familia; guardrails para no omitir funcionalidad crítica; estrategia de verificación de comportamiento; plan de ejecución por oleadas.
- EXCLUDE: implementación directa de fixes en código fuente durante esta sesión; eliminación de módulos/rutas/services para bajar conteo; cambios de contratos backend/frontend sin verificación.
