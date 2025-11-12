
# PROMPT PARA AGENTE IA: IMPLEMENTACIÓN SISTEMA DE TIEMPOS DE CURADURÍA

## OBJETIVO
Refactorizar sistema de control de tiempos de procesos de curaduría urbana, agregando:
1. Componente simulador de fechas para testing manual
2. Validaciones de límites temporales
3. Visualización mejorada de tiempos por actor (Curaduría vs Solicitante)
4. Sistema de sugerencias proactivas

## REGLAS DE NEGOCIO FUNDAMENTALES

### ACTORES TEMPORALES
- **TC (Tiempo Curaduría)**: Consume plazos legales (20-45 días según tipo)
- **TS (Tiempo Solicitante)**: NO consume plazos de curaduría
- **TM (Tiempo Muerto)**: Notificaciones, no consume plazos

### PERÍODOS CRÍTICOS DEL PROCESO

**PERÍODO 1: PRE-ACTA (TC - CURADURÍA)**
```
state:5 (LDF) ────────────────> state:30 (Acta Parte 1)
Modificadores permitidos:
  - Suspensión Pre-Acta (300→350)
  - Prórroga Complejidad (400→401)
```

**PERÍODO 2: CORRECCIONES (TS - SOLICITANTE)**
```
Notif.Acta (32/33) ────────────> state:35 (Rad.Correcciones)
Modificadores permitidos:
  - Prórroga Correcciones (34) → Extiende 30 a 45 días
❗ Este período NO consume tiempo de curaduría
```

**PERÍODO 3: POST-CORRECCIONES (TC - CURADURÍA)**
```
state:35 (Rad.Corr) ───────────> state:61 (Viabilidad)
Modificadores permitidos:
  - Suspensión Post-Acta (301→351)
  - Prórroga Complejidad (400→401) si no usada en Período 1
```

### FÓRMULA DE CÁLCULO
```javascript
baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays
totalUsed = preActaUsed + postCorrUsed
daysLeft = baseTotal - totalUsed

// Semáforo:
// Verde: daysLeft > 5
// Amarillo: daysLeft ≤ 5 y > 0  
// Rojo: daysLeft ≤ 0
```

### LÍMITES CRÍTICOS
- Suspensiones: Máximo 10 días TOTALES (pre + post combinados)
- Prórroga Complejidad: Solo UNA vez (22 días fijos)
- Prórroga Correcciones: Solo UNA vez (15 días, solo solicitante)

## ARCHIVOS A MODIFICAR

### 1. DateSimulator.js (NUEVO)
**Ubicación**: `src/app/[proyecto]/[subcarpeta]/components/DateSimulator.js`
**Propósito**: Componente que permite cambiar fecha del sistema para testing

**Código completo**:
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
    if (isSimulating) onDateChange(moment(newDate));
  };

  const toggleSimulation = () => {
    const newState = !isSimulating;
    setIsSimulating(newState);
    onDateChange(newState ? moment(simulatedDate) : moment());
  };

  const addBusinessDays = (days) => {
    const currentDate = moment(simulatedDate);
    const newDate = businessDaysCalculator.addBusinessDays(currentDate, days);
    setSimulatedDate(newDate.format('YYYY-MM-DD'));
    if (isSimulating) onDateChange(newDate);
  };

  return (
    <div className="date-simulator-container">
      <div className="date-simulator-header">
        <h5><i className="fas fa-calendar-alt" /> Simulador de Fecha del Sistema</h5>
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
              <button onClick={() => handleDateChange(moment().format('YYYY-MM-DD'))} 
                      className="btn btn-sm btn-info" disabled={!isSimulating}>Hoy</button>
              <button onClick={() => addBusinessDays(-5)} 
                      className="btn btn-sm btn-warning" disabled={!isSimulating}>-5 días</button>
              <button onClick={() => addBusinessDays(5)} 
                      className="btn btn-sm btn-warning" disabled={!isSimulating}>+5 días</button>
              <button onClick={() => addBusinessDays(30)} 
                      className="btn btn-sm btn-primary" disabled={!isSimulating}>+30 días</button>
            </div>
          </div>
        </div>

        {isSimulating && (
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle" />
            <strong> Modo Simulación Activo</strong>
            <p>Fecha simulada: <strong>{moment(simulatedDate).format('DD/MM/YYYY')}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};
```

**CSS a agregar en centralClocks.css**:
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
```

---

### 2. useClocksManager.js (MODIFICAR)
**Ubicación**: `src/app/[proyecto]/[subcarpeta]/hooks/useClocksManager.js`

**Cambios específicos**:

a) **Agregar parámetro simulatedDate en firma de función**:
```javascript
// Línea 25 (aproximadamente)
export const useClocksManager = (currentItem, clocksData, currentVersion, simulatedDate = null) => {
  const currentDate = simulatedDate || moment();
  // Usar currentDate en lugar de moment() en TODOS los cálculos
}
```

b) **ELIMINAR bloque preFirstEventExtra** (líneas ~80-90):
```javascript
// ELIMINAR COMPLETAMENTE ESTAS LÍNEAS:
// const preFirstEventUsed = ...
// const preFirstEventExtra = Math.max(0, preFirstEventUsed - preActaUsed);
```

