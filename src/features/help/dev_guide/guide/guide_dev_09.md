# 9. Sistema de Revisiones Técnicas

Esta sección documenta el sistema de revisiones técnicas que evalúan cada trámite de licencia urbanística. El sistema incluye tres tipos de revisión principales: **Arquitectónica (ARC)**, **Estructural (ENG)** y **Jurídica (LAW)**.

---

## 9.1 Visión General del Sistema de Revisiones

El proceso de revisión sigue un flujo paralelo donde cada profesional evalúa aspectos específicos del proyecto de manera independiente, pero sincronizada.

### Diagrama de Flujo de Revisiones

```mermaid
flowchart TB
    subgraph Entrada["📥 Entrada del Trámite"]
        FUN[FUN Radicado]
        ASIGN[Asignación Profesionales]
    end
    
    subgraph Paralelo["🔄 Revisiones Paralelas"]
        direction LR
        subgraph ARC["🏗️ Revisión Arquitectónica"]
            A1[record_arc]
            A2[Cuadro de Áreas]
            A3[Parqueaderos]
            A4[NRS-10]
            A5[Espacio Público]
        end
        
        subgraph ENG["⚙️ Revisión Estructural"]
            E1[record_eng]
            E2[Análisis Sísmico]
            E3[Suelos]
            E4[Estructura]
        end
        
        subgraph LAW["⚖️ Revisión Jurídica"]
            L1[record_law]
            L2[Titularidad]
            L3[Profesionales]
            L4[Documentos]
        end
    end
    
    subgraph Salida["📤 Resultado"]
        RES[record_review]
        VIA{Viable?}
        EXP[Expedición]
        OBS[Observaciones]
    end
    
    FUN --> ASIGN
    ASIGN --> A1
    ASIGN --> E1
    ASIGN --> L1
    A1 --> A2 --> A3 --> A4 --> A5
    E1 --> E2 --> E3 --> E4
    L1 --> L2 --> L3 --> L4
    A5 --> RES
    E4 --> RES
    L4 --> RES
    RES --> VIA
    VIA -->|Sí| EXP
    VIA -->|No| OBS
```

### Estados de Viabilidad

| Estado | Descripción | Color |
|--------|-------------|-------|
| **VIABLE** | Cumple todos los requisitos | 🟢 Verde |
| **NO VIABLE** | Tiene observaciones pendientes | 🔴 Rojo |
| **PENDIENTE** | En proceso de revisión | 🟡 Amarillo |

---

## 9.2 Revisión Arquitectónica (record_arc)

La revisión arquitectónica evalúa el cumplimiento normativo del diseño, áreas, parqueaderos, espacio público y normas de sismo-resistencia.

### Diagrama ER - Revisión Arquitectónica

```mermaid
erDiagram
    record_arc ||--o{ record_arc_step : "tiene pasos"
    record_arc ||--o{ record_arc_33_area : "tiene áreas"
    record_arc ||--o{ record_arc_34_gens : "tiene normas"
    record_arc ||--o{ record_arc_34_k : "tiene índices"
    record_arc ||--o{ record_arc_35_parking : "tiene parqueaderos"
    record_arc ||--o{ record_arc_35_location : "tiene ubicaciones parqueo"
    record_arc ||--o{ record_arc_36_info : "tiene perfiles viales"
    record_arc ||--o{ record_arc_37 : "tiene carga ocupación"
    record_arc ||--o{ record_arc_38 : "tiene conclusiones"

    record_arc {
        int id PK
        int fun0Id FK
        string id_public "Identificador"
        int version "Versión"
        string worker_id "ID Arquitecto"
        string worker_name "Nombre Arquitecto"
        date date_asign "Fecha asignación"
        string worker_prev "Arquitecto anterior"
        text binnacle "Bitácora"
        string category "Categoría"
        string subcategory "Sub-categorías habilitadas"
    }

    record_arc_step {
        int id PK
        int recordArcId FK
        string id_public "ID del paso"
        int version "Versión"
        int check "Estado verificación"
        text value "Valores"
        text json "Datos JSON"
    }

    record_arc_33_area {
        int id PK
        int recordArcId FK
        string type "Tipo (area/blueprint)"
        string floor "Piso"
        string level "Nivel"
        string scale "Escala"
        string use "Uso"
        string category "Categoría"
        string build "Áreas construidas"
        string historic "Áreas históricas"
        string destroy "Áreas a demoler"
        int units "Unidades"
        int pos "Posición"
    }

    record_arc_35_parking {
        int id PK
        int recordArcId FK
        string use "Uso"
        string name "Nombre"
        string type "Tipo parqueadero"
        string norm "Norma exigida"
        string norm_value "Valor norma"
        string project "Proyecto"
        int check "Verificación"
        int pos "Posición"
    }

    record_arc_36_info {
        int id PK
        int recordArcId FK
        string name "Elementos del perfil"
        string parent "Perfil padre"
        string norm "Norma"
        string project "Proyecto"
        string check "Verificación"
        string address "Dirección"
        string side "Costado"
    }

    record_arc_37 {
        int id PK
        int recordArcId FK
        string name "Nombre espacio"
        string main_group "Grupo principal NRS-10"
        string sub_group "Sub-grupo"
        string index "Índice ocupación"
        string anet "Área neta"
        string real "Ocupación real"
        int check "Verificación"
    }

    record_arc_38 {
        int id PK
        int recordArcId FK
        int version "Versión"
        text detail "Observaciones"
        string worker_id "ID revisor"
        string worker_name "Nombre revisor"
        int check "Resultado"
        date date "Fecha"
    }
```

