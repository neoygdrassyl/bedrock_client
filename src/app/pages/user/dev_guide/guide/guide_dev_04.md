# 4. Backend (Express + Sequelize)

Documentación del servidor backend, su arquitectura MVC, modelos de datos y relaciones entre entidades.

---

## 4.1 Stack del Backend

### Dependencias Principales

```mermaid
flowchart TB
    subgraph Core["Core Server"]
        Express[Express 4.21]
        CORS[CORS]
        BodyParser[Body Parser]
    end
    
    subgraph Database["Base de Datos"]
        Sequelize[Sequelize 6.6]
        MySQL[MySQL2 3.14]
    end
    
    subgraph Files["Manejo de Archivos"]
        Multer[Multer 2.0]
        PDFKit[PDFKit 0.11]
        Puppeteer[Puppeteer 5.5]
        PDFLib[pdf-lib 1.17]
    end
    
    subgraph Utils["Utilidades"]
        Nodemailer[Nodemailer 7.0]
        Crypto[crypto-js]
        Moment[Moment.js]
    end
    
    Express --> CORS
    Express --> BodyParser
    Express --> Sequelize
    Sequelize --> MySQL
    Express --> Multer
    Express --> Nodemailer
```

### Tabla de Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `express` | 4.21.2 | Framework web |
| `sequelize` | 6.6.2 | ORM para MySQL |
| `mysql2` | 3.14.1 | Driver MySQL |
| `multer` | 2.0.1 | Upload de archivos |
| `nodemailer` | 7.0.3 | Envío de emails |
| `pdfkit` | 0.11.0 | Generación de PDFs |
| `puppeteer-core` | 5.5.0 | HTML a PDF |
| `pdf-lib` | 1.17.1 | Manipulación PDFs |
| `crypto-js` | 4.0.0 | Encriptación |
| `cors` | 2.8.5 | Cross-Origin |

---

## 4.2 Estructura de Directorios

```
backend/
├── server.js              # Entry point
├── package.json
│
├── app/
│   ├── config/
│   │   └── db.config.js   # Configuración MySQL
│   │
│   ├── controllers/       # Lógica de negocio
│   │   ├── fun.controller.js
│   │   ├── users.controller.js
│   │   ├── pqrs.controller.js
│   │   └── ...
│   │
│   ├── models/            # Modelos Sequelize
│   │   ├── index.js       # Inicialización y relaciones
│   │   ├── users.model.js
│   │   ├── fun/           # Modelos FUN
│   │   ├── pqrs/          # Modelos PQRS
│   │   ├── nomenclature/  # Modelos Nomenclatura
│   │   └── ...
│   │
│   ├── routes/            # Definición de rutas
│   │   ├── fun.routes.js
│   │   ├── users.routes.js
│   │   └── ...
│   │
│   ├── mailer/            # Configuración email
│   │   └── mailer.js
│   │
│   └── templates/         # Plantillas HTML
│       ├── resolution/
│       ├── Executory/
│       └── ActDesist/
│
└── uploads/               # Archivos subidos
    ├── fun/
    ├── pqrs/
    ├── submit/
    ├── norms/
    └── nomenclature/
```

### Diagrama de Arquitectura MVC

```mermaid
flowchart TB
    subgraph Client["Cliente"]
        React[React Frontend]
    end
    
    subgraph Server["server.js"]
        Express[Express App]
        Multer[Multer Middleware]
        CORS[CORS Middleware]
    end
    
    subgraph Routes["📁 routes/"]
        R1[fun.routes.js]
        R2[users.routes.js]
        R3[pqrs.routes.js]
    end
    
    subgraph Controllers["📁 controllers/"]
        C1[fun.controller.js]
        C2[users.controller.js]
        C3[pqrs.controller.js]
    end
    
    subgraph Models["📁 models/"]
        Index[index.js]
        M1[fun/*.model.js]
        M2[users.model.js]
        M3[pqrs/*.model.js]
    end
    
    subgraph DB["Base de Datos"]
        MySQL[(MySQL)]
    end
    
    React --> |HTTP| Express
    Express --> CORS
    Express --> Multer
    Express --> Routes
    
    R1 --> C1
    R2 --> C2
    R3 --> C3
    
    C1 --> Index
    C2 --> Index
    C3 --> Index
    
    Index --> M1
    Index --> M2
    Index --> M3
    
    M1 --> MySQL
    M2 --> MySQL
    M3 --> MySQL
```

