import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  PlayCircle,
  Send,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import {
  buildDovelaErrorReport,
  captureDovelaError,
  captureDovelaConsoleMessage,
  captureDovelaUserAction,
  dismissDashboardGuide,
  extractExpedienteContext,
  getLastDovelaAction,
  getLastDovelaError,
  isDashboardGuideDismissed,
} from '@/app/utils/errorReporting';
import ErrorReportService from '@/app/services/error_report.service';

const SEVERITIES = ['Error funcional', 'Bloqueo', 'Dato incorrecto', 'Solicitud de mejora'];

const TUTORIAL_STEPS = [
  {
    icon: 'LayoutDashboard',
    title: 'Dashboard principal',
    body: 'El panel de inicio concentra accesos a operación diaria, módulos de consulta y seguimiento de expedientes marcados.',
    bullets: ['Acciones principales para iniciar trabajo', 'Bloques de operación y utilidades', 'Resumen de expedientes marcados para revisión'],
  },
  {
    icon: 'Layers',
    title: 'Gestión Licencias Nuevo',
    body: 'El centro operativo de licencias permite consultar expedientes, revisar alarmas, usar filtros y abrir la gestión completa cuando sea necesario.',
    bullets: ['KPI y semáforo operativo', 'Tabla de expedientes con contexto legal', 'Paneles de detalle y navegación por submódulos'],
  },
  {
    icon: 'BellRing',
    title: 'Alarmas, marcados y comunicación',
    body: 'La campana, los marcados personales/equipo y el chat ayudan a priorizar lo que necesita atención durante el lanzamiento de Dovela 2.0.',
    bullets: ['Alarmas visibles desde la barra superior', 'Marcados para seguimiento personal o de equipo', 'Chat interno para coordinación rápida'],
  },
  {
    icon: 'Bug',
    title: 'Reportar error',
    body: 'El botón flotante queda siempre disponible. Al reportar, Dovela captura contexto técnico seguro y permite añadir la explicación del usuario.',
    bullets: ['Ruta, módulo, navegador y usuario activo', 'Último botón, enlace o control usado', 'Radicado o expediente si la pantalla lo expone'],
  },
];

function getContextSnapshot(overrideContext = {}) {
  const lastError = overrideContext.lastError || overrideContext.errorSnapshot || getLastDovelaError();
  const lastAction = overrideContext.lastAction || getLastDovelaAction();
  const expediente = overrideContext.expediente || extractExpedienteContext() || lastError?.expediente || lastAction?.expediente || null;
  return { lastError, lastAction, expediente };
}

function getInitialForm(context) {
  const snapshot = getContextSnapshot(context);
  const lastActionLabel = snapshot.lastAction?.element?.label;
  return {
    severity: 'Error funcional',
    expediente: snapshot.expediente?.radicado || '',
    attemptedAction: lastActionLabel ? `Intentaba usar: ${lastActionLabel}` : '',
    details: '',
  };
}