### Subcategorías de Revisión Arquitectónica

El campo `subcategory` define qué secciones de revisión están habilitadas:

| Índice | Subcategoría | Descripción |
|--------|--------------|-------------|
| 0 | URBANAS | Determinantes urbanísticas |
| 1 | PARKING | Parqueaderos |
| 2 | PUBLIC SPACE | Espacio público |
| 3 | NSR10 | Norma sismo-resistente |

### Pasos de Revisión (record_arc_step)

Los pasos se identifican por `id_public`:

| ID Público | Descripción |
|------------|-------------|
| `a_config` | Configuración general |
| `s33` | Cuadro de áreas |
| `s34` | Determinantes urbanísticas |
| `s35` | Parqueaderos |
| `s36` | Espacio público |
| `s37` | NRS-10 |
| `rar_0` - `rar_16` | Revisiones alternativas |

### Flujo de Revisión Arquitectónica

```mermaid
sequenceDiagram
    participant ARQ as Arquitecto
    participant SYS as Sistema
    participant ARC as record_arc
    participant PDF as PDFGen
    
    ARQ->>SYS: Acceder a revisión
    SYS->>ARC: Cargar datos
    ARC-->>ARQ: Mostrar formulario
    
    loop Por cada sección
        ARQ->>ARC: Evaluar cumplimiento
        ARQ->>ARC: Agregar observaciones
        ARC-->>SYS: Guardar step
    end
    
    ARQ->>SYS: Marcar viabilidad
    SYS->>ARC: Actualizar record_arc_38
    SYS->>PDF: Generar informe
    PDF-->>ARQ: Descargar PDF
```

---

## 9.3 Revisión Estructural (record_eng)

La revisión estructural evalúa el cumplimiento de la normativa sismo-resistente, estudios de suelos y diseño estructural.

### Diagrama ER - Revisión Estructural

```mermaid
erDiagram
    record_eng ||--o{ record_eng_step : "tiene pasos"
    record_eng ||--o{ record_eng_sismic : "tiene análisis sísmico"
    record_eng ||--o{ record_eng_review : "tiene revisiones"

    record_eng {
        int id PK
        int fun0Id FK
        string id_public "Identificador"
        int version "Versión"
        string worker_id "ID Ingeniero"
        string worker_name "Nombre Ingeniero"
        date date_asign "Fecha asignación"
        string worker_prev "Ingeniero anterior"
        text binnacle "Bitácora"
        string category "Categoría"
    }

    record_eng_step {
        int id PK
        int recordEngId FK
        string id_public "ID del paso"
        int version "Versión"
        int check "Estado verificación"
        text value "Valores"
        text json "Datos JSON"
    }

    record_eng_sismic {
        int id PK
        int recordEngId FK
        string zone "Zona sísmica"
        string coef_aa "Coef. aceleración"
        string coef_av "Coef. velocidad"
        string soil_type "Tipo de suelo"
        string importance "Importancia"
        string system "Sistema estructural"
        int check "Verificación"
    }

    record_eng_review {
        int id PK
        int recordEngId FK
        int version "Versión"
        text detail "Observaciones"
        string worker_id "ID revisor"
        string worker_name "Nombre revisor"
        int check "Resultado"
        date date "Fecha"
    }
```

### Parámetros Sísmicos (record_eng_sismic)