---

## 4.3 Modelos y Entidades

El sistema tiene más de **70 modelos** organizados por dominio.

### Organización de Modelos

```mermaid
flowchart TB
    subgraph models["📁 models/"]
        index[index.js<br/>Inicialización + Relaciones]
        
        subgraph core["Core"]
            users[users.model.js]
            profesionals[profesionals.model.js]
            holydays[holydays.model.js]
        end
        
        subgraph fun["📁 fun/"]
            fun1[fun1.model.js]
            fun2[fun2.model.js]
            fun3[fun3.model.js]
            funX[...]
        end
        
        subgraph pqrs["📁 pqrs/"]
            pqrs1[pqrs.model.js]
            pqrsFiles[pqrsFiles.model.js]
        end
        
        subgraph newpqrs["📁 new_pqrs/"]
            npqrs[new_pqrs.model.js]
            npqrsTime[new_pqrs_times.model.js]
        end
        
        subgraph record["📁 record_*/"]
            recArc[record_arc/]
            recEng[record_eng/]
            recLaw[record_law/]
            recPh[record_ph/]
        end
        
        subgraph other["Otros"]
            nomenclature[📁 nomenclature/]
            norm[📁 norm/]
            submit[📁 submit/]
            zoneUse[📁 zone_use/]
        end
    end
    
    index --> core
    index --> fun
    index --> pqrs
    index --> newpqrs
    index --> record
    index --> other
```

### Modelos Principales

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| `Users` | `users` | Usuarios del sistema |
| `Profesionals` | `profesionals` | Profesionales registrados |
| `Fun1` | `fun_1` | FUN - Datos generales |
| `Fun2` | `fun_2` | FUN - Solicitante |
| `Fun3` | `fun_3` | FUN - Predio |
| `Fun4` | `fun_4` | FUN - Proyecto |
| `Fun5` | `fun_5` | FUN - Documentos |
| `Fun6` | `fun_6` | FUN - Archivos |
| `Pqrs` | `pqrs` | PQRS antiguos |
| `New_Pqrs` | `new_pqrs` | PQRS nuevo sistema |
| `Submit` | `submits` | Radicaciones |
| `Nomenclature` | `nomenclatures` | Nomenclaturas |
| `Norms` | `norms` | Normatividad |

---

## 4.4 Relaciones entre Entidades

### Relaciones del FUN

El Formulario Único Nacional (FUN) es la entidad central:

```mermaid
erDiagram
    Fun1 ||--|| Fun2 : "tiene solicitante"
    Fun1 ||--|| Fun3 : "tiene predio"
    Fun1 ||--|| Fun4 : "tiene proyecto"
    Fun1 ||--o{ Fun5 : "tiene documentos"
    Fun1 ||--o{ Fun6 : "tiene archivos"
    Fun1 ||--o{ Fun7 : "tiene observaciones"
    Fun1 ||--o{ Fun8 : "tiene profesionales"
    
    Fun1 {
        int id PK
        string rad_num
        date rad_date
        string status
        int type
    }
    
    Fun2 {
        int id PK
        int fun1_id FK
        string name
        string document
        string email
    }
    
    Fun3 {
        int id PK
        int fun1_id FK
        string address
        string cbml
        float area
    }
    
    Fun4 {
        int id PK
        int fun1_id FK
        string description
        int floors
        float built_area
    }
```

### Relaciones de Usuarios

