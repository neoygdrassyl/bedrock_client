# Diagrama de Gantt - Documentación de Implementación

## Resumen

Se ha implementado un **Diagrama de Gantt** completo para visualizar el proceso de tiempos de la curaduría, con las siguientes características principales:

### Características Implementadas

#### 1. Dos Modos de Visualización

- **Modo Límites Legales**: Muestra los plazos legales completos para cada fase, incluyendo los días base, suspensiones y prórrogas
- **Modo Fechas de Evento**: Muestra solo el tiempo realmente utilizado hasta las fechas de evento registradas

#### 2. Dos Vistas del Diagrama

##### Vista Compacta (GanttCard)
- Se muestra en el sidebar como una tarjeta similar al calendario de días hábiles
- Muestra las primeras 5 fases del proceso
- Incluye un resumen de días (total, base, suspensiones, prórroga)
- Permite alternar entre modos de visualización
- Botón para expandir a vista completa

##### Vista Completa (GanttChart)
- Se abre en un modal de pantalla completa
- Muestra todas las fases del proceso
- Incluye timeline horizontal con escala de días
- Muestra detalles completos de cada fase
- Información de distribución de días entre Acta Parte 1 y Parte 2
- Estadísticas resumidas

#### 3. Visualización de Actores Paralelos

El diagrama maneja correctamente los casos donde **Curaduría** y **Solicitante** tienen procesos que ocurren en paralelo:

- Cada actor se muestra en su propio track dentro de la fase
- Se visualiza el progreso individual de cada actor
- Identificación visual mediante iconos y colores

#### 4. Suspensiones y Prórrogas

##### Suspensiones (Amarillo - Rayado)
- **Pre-Acta**: Se visualizan en la Fase 1 (Estudio y Observaciones)
- **Post-Acta**: Se visualizan en la Fase 4 (Revisión y Viabilidad)
- Se muestran como bloques adicionales al final de la barra de progreso
- Color amarillo con patrón rayado diagonal

##### Prórrogas (Azul Claro - Rayado)
- Se aplican generalmente a las fases de la Curaduría
- Se muestran como bloques adicionales después de las suspensiones
- Color azul claro con patrón rayado diagonal

#### 5. Distribución de Días (Acta Parte 1 / Parte 2)

**Regla de Negocio Implementada:**

- **Si existe fecha de Acta Parte 1**: Se calcula el tiempo usado y el restante se asigna a la Parte 2
- **Si NO existe fecha de Acta Parte 1**: Se usa la distribución legal por defecto (44 días para Parte 1, 1 día para Parte 2)
- Las suspensiones y prórrogas se suman proporcionalmente

Ejemplo:
```
Total disponible: 45 días (base) + 5 días (suspensión) + 10 días (prórroga) = 60 días

Con fecha de Acta Parte 1 (usó 30 días):
- Parte 1: 30 días
- Parte 2: 30 días restantes

Sin fecha de Acta Parte 1:
- Parte 1: 44 + 13.5 ≈ 58 días
- Parte 2: 1 + 1.5 ≈ 2 días
```

#### 6. Configuración Dinámica de Notificación/Comunicación

El diagrama respeta automáticamente la configuración de:
- **Notificar vs Comunicar**: Las fases se muestran u ocultan según la configuración
- **Por Aviso**: Se adapta según esta opción esté activada o no

Esto se maneja automáticamente porque el diagrama utiliza `processPhases` del manager, que ya filtra las fases según estas configuraciones.

#### 7. Estados de Fase

Cada fase puede tener uno de los siguientes estados:

- **COMPLETADO** (Verde): La fase ha finalizado
- **ACTIVO** (Azul): La fase está en curso actualmente (con animación de pulso)
- **PAUSADO** (Amarillo): La fase está pausada por una suspensión activa
- **PENDIENTE** (Gris): La fase aún no ha comenzado
- **VENCIDO** (Rojo): La fase está vencida (días restantes negativos)

## Estructura de Archivos

