# Guía de Usuario - Diagrama de Gantt

## Introducción

El **Diagrama de Gantt** es una herramienta visual que permite ver de forma gráfica el progreso y la planificación de todas las fases del proceso de curaduría.

## Ubicación

El diagrama se encuentra en el panel lateral derecho (sidebar) de la vista de gestión de tiempos, justo debajo de la tarjeta "Fases del Proceso".

## Componentes

### Vista Compacta (Tarjeta en el Sidebar)

La vista compacta muestra:

1. **Encabezado**
   - Título "Diagrama de Gantt"
   - Botón para cambiar el modo de visualización
   - Botón para expandir a pantalla completa

2. **Resumen de Días**
   - Total de días disponibles
   - Días base (según clasificación del proyecto)
   - Días de suspensiones (si aplica)
   - Días de prórroga (si aplica)

3. **Indicador de Modo Actual**
   - Muestra si está en modo "Límites Legales" o "Fechas de Evento"

4. **Timeline Compacto**
   - Muestra las primeras 5 fases del proceso
   - Cada fase incluye:
     - Nombre de la fase
     - Días usados / días totales
     - Barra de progreso visual
     - Suspensiones y prórrogas (si aplican)
     - Actores paralelos (cuando corresponde)

5. **Leyenda**
   - Código de colores para estados
   - Identificación de suspensiones y prórrogas

6. **Botón de Expansión**
   - Abre la vista completa del diagrama

### Vista Completa (Modal de Pantalla Completa)

La vista completa incluye:

1. **Panel de Control Superior**
   - Título del diagrama
   - Fechas clave:
     - Fecha de inicio
     - Fecha de fin proyectada
     - Duración total
   - Botones para alternar modo de visualización

2. **Tarjeta de Distribución de Días**
   - Muestra cómo se distribuyen los días entre Acta Parte 1 y Parte 2
   - Composición del tiempo (base, suspensiones, prórroga)
   - Notas explicativas cuando aplican

3. **Estadísticas Resumidas**
   - Días base legal
   - Total de suspensiones
   - Total de prórroga
   - Visualización con iconos

4. **Timeline Principal**
   - Escala horizontal de días
   - Todas las fases del proceso
   - Para cada fase:
     - Nombre y responsable
     - Estado actual
     - Fechas de inicio y fin
     - Barra de progreso con colores
     - Suspensiones y prórrogas visualizadas
     - Actores paralelos (si aplican)

5. **Leyenda Completa**
   - Todos los estados posibles
   - Significado de colores y patrones

## Modos de Visualización

### Modo Límites Legales

**¿Qué muestra?**
- Los plazos completos según la ley
- Todos los días disponibles (base + suspensiones + prórroga)
- Proyección completa del proceso

**¿Cuándo usarlo?**
- Para planificar el proceso completo
- Para ver cuánto tiempo queda disponible
- Para verificar cumplimiento de términos legales

**Ejemplo:**
```
Fase: Estudio y Observaciones
Barra completa: 50 días (45 base + 5 suspensión)
Progreso: 30 días usados
Restante: 20 días disponibles
```

### Modo Fechas de Evento

**¿Qué muestra?**
- Solo el tiempo realmente utilizado
- Barras acortadas hasta las fechas registradas
- Visualización del cumplimiento real

**¿Cuándo usarlo?**
- Para ver el progreso real del proceso
- Para comparar tiempo usado vs disponible
- Para auditorías y reportes

**Ejemplo:**
```
Fase: Estudio y Observaciones
Barra: Solo hasta la fecha del Acta (30 días)
Resto del espacio: Vacío (no se usaron los 20 días restantes)
```

## Interpretación de Colores

### Estados de Fase

| Color | Estado | Significado |
|-------|--------|-------------|
| 🟢 Verde | Completado | La fase ha finalizado exitosamente |
| 🔵 Azul | En curso | La fase está activa actualmente (con animación) |
| 🟡 Amarillo | Pausado | La fase está pausada por una suspensión |
| ⚫ Gris | Pendiente | La fase aún no ha comenzado |
| 🔴 Rojo | Vencido | La fase está vencida (término excedido) |

