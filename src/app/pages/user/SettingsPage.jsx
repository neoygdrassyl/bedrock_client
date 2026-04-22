import React, { useEffect, useState } from 'react';
import { useAlarmConfig } from './fun_forms/hooks/useAlarmConfig';
import DataService from '../../services/data.service.js';

import { PHASES as PROCESS_PHASES } from './fun_forms/utils/phases';

const ACTORS = ['CURADURIA', 'SOLICITANTE'];

function formatLastLogin(value) {
  if (!value) return 'No disponible';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function normalizeConfig(raw) {
  const cfg = raw || {};
  const phases = cfg.phases ? JSON.parse(JSON.stringify(cfg.phases)) : {};
  
  PROCESS_PHASES.forEach(p => {
    if (!phases[p.code]) phases[p.code] = {};
    ACTORS.forEach(actor => {
      if (!phases[p.code][actor]) {
        phases[p.code][actor] = { threshold: '' };
      }
    });
  });

  const neighbors = cfg.neighbors || { threshold: '' };
  const billboard = cfg.billboard || { threshold: '' };
  const trafficLight = cfg.trafficLight || { green: '', yellow: '', red: '' };

  return { phases, neighbors, billboard, trafficLight };
}

export default function SettingsPage() {
  const { config, loading, saving, error, refetch, save } = useAlarmConfig();
  const [draft, setDraft] = useState(() => normalizeConfig(null));
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('alarmas');
  const [alertMsg, setAlertMsg] = useState(null);
  const user = DataService.getUserData();
  const fullName = [user?.name, user?.surname].filter(Boolean).join(' ') || 'No disponible';
  const roleDesc = user?.roleDesc || 'No disponible';
  const lastLogin = formatLastLogin(user?.lastLoginAt || user?.lastLogin);

  useEffect(() => {
    if (config) {
      setDraft(normalizeConfig(config));
      setDirty(false);
    }
  }, [config]);

  const updatePhase = (phaseCode, actor, value) => {
    setDraft(prev => ({
      ...prev,
      phases: {
        ...prev.phases,
        [phaseCode]: {
          ...prev.phases[phaseCode],
          [actor]: {
            ...prev.phases[phaseCode][actor],
            threshold: value
          }
        }
      }
    }));
    setDirty(true);
  };

  const updateNeighbors = (value) => {
    setDraft(prev => ({
      ...prev,
      neighbors: { ...prev.neighbors, threshold: value }
    }));
    setDirty(true);
  };

  const updateBillboard = (value) => {
    setDraft(prev => ({
      ...prev,
      billboard: { ...prev.billboard, threshold: value }
    }));
    setDirty(true);
  };

  const updateTrafficLight = (key, value) => {
    setDraft(prev => ({
      ...prev,
      trafficLight: { ...prev.trafficLight, [key]: value }
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setAlertMsg(null);
      await save(draft);
      setAlertMsg({ type: 'success', text: 'Configuración guardada exitosamente.' });
      setDirty(false);
      setTimeout(() => setAlertMsg(null), 3000);
    } catch (e) {
      setAlertMsg({ type: 'danger', text: `Error al guardar: ${e?.message || 'Desconocido'}` });
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-1">Configuración de Alarmas</h2>
          <p className="text-muted">Parámetros de tiempos y umbrales para las diferentes fases del proceso.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error cargando configuración</h5>
          <p className="mb-0">{error?.message || 'Intenta recargar.'}</p>
          <button className="btn btn-link p-0 mt-2" onClick={refetch}>Reintentar</button>
        </div>
      )}

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show`} role="alert">
          {alertMsg.text}
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlertMsg(null)}></button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
            <div>
              <h2 className="h4 mb-1">Configuración de Alarmas</h2>
              <p className="text-muted mb-0">Parámetros de tiempos y umbrales para las diferentes fases del proceso.</p>
            </div>

            <div className="d-flex flex-column align-items-lg-end gap-2">
              <div className="d-flex flex-wrap justify-content-lg-end gap-2">
                <span className="badge bg-primary">{fullName}</span>
                <span className="badge bg-secondary">{roleDesc}</span>
              </div>
              <small className="text-muted">Última sesión: {lastLogin}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white pt-3 pb-0">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'alarmas' ? 'active' : ''}`} 
                onClick={() => setActiveTab('alarmas')}
              >
                <i className="fas fa-clock me-2"></i>Alarmas por Fase
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'vecinos' ? 'active' : ''}`} 
                onClick={() => setActiveTab('vecinos')}
              >
                <i className="fas fa-users me-2"></i>Vecinos
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'valla' ? 'active' : ''}`} 
                onClick={() => setActiveTab('valla')}
              >
                <i className="fas fa-sign me-2"></i>Valla Publicitaria
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'semaforo' ? 'active' : ''}`} 
                onClick={() => setActiveTab('semaforo')}
              >
                <i className="fas fa-traffic-light me-2"></i>Semáforo
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body pt-4">
          {activeTab === 'alarmas' && (
            <div>
              <h5 className="card-title mb-3">Configuración de Alarmas por Fase y Actor</h5>
              <p className="card-text text-muted mb-4">
                Defina el umbral en días para cada fase del proceso según el actor responsable.
              </p>
              
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Fase Procesal</th>
                      {ACTORS.map(actor => (
                        <th key={actor} className="text-center" style={{ width: '25%' }}>{actor}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PROCESS_PHASES.map(phase => (
                      <tr key={phase.code}>
                        <td>
                          <strong>{phase.code}</strong> - {phase.label}
                        </td>
                        {ACTORS.map(actor => (
                          <td key={actor} className="text-center">
                            <div className="input-group input-group-sm mx-auto" style={{ maxWidth: '150px' }}>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={draft.phases[phase.code]?.[actor]?.threshold ?? ''}
                                onChange={(e) => updatePhase(phase.code, actor, e.target.value)}
                                disabled={loading || saving}
                                placeholder="Días"
                                min="0"
                              />
                              <span className="input-group-text">días</span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vecinos' && (
            <div>
              <h5 className="card-title mb-3">Alarma de Vecinos</h5>
              <p className="card-text text-muted mb-4">
                Configure el tiempo límite esperado para las interacciones relacionadas con vecinos colindantes.
              </p>
              <div className="mb-3" style={{ maxWidth: '300px' }}>
                <label className="form-label fw-bold">Umbral (días)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={draft.neighbors.threshold ?? ''}
                    onChange={(e) => updateNeighbors(e.target.value)}
                    disabled={loading || saving}
                    min="0"
                  />
                  <span className="input-group-text">días</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'valla' && (
            <div>
              <h5 className="card-title mb-3">Alarma de Valla Publicitaria</h5>
              <p className="card-text text-muted mb-4">
                Establezca el límite de tiempo para verificar la instalación de la valla publicitaria.
              </p>
              <div className="mb-3" style={{ maxWidth: '300px' }}>
                <label className="form-label fw-bold">Umbral (días)</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    value={draft.billboard.threshold ?? ''}
                    onChange={(e) => updateBillboard(e.target.value)}
                    disabled={loading || saving}
                    min="0"
                  />
                  <span className="input-group-text">días</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'semaforo' && (
            <div>
              <h5 className="card-title mb-3">Umbrales de Semáforo</h5>
              <p className="card-text text-muted mb-4">
                Defina los rangos de días para clasificar el estado de las tareas en los KPIs (verde, amarillo, rojo).
              </p>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="card border-success h-100">
                    <div className="card-body">
                      <label className="form-label text-success fw-bold">Verde ({'>'} X días)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={draft.trafficLight.green ?? ''}
                          onChange={(e) => updateTrafficLight('green', e.target.value)}
                          disabled={loading || saving}
                          min="0"
                        />
                        <span className="input-group-text">días</span>
                      </div>
                      <small className="text-muted d-block mt-2">Días restantes para considerar el estado como seguro.</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card border-warning h-100">
                    <div className="card-body">
                      <label className="form-label text-warning fw-bold">Amarillo (X - Y días)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={draft.trafficLight.yellow ?? ''}
                          onChange={(e) => updateTrafficLight('yellow', e.target.value)}
                          disabled={loading || saving}
                          min="0"
                        />
                        <span className="input-group-text">días</span>
                      </div>
                      <small className="text-muted d-block mt-2">Días restantes para alerta preventiva.</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card border-danger h-100">
                    <div className="card-body">
                      <label className="form-label text-danger fw-bold">Rojo ({'<'} Y días)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={draft.trafficLight.red ?? ''}
                          onChange={(e) => updateTrafficLight('red', e.target.value)}
                          disabled={loading || saving}
                          min="0"
                        />
                        <span className="input-group-text">días</span>
                      </div>
                      <small className="text-muted d-block mt-2">Días restantes para considerar el estado crítico o vencido.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="card-footer bg-light d-flex justify-content-end gap-3 py-3">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => { setDraft(normalizeConfig(config)); setDirty(false); }}
            disabled={!dirty || loading || saving}
          >
            Descartar Cambios
          </button>
          <button 
            className="btn btn-primary px-4" 
            onClick={handleSave}
            disabled={!dirty || loading || saving}
          >
            {saving ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...</>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