### Nuevos Archivos Creados

```
src/app/pages/user/clocks/
├── components/
│   ├── GanttCard.js          # Tarjeta compacta para el sidebar
│   └── GanttChart.js         # Vista completa del diagrama
├── utils/
│   └── ganttUtils.js         # Funciones de cálculo y utilidades
└── diagramGantt.css          # Estilos del diagrama de Gantt
```

### Archivos Modificados

```
src/app/pages/user/clocks/
├── components/
│   └── SidebarInfo.js        # Integración del GanttCard
├── centralClocks.component.js # Importación de CSS
└── centralClocks.css         # Estilos adicionales para modal
```

## Funciones Principales

### ganttUtils.js

#### `calculateGanttData(manager, visualizationMode)`
Calcula todos los datos necesarios para renderizar el diagrama de Gantt.

**Parámetros:**
- `manager`: Objeto del hook useClocksManager con toda la información del proceso
- `visualizationMode`: 'legal' o 'actual'

**Retorna:**
```javascript
{
  phases: Array,        // Fases preparadas para el Gantt
  totalDuration: Number, // Duración total en días
  startDate: String,    // Fecha de inicio (ISO)
  endDate: String,      // Fecha de fin proyectada (ISO)
  baseDays: Number,     // Días base del proceso
  suspensionDays: Number, // Total de días de suspensión
  extensionDays: Number  // Total de días de prórroga
}
```

#### `calculateDaysDistribution(manager)`
Calcula la distribución de días entre Acta Parte 1 y Parte 2.

**Retorna:**
```javascript
{
  part1Days: Number,      // Días asignados a Parte 1
  part2Days: Number,      // Días asignados a Parte 2
  totalDays: Number,      // Total de días disponibles
  hasActa1Date: Boolean   // Si existe fecha de Acta Parte 1
}
```

#### `generateTimelineData(ganttData)`
Genera los datos de posicionamiento para el timeline del Gantt.

**Retorna:**
```javascript
[
  {
    ...phase,
    timelineStart: Number,    // Posición de inicio en el timeline
    timelineEnd: Number,      // Posición de fin en el timeline
    timelineProgress: Number  // Porcentaje de progreso (0-100)
  }
]
```

### Componentes

#### GanttCard

**Props:**
- `manager`: Objeto del manager con datos del proceso
- `onOpenFullView`: Función callback para abrir la vista completa

**Características:**
- Toggle entre modos de visualización
- Muestra primeras 5 fases
- Resumen de días
- Leyenda de estados

#### GanttChart

**Props:**
- `manager`: Objeto del manager con datos del proceso

**Características:**
- Timeline completo horizontal
- Escala de días cada 10 días
- Información de distribución de días
- Estadísticas resumidas
- Todas las fases con detalles completos
- Actores paralelos visualizados

## Reglas de Negocio Implementadas

### 1. División de Tiempo en Dos Partes

El proceso tiene un término general de hasta 45 días (dependiendo de la clasificación) que se divide en dos intervalos:

- **Antes del Acta de Observaciones Parte 1**: Fase de Estudio
- **Después del Acta de Observaciones Parte 1**: Fase de Revisión y Viabilidad

**Criterio de división**: La fecha de evento del Acta Parte 1

### 2. Suspensiones y Correcciones

Las suspensiones y prórrogas amplían los tiempos de la Curaduría:

- Se identifican como **pre-acta** o **post-acta** según dónde ocurrieron
- Se visualizan agregando espacio al bloque del proceso
- Color diferenciado (amarillo para suspensiones, azul para prórrogas)

### 3. Visualización sin Fechas

El diagrama puede renderizarse incluso cuando no existen todas las fechas de evento:

- Se proyectan los tiempos usando los límites legales
- Se indica visualmente qué fases están pendientes
- Se muestra una nota cuando se usa la distribución por defecto (44d/1d)

### 4. Configuración Dinámica

