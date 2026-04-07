import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Status visual config ─────────────────────────────────────────────────────
const STATUS_META = {
  OPTIMO:    { label: 'Óptimo',    bg: '#dcfce7', color: '#166534', barColor: '#22c55e' },
  PROMEDIO:  { label: 'Promedio',  bg: '#fef9c3', color: '#854d0e', barColor: '#eab308' },
  EN_RIESGO: { label: 'En Riesgo', bg: '#fee2e2', color: '#991b1b', barColor: '#ef4444' },
  VENCIDO:   { label: 'Vencido',   bg: '#fecaca', color: '#7f1d1d', barColor: '#dc2626' },
};

// ── Componente principal ─────────────────────────────────────────────────────
export function FunExpedienteDetail({ expediente, onClose, onOpenWorkspace }) {
  if (!expediente) return null;

  const s = STATUS_META[expediente.status] || STATUS_META.PROMEDIO;
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
                style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.color}22` }}
                className="text-xs font-semibold px-2 py-1"
              >
                {s.label}
              </Badge>
              <span className="text-sm text-muted-foreground tabular-nums">
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

          {/* Flags */}
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
                    label={`Intervalo de notificación: ${labelNotificacion(expediente.tipo_notificacion_actual)}`}
                    bg="#e0f2fe"
                    color="#0c4a6e"
                  />
                )}
                {expediente.tiene_suspension && (
                  <FlagBadge
                    icon="fas fa-ban"
                    label={expediente.suspension_activa ? 'Suspensión activa' : 'Con suspensión registrada'}
                    bg="#fef3c7"
                    color="#92400e"
                  />
                )}
                {expediente.tiene_extension && (
                  <FlagBadge
                    icon="fas fa-clock"
                    label={expediente.prorroga_activa ? 'Prórroga activa' : 'Con prórroga registrada'}
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

          {/* Metadata */}
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
