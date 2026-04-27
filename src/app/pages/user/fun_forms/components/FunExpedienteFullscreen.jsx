import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import FUNService from '../../../../services/fun.service';
import { useAlarms } from '../hooks/useAlarms';
import FUNG from '../fun_g';
import FUNC from '../fun_c';
import FUND from './fun_docs';
import FUNCLOCK from '../fun_clock';
import RECORD_ARC from '../../records/record_arc';
import RECORD_LAW from '../../records/record_law';
import RECORD_ENG from '../../records/record_eng';
import RECORD_REVIEW from '../../records/record_review';
import EXPEDITION from '../../expeditions/expedition.page';

const SECTION_ITEMS = [
  { id: 'detalles', label: 'Detalles', icon: 'FolderOpen' },
  { id: 'tiempos', label: 'Tiempos', icon: 'Clock' },
  { id: 'chequeo', label: 'Chequeo', icon: 'CheckSquare' },
  { id: 'documentos', label: 'Documentos', icon: 'Archive' },
  { id: 'informes', label: 'Informes', icon: 'FileText' },
  { id: 'acta', label: 'Acta', icon: 'FileCheck' },
  { id: 'expedicion', label: 'Expedición', icon: 'FileOutput' },
];

const REPORT_ITEMS = [
  { id: 'juridico', label: 'Jurídico', icon: 'Scale' },
  { id: 'arquitectonico', label: 'Arquitectónico', icon: 'Building' },
  { id: 'estructural', label: 'Estructural', icon: 'Cog' },
];

const STATUS_META = {
  EN_TERMINO: {
    label: 'En término',
    badgeClass: 'border-accent/30 bg-accent/10 text-accent',
    barClass: 'bg-accent',
  },
  PRONTO_A_VENCER: {
    label: 'Pronto a vencer',
    badgeClass: 'border-warning/30 bg-warning/10 text-warning',
    barClass: 'bg-warning',
  },
  ALERTA_VENCIMIENTO: {
    label: 'Alerta de vencimiento',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
  VENCIDO: {
    label: 'Vencido',
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    barClass: 'bg-destructive',
  },
};

function getExpedienteId(expediente) {
  return expediente?.id ?? expediente?.fun0Id ?? expediente?.fun_0_id ?? null;
}

function getExpedienteVersion(expediente) {
  return Number.isFinite(expediente?.version) ? expediente.version : 1;
}

function getExpedienteRadicado(expediente) {
  return expediente?.id_public ?? expediente?.radicado ?? expediente?.fun0Id ?? expediente?.fun_0_id ?? 'Sin radicado';
}

function getExpedienteApplicant(expediente) {
  return expediente?.solicitante ?? expediente?.applicant ?? expediente?.titular ?? 'Sin solicitante registrado';
}

function normalizeBitacoraEntries(expediente) {
  const source = Array.isArray(expediente?.bitacora)
    ? expediente.bitacora
    : Array.isArray(expediente?.comentarios)
      ? expediente.comentarios
      : Array.isArray(expediente?.observaciones)
        ? expediente.observaciones
        : [];

  return source
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return {
          id: `bitacora-${index}`,
          author: 'Profesional',
          note: entry,
          date: null,
        };
      }

      return {
        id: entry?.id ?? `bitacora-${index}`,
        author: entry?.author ?? entry?.usuario ?? entry?.profesional ?? entry?.worker_name ?? 'Profesional',
        note: entry?.note ?? entry?.comentario ?? entry?.observacion ?? entry?.detalle ?? 'Sin detalle registrado.',
        date: entry?.date ?? entry?.fecha ?? entry?.createdAt ?? entry?.updatedAt ?? null,
      };
    })
    .filter((entry) => entry.note);
}

// ── Fases derivadas del expediente para mini-timeline ─────────────────────
const STANDARD_PHASES_FS = [
  { phaseId: 'RAD',     label: 'Radicación' },
  { phaseId: 'EST',     label: 'Estudio' },
  { phaseId: 'NOT_OBS', label: 'Notif. Obs.' },
  { phaseId: 'CORR',    label: 'Correcciones' },
  { phaseId: 'VIA',     label: 'Viabilidad' },
  { phaseId: 'NOT_VIA', label: 'Notif. Via.' },
  { phaseId: 'PAG',     label: 'Pagos' },
  { phaseId: 'RES',     label: 'Resolución' },
  { phaseId: 'NOT_RES', label: 'Notif. Res.' },
  { phaseId: 'EJEC',    label: 'Ejecutoria' },
  { phaseId: 'ENT',     label: 'Entrega' },
];

