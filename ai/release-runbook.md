# AI Release Runbook — Frontend Dovela

Runbook corto para preparar una release sin convertir el proceso en una auditoria caotica.

## 1. Objetivo

Este runbook sirve para validar si el estado actual del frontend esta listo para release y para actualizar los archivos de valor que deban reflejar esa release.

No sustituye el despliegue al servidor. Su foco es:

- validar alcance real del cambio
- validar contratos relevantes
- validar versionado visible
- validar pruebas minimas por alcance
- actualizar documentacion operativa si quedo desfasada

## 2. Entradas esperadas

Antes de ejecutar una release review, el agente o la persona debe tener claro:

- rama o commit objetivo
- alcance funcional de la release
- criterio de versionado o de release, si el equipo usa uno
- si hubo cambios en auth, routes, services, clocks, records, FUN, PQRS, documentos o integraciones
- entorno backend que se usara para la validacion

Si falta una de estas piezas, la salida debe marcarlo como riesgo o prerequisito.

## 3. Fuentes canonicas a leer

Siempre:

- `AGENTS.md`
- `ai/system-map.md`
- `ai/testing-runbook.md`
- `package.json`

Segun alcance:

- auth o sesion -> `ai/auth/session-contract.md`
- cierre de release -> este archivo
- clocks -> `.github/instructions/clocks.instructions.md`
- tests -> `.github/instructions/testing.instructions.md`

## 4. Flujo de trabajo

### 4.1 Delimitar alcance real

El primer trabajo no es correr comandos. Es responder con evidencia:

- que archivos cambiaron realmente
- que modulos toca la release
- que contratos backend pueden estar implicados
- si la release es documental, de UI, de dominio, de auth o de infraestructura

Si el diff no coincide con la narrativa de release, el agente debe decirlo.

### 4.2 Validar documentacion operativa

Revisar si estos archivos siguen representando la realidad actual:

- `AGENTS.md`
- `ai/system-map.md`
- `ai/auth/session-contract.md` si hubo cambios de auth o integracion
- `ai/testing-runbook.md` si cambiaron criterios de validacion

Actualizar solo cuando la release haya cambiado la verdad operativa, no para reescribir estilo.

### 4.3 Validar versionado

Revisar al menos:

- `package.json`
- cualquier version visible en UI
- notas de release o changelog si existieran

Regla:

- si el usuario o el equipo aporta un criterio de versionado, compararlo contra la version visible y contra `package.json`
- si no existe criterio explicito, usar una regla conservadora: la version visible no debe contradecir `package.json` ni la narrativa de release sin explicacion clara

Si la version publica, la version del paquete y el criterio de release no coinciden, dejarlo explicitado en la salida.

### 4.4 Validar calidad minima segun alcance

Regla corta:

- solo docs/bootstrap -> diff + enlaces + coherencia
- UI o componentes -> `npm run audit:preflight`
- services, contracts, routes, auth, clocks -> `npm run audit:preflight` + `npm test`
- cambios amplios o de infraestructura -> sumar `npm run build`

Si hubo flujo visible critico, agregar smoke manual o Playwright en la ruta afectada.

### 4.5 Emitir reporte de release readiness

La salida debe separar:

- alcance confirmado
- criterio de version usado
- validaciones ejecutadas
- archivos actualizados por consistencia
- riesgos abiertos
- checks manuales pendientes antes de subir al servidor

## 5. Checklist de aceptacion

- el alcance del diff esta descrito con precision
- los docs canonicos siguen alineados con el estado actual
- las validaciones minimas se ejecutaron o quedaron justificadas
- la version visible, `package.json` y el criterio de release no se contradicen sin explicacion
- los riesgos abiertos estan explicitados
- no se declara listo algo que no fue verificado

## 6. Salida esperada

Formato recomendado:

### Release Scope
- modulos tocados
- impacto esperado

### Version Review
- criterio usado
- diferencia o coincidencia entre version visible, `package.json` y release

### Validaciones
- comandos corridos
- smoke realizado o no

### Docs Updated
- archivos operativos actualizados

### Risks
- riesgos o prerequisitos abiertos

### Server Handoff
- puntos que deben verificarse en el servidor o contra backend real
