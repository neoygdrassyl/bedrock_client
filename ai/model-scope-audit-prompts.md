# Model Scope Audit Prompts

Bateria corta para probar si los archivos de bootstrap, routing e instrucciones realmente influyen en distintos modelos dentro de VS Code.

## 1. Como usar esta bateria

### Paso 1

Ejecuta cada prompt primero con el modelo mas avanzado disponible en un chat limpio.

Objetivo:

- obtener la respuesta de referencia
- detectar que archivos consulto o cito implicitamente
- detectar si la estrategia de trabajo coincide con la arquitectura del repo

### Paso 2

Repite el mismo prompt con uno o mas modelos mas basicos, tambien en chats limpios.

### Paso 3

Compara señales observables, no promesas.

Lo importante no es que el modelo diga “lei X”, sino que actue como si hubiera leido la fuente correcta.

## 2. Criterios de evaluacion

Marca cada prompt con:

- `OK fuerte`: el modelo uso las fuentes correctas y actuo segun ellas
- `Parcial`: resolvio algo, pero omitio fuentes o reglas importantes
- `Fallo de alcance`: ignoro por completo el archivo o la instruccion que debia gobernar la tarea

Señales positivas tipicas:

- menciona o sigue el contrato JWT actual
- sube el nivel de validacion cuando toca auth, services o clocks
- trata Clocks como dominio legal, no como UI aislada
- distingue docs canonicos en `ai/` de reglas ligeras en `.github/instructions/`
- en release review revisa version visible, `package.json`, docs y validaciones minimas

## 3. Prompts

### Prompt 1 — Auth Contract

```text
Voy a tocar login y restauracion de sesion. Antes de proponer cambios, dime que archivos del proyecto deberias leer primero, que contrato esperas entre frontend y backend y que riesgo operativo validarías antes de editar nada.
```

Esperado:

- prioriza `ai/auth/session-contract.md`
- incluye `src/app/App.js`, `src/http-common.js`, `src/app/services/data.service.js`
- menciona `AUTH_ENABLED` o backend activo como caveat operativo

### Prompt 2 — Clocks Legal Domain

```text
Necesito cambiar la forma en que se muestran y calculan estados de relojes legales en Clocks. Explica primero que riesgos asumes, que archivos revisarías y como validarías que no rompí lógica de negocio.
```

Esperado:

- trata Clocks como modulo legal critico
- consulta `.github/instructions/clocks.instructions.md`
- menciona hooks de clocks y validacion mas fuerte que simple render

### Prompt 3 — Service Contract

```text
Quiero modificar un service del frontend porque parece apuntar a un endpoint raro. Antes de cambiar nada, analiza como decidirías si ese contrato realmente pertenece al backend Dovela observado o a un servicio externo.
```

Esperado:

- usa `ai/system-map.md`
- distingue services que no apuntan al backend observado
- evita “limpiar” rutas por intuicion

### Prompt 4 — Testing Depth

```text
Voy a tocar routes y auth. No escribas codigo todavia: dime exactamente que validaciones minimas deberia correr y por que no bastaria con un smoke test.
```

Esperado:

- usa `ai/testing-runbook.md`
- pide al menos `npm run audit:preflight` y `npm test`
- propone smoke manual o Playwright si el flujo es visible

### Prompt 5 — Release Readiness

```text
Prepara una revision de release para cambios en submit y auth. Confirma el alcance real, indica que validaciones correrías, que docs operativos podrían quedar desactualizados y como compararías la version visible en UI contra el criterio de release.
```

Esperado:

- usa `ai/release-runbook.md`
- inspecciona alcance antes de correr comandos
- incluye version visible vs `package.json` y criterio de release

### Prompt 6 — Canonical Sources

```text
Estoy confundido entre lo que vive en `.github/instructions` y lo que vive en `ai/`. Explica cual es la fuente canonica para arquitectura, auth, testing y release, y cuando te apoyarias en cada una.
```

Esperado:

- identifica `ai/` como verdad operativa larga
- identifica `.github/instructions/` como reglas ligeras o routing
- no propone duplicar documentacion larga en `.github/instructions`

## 4. Interpretacion rapida

Si un modelo fuerte responde bien y uno basico falla en 1 o 2 prompts, el problema puede ser capacidad del modelo.

Si ambos fallan en el mismo prompt, el problema suele ser de alcance/configuracion:

- `applyTo` demasiado estrecho o demasiado amplio
- descripcion pobre en el agente o instruccion
- conocimiento canonico repartido en demasiados lugares

## 5. Regla practica

Haz cambios de alcance uno por uno.

No muevas al mismo tiempo:

- `AGENTS.md`
- archivos canonicos en `ai/`
- reglas de `.github/instructions/`
- agentes custom en `.github/agents/`

Si cambias todo a la vez, luego no sabras que archivo mejoro o empeoro el comportamiento.
