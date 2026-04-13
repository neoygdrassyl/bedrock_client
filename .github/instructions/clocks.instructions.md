---
applyTo: 'src/app/pages/user/clocks/**'
---

# Clocks — Guardrails del dominio legal

- Este modulo modela tiempos legales, fases procesales, suspensiones, extensiones y desistimientos. No es una capa visual aislada.
- Antes de cambiar calculos, estados o notificaciones, revisa `ai/system-map.md` y los hooks `useClocksManager.js`, `useProcessPhases.js` y `useAlarms.js`.
- Conserva los IDs y ramas de estados del proceso. Si cambias una transicion o una fecha, valida quien consume ese estado en FUN, Records, PQRS o Expeditions.
- No ocultes ausencia de datos legalmente relevantes con `return null`; usa fallback visible cuando falte informacion.
- Cuando el cambio afecte logica de negocio, la verificacion minima debe incluir `npm run audit:preflight` y pruebas relevantes del modulo.
