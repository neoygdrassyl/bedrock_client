import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export function FunExpedienteFullscreen({ expediente, translation, globals, swaMsg, onClose, onRefresh }) {
  const [summary, setSummary] = useState(expediente);
  const [activeSection, setActiveSection] = useState('detalles');
  const [activeReport, setActiveReport] = useState('juridico');
  const [currentId, setCurrentId] = useState(getExpedienteId(expediente));
  const [currentVersion, setCurrentVersion] = useState(getExpedienteVersion(expediente));
  const [currentPublic, setCurrentPublic] = useState(getExpedienteRadicado(expediente));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { alarms } = useAlarms({ includeAttended: true, includeHidden: true });

  useEffect(() => {
    setSummary(expediente);
    setCurrentId(getExpedienteId(expediente));
    setCurrentVersion(getExpedienteVersion(expediente));
    setCurrentPublic(getExpedienteRadicado(expediente));
  }, [expediente]);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

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

  return (
    <div className="fixed inset-0 z-[1200] bg-background text-foreground">
      <div className="flex h-full min-h-0 flex-col bg-background">
        <header className="border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose} aria-label="Cerrar gestión completa">
                  <Icon name="ArrowLeft" size={17} />
                </Button>
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                  Gestión completa del expediente
                </Badge>
                <Badge className={cn('border text-xs font-semibold', summaryStatus.badgeClass)}>{summaryStatus.label}</Badge>
                {remainingDays != null ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {remainingDays} días restantes
                  </Badge>
                ) : null}
                <Badge variant="secondary" className="font-mono text-xs">
                  v{currentVersion}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-end gap-3">
                  <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight sm:text-3xl">{currentPublic}</h1>
                  <p className="text-sm text-muted-foreground">{summary?.fase_label || 'Sin fase activa registrada'}</p>
                </div>
                <p className="max-w-4xl text-sm text-muted-foreground">
                  Superficie única de trabajo para revisar detalles, tiempos, chequeo, documentos, informes, acta y expedición sin perder el contexto del expediente.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryItem icon="User" label="Solicitante" value={getExpedienteApplicant(summary)} />
                <SummaryItem icon="Layers" label="Categoría" value={summary?.categoria || 'Sin categoría'} />
                <SummaryItem icon="Calendar" label="Radicación" value={summary?.fecha_radicacion || 'Sin fecha'} />
                <SummaryItem icon="CalendarDays" label="Fecha límite" value={summary?.fecha_limite || 'Sin fecha límite'} />
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
              <Button variant="outline" size="sm" onClick={() => refreshSummary()} disabled={isRefreshing}>
                <Icon name="RefreshCw" size={14} className={cn(isRefreshing && 'animate-spin')} />
                {isRefreshing ? 'Actualizando' : 'Actualizar'}
              </Button>
              <Button size="sm" onClick={() => handleSectionChange('tiempos')}>
                <Icon name="Clock" size={14} />
                Ir a tiempos
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">
                {usedDays} / {limitDays || 0} días hábiles
              </span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all duration-300', summaryStatus.barClass)} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-card/50 px-2 sm:px-4">
          <div className="flex overflow-x-auto">
            {SECTION_ITEMS.map((item) => (
              <SectionButton key={item.id} item={item} active={activeSection === item.id} onClick={handleSectionChange} />
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-5 p-4 sm:p-6">
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

                <div className="rounded-2xl border border-border bg-card/90 p-3 shadow-sm sm:p-5">
                  {moduleContent}
                </div>

                <div className="space-y-4 xl:hidden">
                  <SupportCard title="Trazabilidad operativa">
                    <BitacoraList entries={bitacoraEntries} />
                  </SupportCard>
                  <SupportCard title="Alertas y tiempos">
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <SummaryItem icon="Clock" label="Días usados" value={`${usedDays}`} />
                        <SummaryItem icon="CalendarDays" label="Días límite" value={`${limitDays || 0}`} />
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">Alarmas activas</span>
                          <Badge variant={currentAlarms.length ? 'destructive' : 'secondary'}>{currentAlarms.length}</Badge>
                        </div>
                        {currentAlarms.length ? (
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {currentAlarms.slice(0, 4).map((alarm) => (
                              <li key={alarm.id} className="rounded-md border border-border/70 bg-card px-3 py-2">
                                <p className="font-medium text-foreground">{alarm.title || alarm.radicado || `Alarma ${alarm.id}`}</p>
                                {alarm.message ? <p className="mt-1 text-muted-foreground">{alarm.message}</p> : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No hay alarmas activas para este expediente.</p>
                        )}
                      </div>
                    </div>
                  </SupportCard>
                </div>
              </div>
            </ScrollArea>
          </div>

          <aside className="hidden w-[320px] shrink-0 border-l border-border bg-card/50 xl:block">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-5">
                <SupportCard title="Contexto del expediente">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start justify-between gap-3">
                      <span>Submódulo activo</span>
                      <span className="font-medium text-foreground">
                        {SECTION_ITEMS.find((item) => item.id === activeSection)?.label || 'Detalles'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Tipo de licencia</span>
                      <span className="text-right font-medium text-foreground">{summary?.tipo_licencia || 'Sin dato'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Responsable actual</span>
                      <span className="text-right font-medium text-foreground">{summary?.responsable || 'Sin responsable'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span>Comentarios registrados</span>
                      <span className="font-medium text-foreground">{bitacoraEntries.length}</span>
                    </div>
                  </div>
                </SupportCard>

                <SupportCard title="Alertas y tiempos">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <SummaryItem icon="Clock" label="Días usados" value={`${usedDays}`} />
                      <SummaryItem icon="CalendarDays" label="Días límite" value={`${limitDays || 0}`} />
                    </div>
                    <div className="rounded-lg border border-border/70 bg-background/80 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">Alarmas activas</span>
                        <Badge variant={currentAlarms.length ? 'destructive' : 'secondary'}>{currentAlarms.length}</Badge>
                      </div>
                      {currentAlarms.length ? (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {currentAlarms.slice(0, 4).map((alarm) => (
                            <li key={alarm.id} className="rounded-md border border-border/70 bg-card px-3 py-2">
                              <p className="font-medium text-foreground">{alarm.title || alarm.radicado || `Alarma ${alarm.id}`}</p>
                              {alarm.message ? <p className="mt-1 text-muted-foreground">{alarm.message}</p> : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay alarmas activas para este expediente.</p>
                      )}
                    </div>
                  </div>
                </SupportCard>

                <SupportCard title="Bitácora operativa">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Este espacio resume comentarios y observaciones registradas por los profesionales durante la evaluación del expediente.
                  </p>
                  <BitacoraList entries={bitacoraEntries} />
                </SupportCard>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default FunExpedienteFullscreen;