### Tipos de Tiempo Adicional

| Patrón | Tipo | Significado |
|--------|------|-------------|
| 🟨 Rayado amarillo | Suspensión | Tiempo adicional por suspensión |
| 🟦 Rayado azul | Prórroga | Tiempo adicional por prórroga |

### Actores

| Color | Actor | Icono |
|-------|-------|-------|
| 🔵 Azul | Curaduría | 🏢 Edificio |
| 🔵 Azul claro | Solicitante | 👤 Usuario |
| 🟣 Púrpura | Mixto | 👥 Usuarios |

## Características Especiales

### 1. Distribución Automática de Días

El sistema divide automáticamente los 45 días base entre dos partes:

**Caso A: Con fecha de Acta Parte 1**
```
Si el Acta Parte 1 se hizo el día 30:
- Parte 1 (Estudio): 30 días usados
- Parte 2 (Viabilidad): 15 días restantes
```

**Caso B: Sin fecha de Acta Parte 1**
```
Distribución legal por defecto:
- Parte 1 (Estudio): 44 días
- Parte 2 (Viabilidad): 1 día
+ Se distribuyen proporcionalmente suspensiones y prórrogas
```

### 2. Suspensiones y Prórrogas

**Suspensiones Pre-Acta:**
- Se agregan a la Fase 1 (Estudio y Observaciones)
- Aparecen como bloques amarillos rayados al final de la barra
- Amplían el plazo de la Curaduría

**Suspensiones Post-Acta:**
- Se agregan a la Fase 4 (Revisión y Viabilidad)
- Mismo formato visual que pre-acta
- También amplían el plazo de la Curaduría

**Prórrogas:**
- Aplican a las fases de la Curaduría
- Aparecen como bloques azules rayados
- Se muestran después de las suspensiones

### 3. Actores en Paralelo

Algunas fases tienen procesos que ocurren simultáneamente:

**Ejemplo: Fase con Valla**
```
┌─────────────────────────────────────┐
│ Curaduría: Revisión (45 días)      │ ████████░░
├─────────────────────────────────────┤
│ Solicitante: Valla (5 días)        │ ███░░
└─────────────────────────────────────┘
```

Cada actor muestra:
- Su nombre
- Días asignados
- Progreso individual

### 4. Adaptación a Configuración

El diagrama se adapta automáticamente a la configuración de:

**Notificar vs Comunicar:**
- Si está configurado para "Comunicar", las fases de comunicación se muestran
- Si está configurado para "Notificar", las fases de notificación se muestran
- Las fases no aplicables se ocultan automáticamente

**Por Aviso:**
- Cuando está activado, se muestran las fases de notificación por aviso
- Cuando está desactivado, se muestran las fases de notificación estándar

## Cómo Usar

### Ver el Diagrama Compacto

1. Abrir la vista de gestión de tiempos del expediente
2. En el sidebar derecho, buscar la tarjeta "Diagrama de Gantt"
3. Ver el resumen y las primeras 5 fases

### Cambiar el Modo de Visualización

**En la vista compacta:**
1. Click en el botón con el icono de balanza (⚖️) o calendario (📅)
2. El diagrama se actualiza instantáneamente

**En la vista completa:**
1. Click en "Límites Legales" o "Fechas de Evento" en los botones superiores
2. El timeline completo se actualiza

### Abrir la Vista Completa

**Opción 1:**
1. Click en el botón "Ver Diagrama Completo" en el footer de la tarjeta

**Opción 2:**
1. Click en el icono de expandir (⛶) en el encabezado de la tarjeta

**En la vista completa:**
- Hacer scroll horizontal para ver todo el timeline
- Hacer scroll vertical para ver todas las fases
- Cerrar con la X o presionar ESC

### Interpretar las Barras

**Barra de Progreso:**
- Parte coloreada: Días ya transcurridos
- Parte gris: Días disponibles restantes
- Etiqueta: "X/Y días" (usados/totales)

**Bloques Adicionales:**
- Después de la barra principal
- Suspensiones en amarillo rayado
- Prórrogas en azul rayado
- Etiqueta con cantidad de días

