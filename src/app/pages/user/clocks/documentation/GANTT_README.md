# Diagrama de Gantt - Documentación

## Descripción General

El Diagrama de Gantt es una herramienta de visualización de tiempos que muestra las fases del proceso de curaduría en formato de línea de tiempo. Permite modelar y gestionar los plazos legales, suspensiones, prórrogas y eventos del proceso.

## Características Principales

### 1. Dos Modos de Visualización

#### Modo Límites Legales
- Muestra los plazos máximos según la normativa vigente
- Calcula límites basándose en días totales + suspensiones + prórrogas
- Rellena la barra según la fecha de cumplimiento del evento
- Si no existe fecha de evento, muestra la proyección completa

#### Modo Fechas de Evento
- Muestra solo las fechas reales de eventos
- Acorta la barra hasta donde existe la fecha de evento
- Si no hay fecha de evento, la barra aparece como "pendiente"

### 2. Gestión de Tiempos

#### Distribución Base (45 días)
- El sistema divide automáticamente los días entre Fase 1 (Estudio) y Fase 4 (Viabilidad)
- Si no hay fecha de acta parte 1: **44 días para Fase 1, 1 día para Fase 4**
- Si hay acta parte 1: Los días restantes pasan automáticamente a Fase 4
- Esta división se calcula dinámicamente usando `daysContext` en las fases

#### Suspensiones
- **Suspensión Pre-Acta**: Se visualiza en amarillo claro en la Fase 1
- **Suspensión Post-Acta**: Se visualiza en amarillo oscuro en la Fase 4
- Se muestran como bloques adicionales al final de la barra principal
- El tooltip muestra el número de días de suspensión

#### Prórrogas
- Se visualizan en azul (info) al final de la barra
- Representan días adicionales otorgados a la curaduría
- Se suman al total de días disponibles

### 3. Procesos Paralelos

El diagrama identifica cuando dos actores (Curaduría y Solicitante) trabajan en paralelo:
- Se muestra un ícono especial (🔀) en la barra
- Al hacer clic en la tarjeta de fase, se pueden ver los actores desglosados
- Cada actor tiene su propio contador de días y estado

### 4. Adaptación Dinámica

#### Según Notificación/Comunicación
El diagrama se adapta automáticamente según la configuración en `phaseOptions`:
- Si se elige "Comunicar": Elimina fases de notificación
- Si se elige "Notificar": Muestra todas las fases de notificación
- Si "Por Aviso" está activo: Usa tiempos diferentes para notificaciones

### 5. Componentes

#### GanttCard (Vista Compacta)
- Se muestra en el sidebar, encima del calendario
- Vista previa simplificada con hasta 300px de altura
- Toggle de modo (Legal/Evento) en la parte inferior
- Botón para expandir a pantalla completa

#### GanttModal (Pantalla Completa)
- Modal que ocupa la mayor parte de la pantalla
- Muestra todos los detalles del proceso
- Incluye información del expediente, fases totales, y días de suspensión/prórroga
- Timeline completo con marcadores de fecha
- Leyenda explicativa de colores

#### GanttDiagram (Motor de Renderizado)
- Componente principal que renderiza las barras
- Maneja tooltips y efectos hover
- Calcula anchos y posiciones de barras según el rango de fechas
- Gestiona el modo de visualización

## Estilos

Los estilos están en `diagramGantt.css` y incluyen:

### Colores de Estado
- **Azul (primary)**: Fase activa
- **Verde (success)**: Fase completada
- **Amarillo (warning)**: Fase pausada o suspensiones
- **Rojo (danger)**: Fase vencida
- **Gris (secondary)**: Fase pendiente
- **Cian (info)**: Prórrogas o fases de notificación

### Clases de Resaltado
- `phase-highlight-radicacion`: Violeta para radicación
- `phase-highlight-estudio`: Verde para estudio
- `phase-highlight-correcciones`: Naranja para correcciones
- `phase-highlight-resolucion`: Cian para resolución
- `phase-highlight-desist`: Rojo para desistimiento

### Responsividad
- En pantallas pequeñas (<768px), los labels se reducen a 120px
- El modal se ajusta para ocupar 95vh en móvil
- Los botones y leyendas se adaptan al espacio disponible

## Casos de Uso

### Caso 1: Proceso Normal con Fechas Completas
```javascript
// Todas las fases tienen startDate y endDate
// El diagrama muestra barras completas con relleno según uso
```

### Caso 2: Proceso Sin Fecha de Acta Parte 1
```javascript
// El sistema asigna automáticamente:
// - Fase 1: 44 días
// - Fase 4: 1 día
// Se suman suspensiones y prórrogas donde corresponda
```

### Caso 3: Proceso con Suspensiones
```javascript
// Si hay suspensión pre-acta: Se muestra en Fase 1 en amarillo claro
// Si hay suspensión post-acta: Se muestra en Fase 4 en amarillo oscuro
// Los días se agregan visualmente al final de la barra principal
```

### Caso 4: Proceso con Prórroga
```javascript
// La prórroga se muestra al final de todas las fases en azul
// Se suma al total de días disponibles
// El tooltip muestra "+X días"
```

### Caso 5: Proceso Paralelo
```javascript
// Cuando parallelActors existe en una fase:
// - Se muestra ícono de código ramificado
// - En el modal se pueden ver los dos actores separados
// - Cada uno tiene su propio progreso
```

## Integración

El diagrama se integra con:

1. **useProcessPhases**: Obtiene las fases calculadas
2. **useClocksManager**: Obtiene datos de suspensiones, prórrogas, y contexto
3. **SidebarInfo**: Se coloca encima del calendario de días hábiles
4. **centralClocks.component**: Importa y renderiza los componentes

## API de Utilidades

### calculateGanttData(processPhases, manager, mode)
Calcula los datos necesarios para renderizar barras
- **processPhases**: Array de fases del proceso
- **manager**: Objeto con datos del manager (suspensiones, prórrogas, etc.)
- **mode**: 'legal' o 'event'

### calculateGanttDateRange(ganttBars)
Determina el rango de fechas total (min/max)

### calculateBarWidth(startDate, endDate, rangeStart, rangeEnd)
Calcula el ancho porcentual de una barra

### calculateBarOffset(startDate, rangeStart, rangeEnd)
Calcula el offset (posición inicial) de una barra

### generateTimelineMarkers(rangeStart, rangeEnd, maxMarkers)
Genera marcadores de fecha para el eje X

### formatGanttTooltip(bar)
Formatea el HTML del tooltip con información de la barra

## Mejoras Futuras Sugeridas

1. **Zoom y Pan**: Permitir hacer zoom en períodos específicos
2. **Exportar**: Generar imagen o PDF del diagrama
3. **Comparación**: Comparar múltiples expedientes lado a lado
4. **Alertas Visuales**: Resaltar fases cerca del vencimiento
5. **Edición Inline**: Permitir ajustar fechas directamente desde el diagrama
6. **Historial**: Mostrar versiones anteriores del diagrama
7. **Milestones**: Agregar hitos importantes del proceso
8. **Dependencias**: Visualizar dependencias entre fases

## Notas Técnicas

- El componente usa React Hooks (useState, useMemo, useEffect)
- Los tooltips usan posicionamiento fijo con coordenadas del mouse
- El modal usa ReactDOM.createPortal para renderizarse en document.body
- Las animaciones usan CSS transitions y keyframes
- Los colores respetan la paleta existente del sistema
- Los íconos son de Font Awesome 5