```mermaid
erDiagram
    Users ||--o{ Fun1 : "radica"
    Users ||--o{ New_Pqrs : "crea"
    Users ||--o{ Submit : "radica"
    Users ||--o{ Appointments : "agenda"
    
    Profesionals ||--o{ Fun8 : "participa en"
    Profesionals ||--o{ Users : "es usuario"
    
    Users {
        int id PK
        string email
        string password
        string name
        string role
        boolean active
    }
    
    Profesionals {
        int id PK
        string name
        string license
        string specialty
        int user_id FK
    }
```

### Relaciones de PQRS

```mermaid
erDiagram
    New_Pqrs ||--o{ New_Pqrs_Times : "tiene tiempos"
    New_Pqrs ||--o{ New_Pqrs_Files : "tiene archivos"
    New_Pqrs }|--|| Users : "creado por"
    
    New_Pqrs {
        int id PK
        string rad_num
        date rad_date
        string type
        string subject
        string status
        int user_id FK
    }
    
    New_Pqrs_Times {
        int id PK
        int pqrs_id FK
        date start_date
        date end_date
        string phase
    }
```

---

## 4.5 Diagrama ER

### Diagrama General del Sistema

```mermaid
erDiagram
    Users ||--o{ Fun1 : creates
    Users ||--o{ New_Pqrs : creates
    Users ||--o{ Submit : creates
    Users ||--o{ Nomenclature : creates
    Users ||--o{ Appointments : schedules
    
    Profesionals ||--o{ Fun8 : participates
    Profesionals }o--|| Users : is_user
    
    Fun1 ||--|| Fun2 : has_applicant
    Fun1 ||--|| Fun3 : has_property
    Fun1 ||--|| Fun4 : has_project
    Fun1 ||--o{ Fun5 : has_docs
    Fun1 ||--o{ Fun6 : has_files
    Fun1 ||--o{ Fun7 : has_observations
    Fun1 ||--o{ Fun8 : has_professionals
    Fun1 ||--o{ RecordArc : reviewed_by_arc
    Fun1 ||--o{ RecordEng : reviewed_by_eng
    Fun1 ||--o{ RecordLaw : reviewed_by_law
    
    New_Pqrs ||--o{ New_Pqrs_Times : has_times
    New_Pqrs ||--o{ New_Pqrs_Files : has_files
    
    Submit ||--o{ SubmitFiles : has_files
    Submit ||--o{ SubmitTimes : has_times
    
    Nomenclature ||--o{ NomFiles : has_files
    
    Norms ||--o{ NormFiles : has_files
    Norms }o--|| ZoneUse : applies_to
    
    Holydays {
        int id
        date date
        string name
    }
    
    Users {
        int id
        string email
        string password
        string name
        string role
    }
    
    Fun1 {
        int id
        string rad_num
        date rad_date
        string status
    }
    
    New_Pqrs {
        int id
        string rad_num
        string type
        string status
    }
```

### Flujo de Estados FUN

```mermaid
stateDiagram-v2
    [*] --> Radicado: Usuario radica
    Radicado --> EnRevision: Asignar revisor
    EnRevision --> Observaciones: Requiere corrección
    Observaciones --> EnRevision: Usuario corrige
    EnRevision --> Aprobado: Revisor aprueba
    EnRevision --> Rechazado: Revisor rechaza
    Aprobado --> Ejecutoriado: Curador firma
    Ejecutoriado --> [*]
    Rechazado --> [*]
```

### Flujo de Estados PQRS

```mermaid
stateDiagram-v2
    [*] --> Recibido: Ciudadano radica
    Recibido --> EnTramite: Asignar responsable
    EnTramite --> Respondido: Generar respuesta
    Respondido --> Cerrado: Notificar ciudadano
    Cerrado --> [*]
    
    EnTramite --> Vencido: Tiempo excedido
    Vencido --> Respondido: Respuesta tardía
```
