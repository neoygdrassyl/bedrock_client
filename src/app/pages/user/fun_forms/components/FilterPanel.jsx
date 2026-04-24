import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    { id: 'sin_pago', label: 'Sin pago a expensas' },
  ],
  EST: [
    { id: 'sin_asignacion', label: 'Sin asignación' },
    { id: 'pendiente_subsanar', label: 'Pendiente por subsanar' },
  ],
  CORR: [
    { id: 'pendiente_subsanar', label: 'Pendiente por subsanar' },
    { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' },
  ],
  PAG: [
    { id: 'sin_pago', label: 'Sin pago' },
    { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' },
  ],
};

const STATUS_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: 'EN_TERMINO', label: 'En término' },
  { value: 'PRONTO_A_VENCER', label: 'Pronto a vencer' },
  { value: 'ALERTA_VENCIMIENTO', label: 'Alerta vencimiento' },
  { value: 'VENCIDO', label: 'Vencido' },
];

const BOOKMARK_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: 'personal', label: 'Para mí' },
  { value: 'team', label: 'Equipo' },
  { value: 'any', label: 'Mí o equipo' },
];

const NEIGHBOR_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'notified', label: 'Notificados' },
  { value: 'complete', label: 'Completos' },
];

const VALLA_OPTIONS = [
  { value: '__all__', label: 'Todas' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'installed', label: 'Instalada' },
  { value: 'expired', label: 'Vencida' },
];

const ALARM_LEVEL_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: '1', label: 'Nivel 1' },
  { value: '2', label: 'Nivel 2' },
  { value: '3', label: 'Nivel 3' },
];

const ALARM_ACTOR_OPTIONS = [
  { value: '__all__', label: 'Todos' },
  { value: 'CUR', label: 'Curaduría' },
  { value: 'SOL', label: 'Solicitante' },
  { value: 'PROF', label: 'Profesional' },
  { value: 'VEC', label: 'Vecino' },
];

const ALARM_ACTION_OPTIONS = [
  { value: '__all__', label: 'Todas' },
  { value: 'show_alarm', label: 'Mostrar alarma' },
  { value: 'send_email', label: 'Enviar correo' },
  { value: 'start_suspension_prorroga', label: 'Suspensión/prórroga' },
];

const PHASE_LABEL_BY_ID = PHASES.reduce((acc, phase) => ({ ...acc, [phase.id]: phase.label }), {});

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label;
}

