# 8. Sistema de Licencias y Asignación

Esta sección documenta el sistema de gestión de licencias urbanísticas, incluyendo la estructura del Formulario Único Nacional (FUN), el proceso de asignación a profesionales y el control temporal de los trámites.

---

## 8.1 Estructura del Sistema FUN

El **FUN (Formulario Único Nacional)** es la entidad central que representa una solicitud de licencia urbanística. La estructura se compone de un registro maestro (`fun_0`) y múltiples tablas relacionadas que almacenan información específica del trámite.

### Diagrama de Entidades FUN

```mermaid
erDiagram
    fun_0 ||--o{ fun_1 : "tiene versiones"
    fun_0 ||--|| fun_2 : "tiene predio"
    fun_0 ||--o{ fun_3 : "tiene direcciones"
    fun_0 ||--o{ fun_4 : "tiene coordenadas"
    fun_0 ||--o{ fun_51 : "tiene titulares"
    fun_0 ||--o{ fun_52 : "tiene profesionales"
    fun_0 ||--|{ fun_53 : "tiene solicitante"
    fun_0 ||--o{ fun_c : "tiene checks"
    fun_0 ||--o{ fun_r : "tiene documentos"
    fun_0 ||--|| fun_law : "tiene control legal"
    fun_0 ||--o{ fun_clock : "tiene estados tiempo"

    fun_0 {
        int id PK
        string id_public "Radicado público"
        int state "Estado del trámite"
        date date "Fecha de creación"
        string type "Tipo (i,ii,iii,iv,oa)"
        int model "Modelo de formulario"
        text schedule_config "Configuración"
    }

    fun_1 {
        int id PK
        int fun0Id FK
        int version "Versión del formulario"
        string tipo "Tipo trámite (A,B,C,D,E,F,G)"
        string tramite "Objeto del trámite"
        string m_urb "Modalidad urbanización"
        string m_sub "Modalidad subdivisión"
        string m_lic "Modalidad licencia"
        string usos "Usos solicitados"
    }

    fun_2 {
        int id PK
        int fun0Id FK
        string direccion "Dirección predio"
        string matricula "Matrícula inmobiliaria"
        string catastral "Código catastral"
        string barrio "Barrio"
        int estrato "Estrato"
        string suelo "Clasificación suelo"
    }

    fun_c {
        int id PK
        int fun0Id FK
        int version "Versión"
        date date "Fecha control"
        int condition "Condición"
        string worker "Trabajador"
        string reciever_name "Receptor"
        date reciever_date "Fecha recepción"
        date legal_date "Fecha legal"
    }

    fun_clock {
        int id PK
        int fun0Id FK
        string name "Nombre estado"
        date date_start "Fecha inicio"
        int state "Código estado"
        string resolver_id6 "ID documento"
        int resolver_status "Estado resolución"
    }
```

### Tipos de Trámite

El campo `fun_1.tipo` define el tipo de actuación urbanística:

| Código | Tipo de Licencia |
|--------|------------------|
| **A** | Urbanización |
| **B** | Parcelación |
| **C** | Subdivisión |
| **D** | Construcción |
| **E** | Intervención y Ocupación del Espacio Público |
| **F** | Reconocimiento de Edificaciones |
| **G** | Otras Actuaciones |

### Categorías por Complejidad

El campo `fun_0.type` clasifica el trámite por complejidad:

| Categoría | Días Hábiles | Descripción |
|-----------|--------------|-------------|
| **i** | 20 | Proyecto simple |
| **ii** | 25 | Proyecto medio |
| **iii** | 35 | Proyecto complejo |
| **iv** | 45 | Proyecto muy complejo |
| **oa** | 15 | Otras actuaciones |

---

## 8.2 Sistema de Control Temporal (fun_clock)

El modelo `fun_clock` registra todos los estados temporales del trámite, permitiendo calcular tiempos legales, suspensiones y vencimientos.

