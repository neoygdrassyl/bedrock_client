# Code Citations

## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getR
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    set
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/services/data.service.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.role
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.role
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + '
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + '
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' +
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      Data
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acc
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButton
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() =>
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

RE
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user
```


## License: unknown
https://github.com/neoygdrassyl/bedrock_client/blob/edc2251af13b7f0a7040e3337ba1b06608f107ef/src/app/App.js

```
Aquí tienes el prompt listo para copiar y pegar en el agente del frontend:

---

```
## TAREA: Implementar sistema de sesión JWT en el frontend

### CONTEXTO
El backend Express ya implementa autenticación JWT. El endpoint `POST /api/login` ahora devuelve:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan",
    "surname": "Pérez",
    "name_2": "Carlos",
    "surname_2": "Gómez",
    "active": 1,
    "roleId": 2,
    "Role": { "name": "Administrador", "desc": "Admin del sistema", "short": "ADM" }
  }
}
```

ANTES devolvía un array: `[{ id, name, surname, ..., role: { name, desc, short } }]`
AHORA devuelve un objeto: `{ token, user: { ..., Role: { name, desc, short } } }`

Nota importante: la clave del rol cambió de minúscula `role` a mayúscula `Role` (nombre del modelo Sequelize).

También hay un nuevo endpoint `GET /api/me` (requiere header `Authorization: Bearer <token>`) que devuelve los datos del usuario actual en el mismo formato que `user` arriba. Sirve para restaurar la sesión tras refrescar la página.

Todas las rutas `/api/*` protegidas devuelven `401 { message, expired: true }` cuando el token expira.

---

### ARCHIVOS A MODIFICAR (3 archivos, NO crear archivos nuevos)

---

#### 1. `src/http-common.js`

CÓDIGO ACTUAL EXACTO:
```js
import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});
```

CAMBIOS REQUERIDOS:
- Crear la instancia axios y almacenarla en una variable antes de exportarla.
- Añadir un **request interceptor** que lea `localStorage.getItem("dovela_token")` y si existe, agregue el header `Authorization: Bearer <token>` a cada request.
- Añadir un **response interceptor** que detecte respuestas `401` con `response.data.expired === true`, borre el token de localStorage, haga `window.user = null`, y redirija a `/login` con `window.location.href = "/login"`.
- Mantener el Content-type multipart/form-data tal cual está.
- Exportar la instancia como default.

---

#### 2. `src/app/services/data.service.js`

CÓDIGO ACTUAL EXACTO:
```js
class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
```

CAMBIOS REQUERIDOS:
- En `setUser(userData)`: además de `window.user = userData`, también guardar `JSON.stringify(userData)` en `localStorage.setItem("dovela_user", ...)`.
- En `setUserNull()`: además de `window.user = null`, también hacer `localStorage.removeItem("dovela_user")` y `localStorage.removeItem("dovela_token")`.
- Añadir método `saveToken(token)` que haga `localStorage.setItem("dovela_token", token)`.
- Añadir método `getToken()` que devuelva `localStorage.getItem("dovela_token")`.
- Añadir método `restoreSession()` que:
  1. Lea `dovela_token` y `dovela_user` de localStorage
  2. Si ambos existen, parsee el user JSON, asigne a `window.user`, y devuelva `true`
  3. Si no existen, devuelva `false`
- NO cambiar ningún método existente que funcione (getFullName, getActive, getRoleName, getRoleDesc, getUserData). Solo AGREGAR los nuevos métodos y EXTENDER setUser / setUserNull.

---

#### 3. `src/app/App.js`

Este es el archivo más delicado. HAY QUE CAMBIAR SOLO las secciones de autenticación. NO tocar rutas, imports de páginas, ni componentes que no sean de auth.

SECCIONES A MODIFICAR:

**A) Añadir método `getMe` al servicio custom** — En `src/app/services/custom.service.js`, añadir dentro de la clase `CustomlDataService`:
```js
  getMe() {
    return http.get(`/me`);
  }
```
Esto va justo después del método `appLogin`.

**B) En `LoginPage` — cambiar el handleSubmit** 

CÓDIGO ACTUAL del handler de login:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.length === 1) {
      let userInfo = {};
      userInfo.name = response.data[0].name;
      userInfo.surname = response.data[0].surname;
      userInfo.role = response.data[0].role.name;
      userInfo.role_short = response.data[0].role.short;
      userInfo.roleDesc = response.data[0].role.desc;
      userInfo.active = response.data[0].active;
      userInfo.roleId = response.data[0].roleId;
      userInfo.id = response.data[0].id;
      userInfo.name_short = response.data[0].name + ' ' + response.data[0].surname;
      userInfo.name_full = response.data[0].name + ' ' + response.data[0].name_2 + ' ' + response.data[0].surname + ' ' + response.data[0].surname_2;
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => { console.log(e); });
```

REEMPLAZAR POR:
```js
CustomsDataService.appLogin(formData)
  .then(response => {
    if (response.data.token && response.data.user) {
      const u = response.data.user;
      let userInfo = {};
      userInfo.name = u.name;
      userInfo.surname = u.surname;
      userInfo.role = u.Role.name;
      userInfo.role_short = u.Role.short;
      userInfo.roleDesc = u.Role.desc;
      userInfo.active = u.active;
      userInfo.roleId = u.roleId;
      userInfo.id = u.id;
      userInfo.name_short = u.name + ' ' + u.surname;
      userInfo.name_full = u.name + ' ' + (u.name_2 || '') + ' ' + u.surname + ' ' + (u.surname_2 || '');
      DataSerive.saveToken(response.data.token);
      DataSerive.setUser(userInfo);
      login();
    } else {
      MySwal.fire({
        title: <h2>CERTIFICACION FALLIDA</h2>,
        text: 'Hubo un error de acceso a la aplicación',
        footer: 'Revise sus credenciales e intentelo nuevamente',
        icon: 'error',
        confirmButtonText: 'CONTINUAR',
      })
    }
  })
  .catch(e => {
    console.log(e);
    MySwal.fire({
      title: <h2>CERTIFICACION FALLIDA</h2>,
      text: 'Credenciales inválidas o error de conexión',
      footer: 'Revise sus credenciales e intentelo nuevamente',
      icon: 'error',
      confirmButtonText: 'CONTINUAR',
    })
  });
```

**C) En `useProvideAuth` — añadir restauración de sesión al cargar**

CÓDIGO ACTUAL:
```js
function useProvideAuth() {
  const [user, setUser] = useState(null);

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

REEMPLAZAR POR:
```js
function useProvideAuth() {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage on initial load
    if (DataSerive.restoreSession()) {
      fakeAuth.isAuthenticated = true;
      return DataSerive.getUserData();
    }
    return null;
  });

  const signin = cb => {
    return fakeAuth.signin(() => {
      setUser(DataSerive.getUserData());
      cb();
    });
  };

  const signout = cb => {
    return fakeAuth.signout(() => {
      setUser(null);
      DataSerive.setUserNull();
      cb();
    });
  };

  return { user, signin, signout };
}
```

---
```

