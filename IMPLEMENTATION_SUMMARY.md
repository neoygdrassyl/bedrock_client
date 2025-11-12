# Sistema de Control de Tiempos de Curaduría - Implementación Completa

## Resumen de Cambios

Se ha implementado exitosamente un sistema completo de gestión de tiempos para procesos de curaduría urbana en Colombia, incluyendo:

### 1. Componente DateSimulator (NUEVO)
- **Ubicación**: `src/app/pages/user/clocks/components/DateSimulator.js`
- **Funcionalidad**: Permite simular diferentes fechas del sistema para testing manual
- **Características**:
  - Activación/desactivación de simulación
  - Selector de fecha manual
  - Botones de acción rápida: Hoy, -5 días, +5 días, +30 días
  - Integración con calculadora de días hábiles de Colombia
  - Indicador visual cuando está activo

### 2. Hook useClocksManager.js (MODIFICADO)
- **Cambios principales**:
  - Añadido parámetro `simulatedDate` para soportar simulación de fechas
  - Eliminado cálculo obsoleto `preFirstEventExtra`
  - Simplificado cálculo `totalUsed` = preActaUsed + postCorrUsed
  - Añadido `solicitanteTimes`: tracking de tiempos del solicitante (radicación, correcciones, pagos)
  - Añadido `suggestions`: sistema de sugerencias proactivas
  - Exporta `currentDate`, `solicitanteTimes`, `suggestions`

### 3. Configuración clocks.definitions.js (ACTUALIZADO)
- **Suspensiones**: Títulos actualizados con clarificación de períodos
  - "SUSPENSIÓN PRE-ACTA (Período 1: Antes de Acta Parte 1)"
  - "SUSPENSIÓN POST-ACTA (Período 3: Después de Correcciones)"
- **Prórrogas**: Ahora detecta automáticamente el período (1 o 3)
- **Pagos**: Restaurados campos `info` para tracking de estado (PAGO/NO PAGO/NA)

### 4. Componente centralClocks.component.js (MODIFICADO)
- Importado y renderizado DateSimulator al inicio
- Añadido estado `simulatedDate`
- Pasado `simulatedDate` a `useClocksManager`
- Implementada función `validateBeforeSave` con validaciones:
  - Límite de 10 días totales para suspensiones
  - Solo una prórroga por complejidad
  - Solo una prórroga de correcciones
  - Validación de no solapamiento de eventos

### 5. Componente SidebarInfo.js (EXTENDIDO)
- Añadida sección "Tiempos del Solicitante" con:
  - Radicación (límite 30 días)
  - Correcciones (límite 30-45 días según prórroga)
  - Pagos (límite 30 días)
- Añadida sección "Sugerencias del Sistema" que muestra:
  - Alertas cuando quedan ≤5 días de curaduría
  - Notificación cuando el plazo está vencido
  - Sugerencia de prórroga de correcciones

## Fórmulas de Cálculo

### Tiempo Base de Curaduría
```javascript
baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays
```
- `evaDefaultTime`: 20, 25, 35, 45 o 15 días según tipo
- `totalSuspensionDays`: Máximo 10 días (pre-acta + post-acta)
- `extensionDays`: 0 o 22 días (prórroga complejidad)

### Tiempo Consumido
```javascript
totalUsed = preActaUsed + postCorrUsed
```
- `preActaUsed`: Días desde state:5 (LDF) hasta state:30 (Acta Parte 1)
- `postCorrUsed`: Días desde state:35 (Correcciones) hasta state:61 (Viabilidad)

### Días Restantes
```javascript
daysLeft = baseTotal - totalUsed
```

### Semáforo de Estado
- **Verde**: `daysLeft > 5`
- **Amarillo**: `daysLeft ≤ 5 y > 0`
- **Rojo**: `daysLeft ≤ 0`

## Períodos Temporales

### PERÍODO 1: PRE-ACTA (TC - CURADURÍA)
- **Desde**: state:5 (Legal y Debida Forma)
- **Hasta**: state:30 (Acta Parte 1)
- **Actor**: CURADURÍA
- **Modificadores**: Suspensión Pre-Acta (300→350), Prórroga Complejidad (400→401)

### PERÍODO 2: CORRECCIONES (TS - SOLICITANTE)
- **Desde**: Notificación Acta (state:32 o 33)
- **Hasta**: state:35 (Radicación Correcciones)
- **Actor**: SOLICITANTE
- **Modificadores**: Prórroga Correcciones (state:34) - Extiende 30→45 días
- **IMPORTANTE**: NO consume tiempo de curaduría

### PERÍODO 3: POST-CORRECCIONES (TC - CURADURÍA)
- **Desde**: state:35 (Radicación Correcciones)
- **Hasta**: state:61 (Viabilidad)
- **Actor**: CURADURÍA
- **Modificadores**: Suspensión Post-Acta (301→351), Prórroga Complejidad (si no usada en Período 1)