Si hay comunicación o notificación configurada:
- El diagrama se adapta automáticamente
- Las fases se muestran u ocultan según corresponda
- Esto se maneja a través de `processPhases` que ya filtra correctamente

## Estilos y Diseño

### Paleta de Colores

```css
/* Estados */
Completado:  #28a745 (Verde)
Activo:      #007bff (Azul) - con animación
Pausado:     #ffc107 (Amarillo)
Pendiente:   #6c757d (Gris)
Vencido:     #dc3545 (Rojo)

/* Tipos de Tiempo */
Suspensión:  #ffc107 (Amarillo - rayado)
Prórroga:    #17a2b8 (Azul claro - rayado)

/* Actores */
Curaduría:   #007bff (Azul)
Solicitante: #17a2b8 (Azul claro)
Mixto:       #6f42c1 (Púrpura)
```

### Animaciones

- **Pulso**: Las fases activas tienen una animación de pulso sutil
- **Hover**: Efectos de hover en tarjetas y botones
- **Transiciones**: Suaves transiciones al cambiar de modo

### Responsive

El diagrama es completamente responsive:

- **Desktop (>1200px)**: Vista completa con todos los detalles
- **Tablet (768px-1200px)**: Ajustes en distribución
- **Mobile (<768px)**: Columnas apiladas, controles adaptados

## Uso

### En el Sidebar

La tarjeta del Gantt se muestra automáticamente en el sidebar debajo de la tarjeta de "Fases del Proceso".

**Interacciones:**
1. Click en icono de modo para alternar entre Legal/Actual
2. Click en "Ver Diagrama Completo" para abrir modal
3. Las barras muestran progreso visual

### En la Vista Completa

**Abrir**: Click en el botón "Ver Diagrama Completo" o el icono de expandir

**Interacciones:**
1. Scroll horizontal para navegar el timeline
2. Alternar entre modos con los botones superiores
3. Ver detalles de distribución de días
4. Revisar estadísticas resumidas
5. Cerrar con X o ESC

## Casos de Uso

### Caso 1: Proceso Normal con Todas las Fechas

```
Datos:
- Fecha radicación: 2025-01-01
- Fecha LDF: 2025-01-15
- Fecha Acta Parte 1: 2025-02-15 (30 días usados)
- Suspensión pre-acta: 5 días
- Total disponible: 45 + 5 = 50 días

Visualización:
- Parte 1: 30 días usados + 5 días suspensión
- Parte 2: 20 días disponibles
- Modo Legal: Muestra barras completas
- Modo Actual: Barras acortadas hasta fechas de evento
```

### Caso 2: Sin Fecha de Acta Parte 1

```
Datos:
- Fecha radicación: 2025-01-01
- Fecha LDF: 2025-01-15
- Fecha Acta Parte 1: NO EXISTE
- Suspensión post-acta: 10 días
- Prórroga: 15 días
- Total disponible: 45 + 10 + 15 = 70 días

Visualización:
- Parte 1: 44 días legales + 22.5 días extras ≈ 67 días
- Parte 2: 1 día legal + 2.5 días extras ≈ 3 días
- Nota: "Sin fecha de Acta Parte 1: usando límites legales (44d / 1d)"
```

### Caso 3: Proceso con Actores Paralelos

```
Ejemplo: Fase "Estudio y Observaciones" con valla

Actores:
1. Curaduría: 45 días para revisión preliminar
2. Solicitante: 5 días para instalar valla

Visualización:
- Dos tracks paralelos en la misma fase
- Cada uno con su propio progreso
- Inicio simultáneo, fin puede variar
```

## Mantenimiento y Extensibilidad

### Para Agregar Nuevos Estados

1. Agregar al mapa de estados en `ganttUtils.js`:
```javascript
export const getStatusClass = (status) => {
  switch (status) {
    // ... casos existentes
    case 'NUEVO_ESTADO':
      return 'gantt-status-nuevo';
    // ...
  }
};
```