| Campo | Descripción | Valores Ejemplo |
|-------|-------------|-----------------|
| `zone` | Zona de amenaza sísmica | Alta, Intermedia, Baja |
| `coef_aa` | Coeficiente de aceleración | 0.15, 0.20, 0.25 |
| `coef_av` | Coeficiente de velocidad | 0.10, 0.15, 0.20 |
| `soil_type` | Clasificación del suelo | A, B, C, D, E, F |
| `importance` | Grupo de importancia | I, II, III, IV |
| `system` | Sistema estructural | Pórticos, Muros, Dual |

### Flujo de Revisión Estructural

```mermaid
flowchart TB
    subgraph Entrada["📥 Documentos de Entrada"]
        D1[Planos Estructurales]
        D2[Memorias de Cálculo]
        D3[Estudio de Suelos]
        D4[Planos Fundaciones]
    end
    
    subgraph Revisión["🔍 Proceso de Revisión"]
        R1[Verificar Profesionales]
        R2[Validar Parámetros Sísmicos]
        R3[Revisar Sistema Estructural]
        R4[Verificar Cimentación]
        R5[Evaluar NSR-10]
    end
    
    subgraph Salida["📤 Resultado"]
        S1[record_eng_review]
        S2{Viable?}
        S3[Aprobar]
        S4[Observar]
    end
    
    D1 --> R1
    D2 --> R2
    D3 --> R3
    D4 --> R4
    R1 --> R5
    R2 --> R5
    R3 --> R5
    R4 --> R5
    R5 --> S1
    S1 --> S2
    S2 -->|Sí| S3
    S2 -->|No| S4
```

---

## 9.4 Revisión Jurídica (record_law)

La revisión jurídica verifica la titularidad del predio, legitimación de los solicitantes, documentación legal y cumplimiento de requisitos normativos.

### Diagrama ER - Revisión Jurídica

```mermaid
erDiagram
    record_law ||--o{ record_law_step : "tiene pasos"
    record_law ||--o{ record_law_gen : "tiene información general"
    record_law ||--o{ record_law_doc : "tiene documentos"
    record_law ||--o{ record_law_review : "tiene revisiones"
    record_law ||--o{ record_law_11_liberty : "tiene cert. libertad"
    record_law ||--o{ record_law_11_tax : "tiene cert. catastral"
    record_law ||--o{ record_law_licence : "tiene licencias"

    record_law {
        int id PK
        int fun0Id FK
        string id_public "Identificador"
        int version "Versión"
        string worker_id "ID Abogado"
        string worker_name "Nombre Abogado"
        date date_asign "Fecha asignación"
        string worker_prev "Abogado anterior"
        text binnacle "Bitácora"
        string category "Categoría"
    }

    record_law_step {
        int id PK
        int recordLawId FK
        string id_public "ID del paso"
        int version "Versión"
        int check "Estado verificación"
        text value "Valores"
        text json "Datos JSON"
    }

    record_law_gen {
        int id PK
        int recordLawId FK
        int version "Versión"
        date date "Fecha"
        string id_public "ID público"
        string type "Tipo"
        string id_6 "ID archivo"
        string class "Clasificación"
    }

    record_law_doc {
        int id PK
        int recordLawId FK
        int version "Versión"
        text docs "Documentos base"
        string docs_id6 "IDs archivos"
        text docs_14 "Art. 14"
        text docs_16 "Art. 16"
        text docs_23 "Art. 23"
        text docs_sign "Firmas"
        text corrections "Correcciones"
    }

    record_law_11_liberty {
        int id PK
        int recordLawId FK
        string id_public "Número matrícula"
        date date "Fecha expedición"
        string address "Dirección"
        string boundary "Linderos m2"
        string subject "Titulares"
        string subject_id "CC/NIT titulares"
        text desc "Observaciones"
        string predial "Código predial"
    }

    record_law_11_tax {
        int id PK
        int recordLawId FK
        string id_public "Número documento"
        date date "Fecha"
        string address "Dirección"
        string predial "Código predial"
        string strata "Estrato"
        string destiny "Destinación"
        string type "Tipo documento"
    }

    record_law_licence {
        int id PK
        int recordLawId FK
        string id_public "Número licencia"
        date date_a "Fecha expedición"
        date date_b "Fecha vencimiento"
        string type "Tipo licencia"
        string category "Categoría"
        string id_6 "ID archivo"
        int check "Verificación"
        int active "Activo"
    }
```

### Pasos de Revisión Jurídica

