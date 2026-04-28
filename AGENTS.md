# AGENTS.md — Frontend Dovela

Bootstrap corto para agentes y modelos que entren a este repo sin contexto previo. Usa este archivo para arrancar y sigue las referencias indicadas; no lo conviertas en una enciclopedia.

## 0. Politica de idioma para agentes

1. **Idioma visible para el usuario: espanol.** Responde, pregunta, resume y explica en espanol salvo instruccion explicita en otro idioma.
2. **Idioma operativo interno preferido: ingles.** Si el usuario escribe en espanol, reformula mentalmente la peticion en ingles antes de razonar, planear, buscar o implementar.
3. **Antes de responder, vuelve la salida al espanol.** La respuesta final debe quedar en espanol claro y natural.
4. **No traduzcas tokens tecnicos.** Manten intactos nombres de archivos, rutas, componentes, props, hooks, servicios, endpoints, comandos, logs, errores literales y bloques de codigo.
5. **Si una traduccion puede introducir ambiguedad tecnica, conserva el termino original y explicalo en espanol.**
6. **Esto no reemplaza un hook real del runtime.** Es una regla persistente de comportamiento para este repo.

## 1. Que es este repo

SPA para modelar procesos de curaduria urbana: licencias, expedientes, relojes legales, PQRS, archivo, nomenclatura, usos del suelo y documentos juridicos.

Regla cardinal:

- Cada ruta, service y componente representa relaciones legales reales. No elimines ni desconectes funcionalidades sin confirmacion.

## 2. Como empezar en 5 minutos

1. Lee este archivo completo.
2. Si tu cambio afecta dominio, auth, rutas, contratos o integracion frontend-backend, lee `ai/system-map.md`.
3. Si tu cambio toca login, sesion, guards o interceptores, lee `ai/auth/session-contract.md`.
4. Si tu cambio afecta pruebas, crashes o validacion final, lee `ai/testing-runbook.md`.
5. Si trabajas con librerias externas, aplica `.github/instructions/context7.instructions.md`.
6. Si trabajas dentro de Clocks, lee primero `.github/instructions/clocks.instructions.md` y los hooks principales.

## 3. Stack esencial

| Pieza | Estado actual |
|---|---|
| Framework | React 19 |
| Build | Vite 6 |
| Tests | Vitest 4 + Testing Library + Playwright |
| Routing | react-router-dom v6 |
| HTTP | axios via `src/http-common.js` |
| UI | Bootstrap 5 + wrappers locales + RSuite 5 + styled-components 6 |
| Fechas | moment + moment-business-days |
| Documentos | jsPDF, pdf-lib, react-pdf y motor propio en `src/app/utils/` |
| Node | 22+ obligatorio |

## 3.1 Priorizacion de skills UI/UX

Para solicitudes de interfaz, experiencia de usuario, layout, estilos, componentes visuales o accesibilidad:

> **Ruta de skills:** Las skills compartidas del workspace viven en `.agents/skills/`. Las skills de proceso especificas del frontend viven en `frontend/.agents/skills/`.

> **Nombres canonicos en este entorno:** `ui-ux-pro-max`, `ckm-design-system`, `ckm-brand`, `ckm-ui-styling`, `ckm-banner-design`, `ckm-slides`, `visual-inspector`. Si algun lockfile o configuracion historica muestra alias con `ckm:` (por ejemplo `ckm:design-system`, `ckm:brand`, `ckm:ui-styling`), tratalos como la misma familia de skills.

1. `ui-ux-pro-max` SIEMPRE es la skill principal de diseno e implementacion UI en este repo. No se reemplaza.
2. Complementar segun necesidad:
   - `visual-inspector` para revision visual automatizada con browser y contexto aislado. No reemplaza `ui-ux-pro-max`; la antecede o la complementa.
   - `ckm-design-system` para tokens y sistemas de diseno.
   - `ckm-brand` para decisiones de identidad visual y tono.
   - `ckm-ui-styling` para implementacion de estilos.
   - `ckm-banner-design` y `ckm-slides` solo para piezas visuales de comunicacion, no para refinamiento de la UI runtime.
3. Mantener skills de proceso (ej. `brainstorming`, `dispatching-parallel-agents`) antes de skills de implementacion, cuando aplique.

## 4. Donde vive la verdad operativa

- Router, layout, auth y login: `src/app/App.js`
- Cliente HTTP y sesion: `src/http-common.js`, `src/app/services/data.service.js`, `src/app/services/custom.service.js`
- Mapa de sistema y contrato con backend: `ai/system-map.md`
- Contrato de sesion y auth actual: `ai/auth/session-contract.md`
- Runbook de validacion: `ai/testing-runbook.md`
- Runbook de release readiness: `ai/release-runbook.md`
- Dominio de Clocks: `src/app/pages/user/clocks/hooks/useClocksManager.js`, `src/app/pages/user/clocks/hooks/useProcessPhases.js`, `src/app/pages/user/clocks/hooks/useAlarms.js`
- Service mas critico: `src/app/services/fun.service.js`
- Motor documental: `src/app/utils/TemplateEngine.js`
- Historial de migracion: `REFACTOR_TRACKING_REACT19.md`

No tomes `README.md` ni prompts historicos como fuente de verdad actual.

## 5. Modulos de alto riesgo

### Clocks

- Modela tiempos legales y fases procesales.
- Cambios aqui pueden afectar FUN, Records, PQRS y expedicion.

### FUN

- Es el mayor orquestador del frontend.
- Acopla records, clocks, documentos y expedicion.

