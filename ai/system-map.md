# AI System Map — Dovela Frontend + Backend Contract

Referencia canonica para entender el sistema antes de tocar codigo. Este archivo complementa a AGENTS.md y debe leerse cuando el cambio afecte dominio, contratos de datos, auth, rutas o modulos criticos.

## 1. Limites del repositorio

- Este workspace contiene el frontend React/Vite en `/home/dg21/dovela/frontend`.
- El backend operativo inspeccionado para este mapa vive fuera del workspace en `C:\xampp\htdocs\dovela-backend`.
- Para este proyecto no conviene guardar la verdad operativa nueva en `docs/` ni en archivos nuevos bajo `.github/`, porque `.gitignore` ignora esas rutas para archivos no rastreados. La referencia portable vive en `ai/`.

## 2. Frontend: verdad de runtime actual

### 2.1 Shell y arranque

- Entry point: `src/index.js`
- Router, auth, layout y boundaries: `src/app/App.js`
- Cliente HTTP central: `src/http-common.js`
- Persistencia de sesion en navegador: `src/app/services/data.service.js`

### 2.2 Auth y sesion

La app actual no usa un store global. La sesion vive en una mezcla de contexto React, `window.user` y `localStorage`.

Flujo observado en codigo:

1. `LoginPage` en `src/app/App.js` llama `CustomsDataService.appLogin(formData)`.
2. Si la respuesta contiene `token` y `user`, se guarda `dovela_token` y `dovela_user` via `data.service.js`.
3. `useProvideAuth()` restaura sesion desde `localStorage` con `DataSerive.restoreSession()`.
4. `PrivateRoute` bloquea el acceso si `auth.user` es `null`.
5. `src/http-common.js` agrega `Authorization: Bearer <token>` y limpia sesion ante `401` con `expired === true`.

### 2.3 Contrato actual de auth

El estado actual observado ya esta alineado hacia JWT:

- El frontend ya esta escrito para una respuesta con forma `{ token, user }`.
- El backend inspeccionado hoy ya devuelve `{ token, user }` en login.
- El backend inspeccionado hoy expone `/api/me` protegido por token.

Referencia especifica: `ai/auth/session-contract.md`.

No asumas que la documentacion historica de auth esta al dia. Antes de tocar login, valida el contrato real del backend y la configuracion de entorno.

### 2.4 Rutas principales del frontend

Rutas publicas observadas en `src/app/App.js`:

- `/`, `/home`, `/login` — login
- `/norms` — normatividad publica
- `/certs` — certificaciones publicas
- `/zone_use` — consulta publica de usos del suelo
- `/dev-guide` — guia de desarrollo

Rutas privadas principales:

- `/dashboard` — panel principal
- `/publish` — publicaciones
- `/seals` — sellos
- `/appointments` — citas
- `/mail` — buzon
- `/fun` — solicitudes y licencias
- `/funmanage` — gestion avanzada de solicitudes/licencias
- `/pqrsadmin` — PQRS
- `/osha` — modulo interno
- `/nomenclature` — nomenclatura
- `/submit` — ventanilla unica
- `/calculator` — liquidador
- `/archive` — archivo
- `/dictionary` — diccionario
- `/profesionals` — directorio profesional
- `/guide_user` — guia de usuario

## 3. Modulos de mayor riesgo

### 3.1 Clocks

Ubicacion principal:

- `src/app/pages/user/clocks/hooks/useClocksManager.js`
- `src/app/pages/user/clocks/hooks/useProcessPhases.js`
- `src/app/pages/user/clocks/hooks/useAlarms.js`

Reglas:

- Este modulo modela tiempos legales, no UI cosmetica.
- Mantiene estados, suspensiones, extensiones, desistimientos y fases procesales.
- Si cambias fechas, estados o notificaciones, el impacto puede alcanzar FUN, records, PQRS y expedicion.
- No reemplaces la ausencia de datos con `return null` si el usuario necesita ver explicitamente que falta informacion.

### 3.2 FUN

Ubicacion principal:

- `src/app/pages/user/fun.js`
- `src/app/pages/user/fun_forms/`
- `src/app/services/fun.service.js`

Notas:

- Es el mayor orquestador del frontend.
- Usa versionamiento explicito y acopla records, clocks, documentos y expedicion.
- Muchos contratos con backend viven de facto en `fun.service.js`.

### 3.3 Records

Ubicacion principal:

- `src/app/pages/user/records/record_arc.js`
- `src/app/pages/user/records/record_eng.js`
- `src/app/pages/user/records/record_law.js`
- `src/app/pages/user/records/record_ph.js`

Notas:

- Cada disciplina tiene logica propia.
- Hay referencias cruzadas entre disciplinas y con FUN.
- Cualquier cambio en estructura de payload puede romper varias vistas a la vez.

### 3.4 PQRS y Expedition

- `src/app/pages/user/pqrs/`
- `src/app/pages/user/expeditions/`

Notas:

- Tienen muchos subcomponentes y cobertura menos directa que Clocks o FUN.
- Antes de cambios profundos, conviene inspeccionar render tests e integration tests relacionados.

### 3.5 Motor documental

Ubicacion principal:

- `src/app/utils/TemplateEngine.js`
- `src/app/utils/BaseDocumentUtils.js`
- `public/templates/`

Reglas:

- No tocar `public/templates/` sin entender el motor.
- El sistema genera actos y resoluciones reales; una ruptura aqui es de alto impacto.

## 4. Backend: verdad de runtime observada

### 4.1 Stack y arranque

Backend inspeccionado:

- `server.js` — Express 4 + cors + multer global + `sequelize.sync({ alter: true })`
- `app/models/index.js` — registro de modelos y asociaciones Sequelize
- `app/routes/*.js` — routers por dominio bajo `/api/*`
- `app/controllers/*.js` — logica de negocio

El backend observado es Node/Express + Sequelize + MySQL. No lo trates como un backend PHP tradicional solo porque este bajo una ruta de XAMPP.

### 4.2 Riesgo estructural del backend

- `sequelize.sync({ alter: true })` esta activo al arrancar.
- Cambiar modelos o asociaciones puede alterar la base de datos real al reiniciar.
- Si tocas backend, necesitas un protocolo de smoke/manual validation aunque no existan tests automatizados de primera clase.

### 4.3 Prefijos de rutas backend mas relevantes

- `/api` — login, files, PDFs, checks, dictionaries
- `/api/fun`
- `/api/recordarc`
- `/api/recordeng`
- `/api/recordlaw`
- `/api/recordph`
- `/api/recordr`
- `/api/submit`
- `/api/archive`
- `/api/expedition`
- `/api/nomenclature`
- `/api/norms`
- `/api/zone_use`
- `/api/pqrs_main`

### 4.4 Uploads y filesystem

`server.js` usa `upload.any()` con destino calculado por prefijo del nombre del archivo.

Prefijos importantes:

- `pqrs_*` -> `./docs/pqrs/input/`
- `pqrsout_*` -> `./docs/pqrs/output/`
- `publish_<type>_*` -> `./docs/publish/<type>/`
- `fun6_<year>_<id>_*` -> `./docs/process/<year>/<id>/`
- `nomenclature_<year>_<id>_*` -> `./docs/nomenclature/<year>/<id>/`
- `submit_<year>_<id>_*` -> `./docs/submit/<year>/<id>/`
- `norm_<year>_<id>_*` -> `./docs/norms/<year>/<id>/`

No cambies estos prefijos sin revisar toda la cadena frontend -> upload -> descarga.

## 5. Agregado raiz y relaciones clave del dominio

`fun_0` es el agregado raiz mas importante del sistema backend inspeccionado.

Relaciones relevantes observadas en `app/models/index.js`:

- `fun_0` tiene muchos `fun_1`, `fun_3`, `fun_4`, `fun_51`, `fun_52`, `fun_53`, `fun_6`, `fun_c`, `fun_r`, `fun_clock`, `process_x_arch`
- `fun_0` tiene un `fun_2`, `fun_law`, `seals`, `record_law`, `record_eng`, `record_arc`, `record_ph`, `record_review`, `expedition`
- `fun_6` tiene muchos `fun_6_h`
- `submit` tiene muchos `sub_list` y `submitSolicitor`, y un `sub_docs`
- `record_law`, `record_eng`, `record_arc`, `record_ph` cuelgan de `fun_0`
- `expedition` cuelga de `fun_0`

Consecuencia: cuando tocas FUN, rara vez estas tocando un modulo aislado.

## 6. Contratos cruzados importantes

### 6.1 Submit puede crear FUN

El controller inspeccionado en backend para submit crea tambien un `fun_0` en ciertos flujos cuando llega `id_payment`. No asumas que Submit y FUN son dominios totalmente separados.

### 6.2 Servicios externos

No todos los services del frontend apuntan al backend inspeccionado.

Casos importantes:

- `emails.service.js` usa otra base URL
- `profesionals.service.js` usa otro host

Antes de cambiar un service, verifica si el contrato pertenece de verdad a este backend.

### 6.3 Rutas no confirmadas

Hay que tratar con cuidado cualquier ruta declarada en services que no aparezca en routers del backend inspeccionado. No borres ni “limpies” codigo por intuicion sin revisar si es codigo muerto, feature en transicion o desalineacion real.

## 7. Observaciones operativas

Estos puntos deben asumirse como caveats activos hasta verificar lo contrario:

- `README.md` del frontend esta obsoleto y sigue describiendo CRA.
- El AGENTS previo del frontend llamaba al backend “PHP/MySQL”; el backend inspeccionado hoy es Express + Sequelize + MySQL.
- El comportamiento final de auth depende tambien del backend activo y de `AUTH_ENABLED`.
- La version visible en UI (`v 1.9.0`) no coincide claramente con `package.json` (`1.20.95`).
- En runtime existen warnings/errores de consola ya presentes: React Router future flags, propiedades DOM invalidas, carga directa del script de Google Maps y algunos problemas de nesting HTML.

No conviertas ninguna de estas observaciones en “verdad nueva” sin validarlas primero.

## 8. Matriz de lectura rapida antes de cambiar algo

Si vas a tocar auth o rutas protegidas:

- `src/app/App.js`
- `src/http-common.js`
- `src/app/services/data.service.js`
- `src/app/services/custom.service.js`
- `ai/auth/session-contract.md`

Si vas a tocar Clocks:

- `src/app/pages/user/clocks/hooks/useClocksManager.js`
- `src/app/pages/user/clocks/hooks/useProcessPhases.js`
- `src/app/pages/user/clocks/hooks/useAlarms.js`
- `.github/instructions/clocks.instructions.md`

Si vas a tocar FUN o Records:

- `src/app/pages/user/fun.js`
- `src/app/services/fun.service.js`
- la disciplina de records correspondiente
- `C:\xampp\htdocs\dovela-backend\app\routes\fun.routes.js`
- `C:\xampp\htdocs\dovela-backend\app\models\index.js`

Si vas a tocar PQRS:

- `src/app/pages/user/pqrs/`
- `src/app/services/pqrs_main.service.js`
- backend `pqrs_main.routes.js` y controller asociado

Si vas a tocar documentos, descargas o PDFs:

- `src/app/utils/TemplateEngine.js`
- `public/templates/`
- backend `custom.routes.js`
- backend `file.controller.js`

Si vas a tocar uploads o paths de archivo:

- backend `server.js`
- modulos frontend que construyan nombres/prefijos de archivo

## 9. Validacion minima recomendada

La estrategia detallada esta en `ai/testing-runbook.md`, pero como regla corta:

- Cambios documentales o de bootstrap: revisar diff y enlaces internos; no hacen falta tests de app.
- Cambios de frontend real: `npm run audit:preflight` y luego pruebas dirigidas segun el modulo.
- Cambios en auth, services, clocks o rutas: no cierres el trabajo sin validar contratos y hacer smoke del flujo afectado.