### Diagrama de Estados del Trámite

```mermaid
flowchart TB
    subgraph Radicación
        S0[Estado 0: Borrador]
        S1[Estado 1: Pre-radicación]
        S5[Estado 5: Radicación Legal]
    end
    
    subgraph Revisión
        S10[Estado 10: En Revisión]
        S20[Estado 20: Revisión ARQ]
        S21[Estado 21: Revisión ENG]
        S22[Estado 22: Revisión LAW]
    end
    
    subgraph Control
        S32[Estado 32: Requerimiento]
        S33[Estado 33: Correcciones]
        S34[Estado 34: Prórroga]
    end
    
    subgraph Resolución
        S40[Estado 40: En Expedición]
        S50[Estado 50: Resuelto]
        S60[Estado 60: Desistido]
        S65[Estado 65: Deberes Urbanísticos]
    end
    
    S0 --> S1
    S1 --> S5
    S5 --> S10
    S10 --> S20
    S10 --> S21
    S10 --> S22
    S20 --> S32
    S21 --> S32
    S22 --> S32
    S32 --> S33
    S33 --> S34
    S34 --> S40
    S32 --> S40
    S40 --> S50
    S40 --> S60
    S50 --> S65
```

### Campos Críticos de Tiempo

| Campo | Descripción | Uso |
|-------|-------------|-----|
| `date_start` | Fecha de inicio del estado | Cálculo de tiempos |
| `state` | Código numérico del estado | Identificación |
| `resolver_id6` | ID del documento asociado | Trazabilidad |
| `resolver_status` | Estado de la resolución | Seguimiento |
| `resolver_context` | Contexto adicional | Metadatos |

### Cálculo de Fecha Límite

El sistema calcula la fecha de desistimiento basándose en:

```javascript
// Tiempo base según categoría
const tiempoRevision = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };

// Si hay requerimiento (estado 32/33)
if (estado32 || estado33) {
    const diasProrroga = estado34 ? 45 : 30;
    fechaLimite = calcularDiasHabiles(fechaRequerimiento, diasProrroga);
} else {
    fechaLimite = calcularDiasHabiles(fechaRadicacion, tiempoRevision[tipo]);
}
```

---

## 8.3 Sistema de Asignación a Profesionales

Cada trámite puede ser asignado a diferentes profesionales según el tipo de revisión requerida. El patrón de asignación es consistente en todos los módulos `record_*`.

### Diagrama de Asignación

```mermaid
flowchart LR
    subgraph FUN["📋 FUN (fun_0)"]
        F0[Trámite Radicado]
    end
    
    subgraph Asignaciones["🔄 Sistema de Asignación"]
        A1[Asignar Arquitecto]
        A2[Asignar Ingeniero]
        A3[Asignar Abogado]
    end
    
    subgraph Registros["📊 Registros de Revisión"]
        R1[record_arc]
        R2[record_eng]
        R3[record_law]
    end
    
    F0 --> A1
    F0 --> A2
    F0 --> A3
    A1 --> R1
    A2 --> R2
    A3 --> R3
```

### Estructura de Asignación (Común a todos los records)

Cada registro de revisión (`record_arc`, `record_eng`, `record_law`) comparte la siguiente estructura de asignación:

```mermaid
erDiagram
    record_base {
        int id PK
        int fun0Id FK "Relación con FUN"
        string id_public "Identificador público"
        int version "Versión del registro"
        string worker_id "ID del trabajador asignado"
        string worker_name "Nombre del trabajador"
        date date_asign "Fecha de asignación"
        string worker_prev "Trabajador anterior"
        text binnacle "Bitácora de cambios"
        string category "Categoría de revisión"
    }
```

### Flujo de Asignación