function deriveMiniPhases(exp) {
  if (!exp?.fase_actual) return [];
  const currentId = exp.fase_actual;
  if (currentId.startsWith('DESIST_') || currentId === 'COMPLETADO' || currentId === 'SIN_INICIAR') {
    return [{ phaseId: currentId, label: exp.fase_label || currentId, status: 'activo', pct: Math.min(exp.porcentaje_avance ?? 0, 100) }];
  }
  const idx = STANDARD_PHASES_FS.findIndex(p => p.phaseId === currentId);
  if (idx < 0) return [];
  return STANDARD_PHASES_FS.slice(0, idx + 2).map((p, i) => ({
    phaseId: p.phaseId,
    label: p.label,
    status: i < idx ? 'completado' : i === idx ? 'activo' : 'pendiente',
    pct: i === idx ? Math.min(exp.porcentaje_avance ?? 0, 100) : (i < idx ? 100 : 0),
  }));
}

function MiniTimeline({ expediente, onGoToTimes }) {
  const phases = deriveMiniPhases(expediente);
  if (!phases.length) {
    return <p className="text-xs text-muted-foreground">Sin datos de fase disponibles.</p>;
  }
  return (
    <div className="space-y-1.5">
      {phases.map((phase) => {
        const isActive = phase.status === 'activo';
        const isDone = phase.status === 'completado';
        const barColor = isDone ? 'bg-accent' : isActive ? 'bg-primary' : 'bg-muted-foreground/20';
        const textColor = isDone ? 'text-accent' : isActive ? 'text-primary' : 'text-muted-foreground/50';
        return (
          <div key={phase.phaseId} className="flex items-center gap-2">
            <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', isDone ? 'bg-accent' : isActive ? 'bg-primary' : 'bg-border')} />
            <span className={cn('min-w-0 flex-1 truncate text-[11px]', textColor, isActive && 'font-semibold')}>{phase.label}</span>
            {isActive && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="font-mono">{phase.pct}%</span>
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-2 overflow-hidden rounded-full bg-muted h-1.5">
        {phases.filter(p => p.status === 'activo').map(p => (
          <div
            key="bar"
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${p.pct}%` }}
          />
        ))}
      </div>
      <Button variant="ghost" size="sm" className="mt-1 w-full text-xs h-7" onClick={onGoToTimes}>
        <Icon name="Clock" size={12} className="mr-1" /> Ver tiempos completos
      </Button>
    </div>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Icon name={icon} size={12} />
        {label}
      </div>
      <p className="truncate text-sm font-medium text-foreground">{value || 'Sin dato disponible'}</p>
    </div>
  );
}

function SectionButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
      )}
    >
      <Icon name={item.icon} size={14} />
      {item.label}
    </button>
  );
}

function SupportCard({ title, children }) {
  return (
    <section className="rounded-xl border border-border bg-card/80 p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function BitacoraList({ entries }) {
  if (!entries.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin comentarios profesionales registrados para este expediente.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.slice(0, 6).map((entry) => (
        <article key={entry.id} className="rounded-lg border border-border/70 bg-background/80 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{entry.author}</span>
            {entry.date ? <span className="text-xs text-muted-foreground">{entry.date}</span> : null}
          </div>
          <p className="text-sm text-muted-foreground">{entry.note}</p>
        </article>
      ))}
    </div>
  );
}

function renderModuleContent(activeSection, activeReport, moduleProps) {
  switch (activeSection) {
    case 'detalles':
      return <FUNG {...moduleProps} onDuplicateSuccess={() => {}} />;
    case 'tiempos':
      return <FUNCLOCK {...moduleProps} />;
    case 'chequeo':
      return <FUNC {...moduleProps} closeModal={moduleProps.closeModal} />;
    case 'documentos':
      return <FUND {...moduleProps} />;
    case 'informes':
      if (activeReport === 'arquitectonico') {
        return <RECORD_ARC {...moduleProps} />;
      }
      if (activeReport === 'estructural') {
        return <RECORD_ENG {...moduleProps} />;
      }
      return <RECORD_LAW {...moduleProps} />;
    case 'acta':
      return <RECORD_REVIEW {...moduleProps} />;
    case 'expedicion':
      return <EXPEDITION {...moduleProps} />;
    default:
      return <FUNG {...moduleProps} onDuplicateSuccess={() => {}} />;
  }
}

function normalizeInitialSection(section) {
  return SECTION_ITEMS.some((item) => item.id === section) ? section : 'detalles';
}

function normalizeInitialReport(report) {
  return REPORT_ITEMS.some((item) => item.id === report) ? report : 'juridico';
}

export function FunExpedienteFullscreen({
  expediente,
  translation,
  globals,
  swaMsg,
  onClose,
  onRefresh,
  initialSection = 'detalles',
  initialReport = 'juridico',
  defaultRightPanelOpen = false,
}) {
  const [summary, setSummary] = useState(expediente);
  const [activeSection, setActiveSection] = useState(() => normalizeInitialSection(initialSection));
  const [activeReport, setActiveReport] = useState(() => normalizeInitialReport(initialReport));
  const [currentId, setCurrentId] = useState(getExpedienteId(expediente));
  const [currentVersion, setCurrentVersion] = useState(getExpedienteVersion(expediente));
  const [currentPublic, setCurrentPublic] = useState(getExpedienteRadicado(expediente));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(defaultRightPanelOpen);

  const { alarms } = useAlarms({ includeAttended: true, includeHidden: true });

  useEffect(() => {
    setSummary(expediente);
    setCurrentId(getExpedienteId(expediente));
    setCurrentVersion(getExpedienteVersion(expediente));
    setCurrentPublic(getExpedienteRadicado(expediente));
  }, [expediente]);

  useEffect(() => {
    setActiveSection(normalizeInitialSection(initialSection));
    setActiveReport(normalizeInitialReport(initialReport));
  }, [initialReport, initialSection]);

  useEffect(() => {
    setRightPanelOpen(defaultRightPanelOpen);
  }, [defaultRightPanelOpen]);

  useEffect(() => {
    const previousTitle = document.title;
    if (currentPublic) {
      document.title = `${currentPublic} · DOVELA`;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [currentPublic]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.classList.add('workspace-fullscreen-open');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('workspace-fullscreen-open');
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'tiempos') {
      setRightPanelOpen(false);
    }
  }, [activeSection]);

  const refreshSummary = useCallback(
    async (radicadoOverride) => {
      const radicado = radicadoOverride ?? currentPublic;
      if (!radicado) {
        return;
      }

      setIsRefreshing(true);
      try {
        const response = await FUNService.get_fun_IdPublic(radicado);
        const data = response?.data?.data ?? response?.data ?? null;

        if (data) {
          setSummary(data);
          setCurrentId(getExpedienteId(data));
          setCurrentVersion(getExpedienteVersion(data));
          setCurrentPublic(getExpedienteRadicado(data));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [currentPublic]
  );

  const requestUpdate = useCallback(
    async (id) => {
      const targetId = id ?? currentId;
      if (!targetId) {
        return;
      }

      try {
        const response = await FUNService.get(targetId);
        const data = response?.data ?? null;
        const radicado = data?.id_public ?? currentPublic;

        if (data) {
          setCurrentId(data.id ?? targetId);
          setCurrentVersion(getExpedienteVersion(data));
          setCurrentPublic(radicado);
        }

        await refreshSummary(radicado);
        await Promise.resolve(onRefresh?.());
      } catch (error) {
        console.error(error);
      }
    },
    [currentId, currentPublic, onRefresh, refreshSummary]
  );

  const handleLegacyNavigation = useCallback((item, nextSection) => {
    if (item) {
      setCurrentId(getExpedienteId(item));
      setCurrentVersion(getExpedienteVersion(item));
      setCurrentPublic(getExpedienteRadicado(item));
      setSummary((prev) => ({ ...prev, ...item }));
    }

    switch (nextSection) {
      case 'general':
        setActiveSection('detalles');
        break;
      case 'check':
        setActiveSection('chequeo');
        break;
      case 'clock':
        setActiveSection('tiempos');
        break;
      case 'archive':
        setActiveSection('documentos');
        break;
      case 'record_law':
        setActiveSection('informes');
        setActiveReport('juridico');
        break;
      case 'record_arc':
        setActiveSection('informes');
        setActiveReport('arquitectonico');
        break;
      case 'record_eng':
        setActiveSection('informes');
        setActiveReport('estructural');
        break;
      case 'record_review':
        setActiveSection('acta');
        break;
      case 'expedition':
        setActiveSection('expedicion');
        break;
      default:
        break;
    }
  }, []);

  const handleVersionNavigation = useCallback((step) => {
    setCurrentVersion((prev) => {
      if (step === 'minus') {
        return Math.max(1, prev - 1);
      }
      if (step === 'plus') {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const handleSectionChange = useCallback((nextSection) => {
    setActiveSection(nextSection);
    if (nextSection !== 'informes') {
      return;
    }
    setActiveReport((prev) => prev || 'juridico');
  }, []);

  const bitacoraEntries = useMemo(() => normalizeBitacoraEntries(summary), [summary]);
  const summaryStatus = STATUS_META[summary?.status] || STATUS_META.EN_TERMINO;
  const usedDays = Number(summary?.dias_habiles_usados ?? 0);
  const limitDays = Number(summary?.dias_habiles_limite ?? 0);
  const progressPercent = Math.max(
    0,
    Math.min(
      Number(summary?.porcentaje_avance ?? (limitDays > 0 ? Math.round((usedDays / limitDays) * 100) : 0)),
      100
    )
  );
  const remainingDays = limitDays > 0 ? Math.max(limitDays - usedDays, 0) : null;
  const currentAlarms = useMemo(
    () => (alarms || []).filter((alarm) => String(alarm.fun0Id) === String(currentId) && !alarm.attendedAt && !alarm.hiddenAt),
    [alarms, currentId]
  );

  const noop = useCallback(() => {}, []);

  const moduleProps = useMemo(
    () => ({
      translation,
      globals,
      swaMsg,
      currentId,
      currentVersion,
      requestUpdate,
      requesRefresh: () => requestUpdate(currentId),
      closeModal: noop,
      NAVIGATION: handleLegacyNavigation,
      NAVIGATION_VERSION: handleVersionNavigation,
    }),
    [currentId, currentVersion, globals, handleLegacyNavigation, handleVersionNavigation, noop, requestUpdate, swaMsg, translation]
  );

  const moduleContent = renderModuleContent(activeSection, activeReport, moduleProps);

  const content = (
    <div
      className="expediente-fullscreen fixed inset-0 z-[9999] bg-background text-foreground flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del expediente"
    >
      {/* ── Header compacto ──────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-background/98 backdrop-blur">
        {/* Fila principal compacta */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Volver"
          >
            <Icon name="ArrowLeft" size={15} />
          </Button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 overflow-hidden">
            <span className="font-mono text-sm font-semibold truncate max-w-[160px] sm:max-w-xs">
              {currentPublic}
            </span>
            <Badge className={cn('border text-[10px] font-semibold shrink-0', summaryStatus.badgeClass)}>
              {summaryStatus.label}
            </Badge>
            {remainingDays != null ? (
              <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                {remainingDays}d restantes
              </Badge>
            ) : null}
            <Badge variant="secondary" className="font-mono text-[10px] shrink-0">
              v{currentVersion}
            </Badge>
          </div>

          {/* Acciones + toggle detalle + cerrar */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-7 text-xs sm:flex"
              onClick={() => refreshSummary()}
              disabled={isRefreshing}
            >
              <Icon name="RefreshCw" size={12} className={cn(isRefreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setHeaderExpanded(p => !p)}
              aria-label={headerExpanded ? 'Colapsar datos' : 'Expandir datos'}
              title={headerExpanded ? 'Colapsar datos' : 'Expandir datos'}
            >
              <Icon name={headerExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="X" size={15} />
            </Button>
          </div>
        </div>

        {/* Franja de progreso siempre visible (fina) */}
        <div className="h-0.5 w-full bg-muted">
          <div
            className={cn('h-full transition-all duration-300', summaryStatus.barClass)}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Detalle expandible */}
        {headerExpanded && (
          <div className="border-t border-border/60 px-3 py-3 sm:px-4">
            <p className="mb-2 text-xs text-muted-foreground">
              {summary?.fase_label || 'Sin fase activa'} &nbsp;·&nbsp;
              <span className="font-mono">{usedDays}/{limitDays || 0} días hábiles ({progressPercent}%)</span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryItem icon="User" label="Solicitante" value={getExpedienteApplicant(summary)} />
              <SummaryItem icon="Layers" label="Categoría" value={summary?.categoria || 'Sin categoría'} />
              <SummaryItem icon="Calendar" label="Radicación" value={summary?.fecha_radicacion || 'Sin fecha'} />
              <SummaryItem icon="CalendarDays" label="Fecha límite" value={summary?.fecha_limite || 'Sin fecha límite'} />
            </div>
          </div>
        )}
      </header>

      {/* ── Navegación de submódulos ─────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-card/50 px-2 sm:px-4">
        <div className="flex overflow-x-auto">
          {SECTION_ITEMS.map((item) => (
            <SectionButton key={item.id} item={item} active={activeSection === item.id} onClick={handleSectionChange} />
          ))}
        </div>
      </div>

      {/* ── Área de trabajo ──────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Contenido principal */}
        <div className={cn('flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden transition-[max-width] duration-200', rightPanelOpen ? 'max-w-[calc(100%_-_18rem)]' : 'max-w-full')}>
          <ScrollArea className="min-w-0 flex-1">
            <div className="w-full min-w-0 space-y-4 p-3 sm:p-5">
              {activeSection === 'informes' ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-sm">
                  {REPORT_ITEMS.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={activeReport === item.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveReport(item.id)}
                    >
                      <Icon name={item.icon} size={14} />
                      {item.label}
                    </Button>
                  ))}
                </div>
              ) : null}

              <div
                className={cn(
                  'w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm',
                  activeSection === 'tiempos' ? 'p-1 sm:p-2' : 'p-3 sm:p-5'
                )}
              >
                {moduleContent}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* ── Panel derecho colapsable ─────────────────────────────── */}
        <div className="relative flex shrink-0">
          {/* Botón para mostrar/ocultar panel */}
          <button
            type="button"
            onClick={() => setRightPanelOpen(p => !p)}
            className={cn(
              'absolute top-3 -left-5 z-10 flex h-8 w-5 items-center justify-center rounded-l-md border border-border bg-card/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground',
              !rightPanelOpen && '-left-5'
            )}
            aria-label={rightPanelOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}
            title={rightPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}
          >
            <Icon name={rightPanelOpen ? 'ChevronRight' : 'ChevronLeft'} size={12} />
          </button>

          {rightPanelOpen && (
            <aside className="w-72 shrink-0 border-l border-border bg-card/50 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">

                  {/* Mini-timeline / Gantt preview */}
                  <SupportCard title="Cronograma del proceso">
                    <MiniTimeline
                      expediente={summary}
                      onGoToTimes={() => handleSectionChange('tiempos')}
                    />
                  </SupportCard>

                  {/* Alarmas activas */}
                  <SupportCard title="Alarmas activas">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={currentAlarms.length ? 'destructive' : 'secondary'} className="text-xs">
                        {currentAlarms.length} alarma{currentAlarms.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {currentAlarms.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sin alarmas activas para este expediente.</p>
                    ) : (
                      <ul className="space-y-2">
                        {currentAlarms.slice(0, 5).map((alarm) => (
                          <li key={alarm.id} className="rounded-md border border-border/70 bg-background/80 px-3 py-2">
                            <p className="text-xs font-medium text-foreground">{alarm.title || alarm.radicado || `Alarma ${alarm.id}`}</p>
                            {alarm.message ? <p className="mt-0.5 text-[11px] text-muted-foreground">{alarm.message}</p> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </SupportCard>

                  {/* Bitácora operativa */}
                  <SupportCard title="Bitácora operativa">
                    <BitacoraList entries={bitacoraEntries} />
                  </SupportCard>

                </div>
              </ScrollArea>
            </aside>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default FunExpedienteFullscreen;