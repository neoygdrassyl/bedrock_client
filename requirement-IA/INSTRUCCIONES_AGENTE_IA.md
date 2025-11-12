
# PLAN DE IMPLEMENTACIÓN: SISTEMA DE CONTROL DE TIEMPOS DE CURADURÍA
## Instrucciones para Agente IA

---

## CONTEXTO GENERAL

Este sistema gestiona tiempos de procesos de curaduría urbana en Colombia. Hay 3 tipos de tiempo:
- **TC (Tiempo Curaduría)**: Días que consumen plazos legales (20-45 según tipo)
- **TS (Tiempo Solicitante)**: Días del ciudadano, NO consumen curaduría
- **TM (Tiempo Muerto)**: Notificaciones, no consumen plazos de nadie

---

## REGLA FUNDAMENTAL: PERÍODOS TEMPORALES

### PERÍODO 1: PRE-ACTA (TC - CURADURÍA)
- **Desde**: state:5 (Legal y Debida Forma)
- **Hasta**: state:30 (Acta Parte 1)
- **Actor**: CURADURÍA
- **Modificadores permitidos**:
  * Suspensión Pre-Acta (states 300→350)
  * Prórroga por Complejidad (states 400→401)

### PERÍODO 2: CORRECCIONES (TS - SOLICITANTE)
- **Desde**: Notificación Acta surtida (state:32 o 33)
- **Hasta**: state:35 (Radicación Correcciones)
- **Actor**: SOLICITANTE
- **Modificadores permitidos**:
  * Prórroga de Correcciones (state:34) - Extiende 30→45 días
- **IMPORTANTE**: Este período NO consume tiempo de curaduría

### PERÍODO 3: POST-CORRECCIONES (TC - CURADURÍA)
- **Desde**: state:35 (Radicación Correcciones)
- **Hasta**: state:61 (Viabilidad)
- **Actor**: CURADURÍA
- **Modificadores permitidos**:
  * Suspensión Post-Acta (states 301→351)
  * Prórroga por Complejidad (states 400→401) - Si no se usó en Período 1

### REGLA CRÍTICA
Las suspensiones y prórroga complejidad:
- Solo existen en PERÍODO 1 (pre-acta) o PERÍODO 3 (post-correcciones)
- NO existen durante PERÍODO 2 (correcciones) porque ese es tiempo del solicitante
- La prórroga de correcciones es DIFERENTE, solo afecta al solicitante

---

## FÓRMULA DE CÁLCULO UNIFICADA

```javascript
// Tiempo base según tipo
evaDefaultTime = FUN_0_TYPE_TIME[currentItem.type]; // 20, 25, 35, 45 o 15

// Días de suspensiones (solo las finalizadas)
totalSuspensionDays = suspensionPreActa.days + suspensionPostActa.days; // Max 10 total

// Días de prórroga complejidad
extensionDays = extension.exists ? 22 : 0; // 22 días fijos o 0

// Total disponible para curaduría
baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays;

// Días consumidos Período 1 (pre-acta)
preActaUsed = dateParser_dateDiff(state:5, state:30);

// Días consumidos Período 3 (post-correcciones)
postCorrUsed = dateParser_dateDiff(state:35, state:61); // Solo si hay correcciones

// Total consumido por curaduría
totalUsed = preActaUsed + postCorrUsed;

// Días disponibles restantes
daysLeft = baseTotal - totalUsed;
```

**Semáforo**:
- `daysLeft > 5`: Verde (Normal)
- `daysLeft ≤ 5 y > 0`: Amarillo (Alerta)
- `daysLeft ≤ 0`: Rojo (Vencido)

---

## TAREAS DE IMPLEMENTACIÓN

### TAREA 1: Crear Componente DateSimulator (NUEVO)

**Archivo**: `src/app/[proyecto]/[subcarpeta]/components/DateSimulator.js`

**Propósito**: Componente que permite cambiar la fecha del sistema para visualizar cómo se calculan los tiempos en diferentes momentos.