| ID Público | Sección | Descripción |
|------------|---------|-------------|
| `s1` | Inventario | Documentación aportada |
| `s23` | FUN | Formulario Único Nacional |
| `s24` | Predio | Información del predio |
| `f51` | Titulares | Verificación titulares |
| `f52` | Profesionales | Verificación profesionales |
| `f53` | Solicitante | Responsable solicitud |
| `sc1` | Cert. Libertad | Certificado de tradición |
| `sc2` | Cert. Catastral | Boletín catastral |
| `flaw` | Publicidad | Valla informativa |

### Flujo de Revisión Jurídica

```mermaid
sequenceDiagram
    participant ABG as Abogado
    participant SYS as Sistema
    participant LAW as record_law
    participant CERT as Certificados
    
    ABG->>SYS: Acceder a revisión
    SYS->>LAW: Cargar expediente
    
    rect rgb(240, 248, 255)
        Note over ABG,CERT: Verificación Documental
        ABG->>CERT: Revisar Cert. Libertad
        CERT-->>ABG: Validar titularidad
        ABG->>CERT: Revisar Cert. Catastral
        CERT-->>ABG: Validar dirección
    end
    
    rect rgb(255, 248, 240)
        Note over ABG,LAW: Verificación FUN
        ABG->>LAW: Verificar titulares (f51)
        ABG->>LAW: Verificar profesionales (f52)
        ABG->>LAW: Verificar solicitante (f53)
    end
    
    ABG->>LAW: Registrar conclusiones
    LAW-->>SYS: Actualizar viabilidad
    SYS-->>ABG: Mostrar resultado
```

### Verificaciones del Certificado de Libertad

La tabla `record_law_11_liberty` permite verificar:

```mermaid
flowchart LR
    subgraph Certificado["📜 Cert. Libertad y Tradición"]
        C1[Matrícula Inmobiliaria]
        C2[Fecha Expedición]
        C3[Linderos y Áreas]
        C4[Titulares Dominio]
    end
    
    subgraph Verificaciones["✅ Puntos de Control"]
        V1[Vigencia < 30 días]
        V2[BIC o Utilidad Pública]
        V3[Litigios o Embargos]
        V4[Régimen P.H.]
        V5[Coincidencia FUN]
    end
    
    C1 --> V5
    C2 --> V1
    C3 --> V5
    C4 --> V2
    C4 --> V3
    C4 --> V4
```

---

## 9.5 Registro Consolidado (record_review)

El modelo `record_review` consolida el resultado de todas las revisiones:

```mermaid
erDiagram
    fun_0 ||--|| record_review : "tiene"
    
    record_review {
        int id PK
        int fun0Id FK
        date date "Fecha Rev. 1"
        date date_2 "Fecha Rev. 2"
        int arc_check "Viabilidad ARQ"
        int eng_check "Viabilidad ENG"
        int law_check "Viabilidad LAW"
        string arc_worker "Revisor ARQ"
        string eng_worker "Revisor ENG"
        string law_worker "Revisor LAW"
        int final_check "Viabilidad Final"
    }
```

### Matriz de Viabilidad

| ARQ | ENG | LAW | Resultado Final |
|-----|-----|-----|-----------------|
| ✅ | ✅ | ✅ | **VIABLE** |
| ✅ | ✅ | ❌ | NO VIABLE |
| ✅ | ❌ | ✅ | NO VIABLE |
| ❌ | ✅ | ✅ | NO VIABLE |
| ❌ | ❌ | ❌ | NO VIABLE |
| ⏳ | ⏳ | ⏳ | PENDIENTE |

---

## 9.6 Generación de Informes PDF

Cada revisión puede generar un informe PDF detallado mediante el endpoint correspondiente.

### Endpoint de Generación

| Revisión | Endpoint | Descripción |
|----------|----------|-------------|
| ARQ | `POST /api/record_arc/pdfgen` | Informe arquitectónico |
| ENG | `POST /api/record_eng/pdfgen` | Informe estructural |
| LAW | `POST /api/record_law/pdfgen` | Informe jurídico |

### Parámetros del Informe

```javascript
// POST /api/record_arc/pdfgen
{
    "id": 12345,           // ID del FUN
    "version": 1,          // Versión del informe
    "type_rev": 1,         // 1=Observaciones, 2=Correcciones
    "header": "1",         // Incluir encabezado
    "r_worker": "Arq. Revisor",
    "r_check": "VIABLE",   // o "NO VIABLE"
    "r_date": "2024-01-20",
    "r_arc_pending": "false"
}
```

### Estructura del PDF Generado