### Records

- Hay cuatro disciplinas con logica distinta y referencias cruzadas.
- No asumas que un cambio local solo afecta una pantalla.

### PQRS y Expeditions

- Tienen muchos subcomponentes y cobertura menos directa que Clocks o FUN.

### TemplateEngine y plantillas publicas

- No editar `public/templates/` sin entender el motor en `src/app/utils/`.

## 6. Restricciones no negociables

1. No elimines rutas ni modulos sin confirmacion.
2. No cambies contratos de datos a ciegas; verifica backend y services.
3. No uses `process.env`; usa `import.meta.env.VITE_*`.
4. No uses `React.forwardRef()` ni `defaultProps` en codigo nuevo.
5. No metas llamadas HTTP directas en componentes; usa `src/app/services/`.
6. No ocultes ausencia de datos legalmente relevantes con `return null`; usa fallback visible.
7. No introduzcas una libreria UI nueva sin consenso.
8. No expongas datos sensibles de `src/app/components/jsons/vars.js` en logs.
9. No des por buena documentacion vieja si contradice el codigo o el runtime.
10. No cierres cambios de codigo ejecutable sin la validacion apropiada para su alcance.
11. **Playwright**: Siempre usa `src/__playwright/config.js` para temp paths. No dejes archivos basura. Lee `.github/instructions/playwright-standards.md`.
12. **NUNCA hagas `git merge` ni `git push` a `main` (o `master`) de forma autónoma.** Antes de cualquier integración de ramas, usa `ask_user` en la sesión activa para solicitar confirmación explícita. Esta regla aplica sin excepción, incluso si la tarea parece completamente exitosa.
13. **Las preguntas al usuario SIEMPRE se hacen con `ask_user` dentro de la sesión en curso.** Nunca termines una respuesta ni la sesión para "esperar al usuario" — eso fuerza una request extra. Usa siempre `ask_user` con opciones claras antes de tomar decisiones que afecten ramas, merges o arquitectura.

## 7. Backend y limites de este repo

- El frontend consume el backend ubicado en `backend/` dentro del workspace (`/home/diego/dovela/backend/`). Ese es el directorio real en este entorno Linux.
- El backend es Express 4 + Sequelize 6 + MySQL.
- No todos los services frontend apuntan a ese backend; revisa `ai/system-map.md` antes de tocar integraciones.

## 8. Observaciones operativas

- `README.md` sigue describiendo CRA y esta obsoleto.
- El comportamiento de auth depende tambien de la configuracion activa del backend.
- La version visible en UI no coincide claramente con `package.json`.
- Hay warnings de consola preexistentes en runtime; no los atribuyas automaticamente a tu cambio.

## 9. Comandos esenciales

```bash
nvm use 22
npm start
npm run audit:preflight
npm test
npm run test:e2e
npm run build
```

## 9.1 Protocolo de reinicio local (sin instancias extra)

1. Estado base obligatorio: frontend ya corriendo en `3000` y backend en `3001`.
2. No levantes una segunda instancia de frontend por defecto; reinicia sobre el proceso existente.
3. Si necesitas reiniciar, hazlo en la misma sesion/terminal que ya estaba ejecutando la app.
4. Si no puedes confirmar que realmente se reinicio o no controlas el proceso, pregunta al usuario con `ask_user` antes de abrir otra instancia.
5. Usa `3002` solo como fallback excepcional y solo despues de confirmacion explicita del usuario con `ask_user`.
6. Cuando termines, deja claro que puerto de frontend quedo activo.

## 10. Regla de lectura progresiva

AGENTS.md solo debe darte lo necesario para arrancar. Si el cambio escala, lee la referencia adecuada en vez de inflar este archivo:

- Sistema y contratos -> `ai/system-map.md`
- Auth y sesion -> `ai/auth/session-contract.md`
- Validacion -> `ai/testing-runbook.md`
- Release -> `ai/release-runbook.md`
- Context7 -> `.github/instructions/context7.instructions.md`
- Clocks -> `.github/instructions/clocks.instructions.md`
- Tests -> `.github/instructions/testing.instructions.md`

## 11. Rediseno UI en curso (LEER SI VAS A TOCAR ESTILOS O LAYOUT)

**Branch activo:** `feat/ui-redesign-phases-0-2`

Hay un rediseno progresivo en marcha. Antes de cualquier cambio visual, de layout o de componentes UI, lee en este orden:

1. `implementacion-rediseno/README.md` — indice maestro del rediseno y estado actual
2. `implementacion-rediseno/01-estado-actual.md` — fase actual, alcance y pendientes reales
3. `implementacion-rediseno/02-principios-inquebrantables.md` — reglas que NO se negocian
4. `implementacion-rediseno/04-antipatrones.md` — errores que ya se han identificado
5. `implementacion-rediseno/06-brecha-visual.md` — analisis de la brecha actual vs objetivo

**Agente especializado para el rediseno:** `.github/agents/dovela-ui-redesign.agent.md`

**Inspeccion visual con browser:** Usa primero el skill `visual-inspector` y el agente `.github/agents/visual-inspector.agent.md` para abrir la app, tomar screenshots, verificar transiciones y generar un reporte de critica de diseno alineado con las fases del rediseno. Cuando la revision termine, vuelve a `ui-ux-pro-max` para refinar e implementar.

**Regla critica:** Cualquier commit que toque componentes UI, estilos o layout debe ser comparado visualmente contra las apps de referencia (Linear, Notion, Figma) segun `implementacion-rediseno/03-apps-referencia.md`.