**Código Completo**:

```javascript
import React, { useState } from 'react';
import moment from 'moment';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

const businessDaysCalculator = new DiasHabilesColombia();

export const DateSimulator = ({ onDateChange }) => {
  const [simulatedDate, setSimulatedDate] = useState(moment().format('YYYY-MM-DD'));
  const [isSimulating, setIsSimulating] = useState(false);

  const handleDateChange = (newDate) => {
    setSimulatedDate(newDate);
    if (isSimulating) {
      onDateChange(moment(newDate));
    }
  };

  const toggleSimulation = () => {
    const newState = !isSimulating;
    setIsSimulating(newState);

    if (newState) {
      onDateChange(moment(simulatedDate));
    } else {
      onDateChange(moment()); // Reset a fecha actual
    }
  };

  const addBusinessDays = (days) => {
    const currentDate = moment(simulatedDate);
    const newDate = businessDaysCalculator.addBusinessDays(currentDate, days);
    setSimulatedDate(newDate.format('YYYY-MM-DD'));
    if (isSimulating) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="date-simulator-container">
      <div className="date-simulator-header">
        <h5>
          <i className="fas fa-calendar-alt" />
          Simulador de Fecha del Sistema
        </h5>
        <button 
          onClick={toggleSimulation}
          className={`btn btn-sm ${isSimulating ? 'btn-success' : 'btn-secondary'}`}
        >
          <i className={`fas ${isSimulating ? 'fa-pause' : 'fa-play'}`} />
          {isSimulating ? 'Simulación Activa' : 'Activar Simulación'}
        </button>
      </div>

      <div className="date-simulator-body">
        <div className="row">
          <div className="col-md-6">
            <label>Fecha Simulada:</label>
            <input 
              type="date" 
              className="form-control"
              value={simulatedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={!isSimulating}
            />
          </div>
          <div className="col-md-6">
            <label>Acciones Rápidas:</label>
            <div className="btn-group" role="group">
              <button 
                onClick={() => handleDateChange(moment().format('YYYY-MM-DD'))}
                className="btn btn-sm btn-info"
                disabled={!isSimulating}
              >
                Hoy
              </button>
              <button 
                onClick={() => addBusinessDays(-5)}
                className="btn btn-sm btn-warning"
                disabled={!isSimulating}
              >
                -5 días
              </button>
              <button 
                onClick={() => addBusinessDays(5)}
                className="btn btn-sm btn-warning"
                disabled={!isSimulating}
              >
                +5 días
              </button>
              <button 
                onClick={() => addBusinessDays(30)}
                className="btn btn-sm btn-primary"
                disabled={!isSimulating}
              >
                +30 días
              </button>
            </div>
          </div>
        </div>

        {isSimulating && (
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle" />
            <strong>Modo Simulación Activo</strong>
            <p>
              Los cálculos de días disponibles, días consumidos y fechas límite 
              se calculan como si hoy fuera: <strong>{moment(simulatedDate).format('DD/MM/YYYY')}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

**CSS a agregar en `centralClocks.css`**:

```css
.date-simulator-container {
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.date-simulator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dee2e6;
}

.date-simulator-header h5 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.date-simulator-header h5 i {
  margin-right: 0.5rem;
  color: #007bff;
}

.date-simulator-body .btn-group {
  width: 100%;
}

