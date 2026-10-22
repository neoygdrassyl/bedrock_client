# 5. APIs y Endpoints

Documentación de los endpoints REST disponibles en el backend, organizados por módulo.

---

## 5.1 Usuarios y Autenticación

### Endpoints de Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/users/login` | Iniciar sesión | ❌ |
| `POST` | `/users` | Crear usuario | ❌ |
| `GET` | `/users` | Listar usuarios | ✅ |
| `GET` | `/users/:id` | Obtener usuario | ✅ |
| `PUT` | `/users/:id` | Actualizar usuario | ✅ |
| `DELETE` | `/users/:id` | Eliminar usuario | ✅ |
| `GET` | `/users/email/:email` | Buscar por email | ✅ |

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as /users/login
    participant DB as MySQL
    
    C->>A: POST {email, password, recaptcha}
    A->>A: Validar reCAPTCHA
    A->>DB: SELECT * FROM users WHERE email=?
    DB-->>A: user record
    A->>A: SHA256(password) == user.password?
    alt Credenciales válidas
        A-->>C: 200 {user, token}
    else Credenciales inválidas
        A-->>C: 401 {error: "Invalid credentials"}
    end
```

### Ejemplo: Login

**Request:**
```json
POST /users/login
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "recaptcha": "token_recaptcha"
}
```

**Response (éxito):**
```json
{
    "id": 1,
    "email": "usuario@ejemplo.com",
    "name": "Usuario Ejemplo",
    "role": "auxiliar",
    "active": true
}
```

---

## 5.2 FUN (Formulario Único Nacional)

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/fun` | Listar todos los FUN |
| `GET` | `/fun/:id` | Obtener FUN por ID |
| `POST` | `/fun` | Crear nuevo FUN |
| `PUT` | `/fun/:id` | Actualizar FUN |
| `DELETE` | `/fun/:id` | Eliminar FUN |
| `GET` | `/fun/rad/:rad_num` | Buscar por radicado |
| `GET` | `/fun/status/:status` | Filtrar por estado |

### Endpoints por Sección

```mermaid
flowchart LR
    subgraph FUN["Módulo FUN"]
        F1["/fun1/*<br/>Datos Generales"]
        F2["/fun2/*<br/>Solicitante"]
        F3["/fun3/*<br/>Predio"]
        F4["/fun4/*<br/>Proyecto"]
        F5["/fun5/*<br/>Documentos"]
        F6["/fun6/*<br/>Archivos"]
        F7["/fun7/*<br/>Observaciones"]
        F8["/fun8/*<br/>Profesionales"]
    end
```

| Módulo | Endpoint Base | Operaciones |
|--------|---------------|-------------|
| Fun1 | `/fun1` | CRUD datos generales |
| Fun2 | `/fun2` | CRUD solicitante |
| Fun3 | `/fun3` | CRUD predio |
| Fun4 | `/fun4` | CRUD proyecto |
| Fun5 | `/fun5` | CRUD documentos |
| Fun6 | `/fun6` | Upload/Download archivos |
| Fun7 | `/fun7` | CRUD observaciones |
| Fun8 | `/fun8` | CRUD profesionales |

### Flujo de Creación FUN

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant DB as MySQL
    
    U->>FE: Llenar formulario FUN
    FE->>BE: POST /fun1 (datos generales)
    BE->>DB: INSERT fun_1
    DB-->>BE: {id: 123}
    BE-->>FE: {id: 123, rad_num: "CU-2024-001"}
    
    FE->>BE: POST /fun2 (solicitante, fun1_id: 123)
    BE->>DB: INSERT fun_2
    
    FE->>BE: POST /fun3 (predio, fun1_id: 123)
    BE->>DB: INSERT fun_3
    
    FE->>BE: POST /fun4 (proyecto, fun1_id: 123)
    BE->>DB: INSERT fun_4
    
    loop Para cada archivo
        FE->>BE: POST /fun6/upload (file, fun1_id: 123)
        BE->>BE: Multer guarda archivo
        BE->>DB: INSERT fun_6
    end
    
    BE-->>FE: FUN creado exitosamente
    FE-->>U: Mostrar confirmación
```

---

## 5.3 PQRS

### Endpoints PQRS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/pqrs` | Listar PQRS |
| `GET` | `/pqrs/:id` | Obtener PQRS |
| `POST` | `/pqrs` | Crear PQRS |
| `PUT` | `/pqrs/:id` | Actualizar PQRS |
| `GET` | `/pqrs/rad/:rad_num` | Buscar por radicado |
| `GET` | `/pqrs/status/:status` | Filtrar por estado |

### Endpoints New PQRS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/new_pqrs` | Listar nuevos PQRS |
| `POST` | `/new_pqrs` | Crear nuevo PQRS |
| `GET` | `/new_pqrs/:id` | Obtener PQRS |
| `PUT` | `/new_pqrs/:id` | Actualizar PQRS |
| `GET` | `/new_pqrs/times/:id` | Obtener tiempos |
| `POST` | `/new_pqrs/times` | Registrar tiempo |

### Tipos de PQRS

