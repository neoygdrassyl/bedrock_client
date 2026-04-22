import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectFlowModal from '../../legal_flow_guide/components/ProjectFlowModal';
import { Icon } from '@/components/icon';
import { useAlarms } from '../hooks/useAlarms';
import legalGuideService from '../../../../services/legalGuide.service';

// ── Status config (semántico, sin colores hardcoded en tokens Tailwind) ──────
const STATUS_META = {
  EN_TERMINO:         { label: 'En Término',        variant: 'success',     bar: 'bg-accent',       icon: 'check-circle' },
  PRONTO_A_VENCER:    { label: 'Pronto a Vencer',   variant: 'warning',     bar: 'bg-warning',      icon: 'alert-circle' },
  ALERTA_VENCIMIENTO: { label: 'Alerta Vencimiento', variant: 'destructive', bar: 'bg-destructive',  icon: 'alert-triangle' },
  VENCIDO:            { label: 'Vencido',            variant: 'destructive', bar: 'bg-destructive',  icon: 'x-circle' },
};

// Status → Tailwind badge classes manuales (shadow variants)
const STATUS_BADGE_CLASS = {
  success:     'bg-accent/10 text-accent border-accent/30',
  warning:     'bg-warning/10 text-warning border-warning/30',
  destructive: 'bg-destructive/10 text-destructive border-destructive/30',
};

// ── Phase derivation (identical to FunExpedienteDetail) ──────────────────────
const STANDARD_PHASES = [
  { phaseId: 'RAD',     label: 'Radicación LDF',               responsible: 'solicitante' },
  { phaseId: 'EST',     label: 'Estudio y Observaciones',      responsible: 'curaduria' },
  { phaseId: 'NOT_OBS', label: 'Notificación Observaciones',   responsible: 'curaduria' },
  { phaseId: 'CORR',    label: 'Correcciones del Solicitante', responsible: 'solicitante' },
  { phaseId: 'VIA',     label: 'Revisión y Viabilidad',        responsible: 'curaduria' },
  { phaseId: 'NOT_VIA', label: 'Notificación Viabilidad',      responsible: 'curaduria' },
  { phaseId: 'PAG',     label: 'Liquidación y Pagos',          responsible: 'solicitante' },
  { phaseId: 'RES',     label: 'Generación de Resolución',     responsible: 'curaduria' },
  { phaseId: 'NOT_RES', label: 'Notificación Resolución',      responsible: 'curaduria' },
  { phaseId: 'EJEC',    label: 'Ejecutoria y Recurso',         responsible: 'curaduria' },
  { phaseId: 'ENT',     label: 'Entrega de Licencia',          responsible: 'curaduria' },
];

