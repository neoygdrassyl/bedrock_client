import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

function pendingActivation(origin) {
  return Array.isArray(origin.warnings) ? origin.warnings.find((warning) => warning && warning.code === 'CENTRAL_ACTIVATION_PENDING') : null;
}

export function DocumentaryOriginStatus({ origin, error, refresh }) {
  if (error) return <div role="alert" className="space-y-2 rounded-md border border-destructive p-3 text-sm"><p>{error}</p><Button type="button" variant="outline" onClick={refresh}>Reintentar</Button></div>;
  if (!origin) return <p role="status" className="p-3 text-sm text-muted-foreground">Consultando la configuración del expediente…</p>;
  const pending = origin.publication ? null : pendingActivation(origin);
  return <div className="space-y-1">
    <p className="m-0 flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground"><FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>{origin.publication
      ? `Documentación según el catálogo documental (versión ${origin.publication.releaseVersion})`
      : origin.mode === 'unlinked' ? 'Entrada sin expediente de licencias vinculado · documentación tradicional'
        : 'Documentación tradicional del expediente'}</span></p>
    {pending ? <p role="note" className="m-0 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
      {`Radicado desde el portal con la publicación de Central ${pending.releaseVersion != null ? `versión ${pending.releaseVersion}` : 'registrada'}${pending.releaseId ? ` (${pending.releaseId})` : ''}, pendiente de activación. Mientras tanto se gestiona como documentación tradicional.`}
    </p> : null}
  </div>;
}
