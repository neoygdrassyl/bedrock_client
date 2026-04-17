import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectFlowModal from '../../legal_flow_guide/components/ProjectFlowModal';

// ── Status visual config ─────────────────────────────────────────────────────
const STATUS_META = {
  EN_TERMINO:          { label: 'En Término',          bg: '#dcfce7', color: '#166534', barColor: '#22c55e', icon: 'fas fa-check-circle' },
  PRONTO_A_VENCER:     { label: 'Pronto a Vencer',     bg: '#fef9c3', color: '#854d0e', barColor: '#eab308', icon: 'fas fa-exclamation-circle' },
  ALERTA_VENCIMIENTO:  { label: 'Alerta Vencimiento',  bg: '#fee2e2', color: '#991b1b', barColor: '#ef4444', icon: 'fas fa-exclamation-triangle' },
  VENCIDO:             { label: 'Vencido',             bg: '#fecaca', color: '#7f1d1d', barColor: '#dc2626', icon: 'fas fa-times-circle' },
};

// ── Phase derivation for flow diagram ────────────────────────────────────────
const STANDARD_PHASES = [
  { phaseId: 'RAD',     label: 'Radicación LDF',              responsible: 'solicitante' },
  { phaseId: 'EST',     label: 'Estudio y Observaciones',     responsible: 'curaduria' },
  { phaseId: 'NOT_OBS', label: 'Notificación Observaciones',  responsible: 'curaduria' },
  { phaseId: 'CORR',    label: 'Correcciones del Solicitante', responsible: 'solicitante' },
  { phaseId: 'VIA',     label: 'Revisión y Viabilidad',       responsible: 'curaduria' },
  { phaseId: 'NOT_VIA', label: 'Notificación Viabilidad',     responsible: 'curaduria' },
  { phaseId: 'PAG',     label: 'Liquidación y Pagos',         responsible: 'solicitante' },
  { phaseId: 'RES',     label: 'Generación de Resolución',    responsible: 'curaduria' },
  { phaseId: 'NOT_RES', label: 'Notificación Resolución',     responsible: 'curaduria' },
  { phaseId: 'EJEC',    label: 'Ejecutoria y Recurso',        responsible: 'curaduria' },
  { phaseId: 'ENT',     label: 'Entrega de Licencia',         responsible: 'curaduria' },
];

/**
 * Derives a simplified phases array from the dashboard BFF expediente.
 * Only the active phase has accurate day data; completed phases show 0.
 */
function derivePhasesFromExpediente(exp) {
  if (!exp?.fase_actual) return [];
  const currentId = exp.fase_actual;

  // For desist/completed/unknown states, show single-node diagram
  if (currentId.startsWith('DESIST_') || currentId === 'COMPLETADO' || currentId === 'SIN_INICIAR') {
    return [{ phaseId: currentId, label: exp.fase_label, status: 'activo', daysUsed: exp.dias_habiles_usados, daysLimit: exp.dias_habiles_limite, responsible: (exp.responsable || '').toLowerCase().includes('curad') ? 'curaduria' : 'solicitante' }];
  }

  const idx = STANDARD_PHASES.findIndex(p => p.phaseId === currentId);
  if (idx < 0) return [];

  return STANDARD_PHASES.slice(0, idx + 2).map((p, i) => ({
    phaseId: p.phaseId,
    label: p.label,
    responsible: p.responsible,
    status: i < idx ? 'completado' : i === idx ? 'activo' : 'pendiente',
    daysUsed: i === idx ? (exp.dias_habiles_usados ?? 0) : 0,
    daysLimit: i === idx ? (exp.dias_habiles_limite ?? 0) : null,
  }));
}

