# Auth Session Contract

Contrato canonico de sesion entre frontend y backend, validado contra el codigo observado el 2026-03-28.

## 1. Estado actual

Frontend y backend ya estan alineados hacia JWT.

- El frontend espera `{ token, user }`.
- El backend observado ya devuelve `{ token, user }` en `POST /api/login`.
- El backend observado expone `GET /api/me` protegido por Bearer token.

## 2. Contrato esperado por el frontend

### 2.1 Login

`src/app/App.js` considera login exitoso solo si la respuesta contiene:

```json
{
  "token": "...",
  "user": {
    "id": 1,
    "name": "...",
    "surname": "...",
    "name_2": "...",
    "surname_2": "...",
    "active": 1,
    "roleId": 2,
    "Role": {
      "name": "...",
      "desc": "...",
      "short": "..."
    }
  }
}
```

Luego el frontend deriva un `userInfo` simplificado y persiste token + usuario en navegador.

### 2.2 Persistencia local

`src/app/services/data.service.js` guarda:

- `dovela_token`
- `dovela_user`

Tambien restaura la sesion inicial desde `localStorage`.

### 2.3 Interceptores HTTP

`src/http-common.js`:

- agrega `Authorization: Bearer <token>` a cada request cuando existe `dovela_token`
- limpia sesion y redirige a `/login` si recibe `401` con `expired === true`

## 3. Contrato observado en backend

### 3.1 `POST /api/login`

En `C:\xampp\htdocs\dovela-backend\app\controllers\users.controller.js`, `appLogin` observado:

- busca usuario activo por email
- valida password legacy SHA-256 o bcrypt
- migra silenciosamente password legacy a bcrypt tras login exitoso
- firma JWT con `jsonwebtoken`
- responde `{ token, user }`

### 3.2 `GET /api/me`

El backend observado expone `GET /api/me` en `app/routes/custom.routes.js` con middleware `verifyToken`.

Devuelve el usuario autenticado con su `Role`.

### 3.3 Middleware global de auth

En `server.js` existe un gate global controlado por `AUTH_ENABLED`.

Estado observado:

- el middleware JWT existe
- el entorno inspeccionado tiene `AUTH_ENABLED = true`

Consecuencia:

- el contrato JWT es real
- aun asi, si otro entorno desactiva `AUTH_ENABLED`, el backend puede comportarse como si las rutas no requirieran token aunque el login siga devolviendo JWT

## 4. Caveats operativos

Estos puntos siguen siendo importantes cuando se toca auth:

- puede haber tests o notas antiguas que no reflejen el contrato canonico actual
- el comportamiento final de proteccion depende de `AUTH_ENABLED`
- el despliegue real debe validarse contra el backend activo, no solo contra la documentacion

## 5. Implicaciones para cambios futuros

Si tocas login, guards, interceptores o sesion:

1. valida `src/app/App.js`
2. valida `src/http-common.js`
3. valida `src/app/services/data.service.js`
4. valida `app/controllers/users.controller.js`
5. valida `app/routes/custom.routes.js`
6. valida `server.js` y `AUTH_ENABLED`

No des por hecho que porque el login devuelve JWT todas las rutas estan protegidas en todos los entornos.

## 6. Decision arquitectonica actual

La direccion correcta del sistema hoy es:

- login con JWT
- sesion restaurable en frontend
- `/api/me` para identidad actual
- middleware de verificacion reusable en backend
