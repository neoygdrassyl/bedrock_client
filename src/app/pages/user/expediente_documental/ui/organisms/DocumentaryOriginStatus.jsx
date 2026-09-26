import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function DocumentaryOriginStatus({ origin, error, refresh }) {
  if (error) return <div role="alert" className="space-y-2 rounded-md border border-destructive p-3 text-sm"><p>{error}</p><Button type="button" variant="outline" onClick={refresh}>Reintentar</Button></div>;
  if (!origin) return <p role="status" className="p-3 text-sm text-muted-foreground">Consultando la configuración del expediente…</p>;
  return <p className="m-0 flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground"><FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>{origin.publication
    ? `Expediente ${origin.project.idPublic} · Dovela Central · publicación ${origin.publication.releaseVersion}`
    : origin.mode === 'central-pending' ? 'Este expediente tiene origen en Central y está pendiente de vincular su publicación.'
      : origin.mode === 'unlinked' ? 'Entrada sin expediente de licencias vinculado · documentación tradicional'
        : 'Documentación tradicional del expediente'}</span></p>;
}
export function PublishedDocumentCatalogue({ origin }) {
  const classifications = new Map((origin.catalogue?.classifications || []).map((item) => [item.id, item]));
  return <section className="space-y-3 p-3">
    <p role="status" className="text-sm text-muted-foreground">Este expediente conserva su integración anterior y sus registros. Su catálogo proviene de esta publicación fija de Central; el traslado de su recepción al nuevo modelo sigue pendiente.</p>
    <h3 className="text-sm font-semibold">Catálogo de la publicación asignada</h3>
    <ul className="divide-y divide-border">{(origin.catalogue?.documents || []).map((item) => <li key={item.sourceDocumentId} className="py-2 text-sm">
      <p>{item.code} · {item.name}</p><p className="text-xs text-muted-foreground">Lista: {item.listKey || 'Sin lista publicada'} · {(item.classificationIds || []).map((id) => classifications.get(id)?.name).filter(Boolean).join(' · ') || 'Sin clasificación publicada'}</p>
    </li>)}</ul>
  </section>;
}
