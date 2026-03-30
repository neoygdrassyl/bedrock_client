# AI Testing Runbook — Frontend Dovela

Runbook corto para validar cambios sin sobre-ejecutar pruebas.

## 1. Regla base

La profundidad de validacion depende del area tocada.

- Si solo cambias AGENTS, instrucciones o markdown portable bajo `ai/`, no necesitas correr la app completa. Revisa diff, coherencia y rutas mencionadas.
- Si cambias frontend productivo, corre al menos `npm run audit:preflight` antes de afirmar que el arbol sigue estable.
- Si cambias auth, services, clocks, routes o contratos con backend, la validacion minima sube: preflight + pruebas relevantes + smoke del flujo.

## 2. Comandos disponibles

```bash
nvm use 22
npm start
npm run audit:ast
npm run audit:arrays
npm run audit:preflight
npm test
npm run test:e2e
npm run build
```

## 3. Secuencia recomendada por tipo de cambio

### 3.1 Solo bootstrap, AGENTS o markdown

1. Revisar `git diff --stat` y `git diff`.
2. Confirmar que los archivos referenciados existen.
3. No hace falta correr tests de app si no cambias codigo ejecutable.

### 3.2 Cambio de componente o UI sin tocar contratos

1. `nvm use 22`
2. `npm run audit:preflight`
3. Si el modulo ya tiene tests claros, correr los relevantes o `npm test` si el alcance no es pequeno.

### 3.3 Cambio de service, auth, router o dominio legal

Antes de validar auth o sesion, lee `ai/auth/session-contract.md`.

1. `nvm use 22`
2. `npm run audit:preflight`
3. `npm test`
4. Si cambia navegacion o flujo visible, smoke manual o Playwright sobre la ruta afectada.
5. `npm run build` si el cambio es amplio o toca infraestructura del frontend.

### 3.4 Cambio en Clocks

Minimo recomendado:

1. `nvm use 22`
2. `npm run audit:preflight`
3. `npm test`
4. Revisar especificamente los tests de clocks si el cambio fue fuerte.
5. Smoke del flujo en `/fun` o donde se abra el modal/visualizacion de tiempos si aplica.

## 4. Si aparece pantalla blanca o crash silencioso

Orden de actuacion:

1. `npm run audit:ast`
2. `npm run audit:arrays`
3. Revisar el modulo afectado antes de editar nada
4. Solo despues correr pruebas de UI o Playwright

No confundas alertas esperables de negocio con crashes reales.

## 5. E2E y Playwright

Estado observado al 2026-03-28:

- La app vive en `http://localhost:3000`.
- Se pudo navegar a `/`, `/fun`, `/submit`, `/archive` y `/pqrsadmin`.
- Existen warnings/errores de consola preexistentes que no deben asumirse como regresion nueva por defecto.

Ruido conocido observado en runtime:

- React Router future flags
- Propiedades DOM invalidas
- problemas de nesting HTML
- carga directa del script de Google Maps

Esto no exime de revisar errores nuevos; solo evita falsos positivos obvios.

## 6. Backend y datos reales

Varias pruebas E2E dependen de backend y de datos reales.

- Backend inspeccionado: `C:\xampp\htdocs\dovela-backend`
- Puerto esperado por el backend inspeccionado: `3001`
- Algunas suites dependen de licencias, cajas o relojes ya poblados

Si una suite falla por ausencia de datos, documenta el prerequisito antes de concluir que el codigo nuevo rompio algo.

## 7. Decision table rapida

- Tocaste solo markdown o instrucciones -> diff y coherencia
- Tocaste componente pequeno -> preflight
- Tocaste service o contrato -> preflight + `npm test`
- Tocaste auth, routes o clocks -> preflight + `npm test` + smoke del flujo
- Tocaste build tooling o infraestructura -> preflight + `npm test` + `npm run build`
