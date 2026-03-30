import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBBtn,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBRow,
  MDBCol,
} from '../../components/ui';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

// SERVICES
import FUNService from '../../services/fun.service';
import SubmitService from '../../services/submit.service';

// Existing child components (reused from old module)
import FUN_DAILY_COMPONENT from './fun_forms/components/fun_daily.component';
import FUN_ASIGNS_COMPONENT from './fun_forms/components/fun_asign.component';
import SUBMIT_X_FUN from './submit/submit_x_fun.component';
import FUN_WORKER_ASIGN from './fun_forms/components/fun_worker_asign.component';

// FUN modals — imported but only mounted when needed
import FUNG from './fun_forms/fun_g';
import FUNC from './fun_forms/fun_c';
import FUNN from './fun_forms/fun_n';
import FUND from './fun_forms/components/fun_docs';
import FUN_ALERT from './fun_forms/fun_alertn';
import FUNCLOCK from './fun_forms/fun_clock';
import RECORD_ARC from './records/record_arc';
import RECORD_LAW from './records/record_law';
import RECORD_ENG from './records/record_eng';
import RECORD_PH from './records/record_ph';
import RECORD_REVIEW from './records/record_review';
import EXPEDITION from './expeditions/expedition.page';
import FUN_REPORT_GEN from './fun_forms/fun_reports/fun_gen.report';

import { regexChecker_isPh, regexChecker_isOA } from '../../components/customClasses/typeParse';
import { nomens } from '../../components/jsons/vars';
import DataTable from 'react-data-table-component';

// Lazy-loaded heavy components
const FUN_MACROTABLE = lazy(() => import('./fun_forms/fun_macrotable.'));

const MySwal = withReactContent(Swal);

// =============================================================================
// Modal style helpers (shared)
// =============================================================================
const MODAL_STYLE = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', zIndex: 2,
  },
  content: {
    position: 'absolute', top: '10px', left: '20%', right: '15%', bottom: '10px',
    border: '1px solid #ccc', overflow: 'auto', WebkitOverflowScrolling: 'touch',
    borderRadius: '4px', outline: 'none', padding: '20px',
  },
};

const MODAL_STYLE_FULL = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', zIndex: 2,
  },
  content: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    border: '1px solid #ccc', overflow: 'auto', WebkitOverflowScrolling: 'touch',
    borderRadius: '4px', outline: 'none', padding: '20px', width: 'auto',
  },
};

// =============================================================================
// MODAL_TYPES — replaces 14 separate booleans with one state
// =============================================================================
const MODAL_TYPES = {
  general: { icon: 'far fa-file-alt', label: 'DETALLES DE LA SOLICITUD' },
  check: { icon: 'far fa-check-square', label: 'LISTA DE CHECKEO' },
  edit: { icon: 'fas fa-file-signature', label: 'ACTUALIZACIÓN DE SOLICITUD' },
  archive: { icon: 'fas fa-archive', label: 'GESTIÓN DOCUMENTAL' },
  alert: { icon: 'fas fa-sign', label: 'AVISOS A VECINOS' },
  clock: { icon: 'far fa-clock', label: 'CONTROL DE TIEMPO DE PROCESO' },
  record_arc: { icon: 'far fa-building', label: 'INFORME ARQUITECTÓNICO' },
  record_law: { icon: 'fas fa-balance-scale', label: 'INFORME JURÍDICO' },
  record_eng: { icon: 'fas fa-cogs', label: 'INFORME ESTRUCTURAL' },
  record_ph: { icon: 'fas fa-pencil-ruler', label: 'INFORME PROPIEDAD HORIZONTAL' },
  record_review: { icon: 'fas fa-file-contract', label: 'ACTA DE OBSERVACIONES' },
  expedition: { icon: 'far fa-file-alt', label: 'EXPEDICIÓN DE LA LICENCIA' },
};

