import React from 'react';
import { Icon } from '@/components/icon';

const SIMPLE_KPIS = [
  {
    key: 'radicacion',
    getValue: (kpis) => kpis?.por_fase?.['Radicación LDF'] || 0,
    label: 'Radicación',
    icon: 'inbox',
    colorClass: 'text-secondary',
    description: 'En Radicación',
    filter: { phase: 'RAD' },
  },
  {
    key: 'estudio',
    getValue: (kpis) => kpis?.en_estudio_revision || 0,
    label: 'Estudio',
    icon: 'search',
    colorClass: 'text-primary',
    description: 'Estudio y Observ.',
    filter: { phase: 'EST,NOT_OBS' },
  },
  {
    key: 'correcciones',
    getValue: (kpis) => kpis?.en_correcciones || 0,
    label: 'Correcciones',
    icon: 'pencil-alt',
    colorClass: 'text-warning',
    description: 'Esperando respuesta',
    filter: { phase: 'CORR' },
  },
  {
    key: 'viabilidad',
    getValue: (kpis) => kpis?.en_estudio_viabilidad || 0,
    label: 'Viabilidad',
    icon: 'check-double',
    colorClass: 'text-info',
    description: 'Revisión y Viabilidad',
    filter: { phase: 'VIA,NOT_VIA' },
  },
  {
    key: 'pagos',
    getValue: (kpis) => kpis?.por_fase?.['Liquidación y Pagos'] || 0,
    label: 'Pagos',
    icon: 'file-invoice-dollar',
    colorClass: 'text-success',
    description: 'Liquidación y Pagos',
    filter: { phase: 'PAG' },
  },
  {
    key: 'resolucion',
    getValue: (kpis) => (kpis?.por_fase?.['Generación de Resolución'] || 0) + (kpis?.por_fase?.['Notificación Resolución'] || 0) + (kpis?.por_fase?.['Ejecutoria y Recurso'] || 0),
    label: 'Resolución',
    icon: 'gavel',
    colorClass: 'text-primary',
    description: 'Generación y Notif.',
    filter: { phase: 'RES,NOT_RES,EJEC' },
  },
  {
    key: 'entrega',
    getValue: (kpis) => kpis?.por_fase?.['Entrega de Licencia'] || 0,
    label: 'Entrega',
    icon: 'box-open',
    colorClass: 'text-success',
    description: 'Entrega de Licencia',
    filter: { phase: 'ENT' },
  },
  {
    key: 'vecinos_pending',
    getValue: (kpis) => (kpis?.vecinosPending ?? kpis?.vecinos_pendientes ?? 0),
    label: 'Vecinos pendientes',
    icon: 'users',
    colorClass: 'text-warning',
    description: 'Dimensión transversal, no fase',
    filter: { vecinos: 'pending' },
  },
  {
    key: 'valla',
    getValue: (kpis) => kpis?.vallaPendientes || 0,
    label: 'Valla publicitaria',
    icon: 'sign',
    colorClass: 'text-danger',
    description: 'Pendiente de instalación',
    filter: { valla: 'pending' },
  },
  {
    key: 'marcados',
    getValue: (kpis) => kpis?.marcados_total || 0,
    label: 'Marcados',
    icon: 'bookmark',
    colorClass: 'text-primary',
    description: 'Marcados total',
    filter: { bookmarked: 'any' },
  }
];

export function FunDashboardKPIs({ kpis, loading, onFilterChange, activeFilterKey }) {
  return (
    <div
      className="row g-2 my-3"
      data-testid="dashboard-kpis"
    >
      {SIMPLE_KPIS.map(cfg => (
        <div className="col-6 col-md-3 col-lg-2" key={cfg.key}>
          <SimpleKPICard
            cfg={cfg}
            value={cfg.getValue(kpis)}
            loading={loading}
            isActive={activeFilterKey === cfg.key}
            onFilterChange={onFilterChange}
          />
        </div>
      ))}
      <div className="col-12 col-md-6 col-lg-4">
        <SemaforoKPICard 
          kpis={kpis} 
          loading={loading} 
          activeFilterKey={activeFilterKey} 
          onFilterChange={onFilterChange} 
        />
      </div>
    </div>
  );
}

