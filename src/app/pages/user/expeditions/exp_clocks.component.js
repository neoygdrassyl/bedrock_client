import React, { useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import VIZUALIZER from '../../../components/vizualizer.component';
import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';
import moment from 'moment';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS(props) {
  const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, outCodes } = props;
  const [isFull, setIsFull] = useState(false);
  const [suspensions, setSuspensions] = useState([]);
  const [extensions, setExtensions] = useState([]);

  const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
  const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
  const NegativePRocessTitle = {
    '-1': 'INCOMPLETO',
    '-2': 'FALTA VALLA INFORMATIVA',
    '-3': 'NO CUMPLE ACTA CORRECCIONES',
    '-4': 'NO PAGA EXPENSAS',
    '-5': 'VOLUNTARIO',
    '-6': 'NEGADA',
  }

  // *************** DATA GETTERS **************** //
  let _GET_CLOCK = () => currentItem.fun_clocks || [];
  let _GET_CHILD_6 = () => currentItem.fun_6s || [];
  let _GET_CHILD_1 = () => {
    var _CHILD = currentItem.fun_1s;
    var _CURRENT_VERSION = currentVersion - 1;
    var _CHILD_VARS = { item_0: "", description: "" }
    if (_CHILD && _CHILD[_CURRENT_VERSION] != null) {
      _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
      _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
      _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
    }
    return _CHILD_VARS;
  }
  let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
  let conGI = _GLOBAL_ID === 'cb1'
  let namePayment = _GLOBAL_ID === 'cb1' ? 'Impuestos Municipales' : 'Impuesto Delineacion'

  // *************** CONVERTERS ****************** //
  let _GET_CLOCK_STATE = (_state) => {
    var _CLOCK = _GET_CLOCK();
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state) return _CLOCK[i];
    }
    return false;
  }
  let _GET_CHILD_CLOCK = () => currentItem.fun_clocks || [];
  let _FIND_6 = (_ID) => {
    let _LIST = _GET_CHILD_6();
    for (var i = 0; i < _LIST.length; i++) if (_LIST[i].id == _ID) return _LIST[i];
    return null;
  }
  let _CHILD_6_SELECT = () => _GET_CHILD_6().map(f => <option key={f.id} value={f.id}>{f.description}</option>)
  let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
    var _CLOCK = _GET_CHILD_CLOCK();
    if (_state == null) return false;
    for (var i = 0; i < _CLOCK.length; i++) {
      if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
    }
    return false;
  }
  let get_clockExistIcon = (state, icon = "") => {
    var _CHILD = _GET_CLOCK_STATE(state);
    if (_CHILD && icon !== "empty") {
      if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") return <i className="far fa-check-circle text-success"></i>
      return <i className="far fa-dot-circle text-warning"></i>
    }
    return <i className="far fa-dot-circle"></i>
  }
  let get_newestDate = (states) => {
    let newDate = null;
    states.forEach((element) => {
      const st = _GET_CLOCK_STATE(element);
      const date = st ? st.date_start : null;
      if (!newDate && date) newDate = date;
      else if (date && moment(date).isAfter(newDate)) newDate = date;
    });
    return newDate;
  }

  // ************** CATEGORÍAS (color/ícono) ************** //
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
    return { color: '#5bc0de', icon: 'fa-folder-open' };
  };

  // Nuevo componente para la barra de control
  const ControlBar = () => (
      <div className="control-bar mb-1">
          <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 shadow-sm">
              <div className="d-flex gap-2">
                  {!_GET_CLOCK_STATE(300).date_start ?  
                  <button 
                      type="button" 
                      className="btn btn-warning btn-sm" 
                      onClick={() => addTimeControl(300, 301, 'Suspensión')}>
                      <i className="fas fa-pause me-2"></i>
                      Añadir Suspensión
                  </button> : <></> }
                  {!_GET_CLOCK_STATE(302).date_start ?
                  <button 
                      type="button" 
                      className="btn btn-info btn-sm" 
                      onClick={() => addTimeControl(302, 303, 'Prórroga')}>
                      <i className="fas fa-clock me-2"></i>
                      Añadir Prórroga
                  </button> : <></> }
              </div>
              <div className="small text-muted align-right">
                  Control de tiempos adicionales del proceso
              </div>
              { !isFull ?
              <button type="button" className="btn btn-sm btn-light ms-2 exp-full-btn"
                title="Pantalla completa"
                onClick={() => setIsFull(true)}>
                <i className="fas fa-expand"></i>
              </button> : <></> }
          </div>
      </div>
  );

  // Función genérica para añadir controles de tiempo
  const addTimeControl = (startState, endState, type) => {
      MySwal.fire({
          title: `Nuevo periodo de ${type}`,
          html: `
              <div class="row g-3">
                  <div class="col-12">
                      <label class="form-label">Fecha Inicio</label>
                      <input type="date" id="time_start" class="form-control"/>
                  </div>
              </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar',
          cancelButtonText: 'Cancelar',
      }).then(result => {
          if (result.isConfirmed) {
              const start = document.getElementById('time_start').value;
              
              if (start) {
                  const formDataStart = new FormData();
                  formDataStart.set('fun0Id', currentItem.id);
                  formDataStart.set('state', startState);
                  formDataStart.set('date_start', start);
                  formDataStart.set('desc', `Inicio de ${type}`);
                  manage_clock(false, startState, false, formDataStart);
              }

              props.requestUpdate(currentItem.id);
          }
      });
  };

  // *********************** JSX ************************** //
   const Header = () => (
    <div className="exp-head d-flex align-items-center justify-content-between">
      <div className="small  w-100">
        <div className="row g-2 m-0 fw-bold">
          <div className="col-4">EVENTO</div>
          <div className="col-2 text-center">FECHA</div>
          <div className="col-2 text-center">LÍMITE</div>
          <div className="col-2 text-center">INFO</div>
          <div className="col-1 text-center">CONSEC.</div>
          <div className="col-1 text-center">DOC</div>
        </div>
      </div>
    </div>
  );

  let _COMPONENT_CLOCKS = () => (
    <>
      <div className="card exp-card">
        <Header />
        <div className="exp-scroll">
          {_COMPONENT_CLOCK_LIST()}
        </div>
      </div>

      {isFull && (
        <div className="exp-fullscreen">
          <div className="exp-fullscreen-inner">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="m-0">Reloj del Proceso</h6>
              <button className="btn btn-sm btn-light" onClick={() => setIsFull(false)}>
                <i className="fas fa-compress"></i> Cerrar
              </button>
            </div>
            <ControlBar />
            <div className="card exp-card mb-0">
              <Header />
              <div className="exp-scroll exp-scroll-full">
                {_COMPONENT_CLOCK_LIST()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  let _COMPONENT_CLOCK_LIST = () => {
    const expandedClocks = [];
    clocks.forEach((value, originalIndex) => {
      if (Array.isArray(value.state) && value.version !== undefined) {
        value.state.forEach((stateItem) => {
          expandedClocks.push({ ...value, state: stateItem, originalIndex });
        });
      } else {
        expandedClocks.push({ ...value, originalIndex });
      }
    });

    let lastTitle = '';

    return expandedClocks.map((value, i) => {
      var clock;
      if (value.version !== undefined) clock = _GET_CLOCK_STATE_VERSION(value.state, value.version);
      else clock = _GET_CLOCK_STATE(value.state);

      if (!clock && value.optional) return null;

      var limit_clock;
      if (value.limit) {
        if (Array.isArray(value.limit[0])) {
          for (let j = 0; j < value.limit[0].length; j++) {
            const limitI = value.limit[0][j];
            limit_clock = (value.version !== undefined)
              ? _GET_CLOCK_STATE_VERSION(limitI, value.version)
              : _GET_CLOCK_STATE(limitI);
            if (limit_clock) break;
          }
        } else {
          limit_clock = (value.version !== undefined)
            ? _GET_CLOCK_STATE_VERSION(value.limit[0], value.version)
            : _GET_CLOCK_STATE(value.limit[0]);
        }
      }
      if(value.limitValues){
        let actaTime = (_GET_CLOCK_STATE(30) || {}).date_start;
        let acta2Time = (_GET_CLOCK_STATE(49) || {}).date_start;
        let extraClocks = (_GET_CLOCK_STATE(302) || {}).date_start; // Inicio prorroga
        let endSuspClocks = (_GET_CLOCK_STATE(301) || {}).date_start; // Fin suspension
        let corrTime = (_GET_CLOCK_STATE(35) || {}).date_start;

        if (extraClocks >= corrTime){
          // Se toma extraClocks como limite izquiero y la fecha limite es extraClocks + limitValues
        } else if (endSuspClocks >= corrTime){
          // Se toma endSuspClocks como limite izquiero y la fecha limite es endSuspClocks + limitValues
        } else{
          // El limite izq es cuando se radicaron las correciones + limitValues
        }
      }

      if (value.requiredClock) {
        let needClock = _GET_CLOCK_STATE(value.requiredClock)
        if (!needClock.date_start) return null;
      }
      if (value.show) return null;

      const currentClock = (value.state !== false && value.state != null)
        ? (value.version !== undefined
          ? (_GET_CLOCK_STATE_VERSION(value.state, value.version) || {})
          : (_GET_CLOCK_STATE(value.state) || {}))
        : {};

      const currentDate = currentClock.date_start ?? value.manualDate ?? clock?.date_start ?? '';
      const canEditDate = value.editableDate !== false && value.state !== false;
      const showConsecutivo = value.hasConsecutivo !== false;
      const showAnnexSelect = value.hasAnnexSelect !== false;

      const sentenceCaseEs = (s) => {
        if (typeof s !== 'string') return s;
        const base = s.normalize('NFC').toLocaleLowerCase('es');
        return base.replace(/^(\p{L})/u, c => c.toLocaleUpperCase('es'));
      };

      let indentLevel = 0;
      if (value.title) indentLevel = 0;
      else if (value.name && (
        value.name.includes('Comunicación') ||
        value.name.includes('Notificación') ||
        value.name.includes('Citación') ||
        value.name.includes('Prórroga') ||
        value.name.includes('Radicación de Correcciones') ||
        value.name.includes('Traslado') ||
        value.name.includes('Recepción')
      )) indentLevel = 2;
      else indentLevel = 1;

      if (value.title) lastTitle = value.title;
      const cat = catForTitle(lastTitle);

      return (
        <React.Fragment key={`row-${i}-${value.state ?? 'no-state'}-${value.version ?? 'no-version'}`}>
          {value.title ? (
            <div className="exp-section" style={{ '--cat': cat.color }}>
              <div className="d-flex align-items-center mb-1">
                <i className={`fas ${cat.icon} me-2`}></i>
                <strong className="text-uppercase">{value.title}</strong>
              </div>
            </div>
          ) : (
            <div className="exp-row border-bottom" style={{ '--cat': cat.color }}>
              <div className="row g-2 align-items-center px-3 py-2">
                <div className="col-4 mt-0">
                  <div style={{ paddingLeft: `${indentLevel * 1.1}rem` }} className="d-flex align-items-center">
                    {indentLevel > 0 && (
                      <span className="text-muted me-2" style={{ fontSize: '1rem' }}>
                        {indentLevel === 2 ? '└' : '•'}
                      </span>
                    )}
                    <span className="me-2" style={{ minWidth: 16 }}>
                      {get_clockExistIcon(value.state, value.icon)}
                    </span>
                    <span className="">
                      {value.name ?? sentenceCaseEs(clock?.name) ?? ``}
                    </span>
                  </div>
                </div>

                <div className="col-2 px-1">
                  {canEditDate && value.version === undefined ? (
                    <input
                      type="date"
                      className="form-control form-control-sm p-1"
                      id={'clock_exp_date_' + i}
                      max="2100-01-01"
                      defaultValue={currentDate}
                      onBlur={() => save_clock(value, i)}
                    />
                  ) : (
                    <div className="text-center small">
                      {currentDate ? currentDate : <span className='text-danger'>-</span>}
                    </div>
                  )}
                </div>

                <div className="col-2 text-center small">
                  {value.limit
                    ? (Array.isArray(value.limit[0])
                      ? dateParser_finalDate(get_newestDate(value.limit[0]), value.limit[1])
                      : dateParser_finalDate((_GET_CLOCK_STATE(value.limit[0]) || {}).date_start, value.limit[1]))
                    : ''}
                </div>

                <div className="col-2 px-1">
                  {value.info ?
                    <select
                      className='form-select form-select-sm p-1'
                      id={'clock_exp_res_' + i}
                      defaultValue={currentClock.resolver_context ?? 0}
                      onChange={() => save_clock(value, i)}
                      disabled={value.version !== undefined}
                    >
                      {value.info.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    : ''}
                </div>

                <div className="col-1 px-1">
                  {showConsecutivo && (
                    <>
                      <input
                        list="codes_exp"
                        autoComplete='off'
                        className='form-control form-control-sm p-1'
                        id={'clock_exp_id_related_' + i}
                        defaultValue={currentClock.id_related ?? ''}
                        onBlur={() => save_clock(value, i)}
                        disabled={value.version !== undefined}
                      />
                      <datalist id="codes_exp">
                        {outCodes.map((data) => <option key={data.cub} value={data.cub}></option>)}
                      </datalist>
                    </>
                  )}
                </div>

                <div className="col-1 px-1">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    {showAnnexSelect && (
                      <select
                        className='form-select form-select-sm p-1'
                        id={'clock_exp_id6_' + i}
                        defaultValue={currentClock.resolver_id6 ?? 0}
                        onChange={() => save_clock(value, i)}
                        disabled={value.version !== undefined}
                      >
                        <option value="-1">FIS</option>
                        <option value="0">N/A</option>
                        {_CHILD_6_SELECT()}
                      </select>
                    )}

                    {(currentClock.resolver_id6 ?? 0) > 0 ? (() => {
                      const file = _FIND_6(currentClock.resolver_id6);
                      if (file?.path && file?.filename) {
                        return (
                          <VIZUALIZER
                            url={`${file.path}/${file.filename}`}
                            apipath={'/files/'}
                            icon={'fas fa-search'}
                            iconWrapper={'btn btn-sm btn-info p-1 shadow-none'}
                          />
                        )
                      }
                      return null;
                    })() : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      )
    })
  }

  // *************** APIS ******************* //
  let save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    var formDataClock = new FormData();

    const dateInput = document.getElementById("clock_exp_date_" + i);
    const resolverSelect = document.getElementById("clock_exp_res_" + i);
    const id6Select = document.getElementById("clock_exp_id6_" + i);
    const idRelatedInput = document.getElementById("clock_exp_id_related_" + i);

    let resolver_context = resolverSelect ? resolverSelect.value : false;
    let resolver_id6 = id6Select ? id6Select.value : 0;
    let id_related = idRelatedInput ? idRelatedInput.value : '';

    if (dateInput) formDataClock.set('date_start', dateInput.value);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('state', value.state);
    formDataClock.set('id_related', id_related);

    let desc = value.desc;
    if (resolver_context) desc = desc + ': ' + resolver_context;
    formDataClock.set('desc', desc);
    formDataClock.set('name', value.name);

    manage_clock(false, value.state, false, formDataClock)
  }

  let manage_clock = (useMySwal, findOne, version, formDataClock) => {
    var _CHILD = _GET_CLOCK_STATE(findOne)
    formDataClock.set('fun0Id', currentItem.id);

    if (useMySwal) {
      MySwal.fire({
        title: swaMsg.title_wait,
        text: swaMsg.text_wait,
        icon: 'info',
        showConfirmButton: false,
      });
    }

    const onOk = () => {
      if (useMySwal) {
        MySwal.fire({
          title: swaMsg.publish_success_title,
          text: swaMsg.publish_success_text,
          footer: swaMsg.text_footer,
          icon: 'success',
          confirmButtonText: swaMsg.text_btn,
        });
      }
      props.requestUpdate(currentItem.id)
    }
    const onErr = () => {
      if (useMySwal) {
        MySwal.fire({
          title: swaMsg.generic_eror_title,
          text: swaMsg.generic_error_text,
          icon: 'warning',
          confirmButtonText: swaMsg.text_btn,
        });
      }
    }

    if (_CHILD && _CHILD.id) {
      FUN_SERVICE.update_clock(_CHILD.id, formDataClock).then(r => r.data === 'OK' ? onOk() : onErr()).catch(() => onErr());
    } else {
      FUN_SERVICE.create_clock(formDataClock).then(r => r.data === 'OK' ? onOk() : onErr()).catch(() => onErr());
    }
  }

  // *************** CLOCKS ****************** //
  // Este método calcula el tiempo disponible (dias disponibles) para el acta de correcciones (Parte 2) 
  // teniendo en cuenta los tiempos de suspensión y prórroga.
  const viaTime = () => {
    const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
    let ldfTime = (_GET_CLOCK_STATE(5) || {}).date_start;
    let actaTime = (_GET_CLOCK_STATE(30) || {}).date_start;
    let acta2Time = (_GET_CLOCK_STATE(49) || {}).date_start;
    let corrTime = (_GET_CLOCK_STATE(35) || {}).date_start;

    // Calcular días de suspensión
    const suspStartTime = (_GET_CLOCK_STATE(300) || {}).date_start;

    // Días de prórroga (complejidad)
    const extStartTime = (_GET_CLOCK_STATE(302) || {}).date_start;

    let time = 1;

    if (ldfTime && actaTime) {
        if (acta2Time && corrTime) {
            time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
        } else {
            time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
        }
        // Añadir los días de suspensión y prórroga
        time += ( suspStartTime ? 10 : 0) + ( extStartTime ? 22 : 0);
    }
    if (time < 1) time = 1;
    return time;
  };

  const requereCorr = () => {
    let actaClock = _GET_CLOCK_STATE(30);
    let con = false;
    if (actaClock && actaClock.desc) {
      if (actaClock.desc.includes('NO CUMPLE')) con = true;
    }
    return con;
  }

  const presentExt = () => {
    let clock34 = _GET_CLOCK_STATE(34);
    return clock34 && clock34.date_start ? true : false;
  }

  let getSuspList = (version = 1) => {
    const susp_start = _GET_CLOCK_STATE(300);
    const susp_end = _GET_CLOCK_STATE(301);
    if (!susp_start.date_start) return [];

    // Checkear si ocurre antes o despues del acta de observaciones parte 1
    if (version === 2) {
      const acta1 = _GET_CLOCK_STATE(30);
      if (!acta1 || susp_start.date_start < acta1.date_start) return [];
    } else {
      const acta1 = _GET_CLOCK_STATE(30);
      if (acta1 && susp_start.date_start >= acta1.date_start) return [];
    }
    
    return [
        { title: 'SUSPENSIÓN DE TÉRMINOS' },
        {
            state: 300,
            name: 'Inicio de Suspensión',
            desc: "Fecha de inicio de la suspensión de términos",
            editableDate: true,
            hasConsecutivo: false,
            hasAnnexSelect: true,
        },
        {
            state: 301,
            name: 'Fin de Suspensión',
            desc: susp_start ? `Suspensión por ${dateParser_dateDiff(susp_start.date_start, susp_end?.date_start || new Date())} días` : "",
            editableDate: true,
            hasConsecutivo: false,
            hasAnnexSelect: true,
        }
    ];
  }

  let getExtList = (version = 1) => {
      const ext_start = _GET_CLOCK_STATE(302);
      const ext_end = _GET_CLOCK_STATE(303);
      if (!ext_start) return [];

      // Checkear si ocurre antes o despues del acta de observaciones parte 1
      if (version === 2) {
        const acta1 = _GET_CLOCK_STATE(30);
        if (!acta1 || ext_start.date_start < acta1.date_start) return [];
      } else {
        const acta1 = _GET_CLOCK_STATE(30);
        if (acta1 && ext_start.date_start >= acta1.date_start) return [];
      }

      return [
          { title: 'PRÓRROGA POR COMPLEJIDAD' },
          {
              state: 302,
              name: 'Inicio de Prórroga',
              desc: "Fecha de inicio de la prórroga por complejidad",
              editableDate: true,
              hasConsecutivo: false,
              hasAnnexSelect: true,
          },
          {
              state: 303,
              name: 'Fin de Prórroga',
              desc: ext_start ? `Prórroga por ${dateParser_dateDiff(ext_start.date_start, ext_end?.date_start || new Date())} días` : "",
              editableDate: true,
              hasConsecutivo: false,
              hasAnnexSelect: true,
          }
      ];
  }

  let desistClocks = (version) => {
    if (conOA()) return [];
    const hasDesistProcess = _GET_CLOCK_STATE_VERSION(-5, version) || _GET_CLOCK_STATE_VERSION(-6, version);
    if (!hasDesistProcess) return [];
    return [
      { title: `Desistido por: ${NegativePRocessTitle[version]}` },
      {
        state: stepsToCheck,
        version: version,
        editableDate: false,
        hasConsecutivo: false,
        hasAnnexSelect: false,
        optional: true
      }
    ];
  }

  let extraClocks = () => {
    if (conOA()) return []
    else return [
      { title: 'RADICACIÓN' },
      { state: false, name: 'Radicación', desc: "Tiempo de Creación en el sistema", manualDate: currentItem.date, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 3, name: 'Expensas Fijas', desc: "Pago de Expensas Fijas", editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, },
      { state: -1, name: 'Incompleto', desc: false, editableDate: false, limit: [[3, false], 30], hasConsecutivo: false, hasAnnexSelect: false, icon: "empty" },
      { state: 5, name: 'Legal y debida forma', desc: false, editableDate: false, limit: regexChecker_isOA_2(_GET_CHILD_1()) ? [[4, false], -30] : [[3, false], 30], hasConsecutivo: false, hasAnnexSelect: false },
      ...desistClocks(-1),
      ...desistClocks(-2),
      ...getSuspList(1),
      ...getExtList(1),
      { title: 'ACTA PARTE 1: OBSERVACIONES' },
      { state: 30, name: 'Acta Parte 1: Observaciones', desc: "Acta de Observaciones inicial", limit: [[5, false], _fun_0_type_time[currentItem.type] ?? 45], },
      { state: 31, name: 'Citación (Observaciones)', desc: "Citación para Observaciones", limit: [[30, false],5], hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 32, name: 'Notificación (Observaciones)', desc: "Notificación de Observaciones", limit: [31, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 33, name: 'Notificación por aviso (Observaciones)', desc: "Notificación por aviso de Observaciones", limit: [31, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 34, name: 'Prórroga correcciones', desc: "Prórroga para presentar correcciones", limit: [[33, 32], [30, 30]], icon: "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      { state: 35, name: 'Radicación de Correcciones', desc: requereCorr() ? "Radicación de documentos corregidos" : false, limit: [[33, 32], presentExt() ? [45, 35, 40] : [30, 35, 40]], icon: requereCorr() ? undefined : "empty", hasConsecutivo: false, hasAnnexSelect: false, },
      ...getSuspList(2),
      ...getExtList(2),
      { title: 'ACTA PARTE 2: CORRECCIONES' },
      { state: 49, name: 'Acta Parte 2: Correcciones', desc: requereCorr() ? "Acta de revisión de correcciones" : false, limit: [[35, false], 50], limitValues: viaTime(), icon: requereCorr() ? undefined : "empty", },
      ...desistClocks(-3),
      ...desistClocks(-4),
      ...desistClocks(-5),
      { title: 'ACTA DE VIABILIDAD' },
      { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: false, },
      { state: 55, name: 'Citación (Viabilidad)', desc: "Comunicación o Requerimiento para el tramite de viabilidad de Licencia", limit: [61, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], },
      { state: 56, name: 'Notificación (Viabilidad)', desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [55, 5], info: ['PERSONAL', 'ELECTRÓNICO'], },
      { state: 57, show: false, name: 'Notificación por aviso (Viabilidad)', desc: "El solicitante NO se presento para el Tramite de viabilidad Licencia, fue informado por otros medios", limit: [55, 10], icon: "empty", info: ['CERTIFICADO', 'ELECTRÓNICO'], },
    ]
  }

  const paymentsClocks = [
    { title: 'PAGOS' },
    { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA() },
    { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'] },
    { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: !conGI },
    { state: 69, name: 'Radicacion de último pago', desc: "Último pago realizado", limit: [[56, 57], 30] },
    ...desistClocks(-4),
  ];

  const clocks = [
    ...extraClocks(),
    ...paymentsClocks,
    { title: 'RESOLUCIÓN' },
    { state: 70, name: "Acto Administrativo / Resolución ", desc: "Expedición Acto Administrativo ", limit: [69, 5], info: ['OTORGA', 'NIEGA', 'DESISTE', 'RECURSO', 'REVOCATORIA DIRECTA', 'SILENCIO ADMINISTRATIVO', 'ACLARACIONES Y CORRECCIONES', 'INTERNO', 'OTRO'] },
    { state: 71, name: "Comunicación o Requerimiento(Resolución)", desc: "Comunicación para notificar al solicitante de Acto Administrativo", info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'] },
    { state: 72, name: "Notificación (Resolución)", desc: "Se le notifica al solicitante del Acto Administrativo", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO',] },
    { state: 73, name: "Notificación por aviso (Resolución)", desc: "El solicitante NO se presento para el Acto Administrativo, fue informado por otros medios", limit: [71, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'] },
    { state: 731, name: "Notificación (Planeación)", desc: "Se notificar a la oficina de planeación", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO', 'NA'] },
    { state: 730, name: "Renuncia de Términos", desc: "Se renuncia a los términos", },
    { title: 'RECURSO' },
    { state: 74, name: "Recurso", desc: "Se presenta recurso", limit: [71, 15], info: ['REPOSICIÓN', 'APELACIÓN', 'QUEJA'], },
    { state: 75, name: "Resuelve Recurso", desc: "El recurso se resuelve", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
    { state: 751, name: "Comunicación o Requerimiento(Recurso)", desc: "Comunicación para notificar al solicitante de Recurso", limit: [74, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
    { state: 752, name: "Notificación (Recurso)", desc: "Se le notifica al solicitante del Recurso", limit: [751, 5], info: ['PERSONAL', 'ELECTRÓNICO',], requiredClock: 74 },
    { state: 733, name: "Notificación por aviso (Recurso)", desc: "El solicitante NO se presento para el Recurso, fue informado por otros medios", limit: [751, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74 },
    { state: 762, name: "Traslado Recurso", desc: "Se traslada el recurso", limit: [75, 5], requiredClock: 74 },
    { state: 76, name: "Apelación (Planeación)", desc: "El recurso se resuelve por planeación", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74 },
    { state: 761, name: "Recepción Notificación (Planeación)", desc: "Se recibe el recurso de planeación", requiredClock: 74 },

    { title: 'LICENCIA' },
    { state: 85, name: "Publicación", desc: "Se publica la Licencia", info: ['PRENSA', 'PAGINA'] },
    { state: 99, name: "Ejecutoria - Licencia", desc: "Expedición de Licencia", limit: [[72, 73], 10], },
    { state: 98, name: "Entrega de Licencia", desc: "La licencia fue entregada oficialmente", },
  ]

  return (
    <div className="exp-wrapper">
      <ControlBar />
      {_COMPONENT_CLOCKS()}

      {/* ESTILOS */}
      <style>{`
        :root { --headH: 44px; }

        .control-bar {
            position: relative;
            z-index: 1;
        }
        .control-bar .btn-sm {
            padding: .25rem .75rem;
            font-size: .875rem;
        }

        .exp-card{
          border-radius: 6px;
          box-shadow: 0 6px 16px rgba(0,0,0,.06);
          overflow: hidden;
          border: 1px solid #e9ecef;
        }

        /* Header sticky SIN borde inferior */
        .exp-head{
          position: sticky; top: 0; z-index: 20;
          height: var(--headH);
          background: #5bc0de; color: #fff;
          padding: .5rem .75rem;
          display: flex;
          border-top-left-radius: 6px; border-top-right-radius: 6px;
        }
        .exp-full-btn{ line-height: 1; }

        /* Scroll solo vertical (sin ajustes raros) */
        .exp-scroll{
          max-height: 80vh;
          overflow-y: auto;
          overflow-x: hidden;
          font-size: .95rem;
        }

        /* Filas con banda vertical e interacción */
        .exp-row{
          background: #fff;
          position: relative;
          transition: background-color .2s;
        }
        .exp-row::before{
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: var(--cat, #6c757d);
          border-top-left-radius: 6px; border-bottom-left-radius: 6px;
        }
        .exp-row:hover{ background: #eaf3ff; }

        /* SUBENCABEZADO: SIN border-top (evita la línea bajo el header) */
        .exp-section{
          background: #f8f9fa;
          border-left: 4px solid var(--cat, #6c757d);
          border-radius: 0 8px 8px 0;
          padding: .35rem .75rem;
          font-size: .95rem; letter-spacing: .4px;
          margin: 0;
          position: static !important;
          top: auto !important;
          z-index: auto !important;
        }

        .form-control-sm, .form-select-sm { height: 30px; padding: .15rem .35rem !important; }

        .exp-scroll::-webkit-scrollbar{ width: 8px; }
        .exp-scroll::-webkit-scrollbar-track{ background: #f1f1f1; }
        .exp-scroll::-webkit-scrollbar-thumb{ background: #bdbdbd; border-radius: 4px; }
        .exp-scroll::-webkit-scrollbar-thumb:hover{ background: #9e9e9e; }

        .exp-fullscreen{
          position: fixed; inset: 0;
          background: rgba(0,0,0,.35);
          backdrop-filter: blur(1px);
          z-index: 1050;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .exp-fullscreen-inner{
          width: min(1400px, 96vw);
          height: min(92vh, 900px);
          background: #fff; border-radius: 8px; padding: .75rem;
          box-shadow: 0 10px 30px rgba(0,0,0,.2);
          display: flex; flex-direction: column;
        }
        .exp-scroll-full{ max-height: calc(92vh - 120px); }

        .exp-wrapper{ overflow-x: hidden; }
      `}</style>
    </div>
  );
}
