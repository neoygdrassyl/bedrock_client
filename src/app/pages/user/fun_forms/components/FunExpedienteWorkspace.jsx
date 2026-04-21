import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LegacyModal as Modal } from '@/components/legacy-modal';

import { Button } from '@/components/ui/button';
import FUNService from '../../../../services/fun.service';

import FUNG from '../fun_g';
import FUNC from '../fun_c';
import FUNN from '../fun_n';
import FUND from './fun_docs';
import FUN_ALERT from '../fun_alertn';
import FUNCLOCK from '../fun_clock';
import RECORD_ARC from '../../records/record_arc';
import RECORD_LAW from '../../records/record_law';
import RECORD_ENG from '../../records/record_eng';
import RECORD_PH from '../../records/record_ph';
import RECORD_REVIEW from '../../records/record_review';
import EXPEDITION from '../../expeditions/expedition.page';
import { Icon } from '@/components/icon';

const MODULE_META = {
  general: { icon: 'far fa-file-alt', label: 'Detalles de la Solicitud' },
  check: { icon: 'far fa-check-square', label: 'Lista de Checkeo' },
  edit: { icon: 'fas fa-file-signature', label: 'Actualización de Solicitud' },
  archive: { icon: 'fas fa-archive', label: 'Gestión Documental' },
  alert: { icon: 'fas fa-sign', label: 'Avisos a Vecinos' },
  clock: { icon: 'far fa-clock', label: 'Control de Tiempo de Proceso' },
  record_arc: { icon: 'far fa-building', label: 'Informe Arquitectónico' },
  record_law: { icon: 'fas fa-balance-scale', label: 'Informe Jurídico' },
  record_eng: { icon: 'fas fa-cogs', label: 'Informe Estructural' },
  record_ph: { icon: 'fas fa-pencil-ruler', label: 'Informe Propiedad Horizontal' },
  record_review: { icon: 'fas fa-file-contract', label: 'Acta de Observaciones' },
  expedition: { icon: 'far fa-file-alt', label: 'Expedición de la Licencia' },
};

const FULLSCREEN_MODAL_STYLE = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
    backdropFilter: 'blur(2px)',
    zIndex: 1060,
  },
  content: {
    position: 'absolute',
    top: '10px',
    left: 'max(8px, 1vw)',
    right: 'max(8px, 1vw)',
    bottom: '10px',
    border: '1px solid #cbd5e1',
    overflow: 'hidden',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '16px',
    outline: 'none',
    padding: 0,
    backgroundColor: '#fff',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.24)',
  },
};

function buildContext(expediente) {
  return {
    currentId: expediente?.id ?? null,
    currentVersion: expediente?.version ?? null,
    currentLastVersion: expediente?.version ?? null,
    currentPublic: expediente?.id_public ?? expediente?.radicado ?? null,
    currentDate: expediente?.fecha_radicacion ?? null,
  };
}

