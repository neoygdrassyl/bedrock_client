# Arquitectura del Sistema de Programación de Tiempos

## Resumen Ejecutivo

Este documento describe la arquitectura de la funcionalidad de **programación individual de tiempos** en el módulo de gestión de clocks de la curaduría.

## Contexto

El sistema permite:
1. Programar fechas límite específicas para cada tiempo/evento del proceso
2. Configurar límites mediante días disponibles O fecha especificada
3. Visualizar límites programados en la tabla maestra junto a límites legales
4. Mantener la trazabilidad de la programación para reportes futuros

## Componentes del Sistema

### 1. **ScheduleModal.js**
Modal principal para programación de tiempos individuales.

**Responsabilidades:**
- Renderizar tabla con tiempos programables
- Permitir entrada de días disponibles o fecha especificada
- Mostrar límite legal de referencia cuando existe
- Validar que no se programen tiempos ya ejecutados
- Gestionar estado local antes de guardar
- Construir objeto `scheduleConfig` para envío al backend

**Props:**
- `currentItem`: Expediente actual
- `clocksData`: Datos de los clocks
- `clocksToShow`: Lista de tiempos a mostrar (filtrada)
- `manager`: Hook useClocksManager con toda la lógica
- `onSave`: Callback para guardar configuración
- `onClose`: Callback para cerrar modal

### 2. **scheduleUtils.js**
Utilidades para cálculos y conversiones de programación.

**Funciones principales:**
```javascript
// Convierte días disponibles a fecha límite
calculateScheduledDateFromDays(referenceDate, days)

// Convierte fecha especificada a días disponibles  
calculateDaysFromScheduledDate(referenceDate, scheduledDate)

// Obtiene la fecha de referencia anterior según prioridad
getReferenceDate(clockState, scheduleConfig, getClock, manager)

// Determina si un tiempo es programable
isTimeSchedulable(clockValue, clock)

// Construye estructura de datos para el endpoint
buildSchedulePayload(scheduleData)
```

### 3. **Modificaciones en ClockRow.js**

**Nueva columna: "Límite Programado"**

Muestra:
- `DD/MM/YYYY` + `X días disponibles` cuando hay fecha de referencia
- `X días (pendiente fecha ref.)` cuando se programó con días sin referencia
- Fecha límite calculada cuando se programó con fecha y existe referencia
- `-` cuando no hay programación

**Lógica de cálculo:**
```javascript
const renderScheduledLimit = () => {
  if (!hasScheduledConfig) return '-';
  
  const refDate = getReferenceDate(value.state, scheduleConfig, getClock);
  const scheduled = scheduleConfig.times[value.state];
  
  if (!refDate) {
    if (scheduled.type === 'days') {
      return `${scheduled.value} días (pendiente fecha ref.)`;
    }
    return 'Pendiente fecha ref.';
  }
  
  // Calcular y mostrar fecha + días
  const limitDate = scheduled.type === 'days'
    ? calculateScheduledDateFromDays(refDate, scheduled.value)
    : scheduled.value;
  
  const days = calculateDaysFromScheduledDate(refDate, limitDate);
  return `${formatDate(limitDate)} (${days} días)`;
}
```

### 4. **Modificaciones en centralClocks.component.js**

**Nueva función: `openIndividualScheduleModal()`**

Reemplaza la función `openScheduleModal()` existente con una versión que:
1. Muestra modal con todos los tiempos programables
2. Permite edición individual de cada tiempo
3. Guarda usando `FUN_SERVICE.updateSchedule()` con FormData

**Integración:**
```javascript
const openIndividualScheduleModal = () => {
  MySwal.fire({
    title: 'Programar Tiempos del Proceso',
    html: '<div id="schedule-modal-root"></div>',
    width: 900,
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Guardar Programación',
    didOpen: () => {
      ReactDOM.render(
        <ScheduleModal
          currentItem={currentItem}
          clocksData={clocksData}
          clocksToShow={clocksToShow}
          manager={manager}
          onSave={saveScheduleConfiguration}
        />,
        document.getElementById('schedule-modal-root')
      );
    }
  });
};
```

### 5. **Hook useScheduleConfig (Modificado)**

**Estructura de datos actualizada:**
```javascript
{
  expedienteId: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  times: {
    [stateId]: {
      type: 'days' | 'date',
      value: number | string,  // días o fecha ISO
      originalType: 'days' | 'date',  // tipo original ingresado por usuario
      notes: string
    }
  }
}
```

**Cambios:**
- Almacena programación por tiempo individual (no por fase)
- Mantiene tipo original para saber cómo editarlo
- Permite notas por tiempo
- Guarda timestamp de creación/actualización

## Flujo de Datos

### Guardado de Programación