```mermaid
flowchart TB
    PQRS[Sistema PQRS]
    
    PQRS --> P[Petición]
    PQRS --> Q[Queja]
    PQRS --> R[Reclamo]
    PQRS --> S[Sugerencia]
    PQRS --> D[Denuncia]
    
    P --> |15 días| Response
    Q --> |15 días| Response
    R --> |15 días| Response
    S --> |15 días| Response
    D --> |15 días| Response
```

---

## 5.4 Nomenclaturas

### Endpoints Nomenclatura

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/nomenclature` | Listar nomenclaturas |
| `POST` | `/nomenclature` | Crear nomenclatura |
| `GET` | `/nomenclature/:id` | Obtener por ID |
| `PUT` | `/nomenclature/:id` | Actualizar |
| `DELETE` | `/nomenclature/:id` | Eliminar |
| `GET` | `/nomenclature/address/:address` | Buscar por dirección |

### Flujo de Asignación

```mermaid
sequenceDiagram
    participant S as Solicitante
    participant FE as Frontend
    participant BE as Backend
    participant DB as MySQL
    
    S->>FE: Solicitar nomenclatura
    FE->>BE: POST /nomenclature
    BE->>DB: Verificar dirección existente
    alt No existe
        BE->>DB: INSERT nomenclature
        BE->>BE: Generar número
        DB-->>BE: nomenclature creada
        BE-->>FE: {id, address, number}
    else Ya existe
        DB-->>BE: nomenclature existente
        BE-->>FE: {error: "Ya asignada"}
    end
    FE-->>S: Resultado
```

---

## 5.5 Submit (Radicaciones)

### Endpoints Submit

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/submit` | Listar radicaciones |
| `POST` | `/submit` | Crear radicación |
| `GET` | `/submit/:id` | Obtener radicación |
| `PUT` | `/submit/:id` | Actualizar |
| `GET` | `/submit/rad/:rad_num` | Buscar por radicado |
| `POST` | `/submit/files` | Subir archivos |
| `GET` | `/submit/files/:id` | Descargar archivo |

### Estructura de Radicación

```mermaid
erDiagram
    Submit ||--o{ SubmitFiles : has
    Submit ||--o{ SubmitTimes : tracks
    Submit }|--|| Users : created_by
    
    Submit {
        int id PK
        string rad_num
        date rad_date
        string subject
        string description
        string status
        int user_id FK
    }
    
    SubmitFiles {
        int id PK
        int submit_id FK
        string filename
        string path
        date uploaded_at
    }
    
    SubmitTimes {
        int id PK
        int submit_id FK
        string phase
        date start_date
        date end_date
    }
```

---

## 5.6 Diagrama de Secuencia API

### Flujo Completo: Radicación de FUN

```mermaid
sequenceDiagram
    actor Usuario
    participant React as Frontend React
    participant Service as FunDataService
    participant Axios as http-common
    participant Express as Express API
    participant Controller as fun.controller
    participant Model as Fun Models
    participant MySQL as Base de Datos
    
    Usuario->>React: Completa formulario FUN
    React->>React: Validación frontend
    
    React->>Service: createFun(formData)
    Service->>Axios: http.post('/fun', data)
    Axios->>Express: POST /fun + headers
    
    Express->>Express: Middleware CORS
    Express->>Express: Middleware Multer (archivos)
    Express->>Controller: router.post → create()
    
    Controller->>Controller: Validar datos
    Controller->>Model: Fun1.create(data)
    Model->>MySQL: INSERT INTO fun_1
    MySQL-->>Model: {id: 1}
    Model-->>Controller: fun1 instance
    
    loop Para cada sección
        Controller->>Model: FunX.create({fun1_id: 1, ...})
        Model->>MySQL: INSERT INTO fun_X
    end
    
    Controller->>Controller: Generar radicado
    Controller-->>Express: res.json({success, data})
    Express-->>Axios: HTTP 201
    Axios-->>Service: response.data
    Service-->>React: fun data
    React-->>Usuario: Confirmación + Radicado
```

### Flujo de Consulta

```mermaid
sequenceDiagram
    participant React as Frontend
    participant API as Backend API
    participant DB as MySQL
    
    React->>API: GET /fun?status=pending
    API->>DB: SELECT * FROM fun_1 WHERE status='pending'
    DB-->>API: [rows]
    
    loop Para cada FUN
        API->>DB: SELECT * FROM fun_2 WHERE fun1_id=?
        API->>DB: SELECT * FROM fun_3 WHERE fun1_id=?
    end
    
    API->>API: Ensamblar respuesta
    API-->>React: [{fun1, fun2, fun3, ...}]
```

### Manejo de Errores

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant DB as Database
    
    C->>A: Request inválido
    
    alt Error de validación
        A-->>C: 400 Bad Request
        Note right of C: {error: "Campos requeridos faltantes"}
    else Error de autenticación
        A-->>C: 401 Unauthorized
        Note right of C: {error: "No autorizado"}
    else Error de permisos
        A-->>C: 403 Forbidden
        Note right of C: {error: "Sin permisos"}
    else No encontrado
        A->>DB: SELECT...
        DB-->>A: null
        A-->>C: 404 Not Found
        Note right of C: {error: "Recurso no encontrado"}
    else Error de servidor
        A->>DB: Query
        DB-->>A: Error
        A-->>C: 500 Internal Error
        Note right of C: {error: "Error interno"}
    end
```
