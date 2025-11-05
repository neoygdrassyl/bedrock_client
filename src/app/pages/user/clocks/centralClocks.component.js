import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';


import { useClocksManager } from './hooks/useClocksManager';
import { generateClocks } from './config/clocks.definitions';
import { ClockRow } from './components/ClockRow';
import { SidebarInfo } from './components/SidebarInfo';
import { HolidayCalendar } from './components/HolidayCalendar';


import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';


const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;


export default function EXP_CLOCKS(props) {
  const { swaMsg, currentItem, currentVersion, outCodes } = props;
  const [clocksData, setClocksData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (currentItem?.fun_clocks) {
      setClocksData([...currentItem.fun_clocks]);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [currentItem?.fun_clocks]);

  const manager = useClocksManager(currentItem, clocksData, currentVersion);

  useEffect(() => {
    const handleResize = () => {
      if (sidebarRef.current) {
        setSidebarHeight(sidebarRef.current.offsetHeight - 44); // 44px es la altura del Header de la tabla
      }
    };
    
    handleResize(); 
    const timer = setTimeout(handleResize, 200); 

    window.addEventListener('resize', handleResize);
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
    };
  }, [clocksData, manager.canAddExtension, manager.canAddSuspension]);
  
  const { getClock, getClockVersion, availableSuspensionTypes, totalSuspensionDays, suspensionPreActa, suspensionPostActa } = manager;


  const conGI = _GLOBAL_ID === 'cb1';
  const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';


  const clocksToShow = generateClocks({
      ...manager,
      currentItem,
      namePayment,
      conGI
  });


  const applyLocalClockChange = (state, changes, version) => {
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => String(c.state) === String(state) && (version !== undefined ? String(c.version) === String(version) : true));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...changes, state, version };
      } else {
        arr.push({ ...changes, state, version });
      }
      return arr;
    });
    setRefreshTrigger(p => p + 1);
  };


  const save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    var formDataClock = new FormData();


    const dateInput = document.getElementById("clock_exp_date_" + i);
    const resolverSelect = document.getElementById("clock_exp_res_" + i);
    const id6Select = document.getElementById("clock_exp_id6_" + i);
    const idRelatedInput = document.getElementById("clock_exp_id_related_" + i);


    const dateVal = dateInput ? String(dateInput.value || '').trim() : '';
    let resolver_context = resolverSelect ? resolverSelect.value : false;
    let resolver_id6 = id6Select ? id6Select.value : 0;
    let id_related = idRelatedInput ? idRelatedInput.value : '';


    if (dateVal) formDataClock.set('date_start', dateVal);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('state', value.state);
    formDataClock.set('id_related', id_related);


    let descBase = value.desc || '';
    if ((value.state === 350 || value.state === 351) && dateVal) {
      const startSusp = (value.state === 350) ? suspensionPreActa.start?.date_start : suspensionPostActa.start?.date_start;
      if (startSusp) descBase = `Fin de suspensión (${dateParser_dateDiff(startSusp, dateVal)} días)`;
    }
    if (value.state === 401 && dateVal) {
        const startExt = manager.extension.start?.date_start;
        if(startExt) descBase = `Fin de prórroga (${dateParser_dateDiff(startExt, dateVal)} días)`;
    }
    if (resolver_context) descBase = (descBase ? (descBase + ': ') : '') + resolver_context;


    formDataClock.set('desc', descBase);
    formDataClock.set('name', value.name);


    applyLocalClockChange(value.state, {
      date_start: dateVal,
      resolver_context: resolver_context || '',
      resolver_id6: resolver_id6,
      id_related: id_related || '',
      desc: descBase,
      name: value.name,
    }, value.version);


    manage_clock(false, value.state, value.version, formDataClock, true);
  }


  const manage_clock = (useMySwal, findOne, version, formDataClock, triggerUpdate = false) => {
    var _CHILD = getClockVersion(findOne, version) || getClock(findOne);
    formDataClock.set('fun0Id', currentItem.id);


    if (useMySwal) MySwal.fire({ title: swaMsg.title_wait, text: swaMsg.text_wait, icon: 'info', showConfirmButton: false });
    
    const onOk = () => {
      if (useMySwal) MySwal.fire({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer, icon: 'success', confirmButtonText: swaMsg.text_btn });
      props.requestUpdate(currentItem.id);
      if (triggerUpdate) setTimeout(() => props.requestUpdate(currentItem.id), 150);
    }
    const onErr = (e) => {
      console.log(e);
      if (useMySwal) MySwal.fire({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning', confirmButtonText: swaMsg.text_btn });
    }


    if (_CHILD && _CHILD.id) {
      FUN_SERVICE.update_clock(_CHILD.id, formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    } else {
      FUN_SERVICE.create_clock(formDataClock).then(r => r.data === 'OK' ? onOk() : onErr(r)).catch(onErr);
    }
  }

  const delete_clock = (value) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la fecha del evento "${value.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const formDataClock = new FormData();
        
        formDataClock.set('state', value.state);
        if (value.version !== undefined) {
          formDataClock.set('version', value.version);
        }

        formDataClock.set('date_start', '');
        formDataClock.set('desc', value.desc || '');
        
        applyLocalClockChange(value.state, { 
            date_start: '',
            desc: value.desc || ''
        }, value.version);

        manage_clock(false, value.state, value.version, formDataClock, true);
      }
    });
  };


  const addTimeControl = (type) => {
    if (type === 'suspension') {
      const availableDays = 10 - totalSuspensionDays;
      if (availableSuspensionTypes.length === 0) return MySwal.fire({ title: 'No disponible', text: 'No hay espacios para añadir suspensiones', icon: 'warning' });
      
      const typeSelectHtml = availableSuspensionTypes.length > 1
        ? `<div class="col-12"><label class="form-label">Ubicación</label><select id="susp_type" class="form-select">${availableSuspensionTypes.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select></div>`
        : `<input type="hidden" id="susp_type" value="${availableSuspensionTypes[0].value}">`;


      MySwal.fire({
        title: 'Nueva Suspensión de Términos',
        html: `<div class="row g-3">
            <div class="col-12"><div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>Días disponibles: <strong>${availableDays}</strong></div></div>
            ${typeSelectHtml}
            <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="susp_start" class="form-control"/></div>
            <div class="col-12"><label class="form-label">Información Adicional</label><textarea id="susp_info" class="form-control" rows="3" placeholder="Detalles..."></textarea></div>
          </div>`,
        showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const suspType = document.getElementById('susp_type').value;
          const startDate = document.getElementById('susp_start').value;
          if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
          return { suspType, startDate, info: document.getElementById('susp_info').value.trim() };
        }
      }).then(result => {
        if (result.isConfirmed) {
          const { suspType, startDate, info } = result.value;
          const isPreActa = suspType === 'pre';
          const startState = isPreActa ? 300 : 301;
          const formDataStart = new FormData();
          formDataStart.set('state', startState);
          formDataStart.set('date_start', startDate);
          formDataStart.set('desc', info || `Suspensión ${isPreActa ? 'antes' : 'después'} del acta`);
          formDataStart.set('name', `Inicio Suspensión ${isPreActa ? 'Pre-Acta' : 'Post-Acta'}`);
          applyLocalClockChange(startState, { date_start: startDate, desc: formDataStart.get('desc'), name: formDataStart.get('name') });
          manage_clock(false, startState, false, formDataStart, true);
        }
      });


    } else if (type === 'extension') {
        MySwal.fire({
            title: 'Nueva Prórroga por Complejidad',
            html: `<div class="row g-3">
                <div class="col-12"><div class="alert alert-info"><i class="fas fa-clock me-2"></i>Otorga hasta <strong>22 días hábiles</strong> adicionales.</div></div>
                <div class="col-12"><label class="form-label">Fecha de Inicio</label><input type="date" id="ext_start" class="form-control"/></div>
                <div class="col-12"><label class="form-label">Fecha de Fin (Opcional)</label><input type="date" id="ext_end" class="form-control"/></div>
            </div>`,
            showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const startDate = document.getElementById('ext_start').value;
                const endDate = document.getElementById('ext_end').value;
                if (!startDate) { Swal.showValidationMessage('La fecha de inicio es obligatoria'); return false; }
                if (endDate && moment(endDate).isBefore(startDate)) {
                    Swal.showValidationMessage('La fecha de fin no puede ser anterior a la fecha de inicio');
                    return false;
                }
                return { startDate, endDate };
            }
        }).then(result => {
            if (result.isConfirmed) {
                const { startDate, endDate } = result.value;
                
                const formDataStart = new FormData();
                formDataStart.set('state', 400);
                formDataStart.set('date_start', startDate);
                formDataStart.set('desc', 'Prórroga por complejidad técnica');
                formDataStart.set('name', 'Inicio Prórroga por Complejidad');
                applyLocalClockChange(400, { date_start: startDate, desc: 'Prórroga por complejidad técnica', name: 'Inicio Prórroga por Complejidad' });
                manage_clock(false, 400, false, formDataStart, true);

                if (endDate) {
                    const days = dateParser_dateDiff(startDate, endDate);
                    const formDataEnd = new FormData();
                    formDataEnd.set('state', 401);
                    formDataEnd.set('date_start', endDate);
                    formDataEnd.set('desc', `Fin de prórroga (${days} días)`);
                    formDataEnd.set('name', 'Fin Prórroga por Complejidad');
                    applyLocalClockChange(401, { date_start: endDate, desc: `Fin de prórroga (${days} días)`, name: 'Fin Prórroga por Complejidad' });
                    setTimeout(() => manage_clock(false, 401, false, formDataEnd, true), 200);
                }
            }
        });
    }
  };


  const _FIND_6 = (id) => (currentItem.fun_6s || []).find(f => f.id == id) || null;
  const _CHILD_6_SELECT = () => (currentItem.fun_6s || []).map(f => <option key={f.id} value={f.id}>{f.description}</option>);
  const catForTitle = (title = '') => {
    title = title.toUpperCase();
    if (title.includes('DESISTIDO')) return { color: '#F93154', icon: 'fa-exclamation-circle' };
    if (title.includes('RADICACIÓN')) return { color: '#5bc0de', icon: 'fa-inbox' };
    if (title.includes('OBSERVACIONES')) return { color: '#fd7e14', icon: 'fa-clipboard-list' };
    if (title.includes('CORRECCIONES')) return { color: '#20c997', icon: 'fa-tools' };
    if (title.includes('VIABILIDAD')) return { color: '#6f42c1', icon: 'fa-compass' };
    if (title.includes('PAGOS')) return { color: '#198754', icon: 'fa-money-bill' };
    if (title.includes('RESOLUCIÓN')) return { color: '#0b5ed7', icon: 'fa-file-signature' };
    if (title.includes('RECURSO')) return { color: '#d63384', icon: 'fa-exclamation-circle' };
    if (title.includes('LICENCIA')) return { color: '#157347', icon: 'fa-id-card' };
    if (title.includes('SUSPENSIÓN')) return { color: '#ffc107', icon: 'fa-pause' };
    if (title.includes('PRÓRROGA')) return { color: '#17a2b8', icon: 'fa-clock' };
    return { color: '#5bc0de', icon: 'fa-folder-open' };
  };
  const getNewestDate = (states) => {
    let newDate = null;
    states.forEach((element) => {
      const date = getClock(element)?.date_start;
      if (!newDate && date) newDate = date;
      else if (date && moment(date).isAfter(newDate)) newDate = date;
    });
    return newDate;
  }


  const Header = () => (
    <div className="exp-head d-flex align-items-center justify-content-between">
      <div className="small w-100"><div className="row g-2 m-0 fw-bold">
        <div className="col-6 cell-border">Evento</div>
        <div className="col-2 text-center cell-border">Fecha Evento</div>
        <div className="col-2 text-center cell-border">Fecha Límite Evento</div>
        <div className="col-2 text-center cell-border">Días Gastados</div>
      </div></div>
    </div>
  );


  let lastTitle = '';
  const renderClockList = () => {
    return clocksToShow.map((value, i) => {
        const clock = value.version !== undefined
          ? getClockVersion(value.state, value.version)
          : getClock(value.state);
        
        if (value.title) lastTitle = value.title;
        const cat = catForTitle(lastTitle);


        return (
          <ClockRow
            key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}-${refreshTrigger}`}
            value={value} i={i} clock={clock} onSave={save_clock} onDelete={delete_clock} cat={cat}
            outCodes={outCodes} _CHILD_6_SELECT={_CHILD_6_SELECT} _FIND_6={_FIND_6}
            helpers={{ getClock, getNewestDate, ...manager, currentItem }}
          />
        );
    });
  }


  return (
    <div className="exp-wrapper">
      <div className="exp-container">
        <div className="exp-main-content">
          <div className="card exp-card">
            <Header />
            <div className="exp-scroll" style={{ height: sidebarHeight, maxHeight: sidebarHeight }}>{renderClockList()}</div>
          </div>
        </div>
        
        <div className="exp-sidebar" ref={sidebarRef}>
          <SidebarInfo 
             manager={manager} 
             actions={{ onAddTimeControl: addTimeControl }} 
          />
          <HolidayCalendar />
        </div>
      </div>
      
      <style>{`
        /* --- SIDEBAR CARDS --- */
        .sidebar-card {
          background-color: #fff;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
          padding: 1rem;
        }
        .sidebar-card-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-weight: 600;
          color: #495057;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f1f3f5;
          margin-bottom: 1rem;
        }
        .sidebar-card-header i {
          color: #868e96;
        }
        .sidebar-card-body .value-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.35rem 0.25rem;
        }
        .sidebar-card-body .value-row .label {
          color: #6c757d;
        }
        .sidebar-card-body .value-row .value {
          font-weight: 600;
        }
        .sidebar-card-body .value-row .value.text-danger {
          color: #e03131 !important;
        }
        .sidebar-card-body .value-row .value.text-success {
          color: #2f9e44 !important;
        }
        
        /* Specific card styles */
        .status-text {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .status-icon {
          font-size: 1.5rem;
        }
        .status-Vencido { color: #e03131; }
        .status-icon-Vencido { color: #e03131; }
        .status-Finalizado { color: #2f9e44; }
        .status-icon-Finalizado { color: #2f9e44; }
        .status-Pausado { color: #f08c00; }
        .status-icon-Pausado { color: #f08c00; }
        .status-Desistido { color: #c92a2a; }
        .status-icon-Desistido { color: #c92a2a; }
        .status-default { color: #1971c2; }
        .status-icon-default { color: #1971c2; }
        
        .quick-actions-card .sidebar-card-body {
            padding: 0;
        }
        .btn-action {
            display: block;
            width: 100%;
            text-align: center;
            padding: 0.6rem;
            border: none;
            color: #fff;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color .2s;
        }
        .btn-action:not(:last-child) {
            margin-bottom: .5rem;
        }
        .btn-suspension {
            background-color: #f08c00;
        }
        .btn-suspension:hover {
            background-color: #e67700;
        }
        .btn-prorroga {
            background-color: #17a2b8;
        }
        .btn-prorroga:hover {
            background-color: #138496;
        }

        .btn-detail-link {
          background: none;
          border: none;
          color: #1971c2;
          font-weight: 600;
          padding: 0;
          text-align: left;
          margin-top: 0.75rem;
          font-size: 0.875rem;
        }
        .btn-detail-link:hover {
          text-decoration: underline;
        }
        
        /* --- CALENDAR WIDGET --- */
        .calendar-widget .sidebar-card-body {
            padding: 0;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            text-transform: capitalize;
        }
        .calendar-header button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            color: #868e96;
            padding: 0 .5rem;
        }
        .calendar-header .current-month {
            font-weight: 600;
        }
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
        }
        .days-of-week {
            font-size: 0.75rem;
            font-weight: 600;
            color: #adb5bd;
            padding-bottom: 0.5rem;
        }
        .day-cell {
            font-size: 0.8rem;
            padding: 0.4rem 0;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }
        .day-cell.not-current-month {
            color: #ced4da;
        }
        .day-cell.weekend {
            background-color: #f1f3f5;
            color: #868e96;
        }
        .day-cell.holiday {
            background-color: #ffe066;
            color: #865900;
            font-weight: 600;
        }
        .day-cell.today {
            border: 2px solid #339af0;
        }
        .calendar-legend {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: #868e96;
            justify-content: center;
            margin-top: 1rem;
            padding: 0.75rem 0;
            border-top: 1px solid #f1f3f5;
        }
        .legend-box {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 2px;
            margin-right: 0.3rem;
        }
        .legend-box.holiday { background-color: #ffe066; }
        .legend-box.weekend { background-color: #f1f3f5; }

        /* --- CALCULATOR --- */
        .calculator-section {
            border-top: 1px solid #e9ecef;
            padding: 1rem .5rem .5rem .5rem;
            margin-top: 1rem;
        }
        .calc-tabs {
            display: flex;
            margin-bottom: 1rem;
            background-color: #f1f3f5;
            border-radius: 6px;
            padding: 2px;
        }
        .calc-tabs button {
            flex: 1;
            padding: .4rem;
            border: none;
            background-color: transparent;
            cursor: pointer;
            color: #495057;
            font-weight: 600;
            font-size: 0.8rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .calc-tabs button.active {
            background-color: #fff;
            box-shadow: 0 1px 3px rgba(0,0,0,.1);
        }
        .calc-body {
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .calc-body input[type="date"], .calc-body input[type="number"] {
            flex: 1;
            min-width: 0;
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: .3rem .4rem;
            font-size: .8rem;
        }
        .calc-body input[type="number"] {
            text-align: center;
            flex-grow: 0.5;
        }
        .calc-separator {
            color: #868e96;
        }
        .calc-button {
            border: none;
            background-color: #339af0;
            color: white;
            border-radius: 4px;
            width: 32px;
            height: 32px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
            flex-shrink: 0;
        }
        .calc-button:hover {
            background-color: #1c7ed6;
        }
        .calc-result {
            margin-top: .75rem;
            text-align: center;
            font-weight: 600;
            font-size: 1.1rem;
            color: #1864ab;
            padding: .5rem;
            background: #e7f5ff;
            border-radius: 4px;
        }
        .calc-result.error {
            color: #c92a2a;
            background: #fff5f5;
        }

        /* --- LAYOUT & MAIN STYLES --- */
        .exp-wrapper {
          overflow-x: hidden;
          width: 100%;
        }
        .exp-container {
          display: flex;
          gap: 1.5rem;
          width: 100%;
          align-items: flex-start;
        }
        .exp-main-content {
          flex: 1;
          min-width: 0;
          padding-top: 1rem;
        }
        .exp-sidebar {
          flex: 0 0 320px;
          min-width: 320px;
          position: sticky;
          top: 1rem;
        }
        .exp-card{ 
          border-radius: 6px; 
          box-shadow: 0 6px 16px rgba(0,0,0,.06); 
          overflow: hidden; 
          border: 1px solid #e9ecef; 
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .exp-head{ 
          position: sticky; 
          top: 0; 
          z-index: 20; 
          height: 44px;
          background: #5bc0de; 
          color: #fff; 
          padding: .5rem .75rem; 
          display: flex; 
          border-top-left-radius: 6px; 
          border-top-right-radius: 6px; 
          flex-shrink: 0;
        }
        .exp-scroll{ 
          overflow-y: auto; 
          overflow-x: hidden; 
          font-size: .95rem; 
        }
        .exp-row{ background: #fff; position: relative; transition: background-color .2s; display: flex; align-items: stretch; }
        .exp-row::before{ content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--cat, #6c757d); }
        .exp-row:hover{ background: #eaf3ff; }
        .exp-section{ background: #f8f9fa; border-left: 4px solid var(--cat, #6c757d); border-radius: 0 8px 8px 0; padding: .35rem .75rem; font-size: .95rem; letter-spacing: .4px; margin: 0; position: sticky; top: 0; z-index: 10; }
        .exp-scroll::-webkit-scrollbar{ width: 8px; }
        .exp-scroll::-webkit-scrollbar-track{ background: #f1f1f1; }
        .exp-scroll::-webkit-scrollbar-thumb{ background: #bdbdbd; border-radius: 4px; }
        .exp-scroll::-webkit-scrollbar-thumb:hover{ background: #9e9e9e; }
        .cell-border { 
          border-right: 1px solid #dee2e6; 
          position: relative; 
        }
        .cell-border:last-child { 
          border-right: none; 
        }
        .exp-head .cell-border { 
          border-right: 1px solid rgba(255, 255, 255, 0.3); 
        }
        .exp-row-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 0.5rem;
          position: relative;
        }
        .btn-delete-date {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          border: none;
          background: #f1f3f5;
          color: #868e96;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          opacity: 0;
          transition: opacity 0.2s, background-color 0.2s, color 0.2s;
          cursor: pointer;
        }
        .exp-row-content:hover .btn-delete-date {
          opacity: 1;
        }
        .btn-delete-date:hover {
          background-color: #e03131;
          color: white;
        }
        .info-icon-tooltip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 0.5rem;
          cursor: help;
          font-size: 0.75rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(92, 184, 222, 0.2);
          color: #5bc0de;
          transition: all 0.2s ease;
          position: relative;
        }
        .info-icon-tooltip:hover {
          background: rgba(92, 184, 222, 0.3);
          color: #0ca3d1;
        }
        .info-icon-tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: normal;
          white-space: normal;
          width: max-content;
          max-width: 280px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,.15);
          border: 1px solid #555;
          pointer-events: none;
        }
        .info-icon-tooltip:hover::before {
          content: "";
          position: absolute;
          bottom: 115%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #333;
          z-index: 1000;
          pointer-events: none;
        }
        
        @media (max-width: 1200px) {
          .exp-container {
            flex-direction: column;
          }
          .exp-sidebar {
            width: 100%;
            position: static;
          }
          .exp-scroll {
            height: auto;
            max-height: 80vh;
          }
        }
      `}</style>
    </div>
  );
}