// ── Componente principal ─────────────────────────────────────────────────────
export function FunExpedienteDetail({ expediente, onClose, onOpenWorkspace }) {
  const [showFlowModal, setShowFlowModal] = useState(false);

  if (!expediente) return null;

  const s = STATUS_META[expediente.status] || STATUS_META.EN_TERMINO;
  const pct = Math.min(expediente.porcentaje_avance ?? 0, 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)',
          zIndex: 1040, transition: 'opacity 0.2s',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'clamp(560px, 48vw, 920px)', maxWidth: '100vw',
          backgroundColor: '#fff', zIndex: 1050,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.2s ease-out',
        }}
        role="dialog"
        aria-label="Detalle del expediente"
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}
        >
          <div>
            <span className="text-xs text-uppercase text-muted d-block" style={{ letterSpacing: '0.06em' }}>
              Expediente
            </span>
            <span className="font-mono font-semibold text-lg">{expediente.radicado}</span>
          </div>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar panel"
          />
        </div>

        {/* ── Body (scrollable) ──────────────────────────── */}
        <div className="flex-grow-1 overflow-auto px-4 py-3" style={{ fontSize: '0.875rem' }}>

          {/* Status + Progress */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <Badge
                style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}33` }}
                className="text-xs font-semibold px-2 py-1"
              >
                <i className={`${s.icon} me-1`} style={{ fontSize: '0.65rem' }} />
                {s.label}
              </Badge>
              <span className="text-sm font-semibold tabular-nums" style={{ color: s.color }}>
                {pct}%
              </span>
            </div>
            <div
              className="rounded-pill overflow-hidden"
              style={{ height: 8, backgroundColor: '#f1f5f9' }}
            >
              <div
                className="rounded-pill"
                style={{
                  height: '100%',
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: s.barColor,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <div className="d-flex justify-content-between mt-1 text-xs text-muted-foreground">
              <span>{expediente.dias_habiles_usados} días usados</span>
              <span>{expediente.dias_habiles_limite} días límite</span>
            </div>
          </div>

          {/* Sugerencia de acción */}
          {expediente.sugerencia && (
            <div
              className="rounded px-3 py-2 mb-4 d-flex align-items-start gap-2"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.color}22` }}
            >
              <i className="fas fa-lightbulb mt-1" style={{ color: s.color, fontSize: '0.8rem' }} />
              <div>
                <span className="d-block text-xs font-semibold" style={{ color: s.color }}>
                  Acción sugerida
                </span>
                <span className="text-xs" style={{ color: s.color, opacity: 0.9 }}>
                  {expediente.sugerencia}
                </span>
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="row g-3 mb-4">
            <InfoField label="Fase actual" value={expediente.fase_label} icon="fas fa-flag" />
            <InfoField label="Responsable" value={expediente.responsable} icon="fas fa-user" />
            <InfoField label="Categoría" value={expediente.categoria} icon="fas fa-layer-group" />
            <InfoField label="Tipo de licencia" value={expediente.tipo_licencia || '—'} icon="fas fa-file-alt" />
            <InfoField label="Trámite" value={expediente.tramite || '—'} icon="fas fa-clipboard-list" />
            <InfoField label="Fecha radicación" value={expediente.fecha_radicacion || '—'} icon="fas fa-calendar" />
            <InfoField label="Fecha límite" value={expediente.fecha_limite || '—'} icon="fas fa-calendar-times" />
            <InfoField
              label="Días totales"
              value={`${expediente.dias_habiles_totales ?? '—'} hábiles desde radicación`}
              icon="fas fa-business-time"
            />
            {expediente.intervalo_notificacion_activo && (
              <InfoField
                label="Intervalo actual"
                value={`${labelNotificacion(expediente.tipo_notificacion_actual)} · ${expediente.dias_intervalo_notificacion ?? '—'} días`}
                icon="fas fa-bell"
              />
            )}
          </div>

          {/* Flags / Alertas */}
          {(expediente.esta_pausado || expediente.tiene_suspension || expediente.tiene_extension || expediente.es_desistido || expediente.intervalo_notificacion_activo) && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-uppercase text-muted d-block mb-2" style={{ letterSpacing: '0.06em' }}>
                Alertas
              </span>
              <div className="d-flex flex-wrap gap-2">
                {expediente.esta_pausado && (
                  <FlagBadge icon="fas fa-pause-circle" label="Pausado" bg="#dbeafe" color="#1e40af" />
                )}
                {expediente.intervalo_notificacion_activo && (
                  <FlagBadge
                    icon="fas fa-bell"
                    label={`Intervalo: ${labelNotificacion(expediente.tipo_notificacion_actual)}`}
                    bg="#e0f2fe"
                    color="#0c4a6e"
                  />
                )}
                {expediente.tiene_suspension && (
                  <FlagBadge
                    icon="fas fa-ban"
                    label={expediente.suspension_activa ? 'Suspensión activa' : 'Suspensión registrada'}
                    bg="#fef3c7"
                    color="#92400e"
                  />
                )}
                {expediente.tiene_extension && (
                  <FlagBadge
                    icon="fas fa-clock"
                    label={expediente.prorroga_activa ? 'Prórroga activa' : 'Prórroga registrada'}
                    bg="#e0e7ff"
                    color="#3730a3"
                  />
                )}
                {expediente.es_desistido && (
                  <FlagBadge
                    icon="fas fa-times-circle"
                    label={`Desistido: ${expediente.razon_desistimiento || '—'}`}
                    bg="#fee2e2" color="#991b1b"
                  />
                )}
              </div>
            </div>
          )}

          {/* Seguimiento de tiempo legal */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-uppercase text-muted d-block mb-2" style={{ letterSpacing: '0.06em' }}>
              Seguimiento de Tiempo Legal
            </span>
            <div
              className="rounded px-3 py-2"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="text-center" style={{ minWidth: 60 }}>
                  <span className="d-block text-lg font-bold" style={{ color: s.color }}>
                    {expediente.dias_habiles_usados}
                  </span>
                  <span className="text-xs text-muted-foreground">Usados</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="rounded-pill overflow-hidden" style={{ height: 6, backgroundColor: '#e2e8f0' }}>
                    <div
                      className="rounded-pill"
                      style={{
                        height: '100%',
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: s.barColor,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
                <div className="text-center" style={{ minWidth: 60 }}>
                  <span className="d-block text-lg font-bold text-slate-600">
                    {expediente.dias_habiles_limite}
                  </span>
                  <span className="text-xs text-muted-foreground">Límite</span>
                </div>
              </div>
              <div className="d-flex justify-content-between text-xs text-muted-foreground">
                <span>
                  <i className="fas fa-calendar-check me-1"></i>
                  Inicio: {expediente.fecha_radicacion || '—'}
                </span>
                <span>
                  <i className="fas fa-calendar-times me-1"></i>
                  Vence: {expediente.fecha_limite || '—'}
                </span>
              </div>
              {expediente.control_temporal_activo && (
                <div className="mt-2 text-xs">
                  <FlagBadge
                    icon="fas fa-shield-alt"
                    label={`${expediente.control_temporal_label} (desde ${expediente.control_temporal_fecha_inicio || '—'})`}
                    bg="#f0f9ff"
                    color="#0369a1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bitácora - últimos movimientos */}
          {Array.isArray(expediente.bitacora) && expediente.bitacora.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-uppercase text-muted d-block mb-2" style={{ letterSpacing: '0.06em' }}>
                Últimos Movimientos
              </span>
              <div
                className="rounded"
                style={{ border: '1px solid #e2e8f0', overflow: 'hidden' }}
              >
                {expediente.bitacora.map((entry, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-start gap-2 px-3 py-2"
                    style={{
                      borderBottom: i < expediente.bitacora.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: i % 2 === 0 ? '#fff' : '#fafbfc',
                    }}
                  >
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: 16, paddingTop: 2 }}>
                      <div
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: i === 0 ? s.barColor : '#cbd5e1',
                        }}
                      />
                      {i < expediente.bitacora.length - 1 && (
                        <div style={{ width: 1, flex: 1, backgroundColor: '#e2e8f0', marginTop: 2 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-xs font-semibold text-slate-700">
                          Estado {entry.state}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.date || '—'}
                        </span>
                      </div>
                      {entry.desc && (
                        <span
                          className="text-xs text-muted-foreground d-block"
                          style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          title={entry.desc}
                        >
                          {entry.desc}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata técnica */}
          <div
            className="rounded px-3 py-2"
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <span className="text-xs font-semibold text-uppercase text-muted d-block mb-1" style={{ letterSpacing: '0.06em' }}>
              Información técnica
            </span>
            <div className="d-flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>ID: {expediente.id}</span>
              <span>State: {expediente.state_raw}</span>
              <span>Clocks: {expediente.clocks_count}</span>
              {expediente.m_lic && <span>Modalidad: {expediente.m_lic}</span>}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div
          className="px-4 py-3 d-flex gap-2 justify-content-end"
          style={{ borderTop: '1px solid #e2e8f0', flexShrink: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFlowModal(true)}
          >
            <i className="fas fa-project-diagram me-1"></i>
            Ver flujo
          </Button>
          {onOpenWorkspace && (
            <Button size="sm" onClick={() => onOpenWorkspace(expediente)}>
              <i className="fas fa-expand-alt me-1"></i>
              Abrir gestión completa
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* ── Modal flujo del expediente ────────────────── */}
      <ProjectFlowModal
        show={showFlowModal}
        onClose={() => setShowFlowModal(false)}
        phases={derivePhasesFromExpediente(expediente)}
        expediente={expediente}
      />

      {/* Keyframe animation (injected once) */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function InfoField({ label, value, icon }) {
  return (
    <div className="col-6">
      <div className="d-flex align-items-start gap-2">
        <i className={`${icon} text-slate-400 mt-1`} style={{ fontSize: '0.75rem', width: 14 }} />
        <div>
          <span className="text-xs text-muted-foreground d-block">{label}</span>
          <span className="font-medium text-sm">{value}</span>
        </div>
      </div>
    </div>
  );
}

function FlagBadge({ icon, label, bg, color }) {
  return (
    <span
      className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      <i className={icon} style={{ fontSize: '0.65rem' }} />
      {label}
    </span>
  );
}

function labelNotificacion(value) {
  if (value === 'aviso') return 'Por aviso';
  if (value === 'personal') return 'Personal';
  if (value === 'comunicar') return 'Comunicación';
  return 'No definida';
}
