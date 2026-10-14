import { CircleAlert, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function pendingActivation(origin) {
  return Array.isArray(origin.warnings) ? origin.warnings.find((warning) => warning && warning.code === 'CENTRAL_ACTIVATION_PENDING') : null;
}

function originLabel(origin) {
  if (origin.publication) return `Documentación según el catálogo documental (versión ${origin.publication.releaseVersion})`;
  return origin.mode === 'unlinked' ? 'Entrada sin expediente de licencias vinculado · documentación tradicional' : 'Documentación tradicional del expediente';
}

/**
 * Caption of the documentary module: radicado and documentary origin, plus the pending
 * Central activation notice. Loading and query errors use the module's skeleton and alert.
 */
export function DocumentaryOriginStatus({ origin, error, refresh, currentPublic }) {
  if (error) {
    return (
      <Alert variant="destructive" className="flex-wrap items-center">
        <CircleAlert aria-hidden="true" />
        <AlertDescription className="min-w-0 flex-1">{error}</AlertDescription>
        <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={refresh}>Reintentar</Button>
      </Alert>
    );
  }
  if (!origin) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-24" aria-hidden="true" />
        <p role="status" className="mb-0 text-xs text-muted-foreground">Consultando la configuración del expediente…</p>
      </div>
    );
  }
  const pending = origin.publication ? null : pendingActivation(origin);
  const radicado = currentPublic || origin.project?.idPublic;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="mb-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {radicado ? <><span className="font-mono text-foreground/80">{radicado}</span><span className="text-muted-foreground/50" aria-hidden="true">/</span></> : null}
        <span>{originLabel(origin)}</span>
      </p>
      {pending ? (
        <Alert role="note" variant="warning" className="py-2">
          <Clock aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1 text-xs">
            {`Radicado desde el portal con la publicación de Central ${pending.releaseVersion != null ? `versión ${pending.releaseVersion}` : 'registrada'}${pending.releaseId ? ` (${pending.releaseId})` : ''}, pendiente de activación. Mientras tanto se gestiona como documentación tradicional.`}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