## Escenarios Comunes

### Escenario 1: Proceso en Curso Normal

**Situación:**
- Ya se registró el Acta Parte 1
- Hay una suspensión activa
- El proceso va según lo planeado

**Qué verás:**
- Fases completadas en verde
- Fase actual en azul (con animación)
- Fases pendientes en gris
- Bloque amarillo de suspensión en la fase correspondiente
- Distribución real de días entre Parte 1 y 2

### Escenario 2: Proceso Recién Iniciado

**Situación:**
- Solo se tiene fecha de radicación y LDF
- No hay Acta Parte 1 todavía
- No hay suspensiones ni prórrogas

**Qué verás:**
- Primera fase completada (Radicación)
- Segunda fase activa (Estudio)
- Distribución por defecto: 44 días para Parte 1, 1 día para Parte 2
- Nota explicativa sobre distribución legal
- Proyección completa del proceso

### Escenario 3: Proceso con Múltiples Suspensiones

**Situación:**
- Hay suspensión pre-acta de 5 días
- Hay suspensión post-acta de 10 días
- Hay prórroga de 15 días

**Qué verás:**
- Fase 1 con bloque amarillo de 5 días
- Fase 4 con bloque amarillo de 10 días
- Bloques azules de prórroga en las fases de Curaduría
- Total disponible: 45 + 5 + 10 + 15 = 75 días
- Distribución ajustada según dónde esté el Acta Parte 1

### Escenario 4: Proceso Vencido

**Situación:**
- Una fase superó su límite de tiempo
- Los días restantes son negativos

**Qué verás:**
- Fase vencida en rojo
- Indicador de "Vencido" en el estado
- En modo Legal: Barra completa pero en rojo
- En modo Actual: Barra que excede el límite

## Preguntas Frecuentes

### ¿Por qué los días no suman exactamente?

Algunas distribuciones usan redondeo cuando se reparten suspensiones y prórrogas proporcionalmente.

### ¿Qué pasa si elimino una fecha de evento?

El diagrama se actualiza automáticamente y vuelve a usar la distribución legal por defecto para las fases afectadas.

### ¿Puedo modificar el diagrama?

No, el diagrama es de solo lectura. Para modificar tiempos, usa las funciones de gestión de tiempos en la tabla principal.

### ¿El diagrama se guarda?

No es necesario guardar. El diagrama se genera dinámicamente cada vez basándose en los datos actuales del expediente.

### ¿Qué significan los números en la escala?

Son los días transcurridos desde el inicio del proceso. Por ejemplo, "30" significa el día 30 desde la radicación.

### ¿Por qué algunas fases no aparecen?

El diagrama respeta la configuración de notificación/comunicación. Si una fase no es aplicable según la configuración, se oculta automáticamente.

### ¿Cómo sé si un proceso va bien?

**Indicadores positivos:**
- Fases en verde (completadas a tiempo)
- Fase actual en azul
- Barras de progreso no llegan al límite
- Días restantes positivos

**Indicadores de alerta:**
- Fases en rojo (vencidas)
- Días restantes negativos
- Barras muy cerca del límite

## Consejos de Uso

1. **Usa el modo Legal para planificar**: Te da una visión completa del tiempo disponible

2. **Usa el modo Actual para reportar**: Muestra el cumplimiento real del proceso

3. **Revisa la distribución de días**: Te ayuda a entender cuánto tiempo queda para la segunda parte

4. **Observa los colores**: Te dan información rápida sobre el estado

5. **Presta atención a las suspensiones**: Entender dónde están te ayuda a planificar mejor

6. **Compara fases completadas con pendientes**: Te da una idea del progreso general

7. **Usa la vista completa para presentaciones**: Es más clara y profesional

## Soporte

Para problemas o dudas sobre el diagrama de Gantt:
- Consulta esta guía
- Revisa la documentación técnica (GANTT_IMPLEMENTATION.md)
- Contacta al administrador del sistema

---

**Versión**: 1.0.0  
**Última actualización**: 30 de diciembre de 2025
