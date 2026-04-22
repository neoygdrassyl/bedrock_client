import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import USER_SERVICE from '../../../../services/users.service';
import { mergeFilters, hasActiveFilters } from '../utils/filters';

const PHASES = [
  { id: 'RAD', label: 'Radicación LDF' },
  { id: 'EST', label: 'Estudio y Observaciones' },
  { id: 'NOT_OBS', label: 'Notificación Observaciones' },
  { id: 'CORR', label: 'Correcciones' },
  { id: 'VIA', label: 'Revisión y Viabilidad' },
  { id: 'NOT_VIA', label: 'Notificación Viabilidad' },
  { id: 'PAG', label: 'Liquidación y Pagos' },
  { id: 'RES', label: 'Generación de Resolución' },
  { id: 'NOT_RES', label: 'Notificación Resolución' },
  { id: 'EJEC', label: 'Ejecutoria y Recurso' },
  { id: 'ENT', label: 'Entrega de Licencia' },
  { id: 'DESIST', label: 'Desistimiento' },
];

const SUBFILTERS_BY_PHASE = {
  RAD: [
    { id: 'sin_valla', label: 'Sin valla' },
    { id: 'pendiente_vecinos', label: 'Pendiente vecinos' },
    { id: 'radicacion_incompleta', label: 'Radicación incompleta' },
    { id: 'sin_pago', label: 'Sin pago a expensas' }
  ],
  EST: [
    { id: 'sin_asignacion', label: 'Sin asignación' },
    { id: 'pendiente_subsanar', label: 'Pendiente por subsanar' }
  ],
  CORR: [
    { id: 'pendiente_subsanar', label: 'Pendiente por subsanar' },
    { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' }
  ],
  PAG: [
    { id: 'sin_pago', label: 'Sin pago' },
    { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' }
  ]
};

export function FilterPanel({ filters, setFilters, clearAllFilters, setKpiActiveFilterKey }) {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    USER_SERVICE.getAll().then((res) => {
      setUsers(res.data || []);
    }).catch(err => console.error("Error fetching users for filter:", err));
  }, []);

  // Multi-select for phases
  const selectedPhases = useMemo(() => {
    if (!filters.phase) return [];
    return filters.phase.split(',').filter(Boolean);
  }, [filters.phase]);

  const handleTogglePhase = useCallback((phaseId) => {
    setKpiActiveFilterKey(null);
    setFilters(f => {
      const current = f.phase ? f.phase.split(',').filter(Boolean) : [];
      let next;
      if (current.includes(phaseId)) {
        next = current.filter(id => id !== phaseId);
      } else {
        next = [...current, phaseId];
      }
      return mergeFilters(f, { 
        phase: next.length > 0 ? next.join(',') : null,
        fase: null, // clear old 'fase' to prioritize 'phase'
        desistido: null,
        causal: null
      });
    });
  }, [setFilters, setKpiActiveFilterKey]);

  // Derived subfilters based on selected phases
  const availableSubfilters = useMemo(() => {
    const map = new Map();
    // Add contextual ones
    selectedPhases.forEach(ph => {
      if (SUBFILTERS_BY_PHASE[ph]) {
        SUBFILTERS_BY_PHASE[ph].forEach(sub => {
          if (!map.has(sub.id)) map.set(sub.id, sub);
        });
      }
    });
    // Add generic ones
    if (!map.has('riesgo_desistimiento')) {
       map.set('riesgo_desistimiento', { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' });
    }
    return Array.from(map.values());
  }, [selectedPhases]);

  const selectedSubfilters = useMemo(() => {
    if (!filters.subfiltro) return [];
    return filters.subfiltro.split(',').filter(Boolean);
  }, [filters.subfiltro]);

  const handleToggleSubfilter = useCallback((subId) => {
    setFilters(f => {
      const current = f.subfiltro ? f.subfiltro.split(',').filter(Boolean) : [];
      let next;
      if (current.includes(subId)) {
        next = current.filter(id => id !== subId);
      } else {
        next = [...current, subId];
      }
      return mergeFilters(f, { subfiltro: next.length > 0 ? next.join(',') : null });
    });
  }, [setFilters]);

  // Rango Temporal handler
  const handleDateChange = (field, value) => {
    setFilters(f => mergeFilters(f, { [field]: value || null }));
  };

  return (
    <div className="rounded border px-3 py-3 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-sm font-semibold text-muted-foreground">
          <Icon name="filter" size={16} className="me-1" /> Panel de Filtros Multi-Capa
        </span>
        {hasActiveFilters(filters) && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} data-testid="filter-clear">
            <Icon name="times" size={16} className="me-1" /> Limpiar todos
          </Button>
        )}
      </div>

      {/* Capa 1: Fases (Multi-select toggles) */}
      <div className="mb-3">
        <span className="text-xs text-muted-foreground fw-bold d-block mb-1">Capa 1: Fases procesales</span>
        <div className="d-flex flex-wrap gap-2">
          {PHASES.map(ph => {
            const isActive = selectedPhases.includes(ph.id);
            return (
              <button
                key={ph.id}
                type="button"
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: '20px', fontSize: '0.75rem' }}
                onClick={() => handleTogglePhase(ph.id)}
              >
                {ph.label} {isActive && <Icon name="check" size={10} className="ms-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Capa 2: Subfiltros Contextuales */}
      {(selectedPhases.length > 0 || availableSubfilters.length > 0) && (
        <div className="mb-3 border-top pt-2">
          <span className="text-xs text-muted-foreground fw-bold d-block mb-1">Capa 2: Subfiltros contextuales (OR)</span>
          <div className="d-flex flex-wrap gap-2">
            {availableSubfilters.map(sub => {
              const isActive = selectedSubfilters.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  className={`btn btn-sm ${isActive ? 'btn-info text-dark fw-bold' : 'btn-outline-info'}`}
                  style={{ borderRadius: '20px', fontSize: '0.75rem' }}
                  onClick={() => handleToggleSubfilter(sub.id)}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Capa 3 & 4: Profesionales y Fechas */}
      <div className="row g-2 border-top pt-2">
        <div className="col-12 col-md-6 col-lg-3">
          <span className="text-xs text-muted-foreground fw-bold d-block mb-1">Capa 3: Profesional</span>
          <div className="d-flex gap-2 align-items-center">
            <Select
              value={filters.profesional || '__all__'}
              onValueChange={(val) => setFilters((f) => mergeFilters(f, { profesional: val === '__all__' ? null : val }))}
            >
              <SelectTrigger className="w-100">
                <SelectValue placeholder="Todos los profesionales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los profesionales</SelectItem>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name} {u.surname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="d-flex align-items-center gap-1 text-sm text-nowrap mb-0" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="form-check-input mt-0"
                checked={!!filters.asignado_a_mi}
                onChange={(e) => setFilters((f) => mergeFilters(f, { asignado_a_mi: e.target.checked }))}
              />
              Solo Yo
            </label>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <span className="text-xs text-muted-foreground fw-bold d-block mb-1">Capa 4: Rango temporal</span>
          <div className="d-flex gap-2 align-items-center">
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={filters.desde || ''}
              onChange={(e) => handleDateChange('desde', e.target.value)}
              title="Desde"
            />
            <span className="text-muted">-</span>
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={filters.hasta || ''}
              onChange={(e) => handleDateChange('hasta', e.target.value)}
              title="Hasta"
            />
          </div>
        </div>

        {/* Capa adicional: Toggles */}
        <div className="col-12 col-lg-5">
          <span className="text-xs text-muted-foreground fw-bold d-block mb-1">Capa Adicional: Estado general</span>
          <div className="d-flex flex-wrap gap-3 align-items-center h-100 pb-1">
            <Select
              value={filters.status || '__all__'}
              onValueChange={(val) => {
                setFilters((f) => mergeFilters(f, { status: val === '__all__' ? null : val }));
                setKpiActiveFilterKey(null);
              }}
            >
              <SelectTrigger style={{ width: '140px', height: '31px', fontSize: '0.8rem' }}>
                <SelectValue placeholder="Estado legal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Estado legal: Todos</SelectItem>
                <SelectItem value="EN_TERMINO">En Término</SelectItem>
                <SelectItem value="PRONTO_A_VENCER">Pronto a Vencer</SelectItem>
                <SelectItem value="ALERTA_VENCIMIENTO">Alerta Vencimiento</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.bookmarked === true ? 'only' : '__all__'}
              onValueChange={(val) => setFilters((f) => mergeFilters(f, { bookmarked: val === 'only' ? true : null }))}
            >
              <SelectTrigger style={{ width: '130px', height: '31px', fontSize: '0.8rem' }}>
                <SelectValue placeholder="Marcados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Marcados: Todos</SelectItem>
                <SelectItem value="only">Solo marcados</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.vecinosState || '__all__'}
              onValueChange={(val) => setFilters((f) => mergeFilters(f, { vecinosState: val === '__all__' ? null : val }))}
            >
              <SelectTrigger style={{ width: '130px', height: '31px', fontSize: '0.8rem' }}>
                <SelectValue placeholder="Vecinos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Vecinos: Todos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="respondida">Respondida</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.vallaState || '__all__'}
              onValueChange={(val) => setFilters((f) => mergeFilters(f, { vallaState: val === '__all__' ? null : val }))}
            >
              <SelectTrigger style={{ width: '120px', height: '31px', fontSize: '0.8rem' }}>
                <SelectValue placeholder="Valla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Valla: Todas</SelectItem>
                <SelectItem value="sin_valla">Sin valla</SelectItem>
                <SelectItem value="con_valla">Con valla</SelectItem>
              </SelectContent>
            </Select>

            <label className="d-flex align-items-center gap-1 text-sm text-muted-foreground" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="form-check-input mt-0"
                checked={!!filters.incluirCerrados}
                onChange={(e) => setFilters((f) => mergeFilters(f, { incluirCerrados: e.target.checked }))}
              />
              Cerrados
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
