# AGENTS.md — Frontend Dovela

Bootstrap corto para agentes y modelos que entren a este repo sin contexto previo. Usa este archivo para arrancar y sigue las referencias indicadas; no lo conviertas en una enciclopedia.

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

## 7. Backend y limites de este repo

- El frontend consume un backend inspeccionado en `C:\xampp\htdocs\dovela-backend`.
- Ese backend observado hoy es Express + Sequelize + MySQL.
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

## 10. Regla de lectura progresiva

AGENTS.md solo debe darte lo necesario para arrancar. Si el cambio escala, lee la referencia adecuada en vez de inflar este archivo:

- Sistema y contratos -> `ai/system-map.md`
- Auth y sesion -> `ai/auth/session-contract.md`
- Validacion -> `ai/testing-runbook.md`
- Release -> `ai/release-runbook.md`
- Context7 -> `.github/instructions/context7.instructions.md`
- Clocks -> `.github/instructions/clocks.instructions.md`
- Tests -> `.github/instructions/testing.instructions.md`