function SelectFilter({ label, value, onValueChange, options, placeholder, testId, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <Select value={value || '__all__'} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 min-w-0 rounded-lg border-border bg-background/80 px-2 text-xs" data-testid={testId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterChip({ active, children, onClick, icon, className = '', ...props }) {
  return (
    <button
      type="button"
      className={[
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-primary/40 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
          : 'border-border bg-background/80 text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-pressed={active}
      {...props}
    >
      {icon && <Icon name={icon} size={13} />}
      <span className="whitespace-nowrap">{children}</span>
      {active && <Icon name="check" size={12} />}
    </button>
  );
}

function CompactSwitch({ checked, onCheckedChange, label, icon, testId }) {
  return (
    <label className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background/80 px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
      {icon && <Icon name={icon} size={14} className="text-muted-foreground" />}
      <Switch checked={checked} onCheckedChange={onCheckedChange} data-testid={testId} />
      <span className="whitespace-nowrap">{label}</span>
    </label>
  );
}

function SummaryBadge({ children }) {
  return (
    <Badge variant="outline" className="border-border bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </Badge>
  );
}

export function FilterPanel({ filters, setFilters, clearAllFilters, setKpiActiveFilterKey }) {
  const [users, setUsers] = useState([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    USER_SERVICE.getAll().then((res) => {
      setUsers(res.data || []);
    }).catch(err => console.error("Error fetching users for filter:", err));
  }, []);

  const selectedPhases = useMemo(() => {
    if (!filters.phase) return [];
    return filters.phase.split(',').filter(Boolean);
  }, [filters.phase]);

  const selectedPhaseLabels = useMemo(
    () => selectedPhases.map((phaseId) => PHASE_LABEL_BY_ID[phaseId] || phaseId),
    [selectedPhases]
  );

  const handleTogglePhase = useCallback((phaseId) => {
    setKpiActiveFilterKey?.(null);
    setFilters((f) => {
      const current = f.phase ? f.phase.split(',').filter(Boolean) : [];
      let next;
      if (current.includes(phaseId)) {
        next = current.filter((id) => id !== phaseId);
      } else {
        next = [...current, phaseId];
      }
      return mergeFilters(f, {
        phase: next.length > 0 ? next.join(',') : null,
        fase: null,
        desistido: null,
        causal: null,
      });
    });
  }, [setFilters, setKpiActiveFilterKey]);

  const availableSubfilters = useMemo(() => {
    const map = new Map();
    selectedPhases.forEach((phaseId) => {
      if (SUBFILTERS_BY_PHASE[phaseId]) {
        SUBFILTERS_BY_PHASE[phaseId].forEach((subfilter) => {
          if (!map.has(subfilter.id)) map.set(subfilter.id, subfilter);
        });
      }
    });
    if (!map.has('riesgo_desistimiento')) {
      map.set('riesgo_desistimiento', { id: 'riesgo_desistimiento', label: 'Riesgo de desistimiento' });
    }
    return Array.from(map.values());
  }, [selectedPhases]);

  const selectedSubfilters = useMemo(() => {
    if (!filters.subfiltro) return [];
    return filters.subfiltro.split(',').filter(Boolean);
  }, [filters.subfiltro]);

  const selectedSubfilterLabels = useMemo(
    () => selectedSubfilters.map((subId) => availableSubfilters.find((subfilter) => subfilter.id === subId)?.label || subId),
    [availableSubfilters, selectedSubfilters]
  );

  const handleToggleSubfilter = useCallback((subId) => {
    setKpiActiveFilterKey?.(null);
    setFilters((f) => {
      const current = f.subfiltro ? f.subfiltro.split(',').filter(Boolean) : [];
      let next;
      if (current.includes(subId)) {
        next = current.filter((id) => id !== subId);
      } else {
        next = [...current, subId];
      }
      return mergeFilters(f, { subfiltro: next.length > 0 ? next.join(',') : null });
    });
  }, [setFilters, setKpiActiveFilterKey]);

  const handleDateChange = (field, value) => {
    setKpiActiveFilterKey?.(null);
    setFilters((f) => mergeFilters(f, { [field]: value || null }));
  };

  const userOptions = useMemo(() => [
    { value: '__all__', label: 'Todos' },
    ...users.map((user) => ({
      value: user.id.toString(),
      label: `${user.name} ${user.surname}`.trim(),
    })),
  ], [users]);

  const activeFilterCount = useMemo(() => {
    const keys = [
      'status', 'profesional', 'desde', 'hasta', 'bookmarked', 'alarmLevel', 'alarmActor', 'alarmAction', 'search',
    ];
    const scalarCount = keys.filter((key) => {
      const value = filters?.[key];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return scalarCount
      + selectedPhases.length
      + selectedSubfilters.length
      + (filters.vecinos || filters.vecinosState ? 1 : 0)
      + (filters.valla || filters.vallaState ? 1 : 0)
      + (filters.asignado_a_mi ? 1 : 0)
      + (filters.incluirCerrados ? 1 : 0)
      + (filters.soloConAlarmas ? 1 : 0);
  }, [filters, selectedPhases.length, selectedSubfilters.length]);

  const hasAdvancedFilters = Boolean(
    filters.vecinos || filters.vecinosState || filters.valla || filters.vallaState
    || filters.alarmLevel || filters.alarmActor || filters.alarmAction
    || filters.incluirCerrados || filters.soloConAlarmas
  );

  const summaryItems = useMemo(() => {
    const items = [];
    if (filters.search) items.push(`Búsqueda: ${filters.search}`);
    if (filters.status) items.push(`Estado: ${getOptionLabel(STATUS_OPTIONS, filters.status) || filters.status}`);
    if (selectedPhaseLabels.length) items.push(`${selectedPhaseLabels.length} fase${selectedPhaseLabels.length === 1 ? '' : 's'}`);
    if (selectedSubfilterLabels.length) items.push(`${selectedSubfilterLabels.length} señal${selectedSubfilterLabels.length === 1 ? '' : 'es'}`);
    if (filters.profesional) items.push(`Profesional: ${getOptionLabel(userOptions, filters.profesional) || 'Seleccionado'}`);
    if (filters.asignado_a_mi) items.push('Solo mis asignados');
    if (filters.desde || filters.hasta) items.push(`Rango: ${filters.desde || 'inicio'} → ${filters.hasta || 'hoy'}`);
    if (filters.bookmarked) items.push(`Marcados: ${getOptionLabel(BOOKMARK_OPTIONS, filters.bookmarked) || filters.bookmarked}`);
    if (filters.vecinos || filters.vecinosState) items.push(`Vecinos: ${getOptionLabel(NEIGHBOR_OPTIONS, filters.vecinos || filters.vecinosState) || filters.vecinos || filters.vecinosState}`);
    if (filters.valla || filters.vallaState) items.push(`Valla: ${getOptionLabel(VALLA_OPTIONS, filters.valla || filters.vallaState) || filters.valla || filters.vallaState}`);
    if (filters.alarmLevel) items.push(`Alarma: ${getOptionLabel(ALARM_LEVEL_OPTIONS, filters.alarmLevel) || filters.alarmLevel}`);
    if (filters.alarmActor) items.push(`Actor: ${getOptionLabel(ALARM_ACTOR_OPTIONS, filters.alarmActor) || filters.alarmActor}`);
    if (filters.alarmAction) items.push(`Acción: ${getOptionLabel(ALARM_ACTION_OPTIONS, filters.alarmAction) || filters.alarmAction}`);
    if (filters.soloConAlarmas) items.push('Con alarmas activas');
    if (filters.incluirCerrados) items.push('Incluye cerrados');
    return items;
  }, [filters, selectedPhaseLabels.length, selectedSubfilterLabels.length, userOptions]);

  const showAdvanced = advancedOpen;

  return (
    <section className="mb-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm" data-testid="filter-panel">
      <div className="flex flex-col gap-2 border-b border-border/70 bg-muted/30 px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="filter" size={16} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mb-0 text-sm font-semibold text-foreground">Filtros operativos</h2>
              <Badge variant="outline" className="border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {activeFilterCount > 0 ? `${activeFilterCount} activos` : 'Sin filtros'}
              </Badge>
            </div>
            <p className="mb-0 text-xs text-muted-foreground">
              Vista compacta para priorizar fase, responsable, estado legal y alertas sin dispersar el dashboard.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            <Icon name="sliders-h" size={14} />
            {showAdvanced ? 'Ocultar avanzados' : hasAdvancedFilters ? 'Ajustar avanzados' : 'Más filtros'}
          </Button>
          {hasActiveFilters(filters) && (
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" onClick={clearAllFilters} data-testid="filter-clear">
              <Icon name="times" size={14} />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 px-3 py-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
          <SelectFilter
            label="Estado"
            value={filters.status || '__all__'}
            placeholder="Estado legal"
            options={STATUS_OPTIONS}
            onValueChange={(val) => {
              setFilters((f) => mergeFilters(f, { status: val === '__all__' ? null : val }));
              setKpiActiveFilterKey?.(null);
            }}
          />

          <SelectFilter
            label="Profesional"
            value={filters.profesional || '__all__'}
            placeholder="Todos los profesionales"
            options={userOptions}
            className="xl:col-span-2"
            onValueChange={(val) => {
              setFilters((f) => mergeFilters(f, { profesional: val === '__all__' ? null : val }));
              setKpiActiveFilterKey?.(null);
            }}
          />

          <SelectFilter
            label="Marcados"
            value={filters.bookmarked || '__all__'}
            placeholder="Marcados"
            options={BOOKMARK_OPTIONS}
            onValueChange={(val) => {
              setFilters((f) => mergeFilters(f, { bookmarked: val === '__all__' ? null : val }));
              setKpiActiveFilterKey?.(null);
            }}
          />

          <div className="min-w-0 xl:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Rango temporal
            </span>
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                className="h-8 min-w-0 flex-1 rounded-lg border-border bg-background/80 px-2 text-xs"
                value={filters.desde || ''}
                onChange={(event) => handleDateChange('desde', event.target.value)}
                title="Desde"
                aria-label="Fecha desde"
              />
              <span className="text-xs text-muted-foreground">—</span>
              <Input
                type="date"
                className="h-8 min-w-0 flex-1 rounded-lg border-border bg-background/80 px-2 text-xs"
                value={filters.hasta || ''}
                onChange={(event) => handleDateChange('hasta', event.target.value)}
                title="Hasta"
                aria-label="Fecha hasta"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CompactSwitch
            checked={!!filters.asignado_a_mi}
            onCheckedChange={(checked) => {
              setFilters((f) => mergeFilters(f, { asignado_a_mi: checked }));
              setKpiActiveFilterKey?.(null);
            }}
            label="Solo mis asignados"
            icon="user-check"
          />
          <CompactSwitch
            checked={!!filters.soloConAlarmas}
            onCheckedChange={(checked) => {
              setFilters((f) => mergeFilters(f, { soloConAlarmas: checked }));
              setKpiActiveFilterKey?.(null);
            }}
            label="Con alarmas"
            icon="bell-on"
            testId="filter-solo-con-alarmas"
          />
          <CompactSwitch
            checked={!!filters.incluirCerrados}
            onCheckedChange={(checked) => {
              setFilters((f) => mergeFilters(f, { incluirCerrados: checked }));
              setKpiActiveFilterKey?.(null);
            }}
            label="Incluir cerrados"
            icon="archive"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="min-w-0 rounded-lg border border-border bg-background/60 p-2 lg:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Fases procesales
              </span>
              <span className="text-[11px] text-muted-foreground">{selectedPhases.length}/{PHASES.length}</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {PHASES.map((phase) => (
                <FilterChip
                  key={phase.id}
                  active={selectedPhases.includes(phase.id)}
                  onClick={() => handleTogglePhase(phase.id)}
                >
                  {phase.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-border bg-background/60 p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Señales contextuales
              </span>
              <span className="text-[11px] text-muted-foreground">OR</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {availableSubfilters.map((subfilter) => (
                <FilterChip
                  key={subfilter.id}
                  active={selectedSubfilters.includes(subfilter.id)}
                  onClick={() => handleToggleSubfilter(subfilter.id)}
                  icon={subfilter.id === 'riesgo_desistimiento' ? 'exclamation-triangle' : undefined}
                >
                  {subfilter.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {summaryItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-2" aria-label="Filtros activos">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Activos</span>
            {summaryItems.map((item) => (
              <SummaryBadge key={item}>{item}</SummaryBadge>
            ))}
          </div>
        )}

        {showAdvanced && (
          <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-muted/20 p-2 md:grid-cols-2 xl:grid-cols-5">
            <SelectFilter
              label="Vecinos"
              value={filters.vecinos || filters.vecinosState || '__all__'}
              placeholder="Vecinos"
              options={NEIGHBOR_OPTIONS}
              onValueChange={(val) => {
                setFilters((f) => mergeFilters(f, {
                  vecinos: val === '__all__' ? null : val,
                  vecinosState: val === '__all__' ? null : val,
                }));
                setKpiActiveFilterKey?.(null);
              }}
            />

            <SelectFilter
              label="Valla"
              value={filters.valla || filters.vallaState || '__all__'}
              placeholder="Valla publicitaria"
              options={VALLA_OPTIONS}
              onValueChange={(val) => {
                const nextValue = val === '__all__' ? null : val;
                setFilters((f) => mergeFilters(f, {
                  valla: nextValue,
                  vallaState: nextValue,
                }));
                setKpiActiveFilterKey?.(null);
              }}
            />

            <SelectFilter
              label="Nivel alarma"
              value={filters.alarmLevel || '__all__'}
              placeholder="Nivel alarma"
              options={ALARM_LEVEL_OPTIONS}
              testId="filter-alarm-level"
              onValueChange={(val) => {
                setFilters((f) => mergeFilters(f, { alarmLevel: val === '__all__' ? null : val }));
                setKpiActiveFilterKey?.(null);
              }}
            />

            <SelectFilter
              label="Actor alarma"
              value={filters.alarmActor || '__all__'}
              placeholder="Actor alarma"
              options={ALARM_ACTOR_OPTIONS}
              testId="filter-alarm-actor"
              onValueChange={(val) => {
                setFilters((f) => mergeFilters(f, { alarmActor: val === '__all__' ? null : val }));
                setKpiActiveFilterKey?.(null);
              }}
            />

            <SelectFilter
              label="Acción alarma"
              value={filters.alarmAction || '__all__'}
              placeholder="Acción"
              options={ALARM_ACTION_OPTIONS}
              testId="filter-alarm-action"
              onValueChange={(val) => {
                setFilters((f) => mergeFilters(f, { alarmAction: val === '__all__' ? null : val }));
                setKpiActiveFilterKey?.(null);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}