function derivePhasesFromExpediente(exp) {
  if (!exp?.fase_actual) return [];
  const currentId = exp.fase_actual;
  if (currentId.startsWith('DESIST_') || currentId === 'COMPLETADO' || currentId === 'SIN_INICIAR') {
    return [{ phaseId: currentId, label: exp.fase_label, status: 'activo', daysUsed: exp.dias_habiles_usados, daysLimit: exp.dias_habiles_limite, responsible: (exp.responsable || '').toLowerCase().includes('curad') ? 'curaduria' : 'solicitante' }];
  }
  const idx = STANDARD_PHASES.findIndex(p => p.phaseId === currentId);
  if (idx < 0) return [];
  return STANDARD_PHASES.slice(0, idx + 2).map((p, i) => ({
    phaseId: p.phaseId, label: p.label, responsible: p.responsible,
    status: i < idx ? 'completado' : i === idx ? 'activo' : 'pendiente',
    daysUsed: i === idx ? (exp.dias_habiles_usados ?? 0) : 0,
    daysLimit: i === idx ? (exp.dias_habiles_limite ?? 0) : null,
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function labelNotificacion(value) {
  if (value === 'aviso') return 'Por aviso';
  if (value === 'personal') return 'Personal';
  if (value === 'comunicar') return 'Comunicación';
  return 'No definida';
}
function getActorLabel(actor) {
  const labels = { CUR: 'Curaduría', SOL: 'Solicitante', PROF: 'Profesional responsable', VEC: 'Vecino o tercero interesado' };
  return labels[actor] || actor || 'No definido';
}
function formatLegalTerm(days) {
  if (days === null || days === undefined) return 'No definido';
  if (Number(days) === 0) return 'Sin término fijo';
  if (Number(days) === 1) return '1 día';
  return `${days} días`;
}

// ── Componente principal ──────────────────────────────────────────────────────
export function FunExpedienteFullscreen({ expediente, onClose, onOpenWorkspace }) {
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [legalGuide, setLegalGuide] = useState(null);
  const [legalGuideLoading, setLegalGuideLoading] = useState(false);
  const [legalGuideError, setLegalGuideError] = useState('');

  const { alarms, attend, hide } = useAlarms({ includeAttended: true, includeHidden: true });

  const currentPhaseCode = expediente?.fase_actual || '';

  useEffect(() => {
    let ignore = false;
    if (!currentPhaseCode) { setLegalGuide(null); setLegalGuideError(''); setLegalGuideLoading(false); return undefined; }
    setLegalGuideLoading(true);
    setLegalGuideError('');
    legalGuideService.getByPhase(currentPhaseCode)
      .then(response => { if (!ignore) setLegalGuide(response.data?.data || response.data || null); })
      .catch(error => {
        if (ignore) return;
        if (error?.response?.status === 404) { setLegalGuide(null); setLegalGuideError(''); return; }
        setLegalGuide(null);
        setLegalGuideError('No fue posible cargar la guía legal de esta fase.');
      })
      .finally(() => { if (!ignore) setLegalGuideLoading(false); });
    return () => { ignore = true; };
  }, [currentPhaseCode]);

  if (!expediente) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Sin datos del expediente.
      </div>
    );
  }

  const s = STATUS_META[expediente.status] || STATUS_META.EN_TERMINO;
  const pct = Math.min(expediente.porcentaje_avance ?? 0, 100);
  const badgeClass = STATUS_BADGE_CLASS[s.variant] || STATUS_BADGE_CLASS.success;
  const diasRestantes = Math.max(0, (expediente.dias_habiles_limite || 0) - (expediente.dias_habiles_usados || 0));
  const expedienteAlarms = alarms.filter(a => String(a.fun0Id) === String(expediente.id));
  const pendingAlarms = expedienteAlarms.filter(a => !a.attended && !a.hidden);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* ── Header fijo superior ───────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3 z-10">
        <div className="flex items-start justify-between gap-4">
          {/* Columna izquierda: identidad del expediente */}
          <div className="flex items-start gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 mt-0.5"
              onClick={onClose}
              aria-label="Volver"
            >
              <Icon name="arrow-left" size={18} />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono font-bold text-xl text-foreground tracking-tight">
                  {expediente.radicado}
                </span>
                <Badge className={`text-xs font-semibold border ${badgeClass}`}>
                  <Icon name={s.icon} size={11} className="mr-1" />
                  {s.label}
                </Badge>
                {expediente.dias_habiles_limite != null && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {diasRestantes} días restantes
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {expediente.solicitante && (
                  <span className="flex items-center gap-1">
                    <Icon name="user" size={12} />
                    {expediente.solicitante}
                  </span>
                )}
                {expediente.fase_label && (
                  <span className="flex items-center gap-1">
                    <Icon name="flag" size={12} />
                    {expediente.fase_label}
                  </span>
                )}
                {expediente.categoria && (
                  <span className="flex items-center gap-1">
                    <Icon name="layers" size={12} />
                    {expediente.categoria}
                  </span>
                )}
                {expediente.tipo_licencia && (
                  <span className="flex items-center gap-1">
                    <Icon name="file-text" size={12} />
                    {expediente.tipo_licencia}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Acciones superiores */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowFlowModal(true)}>
              <Icon name="project-diagram" size={14} className="mr-1" />
              Ver flujo
            </Button>
            {onOpenWorkspace && (
              <Button size="sm" onClick={() => onOpenWorkspace(expediente)}>
                <Icon name="expand-alt" size={14} className="mr-1" />
                Gestión completa
              </Button>
            )}
          </div>
        </div>

        {/* Barra de progreso compacta bajo el header */}
        <div className="mt-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">
              {expediente.dias_habiles_usados ?? 0} / {expediente.dias_habiles_limite ?? 0} días
            </span>
            <div className="flex-1 rounded-full overflow-hidden bg-muted h-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums w-10 text-right shrink-0 text-muted-foreground">
              {pct}%
            </span>
          </div>
        </div>
      </header>

      {/* ── Cuerpo principal ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Área central con tabs ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Tabs defaultValue="info" className="flex flex-col flex-1 min-h-0">
            <div className="border-b border-border px-6 bg-background shrink-0">
              <TabsList className="bg-transparent h-10 p-0 gap-0">
                <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm">
                  <Icon name="info" size={13} className="mr-1.5" />Información
                </TabsTrigger>
                <TabsTrigger value="legal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm">
                  <Icon name="book-open" size={13} className="mr-1.5" />Guía Legal
                </TabsTrigger>
                <TabsTrigger value="alertas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm">
                  <Icon name="alert-triangle" size={13} className="mr-1.5" />
                  Alertas
                  {(expediente.esta_pausado || expediente.tiene_suspension || expediente.tiene_extension || expediente.es_desistido) && (
                    <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4">!</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="bitacora" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm">
                  <Icon name="clock" size={13} className="mr-1.5" />Bitácora
                  {Array.isArray(expediente.bitacora) && expediente.bitacora.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1.5">{expediente.bitacora.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tecnico" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 text-sm">
                  <Icon name="terminal" size={13} className="mr-1.5" />Técnico
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-6 py-5">
                {/* Tab: Información General */}
                <TabsContent value="info" className="mt-0 space-y-5">
                  {/* Sugerencia de acción */}
                  {expediente.sugerencia && (
                    <div className={`rounded-lg px-4 py-3 flex items-start gap-3 border ${badgeClass}`}>
                      <Icon name="lightbulb" size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold mb-0.5">Acción sugerida</p>
                        <p className="text-xs opacity-90">{expediente.sugerencia}</p>
                      </div>
                    </div>
                  )}

                  {/* Grid de información */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                      Datos del trámite
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoField label="Fase actual" value={expediente.fase_label} icon="flag" />
                      <InfoField label="Responsable" value={expediente.responsable} icon="user" />
                      <InfoField label="Categoría" value={expediente.categoria} icon="layers" />
                      <InfoField label="Tipo de licencia" value={expediente.tipo_licencia || '—'} icon="file-text" />
                      <InfoField label="Trámite" value={expediente.tramite || '—'} icon="clipboard-list" />
                      <InfoField label="Fecha radicación" value={expediente.fecha_radicacion || '—'} icon="calendar" />
                      <InfoField label="Fecha límite" value={expediente.fecha_limite || '—'} icon="calendar-x" />
                      <InfoField
                        label="Días totales"
                        value={`${expediente.dias_habiles_totales ?? '—'} hábiles desde radicación`}
                        icon="briefcase"
                      />
                      {expediente.intervalo_notificacion_activo && (
                        <InfoField
                          label="Intervalo actual"
                          value={`${labelNotificacion(expediente.tipo_notificacion_actual)} · ${expediente.dias_intervalo_notificacion ?? '—'} días`}
                          icon="bell"
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Guía Legal */}
                <TabsContent value="legal" className="mt-0">
                  <LegalGuideSection
                    expediente={expediente}
                    guide={legalGuide}
                    loading={legalGuideLoading}
                    error={legalGuideError}
                  />
                </TabsContent>

                {/* Tab: Alertas y Flags */}
                <TabsContent value="alertas" className="mt-0">
                  <AlertasSection expediente={expediente} labelNotificacion={labelNotificacion} />
                </TabsContent>

                {/* Tab: Bitácora */}
                <TabsContent value="bitacora" className="mt-0">
                  <BitacoraSection expediente={expediente} statusBar={s.bar} />
                </TabsContent>

                {/* Tab: Información Técnica */}
                <TabsContent value="tecnico" className="mt-0">
                  <TecnicoSection expediente={expediente} />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* ── Panel lateral derecho: tiempos y alarmas ───────────────────── */}
        <aside className="w-72 shrink-0 border-l border-border flex flex-col overflow-hidden bg-muted/30">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">

              {/* Seguimiento de tiempo legal */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Tiempo legal
                </h3>
                <div className="rounded-lg border border-border bg-background p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-foreground tabular-nums">
                        {expediente.dias_habiles_usados ?? '—'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Usados</span>
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="rounded-full overflow-hidden bg-muted h-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{pct}%</span>
                        <span>{diasRestantes} restantes</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-muted-foreground tabular-nums">
                        {expediente.dias_habiles_limite ?? '—'}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Límite</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-0.5">Inicio</span>
                      <span className="text-xs font-medium text-foreground">
                        {expediente.fecha_radicacion || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-0.5">Vence</span>
                      <span className="text-xs font-medium text-foreground">
                        {expediente.fecha_limite || '—'}
                      </span>
                    </div>
                  </div>

                  {expediente.control_temporal_activo && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">
                        Control temporal
                      </span>
                      <Badge variant="outline" className="text-xs gap-1">
                        <Icon name="shield" size={11} />
                        {expediente.control_temporal_label}
                      </Badge>
                    </div>
                  )}
                </div>
              </section>

              {/* Alarmas */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Alarmas
                  </h3>
                  {pendingAlarms.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                      {pendingAlarms.length}
                    </Badge>
                  )}
                </div>

                {expedienteAlarms.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <Icon name="check-circle" size={20} className="text-accent mx-auto mb-1.5 opacity-60" />
                    <p className="text-xs text-muted-foreground">Sin alarmas registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expedienteAlarms.map((a, idx) => {
                      const isPending = !a.attended && !a.hidden;
                      return (
                        <div
                          key={a.id || idx}
                          className={`rounded-lg border p-2.5 transition-opacity ${
                            isPending ? 'border-destructive/40 bg-destructive/5' : 'border-border opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <Icon
                              name={isPending ? (a.severity === 'warning' ? 'alert-triangle' : 'alert-circle') : 'check-circle'}
                              size={13}
                              className={isPending ? (a.severity === 'warning' ? 'text-warning' : 'text-destructive') : 'text-muted-foreground'}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold block text-foreground">
                                {a.phaseCode}
                              </span>
                              <span className="text-[11px] text-muted-foreground block mt-0.5 leading-snug" style={{ whiteSpace: 'pre-wrap' }}>
                                {a.message || 'Alarma de tiempo en el expediente.'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">
                              {a.computedAt ? String(a.computedAt).substring(0, 10) : ''}
                            </span>
                            {isPending ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  title="Ocultar alarma"
                                  onClick={() => hide(a.id)}
                                >
                                  <Icon name="eye-off" size={11} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-accent hover:text-accent"
                                  title="Marcar como atendida"
                                  onClick={() => attend(a.id)}
                                >
                                  <Icon name="check" size={11} />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Icon name={a.attended ? 'check-circle' : 'eye-off'} size={10} />
                                {a.attended ? 'Atendida' : 'Oculta'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Acciones */}
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Acciones
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowFlowModal(true)}
                >
                  <Icon name="project-diagram" size={14} />
                  Ver flujo del expediente
                </Button>
                {onOpenWorkspace && (
                  <Button
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => onOpenWorkspace(expediente)}
                  >
                    <Icon name="expand-alt" size={14} />
                    Abrir gestión completa
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={onClose}
                >
                  <Icon name="arrow-left" size={14} />
                  Volver
                </Button>
              </section>
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* ── Modal flujo del expediente ─────────────────────────────────────── */}
      <ProjectFlowModal
        show={showFlowModal}
        onClose={() => setShowFlowModal(false)}
        phases={derivePhasesFromExpediente(expediente)}
        expediente={expediente}
      />
    </div>
  );
}

export default FunExpedienteFullscreen;

// ── Sub-componentes de tabs ───────────────────────────────────────────────────

function InfoField({ label, value, icon }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon name={icon} size={14} className="text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-0.5">{label}</span>
        <span className="text-sm font-medium text-foreground">{value || '—'}</span>
      </div>
    </div>
  );
}

function LegalGuideSection({ expediente, guide, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning">
        <Icon name="alert-triangle" size={14} className="mr-2 inline" />
        {error}
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <Icon name="book-open" size={32} className="text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Información legal no disponible para esta fase.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Fase actual: <span className="font-mono">{expediente?.fase_actual || '—'}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1">
          <Icon name="flag" size={11} />
          {expediente?.fase_label || guide.fase || 'Fase actual'}
        </Badge>
        <Badge variant="outline">{getActorLabel(guide.actor)}</Badge>
        <Badge variant="outline">
          <Icon name="clock" size={11} className="mr-1" />
          {formatLegalTerm(guide.terminoDias)}
        </Badge>
      </div>

      {guide.norma && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Referencia normativa
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{guide.norma}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pasos requeridos
          </h4>
          {(guide.pasos || []).length > 0 ? (
            <ol className="space-y-2">
              {(guide.pasos || []).map((paso, index) => (
                <li key={`paso-${index}`} className="flex gap-3">
                  <span className="shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold w-5 h-5 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground leading-relaxed">{paso}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Sin pasos definidos para esta fase.</p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Responsable</span>
            <span className="text-sm font-semibold">{getActorLabel(guide.actor)}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide block mb-1">Término legal</span>
            <span className="text-sm font-semibold">{formatLegalTerm(guide.terminoDias)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertasSection({ expediente, labelNotificacion }) {
  const hasAlertas = expediente.esta_pausado || expediente.tiene_suspension || expediente.tiene_extension || expediente.es_desistido || expediente.intervalo_notificacion_activo;

  if (!hasAlertas) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Icon name="check-circle" size={32} className="text-accent/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Sin alertas activas para este expediente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expediente.esta_pausado && (
        <AlertaCard
          icon="pause-circle"
          title="Expediente pausado"
          description="El expediente se encuentra actualmente pausado."
          variant="info"
        />
      )}
      {expediente.intervalo_notificacion_activo && (
        <AlertaCard
          icon="bell"
          title={`Intervalo de notificación: ${labelNotificacion(expediente.tipo_notificacion_actual)}`}
          description={`Intervalo activo de ${expediente.dias_intervalo_notificacion ?? '—'} días.`}
          variant="info"
        />
      )}
      {expediente.tiene_suspension && (
        <AlertaCard
          icon="ban"
          title={expediente.suspension_activa ? 'Suspensión activa' : 'Suspensión registrada'}
          description={expediente.suspension_activa ? 'Existe una suspensión activa sobre este expediente.' : 'Se registró una suspensión en el historial del expediente.'}
          variant="warning"
        />
      )}
      {expediente.tiene_extension && (
        <AlertaCard
          icon="clock"
          title={expediente.prorroga_activa ? 'Prórroga activa' : 'Prórroga registrada'}
          description={expediente.prorroga_activa ? 'Hay una prórroga activa sobre este expediente.' : 'Se registró una prórroga en el historial del expediente.'}
          variant="warning"
        />
      )}
      {expediente.es_desistido && (
        <AlertaCard
          icon="x-circle"
          title="Expediente desistido"
          description={expediente.razon_desistimiento ? `Razón: ${expediente.razon_desistimiento}` : 'El expediente fue desistido.'}
          variant="destructive"
        />
      )}
    </div>
  );
}

const ALERTA_VARIANT_CLASSES = {
  info:        'border-primary/30 bg-primary/5 text-primary',
  warning:     'border-warning/30 bg-warning/5 text-warning',
  destructive: 'border-destructive/30 bg-destructive/5 text-destructive',
};

function AlertaCard({ icon, title, description, variant = 'info' }) {
  const classes = ALERTA_VARIANT_CLASSES[variant] || ALERTA_VARIANT_CLASSES.info;
  return (
    <div className={`rounded-lg border px-4 py-3 flex gap-3 ${classes}`}>
      <Icon name={icon} size={16} className="shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs opacity-80 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function BitacoraSection({ expediente, statusBar }) {
  if (!Array.isArray(expediente.bitacora) || expediente.bitacora.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <Icon name="clock" size={32} className="text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Sin movimientos registrados en la bitácora.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Historial de movimientos
      </h3>
      <div className="relative">
        {expediente.bitacora.map((entry, i) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center shrink-0 w-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? statusBar : 'bg-muted-foreground/30'}`} />
              {i < expediente.bitacora.length - 1 && (
                <div className="flex-1 w-px bg-border mt-1" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground">
                  Estado {entry.state}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {entry.date || '—'}
                </span>
              </div>
              {entry.desc && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2" title={entry.desc}>
                  {entry.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TecnicoSection({ expediente }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Datos técnicos del registro
      </h3>
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs">
          <TecnicoRow label="ID interno" value={expediente.id} />
          <TecnicoRow label="State raw" value={expediente.state_raw} />
          <TecnicoRow label="Clocks activos" value={expediente.clocks_count} />
          {expediente.m_lic && <TecnicoRow label="Modalidad" value={expediente.m_lic} />}
          {expediente.id_public && <TecnicoRow label="ID público" value={expediente.id_public} />}
        </div>
      </div>
    </div>
  );
}

function TecnicoRow({ label, value }) {
  return (
    <div>
      <span className="text-muted-foreground block">{label}</span>
      <span className="text-foreground font-medium">{value ?? '—'}</span>
    </div>
  );
}