```mermaid
sequenceDiagram
    participant Admin as Administrador
    participant Sistema as Sistema DOVELA
    participant Record as record_*
    participant Worker as Profesional
    
    Admin->>Sistema: Seleccionar trámite
    Sistema->>Sistema: Verificar disponibilidad
    Admin->>Sistema: Asignar profesional
    Sistema->>Record: Crear/Actualizar registro
    Record-->>Record: Guardar worker_prev
    Record-->>Record: Actualizar worker_id
    Record-->>Record: Registrar date_asign
    Sistema->>Worker: Notificar asignación
    Worker->>Sistema: Iniciar revisión
```

---

## 8.4 Control de Documentos (fun_c y fun_r)

### Modelo fun_c (Control de Checks)

El modelo `fun_c` registra los puntos de control documental del trámite:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `version` | int | Versión del control |
| `date` | date | Fecha del control |
| `condition` | int | Condición (0=Rechazado, 1=Aprobado, 2=N/A) |
| `worker` | string | Trabajador que realizó el control |
| `reciever_name` | string | Nombre del receptor |
| `reciever_date` | date | Fecha de recepción |
| `legal_date` | date | Fecha legal válida |

### Modelo fun_r (Documentos Radicados)

```mermaid
erDiagram
    fun_0 ||--o{ fun_r : "tiene"
    
    fun_r {
        int id PK
        int fun0Id FK
        int version "Versión"
        string code "Códigos de documentos"
        string checked "Estado de documentos"
        string review "Revisión de documentos"
        string id_6 "IDs de archivos"
    }
```

El campo `code` almacena códigos de documentos separados por comas (ej: `"511,512,513,516"`), mientras que `checked` indica el estado de cada documento (`0`=No aportado, `1`=Aportado, `2`=N/A).

---

## 8.5 Control Legal (fun_law)

El modelo `fun_law` almacena información específica del control jurídico del trámite:

```mermaid
erDiagram
    fun_0 ||--|| fun_law : "tiene"
    
    fun_law {
        int id PK
        int fun0Id FK
        string sign "Firma y valla informativa"
        string publish_neighbour "Publicación a vecinos"
        float cub_1 "Área construida 1"
        float cub_2 "Área construida 2"
        float cub_3 "Área construida 3"
        float cub_4 "Área construida 4"
        float cub_5 "Área construida 5"
        int cub_p "Parqueaderos"
        float cub_area "Área total"
        int cub_unidades "Unidades"
    }
```

### Campos de Áreas (cub_*)

| Campo | Descripción |
|-------|-------------|
| `cub_1` | Área construida primer piso |
| `cub_2` | Área pisos superiores |
| `cub_3` | Área sótanos |
| `cub_4` | Área equipamentos |
| `cub_5` | Área zonas comunes |
| `cub_p` | Número de parqueaderos |
| `cub_area` | Área total calculada |
| `cub_unidades` | Total de unidades |

---

## 8.6 Licencias Expedidas (record_law_licence)

El modelo `record_law_licence` registra las licencias efectivamente expedidas para un trámite:

```mermaid
erDiagram
    record_law ||--o{ record_law_licence : "tiene"
    
    record_law_licence {
        int id PK
        int recordLawId FK
        string id_public "Número de licencia"
        date date_a "Fecha de expedición"
        date date_b "Fecha de vencimiento"
        string type "Tipo de licencia"
        string category "Categoría"
        string id_6 "ID del archivo"
        int check "Estado verificación"
        int active "Activo (1=Sí, 0=No)"
    }
```

### Flujo de Expedición de Licencia

```mermaid
flowchart TB
    subgraph Revisión["✅ Revisiones Completas"]
        R1[ARQ Viable]
        R2[ENG Viable]
        R3[LAW Viable]
    end
    
    subgraph Expedición["📄 Expedición"]
        E1[Generar Resolución]
        E2[Firmar Curador]
        E3[Crear Licencia]
    end
    
    subgraph Registro["💾 Registro"]
        L1[record_law_licence]
        L2[Asignar número]
        L3[Definir vigencia]
    end
    
    R1 --> E1
    R2 --> E1
    R3 --> E1
    E1 --> E2
    E2 --> E3
    E3 --> L1
    L1 --> L2
    L2 --> L3
```