c) **Simplificar totalUsed** (línea ~95):
```javascript
const totalUsed = useMemo(() => {
  if (!ldfTime) return 0;

  const preActa = acta1Time ? dateParser_dateDiff(ldfTime, acta1Time) : 0;
  const postCorr = (corrTime && viaTime) ? dateParser_dateDiff(corrTime, viaTime) : 0;

  return preActa + postCorr;
}, [ldfTime, acta1Time, corrTime, viaTime]);
```

d) **AGREGAR cálculo solicitanteTimes** (después de totalUsed):
```javascript
const solicitanteTimes = useMemo(() => {
  const radicacionTime = ldfTime ? dateParser_dateDiff(currentItem.create, ldfTime) : null;

  const notifActa = getNewestDate([32, 33]);
  const corrExtension = getClock(34);
  const corrLimit = corrExtension?.date_start ? 45 : 30;
  const correccionesTime = (notifActa && corrTime) ? dateParser_dateDiff(notifActa, corrTime) : null;

  const notifVia = getNewestDate([56, 57]);
  const radicacionPagos = getClock(69);
  const pagosTime = (notifVia && radicacionPagos?.date_start) 
    ? dateParser_dateDiff(notifVia, radicacionPagos.date_start) : null;

  return {
    radicacion: { used: radicacionTime, limit: 30, status: radicacionTime > 30 ? 'exceeded' : 'ok' },
    correcciones: { used: correccionesTime, limit: corrLimit, hasExtension: !!corrExtension?.date_start, 
                    status: correccionesTime > corrLimit ? 'exceeded' : 'ok' },
    pagos: { used: pagosTime, limit: 30, status: pagosTime > 30 ? 'exceeded' : 'ok' }
  };
}, [currentItem, clocksData]);
```

e) **AGREGAR helper suggestions** (después de solicitanteTimes):
```javascript
const suggestions = useMemo(() => {
  const list = [];

  if (curaduriaDetails && !curaduriaDetails.notStarted && !curaduriaDetails.paused) {
    const { daysLeft } = curaduriaDetails;

    if (daysLeft <= 5 && daysLeft > 0) {
      list.push({
        type: 'warning',
        icon: 'fa-exclamation-triangle',
        message: `Quedan ${daysLeft} días disponibles para curaduría`,
        actions: [
          { type: 'suspension', label: 'Añadir Suspensión', enabled: canAddSuspension },
          { type: 'extension', label: 'Añadir Prórroga Complejidad', enabled: canAddExtension }
        ]
      });
    }

    if (daysLeft <= 0) {
      list.push({
        type: 'danger',
        icon: 'fa-times-circle',
        message: `Plazo vencido: ${Math.abs(daysLeft)} días de retraso`,
        actions: [{ type: 'special_extension', label: 'Solicitar Prórroga Especial', enabled: true }]
      });
    }
  }

  const notifActa = getNewestDate([32, 33]);
  const corrExtension = getClock(34);
  if (notifActa && !corrTime && !corrExtension) {
    const corrUsed = dateParser_dateDiff(notifActa, currentDate);
    const corrLeft = 30 - corrUsed;

    if (corrLeft <= 5 && corrLeft > 0) {
      list.push({
        type: 'info',
        icon: 'fa-clock',
        message: `Prórroga de correcciones disponible (${corrLeft} días restantes)`,
        actions: [{ type: 'correction_extension', label: 'Otorgar Prórroga +15 días', enabled: true }]
      });
    }
  }

  return list;
}, [curaduriaDetails, canAddSuspension, canAddExtension, clocksData, currentDate]);
```