```
Usuario ingresa datos en ScheduleModal
    ↓
Validación local de datos
    ↓
buildSchedulePayload() construye objeto scheduleConfig
    ↓
FormData con scheduleConfig en JSON
    ↓
FUN_SERVICE.updateSchedule(expedienteId, formData)
    ↓
Backend actualiza BD
    ↓
Callback actualiza localStorage
    ↓
Re-render de tabla maestra
```

### Visualización en Tabla

```
ClockRow renderizado
    ↓
Obtiene scheduleConfig de localStorage
    ↓
Para el tiempo actual:
  - Busca si existe programación
  - Obtiene fecha de referencia anterior
  - Calcula límite programado
    ↓
Renderiza columna "Límite Programado"
```

## Reglas de Negocio Implementadas

### 1. Fecha de Referencia Anterior

**Prioridad de resolución:**
1. Fecha del evento anterior según relaciones en `clocksDefinitions.js`
2. Si no existe fecha de evento, usar límite programado del anterior
3. Si ninguno existe, dejar campo vacío

### 2. Días Hábiles

- Se cuenta el primer día como día hábil
- Usa `calcularDiasHabiles()` y `sumarDiasHabiles()` existentes
- Respeta calendario de festivos de Colombia

### 3. Tiempos No Programables

- Tiempos con `date_start` existente (ya ejecutados)
- Tiempos sin flag `allowSchedule: true` en definitions

### 4. Prórrogas y Suspensiones

Para tiempos relacionados (Acta Parte 1/2):
- Límite legal: Mismo que tiempo base (respetando dinámicas)
- Días programados: Sumar días de prórrogas/suspensiones desde programación

### 5. Validaciones

- No permitir programar tiempos ejecutados
- Validar formato de fecha (ISO 8601)
- Validar días disponibles (número positivo)
- Al menos uno de los dos campos (días o fecha) debe estar lleno

## Consideraciones de Escalabilidad

### Para Reportes Futuros

La estructura `scheduleConfig` permite:
- Comparar fechas programadas vs reales
- Calcular desviaciones por tiempo
- Generar alarmas tempranas cuando se acerca límite programado
- Análisis de tiempos históricos

### Extensibilidad

El sistema puede extenderse para:
- Programación por responsable (Curaduría vs Solicitante)
- Alertas automáticas por correo
- Dashboard de seguimiento
- Integración con calendario

## Diagrama de Componentes

```
centralClocks.component.js
    ├── ClockRow.js (modificado)
    │   ├── renderLegalLimit()
    │   └── renderScheduledLimit() [NUEVO]
    │
    ├── ScheduleModal.js [NUEVO]
    │   ├── ScheduleTable
    │   ├── ScheduleRow (por cada tiempo)
    │   └── Validations
    │
    ├── hooks/
    │   ├── useClocksManager.js
    │   └── useScheduleConfig.js (modificado)
    │
    └── utils/
        └── scheduleUtils.js [NUEVO]
```

## Decisiones Técnicas

### ¿Por qué FormData en lugar de JSON?

El endpoint `updateSchedule` espera FormData según la arquitectura existente del backend. Esto mantiene consistencia con otros endpoints del sistema.

### ¿Por qué localStorage en lugar de Redux/Context?

- Simplicidad: no introduce nueva dependencia
- Persistencia: datos sobreviven a recargas de página
- Aislamiento: cada expediente tiene su configuración independiente
- Rendimiento: acceso instantáneo sin llamadas al backend

### ¿Por qué preservar tipo original?

Permite al usuario editar con el mismo método que usó originalmente, mejorando la UX y evitando confusión.

## Testing Recomendado

### Casos de Prueba Mínimos

1. **Tiempo sin referencia + días programados**
   - Entrada: 5 días
   - Esperado: "5 días (pendiente fecha ref.)"

2. **Tiempo sin referencia + fecha programada**
   - Entrada: 15/01/2026
   - Esperado: Fecha vacía hasta que exista ref.

3. **Acta Parte 1/2 con prórrogas**
   - Configuración: Prórroga de 10 días activa
   - Esperado: Días sumados en cálculo

4. **Tiempo ya ejecutado**
   - Estado: date_start existe
   - Esperado: No aparece en modal de programación

5. **Guardado y recuperación**
   - Guardar configuración → Recargar página
   - Esperado: Configuración persiste correctamente

## Mantenimiento

### Archivos a revisar ante cambios en:

- **Lógica de días hábiles**: `useClocksManager.js` → `scheduleUtils.js`
- **Definición de tiempos**: `clocks.definitions.js` → `ScheduleModal.js`
- **Endpoint backend**: `fun.service.js` → `centralClocks.component.js`
- **Estructura de datos**: `useScheduleConfig.js` → actualizar documentación

### Control de Versiones

- Versión actual de estructura: `1.0`
- Ante cambios incompatibles, implementar migración en `useScheduleConfig`

---

**Última actualización**: 2025-12-11
**Autor**: Sistema de Programación de Tiempos
**Versión**: 1.0.0
