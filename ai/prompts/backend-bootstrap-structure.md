# Prompt — Backend Bootstrap Structure

Nota: este archivo es una plantilla historica de bootstrap.

No debe usarse como fuente de verdad operativa del runtime actual. La referencia canonica vive en `AGENTS.md`, `ai/system-map.md`, `ai/auth/session-contract.md` y `ai/testing-runbook.md`.

Usa este prompt dentro del repo backend de Dovela.

## Prompt listo para ejecutar

Eres un agente de codigo trabajando dentro del backend de Dovela en `C:\xampp\htdocs\dovela-backend`.

### Objetivo

Quiero que repliques la misma estrategia de bootstrap documental que ya se aplico en el frontend:

- Un `AGENTS.md` corto y util como archivo de arranque real para cualquier modelo.
- Una carpeta portable `ai/` con referencias versionables y rastreables en git.
- Cero dependencia de docs nuevas bajo `docs/` o `.github/` para conocimiento esencial.

### Restricciones importantes

1. **No dejes la verdad operativa en `.github/` ni en `docs/`**.
   - En este repo, `.gitignore` ignora `/.github` y `/docs`.
   - Por eso, cualquier archivo nuevo esencial debe vivir fuera de esas rutas.
2. **No cambies logica de negocio ni contratos API en esta tarea**.
   - Esta tarea es de estructura de bootstrap y documentacion operativa.
3. **No borres documentacion historica ignorada si no es necesario**.
   - Puedes dejar `.github/agents/agents.md` como referencia historica local, pero el nuevo canon debe quedar en archivos versionables.
4. **No asumas que existen tests automatizados**.
   - Si no encuentras tests reales, documenta un protocolo manual/smoke realista.

### Lo que debes hacer

#### 1. Crear una estructura portable en raiz

Crea y deja versionables estos archivos en el repo backend:

- `AGENTS.md`
- `ai/system-map.md`
- `ai/testing-runbook.md`
- `ai/auth/session-contract.md`

#### 2. Reescribir el bootstrap principal

Convierte `AGENTS.md` en un hub corto, estilo init, con estas secciones:

1. Que es este repo.
2. Como empezar en 5 minutos.
3. Stack esencial.
4. Donde vive la verdad operativa.
5. Modulos de alto riesgo.
6. Restricciones no negociables.
7. Drifts conocidos.
8. Comandos esenciales.
9. Regla de lectura progresiva.

No metas detalle enciclopedico ahi. Debe delegar al contenido de `ai/`.

#### 3. Crear `ai/system-map.md`

Debe consolidar la fuente de verdad observada del backend a partir de codigo real, no de prompts viejos.

Incluye como minimo:

- `server.js` como entry point.
- Rutas registradas y prefijos `/api/*`.
- `app/models/index.js` como fuente de asociaciones.
- `fun_0` como agregado raiz si el codigo lo confirma.
- relaciones clave entre FUN, Records, Submit, Expedition, PQRS y archivos.
- comportamiento de `multer` y prefijos de upload.
- riesgo de `sequelize.sync({ alter: true })`.
- servicios externos o contratos que no dependan solo de este backend, si los encuentras.

#### 4. Crear `ai/testing-runbook.md`

Si no hay test suite real, no inventes una.

En ese caso, documenta validacion minima honesta, por ejemplo:

- revision de diff
- verificacion sintactica de archivos JS cambiados
- smoke de arranque del servidor
- comprobacion manual de endpoints afectados
- protocolo de rollback si tocas modelos o rutas

Si si existe una suite real, documenta comandos reales solamente.

#### 5. Crear `ai/auth/session-contract.md`

Necesito que este archivo deje totalmente claro:

- que devuelve hoy realmente `POST /api/login`
- si existe o no existe JWT real en este backend
- si existe o no existe `GET /api/me`
- como se relaciona ese contrato con el frontend actual
- que drift hay entre documentacion historica y controller real
- que decision futura conviene: alinear backend al frontend o documentar compatibilidad temporal

#### 6. Resolver la portabilidad del bootstrap

El bootstrap real del backend debe quedar util aunque un modelo solo abra este repo y no tenga acceso a memorias del editor.

Por eso:

- no dependas de `/memories/`
- no dependas de `.github/` como fuente canonica nueva
- no dependas de archivos ignorados para informacion esencial

### Archivos que debes inspeccionar antes de redactar

- `server.js`
- `.gitignore`
- `package.json`
- `app/models/index.js`
- `app/config/db.config.js`
- `app/routes/custom.routes.js`
- `app/routes/fun.routes.js`
- `app/routes/submit.routes.js`
- `app/controllers/users.controller.js`
- `app/controllers/fun.controller.js`
- `app/controllers/submit.controller.js`
- `.github/agents/agents.md` solo como referencia historica existente
- `.github/JWT_gUIDE.md` solo para detectar drift

### Aceptacion

La tarea queda bien hecha solo si:

1. `AGENTS.md` queda corto y util.
2. `ai/system-map.md` contiene la verdad operativa del backend y sus riesgos.
3. `ai/testing-runbook.md` no promete pruebas inexistentes.
4. `ai/auth/session-contract.md` deja claro el contrato real de login y el drift con frontend.
5. Ningun archivo nuevo esencial queda dentro de `.github/` o `docs/`.

### Verificacion final

- Revisa `git status --short`.
- Revisa `git diff --stat`.
- Corre una comprobacion de sintaxis en cualquier JS que hayas tocado si editas algo executable.
- No afirmes compatibilidad con frontend sin dejar documentados los drifts que encuentres.