f) **Actualizar return** (al final):
```javascript
return {
  // ... todos los exports existentes ...
  solicitanteTimes,      // NUEVO
  suggestions,           // NUEVO
  currentDate,           // NUEVO
};
```

---

### 3. clocks.definitions.js (MODIFICAR)
**Ubicación**: `src/app/[proyecto]/[subcarpeta]/config/clocks.definitions.js`

a) **Actualizar getSuspensionClocks** (línea ~10):
```javascript
const getSuspensionClocks = (suspensionData, type) => {
  if (!suspensionData.exists) return [];

  const [startState, endState] = type === 'pre' ? [300, 350] : [301, 351];
  const title = type === 'pre' 
    ? 'SUSPENSIÓN PRE-ACTA (Período 1: Antes de Acta Parte 1)' 
    : 'SUSPENSIÓN POST-ACTA (Período 3: Después de Correcciones)';

  return [
    { title, subtitle: 'Extiende plazos de CURADURÍA - No cuenta como días consumidos' },
    { state: startState, name: 'Inicio de Suspensión', editableDate: true, 
      hasConsecutivo: false, hasAnnexSelect: true, suspensionInfo: { data: suspensionData, type } },
    { state: endState, name: 'Fin de Suspensión', editableDate: true, 
      hasConsecutivo: false, hasAnnexSelect: true, spentDaysConfig: { startState } }
  ];
};
```

b) **REEMPLAZAR sección de PAGOS** (buscar "PAGOS" en el archivo):
```javascript
{ title: 'PAGOS DEL SOLICITANTE', 
  subtitle: '30 días hábiles desde notificación de viabilidad - Tiempo del SOLICITANTE (TS)' },
{ state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", 
  limit: [[56, 57], 30], info: ['PAGO', 'NO PAGO', 'NA'], hasConsecutivo: true, 
  editableDate: true, show: conOA() },
{ state: 63, name: namePayment, desc: "Pago de Impuestos Municipales / Delineación", 
  limit: [[56, 57], 30], info: ['PAGO', 'NO PAGO', 'NA'], hasConsecutivo: true, 
  editableDate: true, show: conOA() },
{ state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", 
  limit: [[56, 57], 30], info: ['PAGO', 'NO PAGO', 'NA'], hasConsecutivo: true, editableDate: true },
{ state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", 
  limit: [[56, 57], 30], info: ['PAGO', 'NO PAGO', 'NA'], hasConsecutivo: true, 
  editableDate: true, show: !conGI },
{ state: 69, name: 'Radicación Último Pago', desc: "Radicación de todos los pagos - CRÍTICO", 
  limit: [[56, 57], 30], hasConsecutivo: true, editableDate: true, criticalEvent: true },
```

---

### 4. centralClocks.component.js (MODIFICAR)
**Ubicación**: `src/app/[proyecto]/[subcarpeta]/centralClocks.component.js`

a) **Importar DateSimulator** (línea ~10):
```javascript
import { DateSimulator } from './components/DateSimulator';
```

b) **Agregar estado** (línea ~25):
```javascript
const [simulatedDate, setSimulatedDate] = useState(null);
```

c) **Pasar a useClocksManager** (línea ~35):
```javascript
const manager = useClocksManager(currentItem, clocksData, currentVersion, simulatedDate);
```