.date-simulator-body .btn-group button {
  flex: 1;
}
```

---

### TAREA 2: Modificar useClocksManager.js

**Archivo**: `src/app/[proyecto]/[subcarpeta]/hooks/useClocksManager.js`

**Cambios a realizar**:

1. **Agregar parámetro simulatedDate**:
```javascript
export const useClocksManager = (currentItem, clocksData, currentVersion, simulatedDate = null) => {
  const currentDate = simulatedDate || moment();

  // Usar currentDate en lugar de moment() en todos los cálculos
}
```

2. **ELIMINAR cálculo `preFirstEventExtra`** (líneas ~80-90):
```javascript
// ELIMINAR ESTE BLOQUE COMPLETO:
/*
const preFirstEventUsed = firstEvent 
  ? dateParser_dateDiff(ldfTime, firstEvent.date) 
  : 0;
const preFirstEventExtra = Math.max(0, preFirstEventUsed - preActaUsed);
*/
```

3. **Simplificar cálculo de totalUsed**:
```javascript
const totalUsed = useMemo(() => {
  if (!ldfTime) return 0;

  // PERÍODO 1: Pre-Acta (state:5 → state:30)
  const preActa = acta1Time 
    ? dateParser_dateDiff(ldfTime, acta1Time) 
    : 0;

  // PERÍODO 3: Post-Correcciones (state:35 → state:61)
  // Solo si existen correcciones
  const postCorr = (corrTime && viaTime) 
    ? dateParser_dateDiff(corrTime, viaTime) 
    : 0;

  return preActa + postCorr;
}, [ldfTime, acta1Time, corrTime, viaTime]);
```

4. **Agregar cálculo de tiempos del solicitante**:
```javascript
const solicitanteTimes = useMemo(() => {
  // RADICACIÓN: desde creación hasta state:5 (LDF)
  const radicacionTime = ldfTime 
    ? dateParser_dateDiff(currentItem.create, ldfTime) 
    : null;

  // CORRECCIONES: desde notificación acta hasta state:35
  const notifActa = getNewestDate([32, 33]);
  const corrExtension = getClock(34); // Prórroga correcciones
  const corrLimit = corrExtension?.date_start ? 45 : 30;
  const correccionesTime = (notifActa && corrTime) 
    ? dateParser_dateDiff(notifActa, corrTime) 
    : null;

  // PAGOS: desde notificación viabilidad hasta state:69
  const notifVia = getNewestDate([56, 57]);
  const radicacionPagos = getClock(69);
  const pagosTime = (notifVia && radicacionPagos?.date_start) 
    ? dateParser_dateDiff(notifVia, radicacionPagos.date_start) 
    : null;

  return {
    radicacion: { 
      used: radicacionTime, 
      limit: 30,
      status: radicacionTime > 30 ? 'exceeded' : 'ok'
    },
    correcciones: { 
      used: correccionesTime, 
      limit: corrLimit,
      hasExtension: !!corrExtension?.date_start,
      status: correccionesTime > corrLimit ? 'exceeded' : 'ok'
    },
    pagos: { 
      used: pagosTime, 
      limit: 30,
      status: pagosTime > 30 ? 'exceeded' : 'ok'
    }
  };
}, [currentItem, clocksData]);
```

5. **Agregar helper de sugerencias**:
```javascript
const suggestions = useMemo(() => {
  const list = [];

  // Sugerencia: Días de curaduría por vencer
  if (curaduriaDetails && !curaduriaDetails.notStarted && !curaduriaDetails.paused) {
    const { daysLeft } = curaduriaDetails;

    if (daysLeft <= 5 && daysLeft > 0) {
      list.push({
        type: 'warning',
        icon: 'fa-exclamation-triangle',
        message: `Quedan ${daysLeft} días disponibles para curaduría`,
        actions: [
          { 
            type: 'suspension', 
            label: 'Añadir Suspensión', 
            enabled: canAddSuspension 
          },
          { 
            type: 'extension', 
            label: 'Añadir Prórroga Complejidad', 
            enabled: canAddExtension 
          }
        ]
      });
    }

    if (daysLeft <= 0) {
      list.push({
        type: 'danger',
        icon: 'fa-times-circle',
        message: `Plazo vencido: ${Math.abs(daysLeft)} días de retraso`,
        actions: [
          { 
            type: 'special_extension', 
            label: 'Solicitar Prórroga Especial', 
            enabled: true 
          }
        ]
      });
    }
  }

  // Sugerencia: Prórroga de correcciones
  const notifActa = getNewestDate([32, 33]);
  const corrExtension = getClock(34);
  if (notifActa && !corrTime && !corrExtension) {
    const corrUsed = dateParser_dateDiff(notifActa, currentDate);
    const corrLeft = 30 - corrUsed;

    if (corrLeft <= 5 && corrLeft > 0) {
      list.push({
        type: 'info',
        icon: 'fa-clock',
        message: `Prórroga de correcciones disponible (${corrLeft} días restantes para solicitante)`,
        actions: [
          { 
            type: 'correction_extension', 
            label: 'Otorgar Prórroga +15 días', 
            enabled: true 
          }
        ]
      });
    }
  }

  return list;
}, [curaduriaDetails, canAddSuspension, canAddExtension, clocksData, currentDate]);
```

6. **Actualizar exports**:
```javascript
return {
  // ... exports existentes ...
  solicitanteTimes,
  suggestions,
  currentDate, // Nueva exportación para usar en componentes
};
```

---

### TAREA 3: Actualizar clocks.definitions.js

**Archivo**: `src/app/[proyecto]/[subcarpeta]/config/clocks.definitions.js`

**Cambios**:

1. **Actualizar función getSuspensionClocks** para aclarar períodos:
```javascript
const getSuspensionClocks = (suspensionData, type) => {
  if (!suspensionData.exists) return [];

  const [startState, endState] = type === 'pre' ? [300, 350] : [301, 351];
  const title = type === 'pre' 
    ? 'SUSPENSIÓN PRE-ACTA (Período 1: Antes de Acta Parte 1)' 
    : 'SUSPENSIÓN POST-ACTA (Período 3: Después de Correcciones)';

  return [
    { 
      title,
      subtitle: 'Extiende plazos de CURADURÍA - No cuenta como días consumidos'
    },
    {
      state: startState, 
      name: 'Inicio de Suspensión', 
      editableDate: true, 
      hasConsecutivo: false, 
      hasAnnexSelect: true,
      suspensionInfo: { data: suspensionData, type }
    },
    {
      state: endState, 
      name: 'Fin de Suspensión', 
      editableDate: true, 
      hasConsecutivo: false, 
      hasAnnexSelect: true,
      spentDaysConfig: { startState }
    },
  ];
};
```

2. **Actualizar función getExtensionClocks**:
```javascript
const getExtensionClocks = (extensionData) => {
  if (!extensionData.exists) return [];

  // Determinar si es pre o post basado en fechas
  const acta1 = helpers.getClock(30);
  const correcciones = helpers.getClock(35);

  let period = 'Indeterminado';
  if (extensionData.start?.date_start) {
    if (acta1?.date_start && extensionData.start.date_start < acta1.date_start) {
      period = 'Período 1: Antes de Acta Parte 1';
    } else if (correcciones?.date_start && extensionData.start.date_start >= correcciones.date_start) {
      period = 'Período 3: Después de Correcciones';
    }
  }

  return [
    { 
      title: 'PRÓRROGA POR COMPLEJIDAD',
      subtitle: `${period} - Extiende plazos de CURADURÍA en 22 días fijos`
    },
    {
      state: 400,
      name: 'Inicio Prórroga Complejidad',
      editableDate: true,
      hasConsecutivo: false,
      hasAnnexSelect: true
    },
    {
      state: 401,
      name: 'Fin Prórroga Complejidad',
      editableDate: true,
      hasConsecutivo: false,
      hasAnnexSelect: true,
      spentDaysConfig: { startState: 400 }
    }
  ];
};
```

3. **RECUPERAR configuración de pagos** (reemplazar sección de PAGOS existente):
```javascript
// En la función generateClocks, reemplazar sección de pagos:
{ 
  title: 'PAGOS DEL SOLICITANTE',
  subtitle: '30 días hábiles desde notificación de viabilidad - Tiempo del SOLICITANTE (TS)'
},
{
  state: 62, 
  name: 'Expensas Variables', 
  desc: "Pago de Expensas Variables", 
  limit: [[56, 57], 30], 
  info: ['PAGO', 'NO PAGO', 'NA'],
  hasConsecutivo: true,
  editableDate: true,
  show: conOA()
},
{
  state: 63, 
  name: namePayment, 
  desc: "Pago de Impuestos Municipales / Delineación", 
  limit: [[56, 57], 30], 
  info: ['PAGO', 'NO PAGO', 'NA'],
  hasConsecutivo: true,
  editableDate: true,
  show: conOA()
},
{
  state: 64, 
  name: 'Estampilla PRO-UIS', 
  desc: "Pago de Estampilla PRO-UIS", 
  limit: [[56, 57], 30], 
  info: ['PAGO', 'NO PAGO', 'NA'],
  hasConsecutivo: true,
  editableDate: true
},
{
  state: 65, 
  name: 'Deberes Urbanísticos', 
  desc: "Pago de Deberes Urbanísticos", 
  limit: [[56, 57], 30], 
  info: ['PAGO', 'NO PAGO', 'NA'],
  hasConsecutivo: true,
  editableDate: true,
  show: !conGI
},
{
  state: 69, 
  name: 'Radicación Último Pago', 
  desc: "Radicación de todos los pagos requeridos - EVENTO CRÍTICO", 
  limit: [[56, 57], 30],
  hasConsecutivo: true,
  editableDate: true,
  criticalEvent: true
},
```

---

### TAREA 4: Actualizar centralClocks.component.js

**Archivo**: `src/app/[proyecto]/[subcarpeta]/centralClocks.component.js`

**Cambios**:

1. **Importar DateSimulator**:
```javascript
import { DateSimulator } from './components/DateSimulator';
```

2. **Agregar estado para fecha simulada**:
```javascript
const [simulatedDate, setSimulatedDate] = useState(null);
```

3. **Pasar simulatedDate a useClocksManager**:
```javascript
const manager = useClocksManager(currentItem, clocksData, currentVersion, simulatedDate);
```

4. **Agregar DateSimulator al renderizado** (antes de la tabla):
```javascript
return (
  <div className="central-clocks-container">
    {/* Nuevo componente */}
    <DateSimulator onDateChange={setSimulatedDate} />

    {/* Resto del código existente */}
    <div className="clocks-main-content">
      {/* ... tabla y sidebar ... */}
    </div>
  </div>
);
```

5. **Agregar función de validación unificada**:
```javascript
const validateBeforeSave = (eventType, eventData, helpers) => {
  const { totalSuspensionDays, extension, getClock } = helpers;

  // Validación 1: Límite de suspensiones
  if (eventType === 'suspension') {
    const newDays = dateParser_dateDiff(eventData.startDate, eventData.endDate);
    const diasDisponibles = 10 - totalSuspensionDays;

    if (newDays > diasDisponibles) {
      MySwal.fire({
        icon: 'error',
        title: 'Límite Excedido',
        text: `Solo hay ${diasDisponibles} días disponibles de los 10 totales permitidos para suspensiones.`
      });
      return false;
    }
  }

  // Validación 2: Prórroga complejidad única
  if (eventType === 'extension') {
    if (extension.exists) {
      MySwal.fire({
        icon: 'error',
        title: 'Prórroga Ya Existe',
        text: 'Solo puede haber UNA prórroga por complejidad en el expediente.'
      });
      return false;
    }
  }

  // Validación 3: Prórroga correcciones única
  if (eventType === 'correction_extension') {
    if (getClock(34)?.date_start) {
      MySwal.fire({
        icon: 'error',
        title: 'Prórroga Ya Otorgada',
        text: 'Ya se otorgó prórroga de correcciones al solicitante.'
      });
      return false;
    }
  }

  // Validación 4: No solapamiento (simplificada)
  if (['suspension', 'extension'].includes(eventType)) {
    const allSpecialEvents = [
      ...Object.values(helpers).filter(h => h?.start?.date_start && h?.end?.date_start)
    ];

    for (let event of allSpecialEvents) {
      const eventStart = moment(event.start.date_start);
      const eventEnd = moment(event.end.date_start);
      const newStart = moment(eventData.startDate);
      const newEnd = moment(eventData.endDate);

      const overlaps = newStart.isBetween(eventStart, eventEnd, null, '[]') ||
                       newEnd.isBetween(eventStart, eventEnd, null, '[]') ||
                       (newStart.isSameOrBefore(eventStart) && newEnd.isSameOrAfter(eventEnd));

      if (overlaps) {
        MySwal.fire({
          icon: 'error',
          title: 'Fechas Solapadas',
          text: 'Las fechas se solapan con otro evento especial existente.'
        });
        return false;
      }
    }
  }

  return true;
};
```

6. **Actualizar addTimeControl** para usar validaciones:
```javascript
const addTimeControl = (type) => {
  // ... código de modal existente ...

  // En el handleConfirm:
  const handleConfirm = async () => {
    const formData = {
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      // ... otros campos
    };

    // VALIDAR ANTES DE GUARDAR
    if (!validateBeforeSave(type, formData, manager)) {
      return; // No continuar si validación falla
    }

    // Guardar en BD
    await FUN_SERVICE.save_clock(formData);
    setRefreshTrigger(prev => prev + 1);
    MySwal.close();
  };
};
```

---

### TAREA 5: Actualizar SidebarInfo.js

**Archivo**: `src/app/[proyecto]/[subcarpeta]/components/SidebarInfo.js`

**Cambios**:

1. **Agregar sección de tiempos del solicitante**:
```javascript
const renderSolicitanteTimes = () => {
  const { solicitanteTimes } = manager;
  if (!solicitanteTimes) return null;

  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">
        <i className="fas fa-user-clock" />
        <span>Tiempos del Solicitante</span>
      </div>
      <div className="sidebar-card-body">
        {solicitanteTimes.radicacion.used !== null && (
          <div className="value-row">
            <span className="label">Radicación:</span>
            <span className={`value ${solicitanteTimes.radicacion.status === 'exceeded' ? 'text-danger' : 'text-success'}`}>
              {solicitanteTimes.radicacion.used} / {solicitanteTimes.radicacion.limit} días
            </span>
          </div>
        )}

        {solicitanteTimes.correcciones.used !== null && (
          <div className="value-row">
            <span className="label">Correcciones:</span>
            <span className={`value ${solicitanteTimes.correcciones.status === 'exceeded' ? 'text-danger' : 'text-success'}`}>
              {solicitanteTimes.correcciones.used} / {solicitanteTimes.correcciones.limit} días
              {solicitanteTimes.correcciones.hasExtension && (
                <i className="fas fa-clock text-info ml-1" title="Con prórroga" />
              )}
            </span>
          </div>
        )}

        {solicitanteTimes.pagos.used !== null && (
          <div className="value-row">
            <span className="label">Pagos:</span>
            <span className={`value ${solicitanteTimes.pagos.status === 'exceeded' ? 'text-danger' : 'text-success'}`}>
              {solicitanteTimes.pagos.used} / {solicitanteTimes.pagos.limit} días
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
```

2. **Agregar sección de sugerencias**:
```javascript
const renderSuggestions = () => {
  const { suggestions } = manager;
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="sidebar-card suggestions-card">
      <div className="sidebar-card-header">
        <i className="fas fa-lightbulb" />
        <span>Sugerencias del Sistema</span>
      </div>
      <div className="sidebar-card-body">
        {suggestions.map((s, i) => (
          <div key={i} className={`alert alert-${s.type}`}>
            <i className={`fas ${s.icon}`} />
            <p className="mb-2">{s.message}</p>
            {s.actions && s.actions.length > 0 && (
              <div className="btn-group-vertical w-100">
                {s.actions.map((a, j) => (
                  <button
                    key={j}
                    disabled={!a.enabled}
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onAddTimeControl(a.type)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

3. **Agregar al renderizado**:
```javascript
return (
  <div className="sidebar-container">
    {/* Cards existentes */}
    {renderMainStatus()}
    {renderCuraduriaDetails()}

    {/* Nuevas secciones */}
    {renderSolicitanteTimes()}
    {renderSuggestions()}

    {/* Resto de cards */}
  </div>
);
```

---

## VALIDACIONES IMPLEMENTADAS

### En validateBeforeSave():

1. **Límite de Suspensiones**: Max 10 días totales (pre + post)
2. **Prórroga Complejidad Única**: Solo una en todo el expediente
3. **Prórroga Correcciones Única**: Solo una durante período de correcciones
4. **No Solapamiento**: Eventos especiales no pueden tener fechas superpuestas

### Advertencias Visuales (No bloqueantes):

- **Publicación tardía** (state:85 > 1 día después de state:70)
- **Entrega tardía** (state:98 > 1 día después de state:99)
- **Recurso fuera de plazo** (state:74 > 10 días después de notif. resolución)

---

## PRUEBAS MANUALES SUGERIDAS

### Test 1: Simulación de Proceso Normal
1. Activar DateSimulator
2. Crear expediente tipo IV (45 días base)
3. Registrar state:5 con fecha simulada
4. Avanzar +20 días y registrar state:30
5. Verificar: preActaUsed = 20, daysLeft = 25

### Test 2: Suspensión Pre-Acta
1. Crear expediente tipo II (25 días)
2. Registrar state:5
3. Avanzar +10 días, crear suspensión 300
4. Avanzar +5 días, cerrar suspensión 350
5. Avanzar +10 días más, registrar state:30
6. Verificar: baseTotal = 25 + 5 = 30 días

### Test 3: Prórroga de Correcciones
1. Proceso hasta notificación acta (32)
2. Avanzar +25 días con simulador
3. Verificar sugerencia aparece en sidebar
4. Crear prórroga correcciones (34)
5. Verificar límite cambió de 30 a 45 días

### Test 4: Validación de Límite
1. Crear suspensión 1: 6 días
2. Crear suspensión 2: 3 días (total 9)
3. Intentar crear suspensión 3: 5 días
4. Verificar: Sistema bloquea con error "Solo hay 1 días disponibles"

### Test 5: Proceso Vencido
1. Expediente tipo I (20 días)
2. Consumir 25 días sin modificadores
3. Verificar sidebar muestra: "Plazo vencido: 5 días de retraso"
4. Verificar botón "Prórroga Especial" aparece

---

## IMPORTANTE: NO IMPLEMENTAR

❌ **NO crear tests automatizados** (Jest, React Testing Library, etc)
❌ **NO modificar backend** (todas las validaciones en frontend)
❌ **NO cambiar números de states** (mantener 300, 350, 301, 351, 400, 401, etc)
❌ **NO eliminar funcionalidad existente** de desistimientos

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **PRIMERO**: DateSimulator (para poder probar todo lo demás)
2. **SEGUNDO**: Modificar useClocksManager (núcleo de cálculos)
3. **TERCERO**: Actualizar clocks.definitions (configuración)
4. **CUARTO**: Integrar DateSimulator en centralClocks.component
5. **QUINTO**: Agregar validaciones en centralClocks.component
6. **SEXTO**: Actualizar SidebarInfo (visualización)

---

## CRITERIOS DE ÉXITO

✅ DateSimulator permite cambiar fecha y todos los cálculos se actualizan
✅ Sidebar muestra tiempos de solicitante separados de curaduría
✅ Sidebar muestra sugerencias cuando quedan ≤5 días
✅ Validaciones bloquean guardado de eventos inválidos
✅ Configuración de pagos restaurada con campos info
✅ No se puede crear más de 10 días de suspensión total
✅ No se puede crear más de una prórroga complejidad
✅ Prórroga de correcciones extiende plazo de 30 a 45 días (solo solicitante)

---

FIN DE INSTRUCCIONES