function formatValue(value) {
  if (value == null || value === '') return 'No disponible';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function ContextRow({ label, value, multiline = false }) {
  return (
    <div className={cn('grid gap-1 rounded-md border border-border/60 bg-muted/20 px-3 py-2', multiline ? 'sm:col-span-2' : '')}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className={cn('text-xs text-foreground', multiline ? 'max-h-24 overflow-auto whitespace-pre-wrap font-mono' : 'truncate')}>
        {formatValue(value)}
      </span>
    </div>
  );
}

function ErrorReportDialog({ open, onOpenChange, context, source = 'manual-report' }) {
  const [form, setForm] = useState(() => getInitialForm(context));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const snapshot = useMemo(() => getContextSnapshot(context), [context]);

  useEffect(() => {
    if (open) {
      setForm(getInitialForm(context));
      setSubmitting(false);
      setSubmitError('');
    }
  }, [context, open]);

  const previewReport = useMemo(
    () => buildDovelaErrorReport(form, { source, lastError: snapshot.lastError }),
    [form, snapshot.lastError, source]
  );

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildReport = useCallback(() => {
    return buildDovelaErrorReport(form, { source, lastError: snapshot.lastError });
  }, [form, snapshot.lastError, source]);

  const handleSubmit = async () => {
    const report = buildReport();
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await ErrorReportService.create(report);
      const reportId = response?.data?.data?.id;
      toast.success('Reporte enviado', {
        description: reportId ? `Quedó registrado con el número #${reportId}.` : 'Quedó registrado para seguimiento.',
      });
      onOpenChange(false);
    } catch (err) {
      const isSessionError = err?.response?.status === 401 || err?.response?.status === 403;
      const message = isSessionError
        ? 'No fue posible validar tu sesión para guardar el reporte. Vuelve a iniciar sesión y reintenta.'
        : 'No se pudo guardar en la base de datos. El formulario sigue abierto para reintentar cuando el servicio esté disponible.';
      setSubmitError(message);
      toast.error('Reporte no enviado', {
        description: 'No se creó ningún registro alterno en este navegador.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl" data-dovela-report-ui="true">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <Bug className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle>Reportar error de Dovela</DialogTitle>
              <DialogDescription>
                Describe qué intentabas hacer. Dovela adjunta contexto técnico seguro para que desarrollo pueda reproducirlo con menos fricción.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tipo de reporte</Label>
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((severity) => (
                <Button
                  key={severity}
                  type="button"
                  size="sm"
                  variant={form.severity === severity ? 'default' : 'outline'}
                  onClick={() => updateForm('severity', severity)}
                >
                  {form.severity === severity ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                  {severity}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
            <div className="grid gap-2">
              <Label htmlFor="dovela-report-expediente">Expediente o radicado</Label>
              <Input
                id="dovela-report-expediente"
                value={form.expediente}
                onChange={(event) => updateForm('expediente', event.target.value)}
                placeholder="Si aplica"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dovela-report-action">Qué estabas intentando hacer</Label>
              <Input
                id="dovela-report-action"
                value={form.attemptedAction}
                onChange={(event) => updateForm('attemptedAction', event.target.value)}
                placeholder="Ej. Abrir documentos del expediente"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dovela-report-details">Detalle adicional</Label>
            <Textarea
              id="dovela-report-details"
              value={form.details}
              onChange={(event) => updateForm('details', event.target.value)}
              placeholder="Qué pasó, qué esperabas ver y si el error se repite."
              className="min-h-28"
            />
          </div>

          {submitError ? (
            <div data-dovela-report-ui="true" role="status" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}

          <div className="rounded-lg border border-border/70 bg-muted/10 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Información adjunta automáticamente</h3>
              </div>
              <Badge variant="secondary" className="rounded-full text-[10px]">Sin datos de contraseña ni token</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ContextRow label="Módulo" value={previewReport.module} />
              <ContextRow label="Ruta" value={previewReport.location?.pathname} />
              <ContextRow label="Última acción" value={snapshot.lastAction?.element?.label || snapshot.lastAction?.element?.href} />
              <ContextRow label="Error detectado" value={snapshot.lastError ? 'Sí, se adjunta al reporte' : 'No hay error automático reciente'} />
              <ContextRow label="Usuario" value={previewReport.user?.name || previewReport.user?.email || 'Usuario no identificado'} />
              <ContextRow label="Pantalla" value={previewReport.browser?.viewport} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? 'Enviando...' : 'Enviar reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DashboardTutorialDialog({ open, onOpenChange, user }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = TUTORIAL_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  const dismiss = () => {
    dismissDashboardGuide(user);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={step.icon} size={20} />
            </span>
            <div className="min-w-0">
              <DialogTitle>Guía rápida de Dovela 2.0</DialogTitle>
              <DialogDescription>
                Un recorrido breve por los bloques principales y el nuevo canal de reporte de errores.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 rounded-lg border border-border/70 bg-muted/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="rounded-full text-[10px]">
              Paso {stepIndex + 1} de {TUTORIAL_STEPS.length}
            </Badge>
            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((item, index) => (
                <span
                  key={item.title}
                  className={cn('h-1.5 w-6 rounded-full transition-colors', index === stepIndex ? 'bg-primary' : 'bg-muted-foreground/20')}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {step.bullets.map((bullet) => (
              <div key={bullet} className="rounded-md border border-border/60 bg-background/70 px-3 py-2 text-xs text-foreground">
                {bullet}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
          <Button type="button" variant="ghost" onClick={dismiss}>
            Saltar y no volver a mostrar
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={isFirst} onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            {isLast ? (
              <Button type="button" onClick={dismiss}>
                Finalizar
              </Button>
            ) : (
              <Button type="button" onClick={() => setStepIndex((prev) => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ErrorReportInlineTrigger({ context, label = 'Reportar error', size = 'sm', variant = 'outline' }) {
  const [open, setOpen] = useState(false);
  const memoContext = useMemo(() => context || {}, [context]);

  return (
    <>
      <Button type="button" size={size} variant={variant} onClick={() => setOpen(true)}>
        <Bug className="h-4 w-4" />
        {label}
      </Button>
      <ErrorReportDialog
        open={open}
        onOpenChange={setOpen}
        context={memoContext}
        source="inline-error-report"
      />
    </>
  );
}

function shouldCaptureVisibleText(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length < 12 || normalized.length > 900) return false;
  if (/reportar error|reporte de dovela|payload json|reporte no enviado|no se pudo guardar en la base de datos/i.test(normalized)) return false;
  return /error|fall[oó]|no fue posible|no se pudo|failed|exception|rechazad|inv[aá]lid/i.test(normalized);
}

function getVisibleAlertCandidate(node) {
  if (!(node instanceof HTMLElement)) return null;
  const candidate = node.matches?.('[role="alert"], .alert-danger, .text-danger, .invalid-feedback, [data-error]')
    ? node
    : node.querySelector?.('[role="alert"], .alert-danger, .text-danger, .invalid-feedback, [data-error]');
  if (!candidate) return null;
  if (candidate.closest?.('[data-dovela-report-ui="true"], [data-sonner-toaster]')) return null;
  const text = candidate.textContent || '';
  if (!shouldCaptureVisibleText(text)) return null;
  return {
    text,
    tag: candidate.tagName?.toLowerCase(),
    className: candidate.className || null,
    id: candidate.id || null,
  };
}

export function DovelaSupportLayer({ user }) {
  const location = useLocation();
  const [reportOpen, setReportOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [reportContext, setReportContext] = useState({});

  const openReportDialog = useCallback((context = {}) => {
    setReportContext(getContextSnapshot(context));
    setReportOpen(true);
  }, []);

  useEffect(() => {
    const trackAction = (event) => captureDovelaUserAction(event);
    window.addEventListener('click', trackAction, true);
    window.addEventListener('submit', trackAction, true);
    return () => {
      window.removeEventListener('click', trackAction, true);
      window.removeEventListener('submit', trackAction, true);
    };
  }, []);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const entry = captureDovelaConsoleMessage('error', args);
      captureDovelaError(entry.message, { source: 'console-error', notify: false, info: { consoleEntry: entry } });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const entry = captureDovelaConsoleMessage('warn', args);
      captureDovelaError(entry.message, { source: 'console-warn', notify: false, info: { consoleEntry: entry } });
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          const alertInfo = getVisibleAlertCandidate(node);
          if (!alertInfo) return;
          captureDovelaError(alertInfo.text, {
            source: 'visible-ui-alert',
            notify: false,
            info: alertInfo,
          });
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleWindowError = (event) => {
      captureDovelaError(event.error || event.message, {
        source: 'window-error',
        info: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event) => {
      captureDovelaError(event.reason, { source: 'unhandled-rejection' });
    };

    const handleCapturedError = (event) => {
      const detail = event.detail || {};
      if (detail.notify === false) return;
      toast.error('Dovela detectó un error', {
        description: 'Puedes enviar un reporte con el contexto capturado.',
        action: {
          label: 'Reportar error',
          onClick: () => openReportDialog({ lastError: detail }),
        },
      });
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('dovela:error-captured', handleCapturedError);
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('dovela:error-captured', handleCapturedError);
    };
  }, [openReportDialog]);

  useEffect(() => {
    if (location.pathname !== '/dashboard' || isDashboardGuideDismissed(user)) return undefined;
    const timer = window.setTimeout(() => setTutorialOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [location.pathname, user]);

  return (
    <>
      <div className="fixed bottom-8 right-3 z-40 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:right-5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTutorialOpen(true)}
          className="h-9 border-border/70 bg-background/95 px-3 shadow-lg backdrop-blur-sm"
        >
          <PlayCircle className="h-4 w-4" />
          Ver tutorial
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => openReportDialog()}
          className="h-9 px-3 shadow-lg"
        >
          <AlertTriangle className="h-4 w-4" />
          Reportar error
        </Button>
      </div>

      <DashboardTutorialDialog
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        user={user}
      />
      <ErrorReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        context={reportContext}
        source="global-floating-report"
      />
    </>
  );
}