# Sistema de Generación de Alarmas

## Descripción General

El sistema de alarmas de Dovela está diseñado para notificar a los usuarios sobre fechas límite importantes en los procesos de curaduría. Las alarmas se generan automáticamente basándose en las etapas (`Steps`) del proceso y sus fechas límite asociadas.

## Arquitectura del Sistema

### Componentes Principales

1. **Modelo de Datos (`Step`)**
   - Cada etapa contiene información sobre fechas límite
   - Las fechas se almacenan en el campo `deadline` o similar
   - Relación con el proceso principal de curaduría

2. **Motor de Clasificación**
   - Calcula días restantes hasta la fecha límite
   - Asigna clasificación según rangos configurados
   - Actualiza el estado de las alarmas en tiempo real

3. **Sistema de Notificaciones**
   - Muestra alarmas en la interfaz de usuario
   - Filtra alarmas según su estado y clasificación
   - Permite configuración de rangos personalizados

## Clasificación de Alarmas

### Niveles de Severidad

El sistema utiliza cuatro niveles de clasificación basados en la proximidad temporal:

#### 🟢 Verde (Temprano/Seguro)
- **Condición**: Días restantes > Rango Amarillo
- **Significado**: Hay tiempo suficiente, no requiere acción inmediata
- **Comportamiento**: Alarma informativa, baja prioridad
- **Ejemplo**: Faltan 30 días para la fecha límite

#### 🟡 Amarillo (Advertencia)
- **Condición**: Rango Naranja < Días restantes ≤ Rango Amarillo
- **Significado**: Se acerca la fecha, requiere atención
- **Comportamiento**: Alarma preventiva, prioridad media
- **Ejemplo**: Faltan 15 días para la fecha límite

#### 🟠 Naranja (Urgente)
- **Condición**: 0 < Días restantes ≤ Rango Naranja
- **Significado**: Fecha muy próxima, acción inmediata
- **Comportamiento**: Alarma urgente, alta prioridad
- **Ejemplo**: Faltan 5 días para la fecha límite

#### 🔴 Rojo (Vencido)
- **Condición**: Días restantes ≤ 0
- **Significado**: Fecha límite superada
- **Comportamiento**: Alarma crítica, requiere justificación
- **Ejemplo**: La fecha límite fue hace 2 días

## Proceso de Generación

### Flujo de Generación

```
1. Inicio del Proceso
   ↓
2. Obtener Etapas con Fechas Límite
   ↓
3. Para cada Etapa:
   ├─→ Calcular días restantes
   ├─→ Determinar clasificación
   ├─→ Verificar si debe mostrarse
   └─→ Generar objeto de alarma
   ↓
4. Filtrar Alarmas Visibles
   ↓
5. Ordenar por Prioridad/Fecha
   ↓
6. Renderizar en UI
```

### Algoritmo de Clasificación

```typescript
function clasificarAlarma(diasRestantes: number, rangos: Rangos): Clasificacion {
  if (diasRestantes <= 0) {
    return 'VENCIDO'; // 🔴 Rojo
  } else if (diasRestantes <= rangos.naranja) {
    return 'URGENTE'; // 🟠 Naranja
  } else if (diasRestantes <= rangos.amarillo) {
    return 'ADVERTENCIA'; // 🟡 Amarillo
  } else {
    return 'TEMPRANO'; // 🟢 Verde
  }
}
```

### Cálculo de Días Restantes

```typescript
function calcularDiasRestantes(fechaLimite: Date): number {
  const hoy = new Date();
  const diferencia = fechaLimite.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}
```

## Configuración de Rangos

### Rangos por Defecto

```typescript
const RANGOS_DEFAULT = {
  amarillo: 20,  // Días antes de mostrar advertencia
  naranja: 7,    // Días antes de mostrar urgencia
  // Rojo: automático cuando diasRestantes <= 0
};
```

### Personalización