```mermaid
flowchart TB
    subgraph Header["📄 Encabezado"]
        H1[Logo Curaduría]
        H2[Número Radicado]
        H3[Tipo de Informe]
    end
    
    subgraph Info["📋 Información General"]
        I1[Profesional Responsable]
        I2[Control de Revisión]
        I3[Fechas]
    end
    
    subgraph Evaluacion["📊 Evaluación"]
        E1[Cuadro de Áreas]
        E2[Determinantes Urbanísticas]
        E3[Parqueaderos]
        E4[Espacio Público]
        E5[NRS-10]
    end
    
    subgraph Conclusion["✍️ Conclusión"]
        C1[Observaciones]
        C2[Resultado]
        C3[Firma Digital]
    end
    
    Header --> Info --> Evaluacion --> Conclusion
```

---

## 9.7 API de Revisiones

### Endpoints record_arc

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/record_arc` | Listar todos |
| `GET` | `/api/record_arc/single/:id` | Obtener por FUN ID |
| `GET` | `/api/record_arc/steps/:id` | Obtener pasos |
| `POST` | `/api/record_arc` | Crear registro |
| `PUT` | `/api/record_arc/:id` | Actualizar registro |
| `POST` | `/api/record_arc/step` | Crear paso |
| `PUT` | `/api/record_arc/step/:id` | Actualizar paso |
| `POST` | `/api/record_arc/33area` | Crear área |
| `PUT` | `/api/record_arc/33area/:id` | Actualizar área |
| `POST` | `/api/record_arc/35parking` | Crear parqueadero |
| `PUT` | `/api/record_arc/35parking/:id` | Actualizar parqueadero |
| `POST` | `/api/record_arc/pdfgen` | Generar PDF |

### Endpoints record_law

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/record_law` | Listar todos |
| `GET` | `/api/record_law/single/:id` | Obtener por FUN ID |
| `POST` | `/api/record_law` | Crear registro |
| `PUT` | `/api/record_law/:id` | Actualizar registro |
| `POST` | `/api/record_law/step` | Crear paso |
| `PUT` | `/api/record_law/step/:id` | Actualizar paso |
| `POST` | `/api/record_law/11liberty` | Crear cert. libertad |
| `PUT` | `/api/record_law/11liberty/:id` | Actualizar cert. |
| `POST` | `/api/record_law/licence` | Crear licencia |
| `PUT` | `/api/record_law/licence/:id` | Actualizar licencia |
| `POST` | `/api/record_law/pdfgen` | Generar PDF |

---

## 9.8 Consideraciones de Implementación

### Versionamiento

Cada revisión mantiene un historial de versiones:

```javascript
// Al crear nueva versión
const nuevaVersion = versionActual + 1;

// Los steps se filtran por versión
const steps = await record_arc_step.findAll({
    where: { 
        recordArcId: arcId,
        version: version 
    }
});
```

### Bitácora de Cambios

El campo `binnacle` almacena un registro de cambios:

```javascript
// Formato de bitácora
const entradaBitacora = JSON.stringify({
    fecha: new Date(),
    usuario: userId,
    accion: "Actualización de áreas",
    detalle: "Modificado cuadro de áreas piso 3"
});

// Agregar a bitácora existente
record.binnacle = record.binnacle 
    ? record.binnacle + ";" + entradaBitacora 
    : entradaBitacora;
```

### Reasignación de Profesional

```javascript
// Al reasignar profesional
await record_arc.update({
    worker_prev: record.worker_id,  // Guardar anterior
    worker_id: nuevoWorkerId,
    worker_name: nuevoWorkerName,
    date_asign: new Date()
}, { where: { id: recordId } });
```

### Validación de Completitud

Antes de marcar como viable, se verifica que todos los pasos requeridos estén completos:

```mermaid
flowchart TD
    START[Solicitar Viabilidad]
    
    CHECK1{Áreas completas?}
    CHECK2{Parqueos verificados?}
    CHECK3{Perfiles revisados?}
    CHECK4{NRS-10 evaluado?}
    
    FAIL[Mostrar pendientes]
    SUCCESS[Marcar VIABLE]
    
    START --> CHECK1
    CHECK1 -->|No| FAIL
    CHECK1 -->|Sí| CHECK2
    CHECK2 -->|No| FAIL
    CHECK2 -->|Sí| CHECK3
    CHECK3 -->|No| FAIL
    CHECK3 -->|Sí| CHECK4
    CHECK4 -->|No| FAIL
    CHECK4 -->|Sí| SUCCESS
```