export function FunExpedienteWorkspace({
  expediente,
  translation,
  globals,
  swaMsg,
  onClose,
  onRefresh,
}) {
  const [activeModule, setActiveModule] = useState('general');
  const [context, setContext] = useState(() => buildContext(expediente));
  const [bootstrapping, setBootstrapping] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const setItemData = useCallback((item) => {
    if (!item) return;
    setContext(prev => ({
      ...prev,
      currentId: item.id ?? prev.currentId,
      currentVersion: item.version ?? prev.currentVersion,
      currentLastVersion: item.version ?? prev.currentLastVersion,
      currentPublic: item.id_public ?? item.radicado ?? prev.currentPublic,
      currentDate: item.clock_payment ?? item.fecha_radicacion ?? prev.currentDate,
    }));
  }, []);

  useEffect(() => {
    const nextContext = buildContext(expediente);
    setActiveModule('general');
    setContext(nextContext);
    setLoadError(null);

    if (!expediente?.id) {
      setBootstrapping(false);
      return;
    }

    if (nextContext.currentVersion && nextContext.currentPublic) {
      setBootstrapping(false);
      return;
    }

    setBootstrapping(true);
    FUNService.get(expediente.id)
      .then(response => {
        setItemData(response.data);
        setBootstrapping(false);
      })
      .catch(() => {
        setLoadError('No fue posible cargar el contexto completo del expediente.');
        setBootstrapping(false);
      });
  }, [expediente, setItemData]);

  const closeActiveModule = useCallback(() => {
    if (activeModule === 'general') {
      onClose?.();
      return;
    }
    setActiveModule('general');
  }, [activeModule, onClose]);

  const navigation = useCallback((item, to) => {
    if (item) setItemData(item);
    if (!to || !MODULE_META[to]) return;
    setActiveModule(to);
  }, [setItemData]);

  const navigationVersion = useCallback((step) => {
    setContext(prev => ({
      ...prev,
      currentVersion: step === 'minus'
        ? Math.max(1, (prev.currentVersion || 1) - 1)
        : (prev.currentVersion || 0) + 1,
    }));
  }, []);

  const requestUpdate = useCallback((id) => {
    return FUNService.get(id).then(response => {
      setItemData(response.data);
      onRefresh?.();
      return response.data;
    });
  }, [onRefresh, setItemData]);

  const handleDuplicateSuccess = useCallback((newId) => {
    return FUNService.get(newId).then(response => {
      setItemData(response.data);
      setActiveModule('general');
      onRefresh?.();
    });
  }, [onRefresh, setItemData]);

  const commonProps = useMemo(() => ({
    translation,
    swaMsg,
    globals,
    currentId: context.currentId,
    currentVersion: context.currentVersion,
    requestUpdate,
    requesRefresh: onRefresh,
    NAVIGATION: navigation,
    NAVIGATION_VERSION: navigationVersion,
  }), [
    context.currentId,
    context.currentVersion,
    globals,
    navigation,
    navigationVersion,
    onRefresh,
    requestUpdate,
    swaMsg,
    translation,
  ]);

  const meta = MODULE_META[activeModule] || MODULE_META.general;
  const contentKey = `${activeModule}-${context.currentId || 'empty'}`;

  const renderContent = () => {
    switch (activeModule) {
      case 'general':
        return (
          <FUNG
            key={contentKey}
            {...commonProps}
            onDuplicateSuccess={handleDuplicateSuccess}
          />
        );
      case 'check':
        return (
          <FUNC
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'edit':
        return <FUNN key={contentKey} {...commonProps} />;
      case 'archive':
        return <FUND key={contentKey} {...commonProps} />;
      case 'alert':
        return (
          <FUN_ALERT
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'clock':
        return <FUNCLOCK key={contentKey} {...commonProps} />;
      case 'record_arc':
        return (
          <RECORD_ARC
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'record_law':
        return (
          <RECORD_LAW
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'record_eng':
        return (
          <RECORD_ENG
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'record_ph':
        return (
          <RECORD_PH
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'record_review':
        return (
          <RECORD_REVIEW
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      case 'expedition':
        return (
          <EXPEDITION
            key={contentKey}
            {...commonProps}
            closeModal={closeActiveModule}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      contentLabel={meta.label}
      isOpen={!!expediente}
      style={FULLSCREEN_MODAL_STYLE}
      ariaHideApp={false}
      onRequestClose={closeActiveModule}
    >
      <div className="d-flex flex-column h-100">
        <div
          className="px-4 py-3 d-flex flex-wrap gap-3 align-items-start justify-content-between"
          style={{ borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}
        >
          <div>
            <span className="text-xs text-uppercase text-muted d-block" style={{ letterSpacing: '0.06em' }}>
              Modo de gestión completa
            </span>
            <div className="d-flex align-items-center gap-2 mt-1">
              <Icon name={meta.icon} size={16} />
              <span className="fw-semibold">{meta.label}</span>
            </div>
            <div className="text-muted mt-1">
              Radicado: <span className="font-mono fw-semibold">{context.currentPublic || '—'}</span>
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {activeModule !== 'general' && (
              <Button variant="outline" size="sm" onClick={() => setActiveModule('general')}>
                <Icon name="arrow-left" size={16} className="me-1" />
                Volver al detalle
              </Button>
            )}
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar gestión completa">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div
          className="px-4 py-2 d-flex flex-wrap gap-3 align-items-center"
          style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', flexShrink: 0 }}
        >
          <span className="text-xs text-uppercase text-muted" style={{ letterSpacing: '0.06em' }}>
            Última versión: <strong>{context.currentLastVersion || '—'}</strong>
          </span>
          {context.currentDate && (
            <span className="text-xs text-muted">
              Fecha referencia: {String(context.currentDate)}
            </span>
          )}
          {bootstrapping && (
            <span className="text-xs text-muted ms-auto">
              <Icon name="spinner" size={16} className="me-1" />
              Cargando contexto completo...
            </span>
          )}
        </div>

        <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ backgroundColor: '#fff' }}>
          {loadError ? (
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <Icon name="exclamation-triangle" size={16} className="me-2" />
              <span>{loadError}</span>
            </div>
          ) : bootstrapping ? (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              <div className="text-center">
                <div className="spinner-border spinner-border-sm mb-3" role="status">
                  <span className="visually-hidden">Cargando…</span>
                </div>
                <div>Cargando expediente...</div>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>

        <div
          className="px-4 py-3 d-flex gap-2 justify-content-end"
          style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}
        >
          {activeModule !== 'general' && (
            <Button variant="outline" size="sm" onClick={() => setActiveModule('general')}>
              Volver al detalle
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