Los rangos pueden configurarse:
- **Por usuario**: Preferencias personales
- **Por tipo de proceso**: Diferentes tiempos según el procedimiento
- **Por etapa**: Rangos específicos para etapas críticas

## Reglas de Negocio

### 1. Visibilidad de Alarmas

- Las alarmas **verdes** pueden ocultarse opcionalmente
- Las alarmas **amarillas** se muestran como recordatorios
- Las alarmas **naranjas** se destacan visualmente
- Las alarmas **rojas** son siempre visibles y prioritarias

### 2. Priorización

Orden de prioridad (de mayor a menor):
1. Vencido (Rojo)
2. Urgente (Naranja)
3. Advertencia (Amarillo)
4. Temprano (Verde)

### 3. Agrupación

Las alarmas pueden agruparse por:
- **Proceso**: Todas las alarmas de un expediente
- **Etapa**: Alarmas de una fase específica
- **Clasificación**: Todas las alarmas rojas, naranjas, etc.

## Relaciones con el Proceso de Curaduría

### Integración con Etapas

- Cada **etapa del proceso** puede tener múltiples fechas límite
- Las alarmas respetan la **jerarquía del proceso**
- Los **cambios en etapas** actualizan automáticamente las alarmas

### Relaciones Legales

- Las fechas límite están vinculadas a **requisitos legales**
- Las alarmas reflejan **obligaciones normativas**
- El sistema mantiene **trazabilidad** de notificaciones

### Acciones Derivadas

Cuando una alarma se activa:
1. Se notifica al usuario responsable
2. Se registra en el historial del proceso
3. Puede disparar workflows automáticos
4. Se actualiza el dashboard de gestión

## Casos de Uso

### Caso 1: Nueva Etapa con Fecha Límite

```
Usuario crea etapa → Sistema calcula días restantes →
Clasifica alarma → Programa notificaciones →
Muestra en dashboard
```

### Caso 2: Actualización de Fecha

```
Usuario modifica fecha → Recalcula clasificación →
Actualiza alarmas existentes → Notifica cambios
```

### Caso 3: Vencimiento de Plazo

```
Pasa fecha límite → Alarma cambia a ROJO →
Notificación prioritaria → Requiere acción correctiva
```

## Mejores Prácticas

### Para Desarrolladores

1. **Siempre validar fechas** antes de generar alarmas
2. **Mantener sincronización** entre etapas y alarmas
3. **No modificar clasificaciones** sin actualizar documentación
4. **Preservar relaciones** del proceso de curaduría

### Para Usuarios

1. **Revisar alarmas diariamente**
2. **Configurar rangos** según necesidades del proceso
3. **Actualizar fechas** cuando cambien requisitos
4. **Documentar excepciones** en alarmas vencidas

## Consideraciones Técnicas

### Performance

- Las alarmas se calculan **en tiempo real**
- Se utiliza **caché** para procesos con muchas etapas
- Optimización de consultas a base de datos

### Escalabilidad

- El sistema soporta **miles de alarmas simultáneas**
- Paginación y filtrado eficiente
- Actualización incremental

### Mantenibilidad

- Código desacoplado y modular
- Configuración externa de rangos
- Tests unitarios para clasificación

## Glosario

- **Step (Etapa)**: Fase del proceso de curaduría con fecha límite
- **Deadline (Fecha Límite)**: Fecha máxima para completar una etapa
- **Clasificación**: Nivel de severidad de la alarma (Verde/Amarillo/Naranja/Rojo)
- **Rango**: Número de días que define cada clasificación
- **Días Restantes**: Diferencia entre hoy y la fecha límite

## Versionado

- **Versión**: 1.0
- **Última Actualización**: 2024
- **Autor**: Sistema Dovela
- **Estado**: Activo

---

**Nota**: Esta documentación debe actualizarse cuando se modifiquen las reglas de clasificación o el proceso de generación de alarmas.