2. Agregar estilos en `diagramGantt.css`:
```css
.gantt-status-nuevo .gantt-phase-progress {
  background: linear-gradient(90deg, #color1 0%, #color2 100%);
}
```

### Para Modificar Cálculos de Días

Los cálculos principales están en `ganttUtils.js`:
- `calculateDaysDistribution()` - Distribución entre Parte 1 y 2
- `calculatePhaseSuspensions()` - Asignación de suspensiones
- `calculatePhaseExtensions()` - Asignación de prórrogas

### Para Agregar Nuevos Modos de Visualización

1. Agregar el nuevo modo al estado en los componentes
2. Modificar `preparePhaseForGantt()` para incluir la lógica del nuevo modo
3. Agregar botón de toggle en los controles

## Testing Recomendado

### Casos de Prueba Manuales

1. **Proceso completo**: Todas las fechas presentes
2. **Proceso parcial**: Solo algunas fechas
3. **Sin Acta Parte 1**: Verificar distribución 44/1
4. **Con suspensiones**: Pre-acta y post-acta
5. **Con prórroga**: Verificar visualización
6. **Actores paralelos**: Verificar tracks
7. **Cambio de modo**: Legal ↔ Actual
8. **Responsive**: Desktop, tablet, mobile
9. **Con configuración notificar**: Verificar fases
10. **Con configuración comunicar**: Verificar fases

### Validaciones

- [ ] Barras no se superponen
- [ ] Colores son consistentes
- [ ] Tooltips informativos
- [ ] Animaciones suaves
- [ ] Texto legible en todas las resoluciones
- [ ] Modal se cierra correctamente
- [ ] Cálculos de días son precisos
- [ ] Leyenda es precisa

## Notas Importantes

### Días Hábiles

El sistema utiliza `calcularDiasHabiles` para calcular días hábiles respetando:
- Fines de semana
- Festivos de Colombia
- Lógica específica del sistema

### Sincronización con Fases

El diagrama siempre se sincroniza con `processPhases` del manager, por lo que:
- Cambios en las fases se reflejan automáticamente
- Configuraciones dinámicas se respetan
- No hay lógica duplicada de filtrado

### Performance

Para procesos largos (muchas fases):
- La vista compacta muestra solo 5 fases
- La vista completa tiene scroll optimizado
- Los cálculos se memorizan en el manager

## Troubleshooting

### El Gantt no se muestra

**Posibles causas:**
1. `manager.processPhases` está vacío
2. Error en importación de CSS
3. ReactDOM no está importado

**Solución:** Verificar que todos los imports estén correctos y que el manager tenga datos

### Los días no coinciden

**Posibles causas:**
1. Cálculo de días hábiles incorrecto
2. Distribución entre Parte 1 y 2 no considera todos los factores

**Solución:** Revisar `calculateDaysDistribution()` y verificar que incluya suspensiones y prórrogas

### Las suspensiones no se ven

**Posibles causas:**
1. La fase no está identificada correctamente como pre-acta o post-acta
2. Los datos de suspensión no están presentes en el manager

**Solución:** Verificar que `suspensionPreActa` y `suspensionPostActa` tengan los datos correctos

## Próximas Mejoras

### Funcionalidades Propuestas

1. **Exportar como imagen**: Captura del diagrama en PNG/PDF
2. **Zoom interactivo**: Para procesos muy largos
3. **Filtros de fase**: Mostrar/ocultar fases específicas
4. **Comparación**: Ver múltiples procesos lado a lado
5. **Predicción**: Proyección de fechas futuras basada en velocidad actual
6. **Alertas**: Indicadores visuales de fases críticas
7. **Drag & Drop**: Reprogramar fechas arrastrando barras (solo visual, no modificaría datos)
8. **Atajos de teclado**: Navegación con teclado
9. **Modo oscuro**: Tema oscuro para el diagrama
10. **Tooltips enriquecidos**: Más información al hacer hover

---

**Versión**: 1.0.0  
**Última actualización**: 2025-12-30  
**Autor**: Sistema de Diagrama de Gantt
