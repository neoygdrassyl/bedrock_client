# 2. Arquitectura del Sistema

Esta sección detalla la arquitectura técnica del sistema DOVELA, los patrones de comunicación y la integración con servicios externos.

---

## 2.1 Comunicación Frontend-Backend

El sistema utiliza una arquitectura **cliente-servidor** con comunicación vía **REST API**.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant R as React App
    participant S as Service Layer
    participant A as Axios (http-common)
    participant E as Express API
    participant C as Controller
    participant M as Model (Sequelize)
    participant DB as MySQL
    
    U->>R: Acción en UI
    R->>S: Llamada a servicio
    S->>A: Petición HTTP
    A->>E: Request con headers
    E->>C: Router → Controller
    C->>M: Operación CRUD
    M->>DB: Query SQL
    DB-->>M: Resultado
    M-->>C: Datos/Modelo
    C-->>E: Response JSON
    E-->>A: HTTP Response
    A-->>S: Datos procesados
    S-->>R: Actualización estado
    R-->>U: UI actualizada
```

### Configuración del Cliente HTTP

El archivo `src/http-common.js` centraliza la configuración de Axios:

```javascript
// Configuración base
import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json"
  }
});
```

**Variables de entorno clave:**
- `REACT_APP_API_URL`: URL base del backend (ej: `http://localhost:3001`)

---

## 2.2 Flujo de Datos

### Patrón de Servicios

Cada módulo del sistema tiene su propio archivo de servicio que encapsula las llamadas API:

```mermaid
flowchart LR
    subgraph Frontend
        Page[Página/Componente]
        Service[users.service.js]
        HTTP[http-common.js]
    end
    
    subgraph Backend
        Route[users.routes.js]
        Ctrl[users.controller.js]
        Model[users.model.js]
    end
    
    Page --> |"UsersDataService.login()"| Service
    Service --> |"http.post('/users/login')"| HTTP
    HTTP --> |"axios POST"| Route
    Route --> |"controller.login"| Ctrl
    Ctrl --> |"Users.findOne()"| Model
```

### Ejemplo de Flujo: Login de Usuario

```mermaid
sequenceDiagram
    participant Login as LoginPage.js
    participant UDS as UsersDataService
    participant API as Express /users
    participant UC as users.controller
    participant U as Users Model
    participant DB as MySQL
    
    Login->>UDS: login({email, password})
    UDS->>API: POST /users/login
    API->>UC: findOne(req, res)
    UC->>U: Users.findOne({where: {...}})
    U->>DB: SELECT * FROM users WHERE...
    DB-->>U: user record
    U-->>UC: user object
    UC->>UC: Validate password (SHA256)
    alt Password válido
        UC-->>API: {user, status: 'ok'}
        API-->>UDS: Response 200
        UDS-->>Login: user data
        Login->>Login: setUser(data), redirect
    else Password inválido
        UC-->>API: {status: 'error'}
        API-->>UDS: Response 401
        UDS-->>Login: error
        Login->>Login: Mostrar error
    end
```

---

## 2.3 Servicios Externos

El sistema integra varios servicios externos para funcionalidades específicas:

```mermaid
flowchart TB
    subgraph DOVELA["Sistema DOVELA"]
        FE[Frontend React]
        BE[Backend Express]
    end
    
    subgraph Google["Google Services"]
        reCAPTCHA[reCAPTCHA v2/v3]
        Maps[Google Maps API]
    end
    
    subgraph Email["Email Services"]
        SMTP[Servidor SMTP]
        Templates[Plantillas HTML]
    end
    
    subgraph Storage["Almacenamiento"]
        FS[File System Local]
        PDF[Generación PDF]
    end
    
    FE --> |Validación bot| reCAPTCHA
    FE --> |Ubicación geográfica| Maps
    
    BE --> |Notificaciones| SMTP
    BE --> |Renderizado| Templates
    BE --> Templates
    
    BE --> |Archivos subidos| FS
    BE --> |Documentos| PDF
```

### Google reCAPTCHA

Usado en formularios públicos para prevenir spam:
- **Login** de usuarios
- **Radicación** de PQRS
- **Registro** de profesionales

### Servidor de Email (Nodemailer)

Configuración en `app/mailer/`:
- Notificaciones de estado de trámites
- Recordatorios de citas
- Envío de documentos

### Sistema de Archivos

Multer gestiona uploads con destinos dinámicos:

```javascript
// Prefijos de archivos y sus destinos
pqrs_      → ./uploads/pqrs/
fun6_      → ./uploads/fun/
submit_    → ./uploads/submit/
norm_      → ./uploads/norms/
nomenclature_ → ./uploads/nomenclature/
```

### Generación de PDFs

Dos enfoques según el tipo de documento:

| Librería | Uso | Ejemplo |
|----------|-----|---------|
| **PDFKit** | Documentos simples, recibos | Constancias, comprobantes |
| **Puppeteer** | Documentos complejos desde HTML | Resoluciones, actas |

```mermaid
flowchart LR
    HTML[Template HTML] --> Puppeteer
    Puppeteer --> |Renderiza| PDF1[PDF Resolución]
    
    Data[Datos JSON] --> PDFKit
    PDFKit --> |Genera| PDF2[PDF Recibo]
```
