import React, { useState, useCallback } from 'react';
import {
  MDBBtn,
} from '../../components/ui';
import Modal from 'react-modal';

// SERVICES
import FUNService from '../../services/fun.service';

// NEW DASHBOARD
import { FunDashboard } from './fun_dashboard';
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
  // ---- Single modal state ----
  const [activeModal, setActiveModal] = useState(null);

  // ---- Item context (needed by modals) ----
  const [currentId, setCurrentId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [currentLastVersion, setCurrentLastVersion] = useState(null);
  const [currentPublic, setCurrentPublic] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);

  // ---- Data fetcher for refresh ----
  const retrievePublish = useCallback(() => {
    // Lightweight: only used after modal actions that mutate data
    FUNService.getAll_fun().catch(e => console.log(e));
  }, []);

  // ---- Modal management ----
  const setItemData = useCallback((item) => {
    setCurrentVersion(item.version);
    setCurrentId(item.id);
    setCurrentLastVersion(item.version);
    setCurrentDate(item.clock_payment ?? 'FECHA PENDIENTE');
    setCurrentPublic(item.id_public);
  }, []);

  const openModal = useCallback((item, type) => {
    if (item) setItemData(item);
    setActiveModal(type);
  }, [setItemData]);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const navigation = useCallback((item, TO, FROM) => {
    if (FROM) setActiveModal(null);
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
    });
  }, []);

  const handleDuplicateSuccess = useCallback((newId) => {
    closeModal();
    FUNService.get(newId).then(response => {
      openModal(response.data, 'general');
    }).catch(e => console.log(e));
  }, [closeModal, openModal]);

  // ---- Dashboard → Modal bridge ----
  const handleProjectClick = useCallback((project) => {
    const raw = project._raw;
    if (raw) {
      setItemData({
        id: raw.id,
        version: raw.version || 1,
        clock_payment: raw.clock_payment,
        id_public: raw.id_public,
      });
      setActiveModal('general');
    }
  }, [setItemData]);

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
    <>
      {/* ── New Dashboard ── */}
      <FunDashboard onProjectClick={handleProjectClick} />

      {/* ── Modal for FUN interactions (preserved) ── */}
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
          <div className="my-3 d-flex justify-content-between">
            <label>ULTIMA VERSIÓN: {currentLastVersion}</label>
          </div>
          {renderModalContent()}
          <div className="text-end py-4 mt-3">
            <MDBBtn color="info" onClick={closeModal}>
              <h4 className="pt-2"><i className="fas fa-times-circle"></i> CERRAR</h4>
            </MDBBtn>
          </div>
        </Modal>
      )}
    </>
  );
}

export default FunManageNewPage;