// =============================================================================
// Component
// =============================================================================
function FunManageNewPage({ translation, swaMsg, globals, breadCrums }) {
  // ---- Active tab ----
  const [activeTab, setActiveTab] = useState('daily');

  // ---- Single modal state (replaces 14 booleans) ----
  const [activeModal, setActiveModal] = useState(null); // null | 'general' | 'check' | ...
  const [macroOpen, setMacroOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // ---- Item context ----
  const [currentId, setCurrentId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentLastVersion, setCurrentLastVersion] = useState(null);
  const [currentPublic, setCurrentPublic] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // ---- Data lists ----
  const [items, setItems] = useState([]);
  const [listComplete, setListComplete] = useState([]);
  const [listStarted, setListStarted] = useState([]);
  const [submitItems, setSubmitItems] = useState([]);

  // ---- Macro dates ----
  const [dateStart, setDateStart] = useState(moment().subtract(12, 'months').format('YYYY-MM-DD'));
  const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));
  const [reportDateStart, setReportDateStart] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [reportDateEnd, setReportDateEnd] = useState(moment().endOf('month').format('YYYY-MM-DD'));
  const [defaultFilter, setDefaultFilter] = useState(false);

  // ---- Submit (radicación) ----
  const [submitList, setSubmitList] = useState([]);
  const [submitSearch, setSubmitSearch] = useState('');
  const [submitSearchField, setSubmitSearchField] = useState('id_public');

  // ---- Initial load ----
  useEffect(() => {
    retrievePublish();
    retrieveSubmitList();
  }, []);

  // ---- Data fetchers ----
  const retrievePublish = useCallback(() => {
    FUNService.getAll_fun()
      .then(response => {
        const _LIST = response.data;
        const started = [];
        for (const item of _LIST) {
          if (item.state >= -1 && item.state < 5) started.push(item);
        }
        setItems(_LIST);
        setListComplete(_LIST);
        setListStarted(started);
      })
      .catch(e => console.log(e));
  }, []);

  const retrieveSubmitList = useCallback(() => {
    SubmitService.getAll()
      .then(response => setSubmitList(response.data))
      .catch(e => console.log(e));
  }, []);

  const retrieveSingle = useCallback((id) => {
    MySwal.fire({ title: swaMsg.title_wait, text: swaMsg.text_wait, icon: 'info', showConfirmButton: false });
    FUNService.get(id)
      .then(response => {
        MySwal.close();
        openModal(response.data, 'archive');
      })
      .catch(e => {
        MySwal.fire({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning', confirmButtonText: swaMsg.text_btn });
        console.log(e);
      });
  }, [swaMsg]);

  // ---- Modal management (single state) ----
  const setItemData = useCallback((item) => {
    setCurrentVersion(item.version);
    setCurrentId(item.id);
    setCurrentLastVersion(item.version);
    setCurrentDate(item.clock_payment ?? 'FECHA PENDIENTE');
    setCurrentPublic(item.id_public);
    setSelectedRow(item.id);
  }, []);

  const openModal = useCallback((item, type) => {
    if (item) setItemData(item);
    setActiveModal(type);
  }, [setItemData]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const navigation = useCallback((item, TO, FROM) => {
    // Close current if open
    if (FROM) setActiveModal(null);
    // Open target
    if (TO === 'macro') {
      setMacroOpen(true);
      return;
    }
    if (item) setItemData(item);
    setActiveModal(TO);
  }, [setItemData]);

  const navigationVersion = useCallback((step) => {
    setCurrentVersion(prev => step === 'minus' ? prev - 1 : prev + 1);
  }, []);

  const requestUpdate = useCallback((id) => {
    FUNService.get(id).then(response => {
      const item = response.data;
      setCurrentId(item.id);
      setCurrentVersion(item.version);
      retrievePublish();
    });
  }, [retrievePublish]);

  const handleDuplicateSuccess = useCallback((newId) => {
    closeModal();
    FUNService.get(newId).then(response => {
      openModal(response.data, 'general');
      retrievePublish();
    }).catch(e => console.log(e));
  }, [closeModal, openModal, retrievePublish]);

  const toggleNegative = useCallback((item) => {
    if (item) {
      setCurrentVersion(item.version);
      setCurrentId(item.id_sistem);
      setCurrentLastVersion(item.version);
      setCurrentDate(item.date);
      setCurrentPublic(item.id_public);
      setSelectedRow(item.id_sistem);
    }
    setActiveModal('general');
  }, []);

  // ---- Submit search ----
  const handleSubmitSearch = useCallback(() => {
    if (!submitSearch.trim()) { retrieveSubmitList(); return; }
    MySwal.fire({ title: swaMsg.title_wait, text: swaMsg.text_wait, icon: 'info', showConfirmButton: false });
    SubmitService.getSearch(submitSearchField, submitSearch)
      .then(response => { setSubmitList(response.data); MySwal.close(); })
      .catch(e => { console.log(e); MySwal.close(); });
  }, [submitSearch, submitSearchField, swaMsg, retrieveSubmitList]);

  // ---- Macro loaders ----
  const handleLoadMacro = useCallback((e) => {
    e.preventDefault();
    let d1 = dateStart, d2 = dateEnd;
    if (moment(d1).diff(d2) >= 0) { d1 = dateEnd; d2 = dateStart; }
    setDateStart(d1);
    setDateEnd(d2);
    setMacroOpen(true);
  }, [dateStart, dateEnd]);

  const handleOpenReport = useCallback((e) => {
    e.preventDefault();
    let d1 = reportDateStart, d2 = reportDateEnd;
    if (moment(d1).diff(d2) >= 0) { d1 = reportDateEnd; d2 = reportDateStart; }
    setReportDateStart(d1);
    setReportDateEnd(d2);
    setReportOpen(true);
  }, [reportDateStart, reportDateEnd]);

  // ---- Modal header ----
  const modalHeader = (
    <div className="my-3 d-flex justify-content-between">
      <label>ULTIMA VERSIÓN: {currentLastVersion}</label>
    </div>
  );

  // ---- Modal content map ----
  const renderModalContent = () => {
    const commonProps = {
      translation, swaMsg, globals,
      currentId, currentVersion,
      requestUpdate, requesRefresh: retrievePublish,
      NAVIGATION: navigation, NAVIGATION_VERSION: navigationVersion,
    };

    switch (activeModal) {
      case 'general':
        return <FUNG {...commonProps} onDuplicateSuccess={handleDuplicateSuccess} />;
      case 'check':
        return <FUNC {...commonProps} closeModal={closeModal} />;
      case 'edit':
        return <FUNN {...commonProps} />;
      case 'archive':
        return <FUND {...commonProps} />;
      case 'alert':
        return <FUN_ALERT {...commonProps} closeModal={closeModal} />;
      case 'clock':
        return <FUNCLOCK {...commonProps} />;
      case 'record_arc':
        return <RECORD_ARC {...commonProps} closeModal={closeModal} />;
      case 'record_law':
        return <RECORD_LAW {...commonProps} closeModal={closeModal} />;
      case 'record_eng':
        return <RECORD_ENG {...commonProps} closeModal={closeModal} />;
      case 'record_ph':
        return <RECORD_PH {...commonProps} closeModal={closeModal} />;
      case 'record_review':
        return <RECORD_REVIEW {...commonProps} closeModal={closeModal} />;
      case 'expedition':
        return <EXPEDITION {...commonProps} closeModal={closeModal} />;
      default:
        return null;
    }
  };

  const modalMeta = activeModal ? MODAL_TYPES[activeModal] : null;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="container-fluid p-0">
      {/* ---- Breadcrumb ---- */}
      <div className="col-12 d-flex justify-content-start p-0">
        <MDBBreadcrumb className="mb-0 p-0 ms-0">
          <MDBBreadcrumbItem>
            <Link to="/home">
              <i className="fas fa-home"></i>{' '}
              <label className="text-uppercase">{breadCrums?.bc_01 || 'Inicio'}</label>
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem>
            <Link to="/dashboard">
              <i className="far fa-bookmark"></i>{' '}
              <label className="text-uppercase">{breadCrums?.bc_u1 || 'Panel'}</label>
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem active>
            <i className="fas fa-layer-group"></i>{' '}
            <label className="text-uppercase">Centro de Operaciones</label>
          </MDBBreadcrumbItem>
        </MDBBreadcrumb>
      </div>

      {/* ---- Title ---- */}
      <div className="row mb-3 d-flex justify-content-center">
        <div className="col-lg-11 col-md-12">
          <h1 className="text-center my-3">CENTRO DE OPERACIONES DE LICENCIAS</h1>
          <hr />
        </div>

        {/* ---- Hidden helpers (worker assignments, submit bridge) ---- */}
        <SUBMIT_X_FUN translation={translation} globals={globals}
          setSubtmitRows={setSubmitItems} type="LIC" simple hide
          retrievSingle={retrieveSingle} openModal={openModal}
          listIncomplete={listStarted} />
        <FUN_WORKER_ASIGN translation={translation} globals={globals} type="law" openModal={openModal} />
        <FUN_WORKER_ASIGN translation={translation} globals={globals} type="arc" openModal={openModal} />
        <FUN_WORKER_ASIGN translation={translation} globals={globals} type="eng" openModal={openModal} />

        {/* ---- Actions row (macro + reports) ---- */}
        <MDBRow>
          <h2 className="text-uppercase text-center pb-2">ACCIONES</h2>
          <MDBCol md="6">
            <MDBCard className="bg-card mb-3">
              <MDBCardBody>
                <MDBCardTitle className="text-center">CARGAR MACROTABLA</MDBCardTitle>
                <form onSubmit={handleLoadMacro}>
                  <div className="row">
                    <div className="col">
                      <div className="input-group">
                        <span className="input-group-text bg-info text-white"><i className="far fa-calendar-alt"></i></span>
                        <input type="date" className="form-control" required
                          value={dateStart} onChange={e => setDateStart(e.target.value)} />
                      </div>
                    </div>
                    <div className="col">
                      <div className="input-group">
                        <span className="input-group-text bg-info text-white"><i className="far fa-calendar-alt"></i></span>
                        <input type="date" className="form-control" required
                          value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-danger mt-1"><i className="fas fa-th"></i> CARGAR</button>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
          <MDBCol md="6">
            <MDBCard className="bg-card mb-3">
              <MDBCardBody>
                <MDBCardTitle className="text-center">REPORTES</MDBCardTitle>
                <form onSubmit={handleOpenReport}>
                  <div className="row">
                    <div className="col">
                      <div className="input-group">
                        <span className="input-group-text bg-info text-white"><i className="far fa-calendar-alt"></i></span>
                        <input type="date" className="form-control" required
                          value={reportDateStart} onChange={e => setReportDateStart(e.target.value)} />
                      </div>
                    </div>
                    <div className="col">
                      <div className="input-group">
                        <span className="input-group-text bg-info text-white"><i className="far fa-calendar-alt"></i></span>
                        <input type="date" className="form-control" required
                          value={reportDateEnd} onChange={e => setReportDateEnd(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="btn btn-primary mt-1"><i className="fas fa-file-alt"></i> CARGAR</button>
                  </div>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* ---- Main tabs ---- */}
        <MDBTabs fill className="m-2 border" pills>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => setActiveTab('daily')} active={activeTab === 'daily'}>
              <i className="fas fa-calendar-day me-1"></i> PROCESOS DIARIOS
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => setActiveTab('submit')} active={activeTab === 'submit'}>
              <i className="fas fa-file-import me-1"></i> RADICACIÓN
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => setActiveTab('docs')} active={activeTab === 'docs'}>
              <i className="fas fa-folder-open me-1"></i> ENTRADA DE DOCUMENTOS
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => setActiveTab('asigns')} active={activeTab === 'asigns'}>
              <i className="fas fa-users me-1"></i> CARGA PROFESIONAL
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent>
          {/* -- Tab: Procesos Diarios (Kanban board) -- */}
          <MDBTabsPane show={activeTab === 'daily'}>
            <FUN_DAILY_COMPONENT
              translation={translation} swaMsg={swaMsg} globals={globals}
              NAVIGATION_GEN={navigation}
              requestUpdate={requestUpdate}
              requesRefresh={retrievePublish}
            />
          </MDBTabsPane>

          {/* -- Tab: Radicación (Submit integrated) -- */}
          <MDBTabsPane show={activeTab === 'submit'}>
            <SubmitSection
              swaMsg={swaMsg} globals={globals} translation={translation}
              submitList={submitList}
              submitSearch={submitSearch}
              setSubmitSearch={setSubmitSearch}
              submitSearchField={submitSearchField}
              setSubmitSearchField={setSubmitSearchField}
              handleSubmitSearch={handleSubmitSearch}
              refreshList={retrieveSubmitList}
            />
          </MDBTabsPane>

          {/* -- Tab: Entrada de Documentos -- */}
          <MDBTabsPane show={activeTab === 'docs'}>
            <SUBMIT_X_FUN
              translation={translation} globals={globals}
              setSubtmitRows={setSubmitItems} type="LIC"
              retrievSingle={retrieveSingle} openModal={openModal}
              listIncomplete={listStarted}
            />
          </MDBTabsPane>

          {/* -- Tab: Carga Profesional -- */}
          <MDBTabsPane show={activeTab === 'asigns'}>
            <FUN_ASIGNS_COMPONENT
              translation={translation} swaMsg={swaMsg} globals={globals}
              NAVIGATION_GEN={navigation}
              requestUpdate={requestUpdate}
              requesRefresh={retrievePublish}
            />
          </MDBTabsPane>
        </MDBTabsContent>
      </div>

      {/* ============================================================= */}
      {/* SINGLE MODAL for all FUN interactions (conditionally mounted) */}
      {/* ============================================================= */}
      {activeModal && modalMeta && (
        <Modal
          contentLabel={modalMeta.label}
          isOpen={!!activeModal}
          style={MODAL_STYLE}
          ariaHideApp={false}
        >
          <div className="my-4 d-flex justify-content-between">
            <label>
              <i className={modalMeta.icon}></i>{' '}
              {modalMeta.label} - No. Radicación: {currentPublic}
            </label>
            <MDBBtn className="btn-close" color="none" onClick={closeModal} />
          </div>
          {modalHeader}
          {renderModalContent()}
          <div className="text-end py-4 mt-3">
            <MDBBtn color="info" onClick={closeModal}>
              <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
            </MDBBtn>
          </div>
        </Modal>
      )}

      {/* ---- Macro table modal (lazy loaded) ---- */}
      {macroOpen && (
        <Modal
          contentLabel="MACRO TABLE"
          isOpen={macroOpen}
          style={MODAL_STYLE_FULL}
          ariaHideApp={false}
          className="macro-modal-content"
          overlayClassName="macro-modal-overlay"
        >
          <div className="my-1 d-flex justify-content-between">
            <label><i className="fas fa-th"></i> Macro tabla de seguimiento: Desde {dateStart} hasta {dateEnd}</label>
            <MDBBtn className="btn-close" color="none" onClick={() => setMacroOpen(false)} />
          </div>
          <Suspense fallback={<div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>}>
            <FUN_MACROTABLE
              translation={translation} swaMsg={swaMsg} globals={globals}
              closeModal={() => setMacroOpen(false)}
              NAVIGATION={navigation}
              NAVIGATION_GEN={navigation}
              NAVIGATION_GEN_NEGATIVE={toggleNegative}
              date_start={dateStart} date_end={dateEnd}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              defaultFilter={defaultFilter}
            />
          </Suspense>
        </Modal>
      )}

      {/* ---- Report modal ---- */}
      {reportOpen && (
        <Modal
          contentLabel="REPORT"
          isOpen={reportOpen}
          style={MODAL_STYLE_FULL}
          ariaHideApp={false}
          className="macro-modal-content"
          overlayClassName="macro-modal-overlay"
        >
          <div className="row">
            <div className="col">
              <div className="form-group row">
                <label className="col-form-label col-3"><i className="fas fa-file-alt"></i> REPORTE GENERAL DE SOLICITUDES</label>
                <label className="col-form-label col-1 text-end">FECHAS:</label>
                <div className="col">
                  <input type="date" max="2100-01-01" className="form-control form-control-sm mt-2"
                    value={reportDateStart} onChange={e => setReportDateStart(e.target.value)} />
                </div>
                <div className="col">
                  <input type="date" max="2100-01-01" className="form-control form-control-sm mt-2"
                    value={reportDateEnd} onChange={e => setReportDateEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="col-1 text-end">
              <MDBBtn className="btn-close" color="none" onClick={() => setReportOpen(false)} />
            </div>
          </div>
          <hr />
          <FUN_REPORT_GEN
            translation={translation} swaMsg={swaMsg} globals={globals}
            data={listComplete}
            date_i={reportDateStart} date_f={reportDateEnd}
          />
        </Modal>
      )}
    </div>
  );
}

