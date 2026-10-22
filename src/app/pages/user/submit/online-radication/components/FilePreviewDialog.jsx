import { useEffect, useState } from 'react';
import { CircleAlert, Download, ExternalLink, FileImage, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog';
import { cn } from '@/shared/lib/utils';
import OnlineRadicationService, { isRequestCanceled } from '@/app/services/online-radication.service';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';
import { formatBytes, hasValue } from '../onlineRadicationModel';

const SMALL_BUTTON = 'h-8 gap-1.5 px-[0.75rem] text-xs [&_svg]:size-3.5';
const PREVIEWABLE = /^(?:application\/pdf|image\/(?:png|jpe?g|gif|webp))$/i;

/**
 * Loads one entry file with the session JWT and keeps its object URL for the lifetime of the
 * preview. `file`: `{ requestId, entryId, index, name, label, mimeType, byteSize }`.
 */
function useEntryFile(file, revision) {
  const [state, setState] = useState({ key: null, url: '', contentType: '', error: null });
  const key = file ? `${file.requestId}|${file.entryId}|${file.index}|${revision}` : null;

  useEffect(() => {
    if (!file) return undefined;
    const controller = new AbortController();
    let objectUrl = '';
    setState({ key, url: '', contentType: '', error: null });
    OnlineRadicationService.fetchEntryFile(file.requestId, file.entryId, file.index, { signal: controller.signal })
      .then(({ blob, contentType }) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ key, url: objectUrl, contentType, error: null });
      })
      .catch((error) => {
        if (controller.signal.aborted || isRequestCanceled(error)) return;
        setState({ key, url: '', contentType: '', error });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // `key` covers every field of `file` that changes the request.
  }, [key]);

  const current = state.key === key;
  return {
    url: current ? state.url : '',
    contentType: current ? state.contentType : '',
    error: current ? state.error : null,
    loading: Boolean(file) && (!current || (!state.url && !state.error)),
  };
}

/**
 * In-app viewer for the files of a document entry: PDF and images inline, others to download.
 * `file` stays set while closing so the header does not flash; the blob is released on close.
 */
export function FilePreviewDialog({ open, file, onOpenChange }) {
  const [revision, setRevision] = useState(0);
  const { url, contentType, error, loading } = useEntryFile(open ? file : null, revision);
  const name = file?.name || 'Documento';
  const previewable = PREVIEWABLE.test(contentType);
  const isImage = contentType.startsWith('image/');
  const meta = [file?.label, formatBytes(file?.byteSize)].filter(hasValue);
  const HeaderIcon = String(file?.mimeType || contentType).startsWith('image/') ? FileImage : FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/60"
        className={cn(ONLINE_RADICATION_SCOPE, 'flex h-[min(92vh,64rem)] max-w-[min(94vw,80rem)] flex-col gap-0 overflow-hidden p-0')}
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-[1rem] gap-y-2 border-b bg-[hsl(var(--card))] py-[0.75rem] pl-[1.25rem] pr-14">
          <div className="flex min-w-0 items-center gap-[0.75rem]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-[1px] border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
              <HeaderIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="mb-0 truncate text-sm font-semibold leading-5" title={name}>{name}</DialogTitle>
              <DialogDescription className="mb-0 truncate text-xs text-muted-foreground">
                {meta.length ? meta.join(' · ') : 'Archivo aportado desde el portal ciudadano'}
              </DialogDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {url ? (
              <Button variant="outline" size="sm" className={cn(SMALL_BUTTON, 'no-underline')} asChild>
                <a href={url} download={name}>
                  <Download aria-hidden="true" />
                  Descargar
                </a>
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" className={SMALL_BUTTON} disabled>
                <Download aria-hidden="true" />
                Descargar
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={SMALL_BUTTON}
              disabled={!url || !previewable}
              onClick={() => window.open(url, '_blank', 'noopener')}
            >
              <ExternalLink aria-hidden="true" />
              Abrir en pestaña nueva
            </Button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 bg-muted/40" aria-busy={loading || undefined}>
          {loading ? (
            <div className="absolute inset-0 grid place-items-center" role="status">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Cargando el archivo…
              </span>
            </div>
          ) : null}

          {error ? (
            <div className="grid h-full place-items-center p-6">
              <Alert variant="destructive" className="max-w-lg flex-wrap items-center">
                <CircleAlert aria-hidden="true" />
                <AlertDescription className="min-w-0 flex-1">{error.message}</AlertDescription>
                <Button type="button" variant="outline" size="sm" className={cn(SMALL_BUTTON, 'bg-background')} onClick={() => setRevision((value) => value + 1)}>
                  <RefreshCw aria-hidden="true" />
                  Reintentar
                </Button>
              </Alert>
            </div>
          ) : null}

          {url && previewable && !isImage ? (
            <iframe src={url} title={`Vista previa de ${name}`} className="h-full w-full border-0 bg-background" />
          ) : null}

          {url && previewable && isImage ? (
            <div className="h-full overflow-auto p-6">
              <img src={url} alt={file?.label ? `${file.label}: ${name}` : name} className="mx-auto block h-auto max-w-full rounded-md bg-background shadow-sm" />
            </div>
          ) : null}

          {url && !previewable ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <p className="mb-0 max-w-sm text-sm text-muted-foreground">
                Este tipo de archivo ({contentType || 'desconocido'}) no se puede previsualizar. Descárguelo para revisarlo.
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
