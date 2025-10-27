import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import VIZUALIZER from '../../../components/vizualizer.component';
import FUN_SERVICE from '../../../services/fun.service';
import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../components/customClasses/typeParse';
import moment from 'moment';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

export default function EXP_CLOCKS_DIAGRAM(props) {
  const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, outCodes } = props;
  const [selectedNode, setSelectedNode] = useState(null);
  const [processList, setProcessList] = useState([]);

  const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
  const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
  const NegativePRocessTitle = {
    '-1': 'INCOMPLETO',
    '-2': 'FALTA VALLA INFORMATIVA',
    '-3': 'NO CUMPLE ACTA CORRECCIONES',
    '-4': 'NO PAGA EXPENSAS',
    '-5': 'VOLUNTARIO',
    '-6': 'NEGADA',
  };

  // Actor types
  const ACTOR = {
    NEUTRAL: 'neutral',
    CURADURIA: 'curaduria',
    SOLICITANTE: 'solicitante'
  };

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

  // *************** CLOCK CALCULATIONS ************** //
  const viaTime = () => {
    const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
    let ldfTime = (_GET_CLOCK_STATE(5) || {}).date_start;
    let actaTime = (_GET_CLOCK_STATE(30) || {}).date_start;
    let acta2Time = (_GET_CLOCK_STATE(49) || {}).date_start;
    let corrTime = (_GET_CLOCK_STATE(35) || {}).date_start;
    const suspStartTime = (_GET_CLOCK_STATE(300) || {}).date_start;
    const extStartTime = (_GET_CLOCK_STATE(302) || {}).date_start;

    let time = 1;
    if (ldfTime && actaTime) {
      if (acta2Time && corrTime) {
        time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
      } else {
        time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
      }
      time += (suspStartTime ? 10 : 0) + (extStartTime ? 22 : 0);
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
    if (!susp_start || !susp_start.date_start) return [];

    if (version === 2) {
      const acta1 = _GET_CLOCK_STATE(30);
      if (!acta1 || susp_start.date_start < acta1.date_start) return [];
    } else {
      const acta1 = _GET_CLOCK_STATE(30);
      if (acta1 && susp_start.date_start >= acta1.date_start) return [];
    }

    return [
      {
        state: 300,
        name: 'Inicio de Suspensión',
        desc: "Fecha de inicio de la suspensión de términos",
        actor: ACTOR.NEUTRAL,
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      },
      {
        state: 301,
        name: 'Fin de Suspensión',
        desc: susp_start ? `Suspensión por ${dateParser_dateDiff(susp_start.date_start, susp_end?.date_start || new Date())} días` : "",
        actor: ACTOR.NEUTRAL,
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      }
    ];
  }

  let getExtList = (version = 1) => {
    const ext_start = _GET_CLOCK_STATE(302);
    const ext_end = _GET_CLOCK_STATE(303);
    if (!ext_start || !ext_start.date_start) return [];

    if (version === 2) {
      const acta1 = _GET_CLOCK_STATE(30);
      if (!acta1 || ext_start.date_start < acta1.date_start) return [];
    } else {
      const acta1 = _GET_CLOCK_STATE(30);
      if (acta1 && ext_start.date_start >= acta1.date_start) return [];
    }

    return [
      {
        state: 302,
        name: 'Inicio de Prórroga',
        desc: "Fecha de inicio de la prórroga por complejidad",
        actor: ACTOR.NEUTRAL,
        editableDate: true,
        hasConsecutivo: false,
        hasAnnexSelect: true,
      },
      {
        state: 303,
        name: 'Fin de Prórroga',
        desc: ext_start ? `Prórroga por ${dateParser_dateDiff(ext_start.date_start, ext_end?.date_start || new Date())} días` : "",
        actor: ACTOR.NEUTRAL,
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
      {
        state: stepsToCheck,
        version: version,
        name: `Desistido: ${NegativePRocessTitle[version]}`,
        desc: `Proceso desistido por: ${NegativePRocessTitle[version]}`,
        actor: ACTOR.NEUTRAL,
        editableDate: false,
        hasConsecutivo: false,
        hasAnnexSelect: false,
      }
    ];
  }

  let extraClocks = () => {
    if (conOA()) return []
    else return [
      { state: false, name: 'Radicación', desc: "Tiempo de Creación en el sistema", manualDate: currentItem.date, actor: ACTOR.SOLICITANTE, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false },
      { state: 3, name: 'Expensas Fijas', desc: "Pago de Expensas Fijas", actor: ACTOR.SOLICITANTE, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false },
      { state: -1, name: 'Incompleto', desc: false, limit: [[3, false], 30], actor: ACTOR.CURADURIA, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false, icon: "empty" },
      { state: 5, name: 'Legal y debida forma', desc: false, limit: regexChecker_isOA_2(_GET_CHILD_1()) ? [[4, false], -30] : [[3, false], 30], actor: ACTOR.CURADURIA, editableDate: false, hasConsecutivo: false, hasAnnexSelect: false },
      ...desistClocks(-1),
      ...desistClocks(-2),
      ...getSuspList(1),
      ...getExtList(1),
      { state: 30, name: 'Acta Parte 1: Observaciones', desc: "Acta de Observaciones inicial", limit: [[5, false], _fun_0_type_time[currentItem.type] ?? 45], actor: ACTOR.CURADURIA },
      { state: 31, name: 'Citación (Observaciones)', desc: "Citación para Observaciones", limit: [[30, false], 5], actor: ACTOR.NEUTRAL, hasConsecutivo: false, hasAnnexSelect: false },
      { state: 32, name: 'Notificación (Observaciones)', desc: "Notificación de Observaciones", limit: [31, 5], info: ['PERSONAL', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
      { state: 33, name: 'Notificación por aviso (Observaciones)', desc: "Notificación por aviso de Observaciones", limit: [31, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL, icon: "empty" },
      { state: 34, name: 'Prórroga correcciones', desc: "Prórroga para presentar correcciones", limit: [[33, 32], [30, 30]], actor: ACTOR.SOLICITANTE, hasConsecutivo: false, hasAnnexSelect: false, icon: "empty" },
      { state: 35, name: 'Radicación de Correcciones', desc: requereCorr() ? "Radicación de documentos corregidos" : false, limit: [[33, 32], presentExt() ? [45, 35, 40] : [30, 35, 40]], actor: ACTOR.SOLICITANTE, hasConsecutivo: false, hasAnnexSelect: false, icon: requereCorr() ? undefined : "empty" },
      ...getSuspList(2),
      ...getExtList(2),
      { state: 49, name: 'Acta Parte 2: Correcciones', desc: requereCorr() ? "Acta de revisión de correcciones" : false, limit: [[35, false], 50], limitValues: viaTime(), actor: ACTOR.CURADURIA, icon: requereCorr() ? undefined : "empty" },
      ...desistClocks(-3),
      ...desistClocks(-4),
      ...desistClocks(-5),
      { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', desc: "Tramite de viabilidad Licencia", limit: false, actor: ACTOR.CURADURIA },
      { state: 55, name: 'Citación (Viabilidad)', desc: "Comunicación o Requerimiento para el tramite de viabilidad de Licencia", limit: [61, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
      { state: 56, name: 'Notificación (Viabilidad)', desc: "Se le notifica al solicitante del Tramite de viabilidad Licencia", limit: [55, 5], info: ['PERSONAL', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
      { state: 57, name: 'Notificación por aviso (Viabilidad)', desc: "El solicitante NO se presento para el Tramite de viabilidad Licencia, fue informado por otros medios", limit: [55, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL, show: false, icon: "empty" },
    ]
  }

  const paymentsClocks = [
    { state: 62, name: 'Expensas Variables', desc: "Pago de Expensas Variables", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA(), actor: ACTOR.SOLICITANTE },
    { state: 63, name: namePayment, desc: "Pago de Impuestos Municipales", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: conOA(), actor: ACTOR.SOLICITANTE },
    { state: 64, name: 'Estampilla PRO-UIS', desc: "Pago de Estampilla PRO-UIS", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], actor: ACTOR.SOLICITANTE },
    { state: 65, name: 'Deberes Urbanísticos', desc: "Pago de Deberes Urbanísticos", limit: [49, 30], info: ['PAGO', 'NO PAGO', 'NA'], show: !conGI, actor: ACTOR.SOLICITANTE },
    { state: 69, name: 'Radicacion de último pago', desc: "Último pago realizado", limit: [[56, 57], 30], actor: ACTOR.SOLICITANTE },
    ...desistClocks(-4),
  ];

  const allClocks = [
    ...extraClocks(),
    ...paymentsClocks,
    { state: 70, name: "Acto Administrativo / Resolución ", desc: "Expedición Acto Administrativo ", limit: [69, 5], info: ['OTORGA', 'NIEGA', 'DESISTE', 'RECURSO', 'REVOCATORIA DIRECTA', 'SILENCIO ADMINISTRATIVO', 'ACLARACIONES Y CORRECCIONES', 'INTERNO', 'OTRO'], actor: ACTOR.CURADURIA },
    { state: 71, name: "Comunicación o Requerimiento(Resolución)", desc: "Comunicación para notificar al solicitante de Acto Administrativo", info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
    { state: 72, name: "Notificación (Resolución)", desc: "Se le notifica al solicitante del Acto Administrativo", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
    { state: 73, name: "Notificación por aviso (Resolución)", desc: "El solicitante NO se presento para el Acto Administrativo, fue informado por otros medios", limit: [71, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], actor: ACTOR.NEUTRAL },
    { state: 731, name: "Notificación (Planeación)", desc: "Se notificar a la oficina de planeación", limit: [71, 5], info: ['PERSONAL', 'ELECTRÓNICO', 'NA'], actor: ACTOR.NEUTRAL },
    { state: 730, name: "Renuncia de Términos", desc: "Se renuncia a los términos", actor: ACTOR.SOLICITANTE },
    { state: 74, name: "Recurso", desc: "Se presenta recurso", limit: [71, 15], info: ['REPOSICIÓN', 'APELACIÓN', 'QUEJA'], actor: ACTOR.SOLICITANTE },
    { state: 75, name: "Resuelve Recurso", desc: "El recurso se resuelve", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74, actor: ACTOR.CURADURIA },
    { state: 751, name: "Comunicación o Requerimiento(Recurso)", desc: "Comunicación para notificar al solicitante de Recurso", limit: [74, 5], info: ['MEDIO EFICAZ', 'CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74, actor: ACTOR.NEUTRAL },
    { state: 752, name: "Notificación (Recurso)", desc: "Se le notifica al solicitante del Recurso", limit: [751, 5], info: ['PERSONAL', 'ELECTRÓNICO'], requiredClock: 74, actor: ACTOR.NEUTRAL },
    { state: 733, name: "Notificación por aviso (Recurso)", desc: "El solicitante NO se presento para el Recurso, fue informado por otros medios", limit: [751, 10], info: ['CERTIFICADO', 'ELECTRÓNICO'], requiredClock: 74, actor: ACTOR.NEUTRAL },
    { state: 762, name: "Traslado Recurso", desc: "Se traslada el recurso", limit: [75, 5], requiredClock: 74, actor: ACTOR.NEUTRAL },
    { state: 76, name: "Apelación (Planeación)", desc: "El recurso se resuelve por planeación", limit: [74, 30], info: ['CONFIRMA', 'REVOCA - MODIFICA'], requiredClock: 74, actor: ACTOR.CURADURIA },
    { state: 761, name: "Recepción Notificación (Planeación)", desc: "Se recibe el recurso de planeación", requiredClock: 74, actor: ACTOR.NEUTRAL },
    { state: 85, name: "Publicación", desc: "Se publica la Licencia", info: ['PRENSA', 'PAGINA'], actor: ACTOR.CURADURIA },
    { state: 99, name: "Ejecutoria - Licencia", desc: "Expedición de Licencia", limit: [[72, 73], 10], actor: ACTOR.CURADURIA },
    { state: 98, name: "Entrega de Licencia", desc: "La licencia fue entregada oficialmente", actor: ACTOR.CURADURIA },
  ];

  // *************** BUILD PROCESS LIST ************** //
  useEffect(() => {
    if (currentItem && currentItem.fun_clocks) {
      buildProcessList();
    }
  }, [currentItem]);

  const buildProcessList = () => {
    const expandedClocks = [];
    allClocks.forEach((value, originalIndex) => {
      if (Array.isArray(value.state) && value.version !== undefined) {
        value.state.forEach((stateItem) => {
          expandedClocks.push({ ...value, state: stateItem, originalIndex });
        });
      } else {
        expandedClocks.push({ ...value, originalIndex });
      }
    });

    const processedList = expandedClocks.filter(value => {
      // Skip if "show" is explicitly false
      if (value.show === false) return false;

      var clock;
      if (value.version !== undefined) {
        clock = _GET_CLOCK_STATE_VERSION(value.state, value.version);
      } else {
        clock = _GET_CLOCK_STATE(value.state);
      }

      // Skip if optional and no clock exists
      if (!clock && value.optional) return false;

      // Skip if required clock doesn't exist
      if (value.requiredClock) {
        let needClock = _GET_CLOCK_STATE(value.requiredClock);
        if (!needClock || !needClock.date_start) return false;
      }

      // Skip if desc is explicitly false
      if (value.desc === false) return false;

      return true;
    }).map((value, idx) => {
      const clock = value.version !== undefined
        ? _GET_CLOCK_STATE_VERSION(value.state, value.version)
        : _GET_CLOCK_STATE(value.state);

      const currentDate = clock?.date_start ?? value.manualDate ?? '';
      
      let limitDate = '';
      if (value.limit) {
        if (Array.isArray(value.limit[0])) {
          limitDate = dateParser_finalDate(get_newestDate(value.limit[0]), value.limit[1]);
        } else {
          limitDate = dateParser_finalDate((_GET_CLOCK_STATE(value.limit[0]) || {}).date_start, value.limit[1]);
        }
      }

      return {
        ...value,
        clock: clock || {},
        currentDate,
        limitDate,
        status: currentDate ? 'completed' : 'pending',
        indexInList: idx
      };
    });

    console.log('Process List:', processedList);
    setProcessList(processedList);
  };

  // *************** NODE COMPONENT ************** //
  const ProcessNode = ({ node, index }) => {
    const actor = node.actor || ACTOR.NEUTRAL;
    
    const getYPosition = () => {
      if (actor === ACTOR.CURADURIA) return '-29%';
      if (actor === ACTOR.SOLICITANTE) return '29%';
      return '0%';
    };

    const isCompleted = node.status === 'completed';
    const nodeColor = isCompleted ? '#28a745' : '#cbd5e0';

    return (
      <div 
        className="process-node"
        style={{ 
          '--node-color': nodeColor,
          top: getYPosition(),
        }}
        onClick={() => setSelectedNode({ ...node, index })}
      >
        <div className="node-inner">
          <div className="node-content">
            <div className="node-title">{node.name}</div>
            <div className="node-date">
              {node.currentDate ? (
                <span className="text-success fw-bold">{node.currentDate}</span>
              ) : (
                <span className="text-muted">Pendiente</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // *************** MODAL DETAIL ************** //
  const NodeDetailModal = () => {
    if (!selectedNode) return null;

    const handleSave = () => {
      save_clock(selectedNode, selectedNode.indexInList);
      setSelectedNode(null);
      setTimeout(() => {
        props.requestUpdate(currentItem.id);
      }, 500);
    };

    const handleClose = () => setSelectedNode(null);

    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header" style={{ background: '#667eea' }}>
            <h5 className="modal-title text-white">
              <i className="fas fa-clock me-2"></i>
              {selectedNode.name}
            </h5>
            <button className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Descripción</label>
                <p className="text-muted">{selectedNode.desc || 'Sin descripción'}</p>
              </div>

              {selectedNode.editableDate !== false && selectedNode.state !== false && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id={`modal_clock_date_${selectedNode.indexInList}`}
                    defaultValue={selectedNode.currentDate}
                    max="2100-01-01"
                  />
                </div>
              )}

              {selectedNode.limitDate && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">Fecha Límite</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedNode.limitDate}
                    disabled
                  />
                </div>
              )}

              {selectedNode.info && (
                <div className="col-12">
                  <label className="form-label fw-bold">Información Adicional</label>
                  <select
                    className="form-select"
                    id={`modal_clock_res_${selectedNode.indexInList}`}
                    defaultValue={selectedNode.clock.resolver_context ?? selectedNode.info[0]}
                  >
                    {selectedNode.info.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {selectedNode.hasConsecutivo !== false && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">Consecutivo</label>
                  <input
                    list="codes_exp_modal"
                    autoComplete="off"
                    className="form-control"
                    id={`modal_clock_id_related_${selectedNode.indexInList}`}
                    defaultValue={selectedNode.clock.id_related ?? ''}
                  />
                  <datalist id="codes_exp_modal">
                    {outCodes && outCodes.map((data) => <option key={data.cub} value={data.cub}></option>)}
                  </datalist>
                </div>
              )}

              {selectedNode.hasAnnexSelect !== false && (
                <div className="col-md-6">
                  <label className="form-label fw-bold">Documento Anexo</label>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select"
                      id={`modal_clock_id6_${selectedNode.indexInList}`}
                      defaultValue={selectedNode.clock.resolver_id6 ?? 0}
                    >
                      <option value="-1">FIS</option>
                      <option value="0">N/A</option>
                      {_CHILD_6_SELECT()}
                    </select>
                    
                    {(selectedNode.clock.resolver_id6 ?? 0) > 0 && (() => {
                      const file = _FIND_6(selectedNode.clock.resolver_id6);
                      if (file?.path && file?.filename) {
                        return (
                          <VIZUALIZER
                            url={`${file.path}/${file.filename}`}
                            apipath={'/files/'}
                            icon={'fas fa-search'}
                            iconWrapper={'btn btn-info'}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              {selectedNode.actor && (
                <div className="col-12">
                  <div className={`alert mb-0 ${
                    selectedNode.actor === ACTOR.CURADURIA ? 'alert-info' :
                    selectedNode.actor === ACTOR.SOLICITANTE ? 'alert-success' :
                    'alert-secondary'
                  }`}>
                    <strong>Actor responsable:</strong> {
                      selectedNode.actor === ACTOR.CURADURIA ? 'Curaduría' :
                      selectedNode.actor === ACTOR.SOLICITANTE ? 'Solicitante' :
                      'Neutral'
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <i className="fas fa-save me-2"></i>Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // *************** SAVE CLOCK ************** //
  let save_clock = (value, i) => {
    if (value.state === false || value.state == null) return;
    var formDataClock = new FormData();

    const dateInput = document.getElementById(`modal_clock_date_${i}`);
    const resolverSelect = document.getElementById(`modal_clock_res_${i}`);
    const id6Select = document.getElementById(`modal_clock_id6_${i}`);
    const idRelatedInput = document.getElementById(`modal_clock_id_related_${i}`);

    let resolver_context = resolverSelect ? resolverSelect.value : false;
    let resolver_id6 = id6Select ? id6Select.value : 0;
    let id_related = idRelatedInput ? idRelatedInput.value : '';

    if (dateInput && dateInput.value) formDataClock.set('date_start', dateInput.value);
    if (resolver_context) formDataClock.set('resolver_context', resolver_context);
    formDataClock.set('resolver_id6', resolver_id6);
    formDataClock.set('state', value.state);
    formDataClock.set('id_related', id_related);

    let desc = value.desc || value.name;
    if (resolver_context) desc = desc + ': ' + resolver_context;
    formDataClock.set('desc', desc);
    formDataClock.set('name', value.name);

    manage_clock(true, value.state, false, formDataClock);
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
      buildProcessList();
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

  // *************** RENDER ************** //
  if (!currentItem || !currentItem.fun_clocks) {
    return <div className="alert alert-warning">No hay datos de proceso disponibles</div>;
  }

  return (
    <div className="diagram-wrapper">
      <div className="diagram-header">
        <h5 className="mb-0">
          <i className="fas fa-project-diagram me-2"></i>
          Diagrama del Proceso
        </h5>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#5bc0de' }}></div>
            <span>Curaduría</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#28a745' }}></div>
            <span>Solicitante</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#6c757d' }}></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>

      <div className="diagram-container">
        {/* Actor Labels */}
        <div className="actor-labels">
          <div className="actor-label actor-curaduria">Curaduría</div>
          <div className="actor-label actor-solicitante">Solicitante</div>
        </div>

        <div className="diagram-scroll" >
          <div className="diagram-content">
            <div className="timeline-track"></div>

            {processList.length > 0 ? (
              processList.map((node, index) => (
                <ProcessNode 
                  key={`node-${index}-${node.state}`} 
                  node={node} 
                  index={index}
                />
              ))
            ) : (
              <div className="no-data-message">
                <i className="fas fa-info-circle me-2"></i>
                No hay eventos para mostrar en el diagrama
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <NodeDetailModal />

      {/* Styles */}
      <style>{`
        .diagram-wrapper {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .diagram-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .legend {
          display: flex;
          gap: 1.5rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .diagram-container {
          position: relative;
          height: 450px;
          background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
        }

        .actor-labels {
          position: absolute;
          left: 1rem;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 10;
          pointer-events: none;
        }

        .actor-label {
          position: absolute;
          font-weight: 600;
          font-size: 0.875rem;
          color: #495057;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .actor-curaduria {
          top: calc(20% - 20px);
        }

        .actor-solicitante {
          top: calc(80% - 20px);
        }

        .diagram-scroll {
          width: 100%;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding-left: 120px;
        }

        .diagram-content {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          gap: 0;
          min-width: max-content;
          padding: 0;
        }

        .timeline-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 3px;
          background: linear-gradient(to right, #cbd5e0 0%, #a0aec0 100%);
          z-index: 1;
        }

        .no-data-message {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 2rem 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          color: #6c757d;
          font-size: 1rem;
          z-index: 20;
        }

        .process-node {
          position: relative;
          min-width: 150px;
          z-index: 10;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 0.5rem;
        }

        .process-node:hover .node-inner {
          transform: scale(1.08);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .node-inner {
          background: white;
          border: 3px solid var(--node-color);
          border-radius: 12px;
          padding: 0.65rem 0.85rem;
          box-shadow: 0 3px 10px rgba(0,0,0,0.12);
          display: flex;
          gap: 0.75rem;
          align-items: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .node-inner::before {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 10px;
          background: var(--node-color);
          border-radius: 50%;
          z-index: 15;
          box-shadow: 0 0 0 3px white, 0 0 0 5px var(--node-color);
        }

        .node-content {
          flex: 1;
          min-width: 0;
        }

        .node-title {
          font-weight: 600;
          font-size: 0.825rem;
          color: #212529;
          margin-bottom: 0.35rem;
          line-height: 1.3;
        }

        .node-date {
          font-size: 0.775rem;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid #dee2e6;
        }

        .diagram-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .diagram-scroll::-webkit-scrollbar-track {
          background: #e9ecef;
        }

        .diagram-scroll::-webkit-scrollbar-thumb {
          background: #adb5bd;
          border-radius: 4px;
        }

        .diagram-scroll::-webkit-scrollbar-thumb:hover {
          background: #6c757d;
        }

        @media (max-width: 768px) {
          .diagram-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .legend {
            width: 100%;
            justify-content: space-around;
          }

          .actor-labels {
            width: 80px;
          }

          .actor-label {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }

          .process-node {
            min-width: 170px;
          }

          .diagram-scroll {
            padding-left: 90px;
          }

          .diagram-container {
            height: 400px;
          }
        }
      `}</style>
    </div>
  );
}