### Tipos de Licencia

El campo `type` puede contener valores como:

| Tipo | Descripción |
|------|-------------|
| `URB` | Licencia de Urbanización |
| `PAR` | Licencia de Parcelación |
| `SUB` | Licencia de Subdivisión |
| `CON` | Licencia de Construcción |
| `REC` | Reconocimiento de Edificación |
| `MOD` | Modificación de Licencia |
| `PRO` | Prórroga de Licencia |

---

## 8.7 Relación Completa del Sistema

El siguiente diagrama muestra la relación completa entre FUN y los sistemas de revisión:

```mermaid
erDiagram
    fun_0 ||--|| record_arc : "tiene revisión arquitectónica"
    fun_0 ||--|| record_eng : "tiene revisión estructural"
    fun_0 ||--|| record_law : "tiene revisión jurídica"
    fun_0 ||--|| record_ph : "tiene planos horizontales"
    fun_0 ||--|| record_review : "tiene resumen revisión"
    
    record_arc ||--o{ record_arc_step : "tiene pasos"
    record_arc ||--o{ record_arc_33_area : "tiene áreas"
    record_arc ||--o{ record_arc_35_parking : "tiene parqueos"
    record_arc ||--o{ record_arc_38 : "tiene conclusiones"
    
    record_eng ||--o{ record_eng_step : "tiene pasos"
    record_eng ||--o{ record_eng_sismic : "tiene análisis sísmico"
    record_eng ||--o{ record_eng_review : "tiene revisiones"
    
    record_law ||--o{ record_law_step : "tiene pasos"
    record_law ||--o{ record_law_gen : "tiene información general"
    record_law ||--o{ record_law_doc : "tiene documentos"
    record_law ||--o{ record_law_licence : "tiene licencias"
    record_law ||--o{ record_law_11_liberty : "tiene libertad"
    record_law ||--o{ record_law_11_tax : "tiene impuestos"

    fun_0 {
        int id PK
        string id_public
        int state
        string type
    }
    
    record_arc {
        int id PK
        int fun0Id FK
        string worker_id
        string worker_name
        date date_asign
    }
    
    record_eng {
        int id PK
        int fun0Id FK
        string worker_id
        string worker_name
        date date_asign
    }
    
    record_law {
        int id PK
        int fun0Id FK
        string worker_id
        string worker_name
        date date_asign
    }
```

---

## 8.8 API de Asignación y Licencias

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/record_arc` | Crear registro arquitectónico |
| `PUT` | `/api/record_arc/:id` | Actualizar asignación ARQ |
| `POST` | `/api/record_eng` | Crear registro estructural |
| `PUT` | `/api/record_eng/:id` | Actualizar asignación ENG |
| `POST` | `/api/record_law` | Crear registro jurídico |
| `PUT` | `/api/record_law/:id` | Actualizar asignación LAW |
| `POST` | `/api/record_law/licence` | Crear licencia |
| `PUT` | `/api/record_law/licence/:id` | Actualizar licencia |

### Ejemplo de Asignación

```javascript
// POST /api/record_arc
{
    "fun0Id": 12345,
    "id_public": "ARC-2024-001",
    "version": 1,
    "worker_id": "USER001",
    "worker_name": "Arquitecto Revisor",
    "date_asign": "2024-01-15",
    "worker_prev": null
}
```

### Ejemplo de Creación de Licencia

```javascript
// POST /api/record_law/licence
{
    "recordLawId": 5678,
    "id_public": "LC-2024-0123",
    "date_a": "2024-02-01",
    "date_b": "2027-02-01",
    "type": "CON",
    "category": "Construcción Nueva",
    "check": 1,
    "active": 1
}
```
