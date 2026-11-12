import { BookCheck, BookOpen, CircleAlert, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

function pendingActivation(origin) {
  return Array.isArray(origin.warnings) ? origin.warnings.find((warning) => warning && warning.code === 'CENTRAL_ACTIVATION_PENDING') : null;
}

function originLabel(origin, { compact = false } = {}) {
  if (origin.publication) return `Documentación según el catálogo documental (versión ${origin.publication.releaseVersion})`;
  if (origin.mode === 'unlinked') return 'Entrada sin expediente de licencias vinculado · documentación tradicional';
  return compact ? 'Documentación tradicional' : 'Documentación tradicional del expediente';
}

function pendingMessage(pending) {
  return `Radicado desde el portal con la publicación de Central ${pending.releaseVersion != null ? `versión ${pending.releaseVersion}` : 'registrada'}${pending.releaseId ? ` (${pending.releaseId})` : ''}, pendiente de activación. Mientras tanto se gestiona como documentación tradicional.`;
}

function captionLabel(origin) {
  if (origin.publication) return `Catálogo v${origin.publication.releaseVersion}`;
  if (origin.mode === 'unlinked') return 'Sin expediente vinculado';
  return 'Documentación tradicional';
}

/**
 * Compact origin chip that sits at the end of the module tab bar. The radicado is already in
 * the expediente header, so only the documentary origin shows here (full sentence in `title`).
 * Load state shows a short skeleton and query errors render nothing here (see OriginNotices).
 */
export function OriginCaption({ origin, error, className }) {
  if (error) return null;
  if (!origin) {
    return (
      <div className={`flex items-center gap-2 ${className || ''}`.trim()}>
        <Skeleton className="h-3.5 w-24" aria-hidden="true" />
        <p role="status" className="sr-only">Consultando la configuración del expediente…</p>
      </div>
    );
  }
  const canonical = Boolean(origin.publication);
  return (
    <p
      className={`mb-0 inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground ${className || ''}`.trim()}
      title={originLabel(origin)}
    >
      {canonical
        ? <BookCheck className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--primary))]" aria-hidden="true" />
        : <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{captionLabel(origin)}</span>
    </p>
  );
}

/** Blocking error (with retry) and the pending Central activation notice. */
export function OriginNotices({ origin, error, refresh }) {
  if (error) {
    return (
      <Alert variant="destructive" className="flex-wrap items-center">
        <CircleAlert aria-hidden="true" />
        <AlertDescription className="min-w-0 flex-1">{error}</AlertDescription>
        <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={refresh}>Reintentar</Button>
      </Alert>
    );
  }
  const pending = origin && !origin.publication ? pendingActivation(origin) : null;
  if (!pending) return null;
  return (
    <Alert role="note" variant="warning" className="py-2">
      <Clock aria-hidden="true" />
      <AlertDescription className="min-w-0 flex-1 text-xs">{pendingMessage(pending)}</AlertDescription>
    </Alert>
  );
}

/**
 * Caption of the documentary module: radicado and documentary origin, plus the pending
 * Central activation notice. Loading and query errors use the module's skeleton and alert.
 * Standalone screens (VR manager) use this block; the document tabs place the caption
 * and the notices separately.
 */
export function DocumentaryOriginStatus({ origin, error, refresh, currentPublic }) {
  if (error) return <OriginNotices origin={origin} error={error} refresh={refresh} />;
  if (!origin) return <OriginCaption origin={origin} />;
  const pending = origin.publication ? null : pendingActivation(origin);
  const radicado = currentPublic || origin.project?.idPublic;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {radicado ? <><span className="font-mono text-foreground/80">{radicado}</span><span className="text-muted-foreground/50" aria-hidden="true">/</span></> : null}
        <span>{originLabel(origin)}</span>
      </p>
      {pending ? <OriginNotices origin={origin} error="" refresh={refresh} /> : null}
    </div>
  );
}