function SimpleKPICard({ cfg, value, loading, isActive, onFilterChange }) {
  const handleClick = () => onFilterChange({ ...cfg.filter, key: cfg.key });
  return (
    <div
      className={`card h-100 shadow-sm transition-all select-none ${isActive ? 'border-primary border-2 bg-light' : 'border-light'}`}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body p-2 p-md-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="card-title mb-0 text-muted fw-bold text-truncate" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }} title={cfg.label}>
            {cfg.label}
          </h6>
          <Icon name={cfg.icon} size={14} className={cfg.colorClass} aria-hidden="true" />
        </div>
        <h3 className={`fw-bold mb-1 ${cfg.colorClass}`}>
          {loading ? <span className="text-muted fs-5">...</span> : (value ?? 0)}
        </h3>
        <p className="text-muted small mb-0 mt-auto text-truncate" style={{ fontSize: '0.65rem' }} title={cfg.description}>
          {cfg.description}
        </p>
      </div>
    </div>
  );
}

function SemaforoKPICard({ kpis, loading, activeFilterKey, onFilterChange }) {
  const semaforo = kpis?.semaforo_curaduria || kpis?.semaforo || {};
  const verde = semaforo.verde ?? 0;
  const amarillo = semaforo.amarillo ?? 0;
  const rojo = semaforo.rojo ?? 0;
  const total = verde + amarillo + rojo;

  const isVerdeActive = activeFilterKey === 'semaforo_verde';
  const isAmarilloActive = activeFilterKey === 'semaforo_amarillo';
  const isRojoActive = activeFilterKey === 'semaforo_rojo';
  const isTotalActive = activeFilterKey === 'semaforo_total';
  const isAnyActive = isVerdeActive || isAmarilloActive || isRojoActive || isTotalActive;

  return (
    <div
      className={`card h-100 shadow-sm transition-all select-none ${isAnyActive ? 'border-secondary border-2 bg-light' : 'border-light'}`}
    >
      <div className="card-body p-2 p-md-3 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="card-title mb-0 text-muted fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Semáforo
          </h6>
          <Icon name="traffic-light" size={14} className="text-secondary" aria-hidden="true" />
        </div>
        <p className="mb-2 text-muted" style={{ fontSize: '0.62rem', lineHeight: 1.2 }}>
          Alarmas visibles de Curaduría
        </p>
        
        <div className="d-flex w-100 gap-1 mt-auto flex-nowrap" style={{ overflowX: 'auto' }}>
          <SemaforoPill
            label="Verde"
            value={verde}
            loading={loading}
            isActive={isVerdeActive}
            color="hsl(var(--accent))"
            bg="hsl(var(--accent) / 0.12)"
            onClick={() => onFilterChange({ alarmTraffic: 'green', key: 'semaforo_verde' })}
          />
          <SemaforoPill
            label="Amarillo"
            value={amarillo}
            loading={loading}
            isActive={isAmarilloActive}
            color="hsl(var(--warning))"
            bg="hsl(var(--warning) / 0.14)"
            onClick={() => onFilterChange({ alarmTraffic: 'yellow', alarmActor: 'CUR', alarmAction: 'show_alarm', alarmLevel: '1', soloConAlarmas: true, key: 'semaforo_amarillo' })}
          />
          <SemaforoPill
            label="Rojo"
            value={rojo}
            loading={loading}
            isActive={isRojoActive}
            color="hsl(var(--destructive))"
            bg="hsl(var(--destructive) / 0.12)"
            onClick={() => onFilterChange({ alarmTraffic: 'red', alarmActor: 'CUR', alarmAction: 'show_alarm', alarmLevel: '2,3', soloConAlarmas: true, key: 'semaforo_rojo' })}
          />
          <SemaforoPill
            label="Total"
            value={total}
            loading={loading}
            isActive={isTotalActive}
            color="hsl(var(--muted-foreground))"
            bg="hsl(var(--muted))"
            onClick={() => onFilterChange({ alarmTraffic: null, key: 'semaforo_total' })}
          />
        </div>
      </div>
    </div>
  );
}

function SemaforoPill({ label, value, loading, isActive, color, bg, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`flex-fill rounded text-center py-1 transition-all ${isActive ? 'shadow-sm' : ''}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${isActive ? color : 'hsl(var(--border))'}`,
        cursor: 'pointer',
        minWidth: '45px'
      }}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <span className="d-block fw-bold" style={{ color, fontSize: '0.85rem' }}>
        {loading ? '...' : value}
      </span>
      <span className="d-block text-truncate px-1" style={{ color, fontSize: '0.6rem' }} title={label}>
        {label}
      </span>
    </div>
  );
}