d) **AGREGAR función validateBeforeSave** (después de useEffect):
```javascript
const validateBeforeSave = (eventType, eventData, helpers) => {
  const { totalSuspensionDays, extension, getClock } = helpers;

  if (eventType === 'suspension') {
    const newDays = dateParser_dateDiff(eventData.startDate, eventData.endDate);
    const diasDisponibles = 10 - totalSuspensionDays;
    if (newDays > diasDisponibles) {
      MySwal.fire({ icon: 'error', title: 'Límite Excedido',
        text: `Solo hay ${diasDisponibles} días disponibles.` });
      return false;
    }
  }

  if (eventType === 'extension' && extension.exists) {
    MySwal.fire({ icon: 'error', title: 'Prórroga Ya Existe',
      text: 'Solo puede haber UNA prórroga por complejidad.' });
    return false;
  }

  if (eventType === 'correction_extension' && getClock(34)?.date_start) {
    MySwal.fire({ icon: 'error', title: 'Prórroga Ya Otorgada',
      text: 'Ya se otorgó prórroga de correcciones.' });
    return false;
  }

  return true;
};
```

e) **Modificar addTimeControl** para usar validación (buscar función addTimeControl):
```javascript
// Dentro de handleConfirm:
if (!validateBeforeSave(type, formData, manager)) {
  return; // No guardar si falla validación
}
```

f) **Agregar DateSimulator al render** (antes de la tabla):
```javascript
return (
  <div className="central-clocks-container">
    <DateSimulator onDateChange={setSimulatedDate} />
    {/* resto del código existente */}
  </div>
);
```

---

### 5. SidebarInfo.js (MODIFICAR)
**Ubicación**: `src/app/[proyecto]/[subcarpeta]/components/SidebarInfo.js`

a) **AGREGAR función renderSolicitanteTimes**:
```javascript
const renderSolicitanteTimes = () => {
  const { solicitanteTimes } = manager;
  if (!solicitanteTimes) return null;

  return (
    <div className="sidebar-card">
      <div className="sidebar-card-header">
        <i className="fas fa-user-clock" /><span>Tiempos del Solicitante</span>
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
              {solicitanteTimes.correcciones.hasExtension && 
                <i className="fas fa-clock text-info ml-1" title="Con prórroga" />}
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

b) **AGREGAR función renderSuggestions**:
```javascript
const renderSuggestions = () => {
  const { suggestions } = manager;
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="sidebar-card suggestions-card">
      <div className="sidebar-card-header">
        <i className="fas fa-lightbulb" /><span>Sugerencias del Sistema</span>
      </div>
      <div className="sidebar-card-body">
        {suggestions.map((s, i) => (
          <div key={i} className={`alert alert-${s.type}`}>
            <i className={`fas ${s.icon}`} />
            <p className="mb-2">{s.message}</p>
            {s.actions?.length > 0 && (
              <div className="btn-group-vertical w-100">
                {s.actions.map((a, j) => (
                  <button key={j} disabled={!a.enabled} 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onAddTimeControl(a.type)}>
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

c) **Agregar al return principal** (después de renderCuraduriaDetails()):
```javascript
{renderSolicitanteTimes()}
{renderSuggestions()}
```

---

## ORDEN DE IMPLEMENTACIÓN

1. DateSimulator.js (crear archivo nuevo)
2. useClocksManager.js (modificar)
3. clocks.definitions.js (modificar)
4. centralClocks.component.js (modificar)
5. SidebarInfo.js (modificar)

## CRITERIOS DE ÉXITO

✅ DateSimulator permite cambiar fecha y cálculos se actualizan
✅ Sidebar muestra tiempos de solicitante separados
✅ Sidebar muestra sugerencias cuando quedan ≤5 días
✅ Validaciones bloquean guardado de eventos inválidos
✅ Configuración de pagos con campos info restaurada
✅ No permite >10 días de suspensión total
✅ No permite >1 prórroga complejidad
✅ Prórroga correcciones extiende 30→45 días (solo solicitante)

## RESTRICCIONES

❌ NO crear tests automatizados
❌ NO modificar backend
❌ NO cambiar números de states
❌ NO eliminar funcionalidad de desistimientos

---

FIN DEL PROMPT