## Validaciones Implementadas

### Bloqueantes (no permiten guardar):
1. **Límite Suspensiones**: Max 10 días totales (pre + post)
2. **Prórroga Única**: Solo una prórroga por complejidad en todo el expediente
3. **Prórroga Correcciones Única**: Solo una durante período de correcciones
4. **No Solapamiento**: Eventos especiales no pueden tener fechas superpuestas

### Advertencias (sugerencias en sidebar):
- Próximo vencimiento (≤5 días restantes)
- Plazo vencido
- Prórroga de correcciones disponible

## Testing Manual

### Test 1: Simulador de Fechas
1. Abrir página de expediente
2. Ver el DateSimulator en la parte superior
3. Hacer clic en "Activar Simulación"
4. Cambiar la fecha usando el selector o botones rápidos
5. Verificar que los cálculos se actualizan automáticamente

### Test 2: Cálculos de Tiempo de Curaduría
1. Crear/abrir expediente tipo IV (45 días base)
2. Registrar state:5 (LDF) con una fecha
3. Avanzar simulador +20 días
4. Registrar state:30 (Acta)
5. Verificar sidebar: "Días Usados: 20", "Días Restantes: 25"

### Test 3: Tiempos del Solicitante
1. Proceso con correcciones registradas
2. Verificar sección "Tiempos del Solicitante" en sidebar
3. Debe mostrar días usados/límite para:
   - Radicación
   - Correcciones
   - Pagos (si aplica)

### Test 4: Validación de Límites
1. Crear suspensión de 6 días
2. Crear suspensión de 3 días (total 9)
3. Intentar crear suspensión de 5 días
4. Verificar error: "Solo hay 1 días disponibles"

### Test 5: Sugerencias del Sistema
1. Consumir suficientes días para dejar ≤5 días restantes
2. Verificar que aparece sugerencia en sidebar
3. Verificar botones de acción (Añadir Suspensión, Prórroga)

## Estructura de Archivos Modificados

```
src/app/pages/user/clocks/
├── components/
│   ├── DateSimulator.js (NUEVO)
│   ├── SidebarInfo.js (MODIFICADO)
│   ├── ClockRow.js
│   └── HolidayCalendar.js
├── hooks/
│   └── useClocksManager.js (MODIFICADO)
├── config/
│   └── clocks.definitions.js (MODIFICADO)
├── centralClocks.component.js (MODIFICADO)
└── centralClocks.css (MODIFICADO)
```

## Estilos CSS Añadidos

```css
.date-simulator-container
.date-simulator-header
.date-simulator-body
```

## Notas de Implementación

1. **NO se modificó el backend**: Todas las validaciones están en frontend
2. **NO se cambiaron números de states**: Se mantienen 300, 350, 301, 351, 400, 401, etc.
3. **NO se eliminó funcionalidad existente**: Desistimientos y otras funciones permanecen intactas
4. **Compatibilidad**: El código es compatible con la versión actual sin breaking changes

## Estados del Proceso

- **No Iniciado**: No hay fecha en state:5 (LDF)
- **En Curso**: Proceso activo, consumiendo días
- **Pausado**: Esperando acción del solicitante o suspensión activa
- **Vencido**: daysLeft ≤ 0
- **Finalizado**: Existe state:49 (Acta Parte 2) o state:61 (Viabilidad)
- **Desistido**: Hay eventos de desistimiento registrados

## Semáforos Visuales

- 🟢 **Verde** (text-success): Dentro de límites normales
- 🟡 **Amarillo** (warning): Alerta, quedan ≤5 días
- 🔴 **Rojo** (text-danger): Vencido o excedido

## Dependencias

- **moment**: Manejo de fechas
- **DiasHabilesColombia**: Calculadora de días hábiles específica de Colombia
- **sweetalert2**: Diálogos modales para validaciones
- **Bootstrap**: Estilos y componentes UI

## Próximos Pasos (Opcional)

Si se desea ampliar en el futuro:
1. Agregar persistencia de fecha simulada en localStorage
2. Implementar exportación de reportes con cálculos
3. Agregar gráficos de línea de tiempo visual
4. Integrar notificaciones automáticas por email/SMS

## Soporte y Mantenimiento

Para modificaciones futuras, los puntos clave son:
- `useClocksManager.js`: Lógica de cálculos
- `clocks.definitions.js`: Configuración de eventos
- `validateBeforeSave`: Validaciones de negocio
- `DateSimulator`: Simulación de fechas

---

**Implementación completada**: ✅
**Archivos modificados**: 6
**Líneas añadidas**: ~600
**Líneas eliminadas**: ~50
**Tests manuales sugeridos**: 5