// =============================================================================
// SubmitSection — Radicación simplificada integrada
// =============================================================================
function SubmitSection({
  swaMsg, globals, translation,
  submitList, submitSearch, setSubmitSearch,
  submitSearchField, setSubmitSearchField,
  handleSubmitSearch, refreshList,
}) {
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editId, setEditId] = useState(null);

  const columns = [
    { name: 'Nr. RADICACIÓN', selector: row => row.id_public, sortable: true, width: '160px' },
    { name: 'Nr. SOLICITUD', selector: row => row.id_related, sortable: true, width: '200px' },
    { name: 'TIPO', selector: row => row.type, sortable: true, width: '130px' },
    {
      name: 'FECHA',
      selector: row => row.date,
      sortable: true,
      width: '180px',
      cell: row => <span>{row.date} {row.time ? `- ${row.time}` : ''}</span>,
    },
    { name: 'PROPIETARIO', selector: row => row.owner, sortable: true },
    {
      name: 'ACCIÓN',
      width: '120px',
      cell: row => (
        <div className="d-flex gap-1">
          <MDBBtn size="sm" color="info" onClick={() => { setEditItem(row); setEditId(row.id); setEditModal(true); }}>
            <i className="far fa-eye"></i>
          </MDBBtn>
          <MDBBtn size="sm" color="danger" onClick={() => handleDelete(row)}>
            <i className="fas fa-trash"></i>
          </MDBBtn>
        </div>
      ),
    },
  ];

  const handleDelete = (row) => {
    Swal.fire({
      title: '¿Eliminar radicado?',
      text: `Se eliminará ${row.id_public}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        SubmitService.delete(row.id)
          .then(() => { refreshList(); Swal.fire('Eliminado', '', 'success'); })
          .catch(e => console.log(e));
      }
    });
  };

  return (
    <div className="p-2">
      {/* Search bar */}
      <MDBCard className="mb-3">
        <MDBCardBody>
          <div className="row align-items-end g-2">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Buscar por:</label>
              <select className="form-select" value={submitSearchField} onChange={e => setSubmitSearchField(e.target.value)}>
                <option value="id_public">Nr. Radicación</option>
                <option value="id_related">Nr. Solicitud</option>
                <option value="owner">Propietario</option>
                <option value="name_retriever">Persona que Entrega</option>
                <option value="id_number_retriever">C.C Persona</option>
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label fw-semibold">Valor:</label>
              <input type="text" className="form-control" placeholder="Buscar..."
                value={submitSearch} onChange={e => setSubmitSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitSearch(); }}
              />
            </div>
            <div className="col-md-2">
              <MDBBtn color="primary" className="w-100" onClick={handleSubmitSearch}>
                <i className="fas fa-search"></i> CONSULTAR
              </MDBBtn>
            </div>
            <div className="col-md-2">
              <MDBBtn color="secondary" className="w-100" onClick={() => { setSubmitSearch(''); refreshList(); }}>
                <i className="fas fa-sync"></i> LIMPIAR
              </MDBBtn>
            </div>
          </div>
        </MDBCardBody>
      </MDBCard>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={submitList}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        highlightOnHover
        striped
        noDataComponent={<span className="p-3 text-muted">Sin radicados encontrados</span>}
      />
    </div>
  );
}

export default FunManageNewPage;
