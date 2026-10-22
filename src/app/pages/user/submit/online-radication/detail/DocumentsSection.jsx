import { Eye, FileImage, FileText, Info, Paperclip } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { DovelaBadge } from '@/shared/dovela-ui';
import { Button } from '@/shared/ui/button';
import { buildDocumentRows, buildEntryFileIndex, getDocumentEntries, hasValue, plural } from '../onlineRadicationModel';
import { CountPill, DetailCard, EmptyNote } from './DetailPrimitives';

const VIEW_BUTTON = 'h-8 shrink-0 self-center gap-1.5 px-2.5 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-primary/10 hover:text-[hsl(var(--primary))] [&_svg]:size-3.5';

/** Note under the list: where the files live, depending on what the portal has transferred. */
function filesNote({ hasFiles, entries, linked, total }) {
  if (!hasFiles) return null;
  if (!entries) return 'Este servidor aún no recibe los archivos del portal: solo se muestran sus datos.';
  if (!entries.length) return 'El portal aún no ha enviado los archivos de esta solicitud. Aparecerán en «Entradas de documentos» cuando lleguen.';
  if (linked < total) return 'Algunos archivos no están en las entradas recibidas del portal; solo se muestran sus datos.';
  return null;
}

function RequiredBadge({ required }) {
  return required
    ? <DovelaBadge tone="info">Obligatorio</DovelaBadge>
    : <DovelaBadge tone="outline">Opcional</DovelaBadge>;
}

function DocumentRow({ row, file, onView }) {
  const meta = [row.fileName, row.size].filter(hasValue);
  const Icon = String(row.mimeType || '').startsWith('image/') ? FileImage : FileText;
  return (
    <li className="flex items-start gap-[0.75rem] py-2.5 first:pt-0 last:pb-0">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-[0.75rem] gap-y-1">
          <p className="mb-0 min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">{row.label}</p>
          <RequiredBadge required={row.required} />
        </div>
        <p className="mb-0 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs leading-5 text-muted-foreground">
          {row.code ? <span className="font-mono">{row.code}</span> : null}
          {meta.map((value) => (
            <span key={value} className="inline-flex min-w-0 items-center gap-1.5">
              <span aria-hidden="true">·</span>
              <span className="break-all">{value}</span>
            </span>
          ))}
        </p>
      </div>
      {file ? (
        <Button type="button" variant="ghost" size="sm" onClick={onView} aria-label={`Ver ${row.fileName || row.label}`} className={VIEW_BUTTON}>
          <Eye aria-hidden="true" />
          Ver
        </Button>
      ) : null}
    </li>
  );
}

/**
 * Documentos aportados and requirements without a file. Each document opens its file from the
 * document entries (matched by sha256) once the portal has transferred it.
 */
export function DocumentsSection({ item, onViewFile }) {
  const { hasFiles, rows, missing } = buildDocumentRows(item);
  const entries = getDocumentEntries(item);
  const fileIndex = buildEntryFileIndex(item);
  const fileFor = (row) => (row.sha256 ? fileIndex.get(row.sha256) : null);
  const linked = rows.filter(fileFor).length;
  const note = filesNote({ hasFiles, entries, linked, total: rows.length });
  const title = hasFiles ? 'Documentos aportados' : 'Requisitos evaluados';
  return (
    <DetailCard
      icon={Paperclip}
      title={title}
      aside={<CountPill label={plural(rows.length, 'documento')}>{rows.length}</CountPill>}
      contentClassName="flex flex-col gap-[0.875rem]"
    >
      {rows.length ? (
        <ul className="mb-0 list-none divide-y divide-border/70 p-0" aria-label={title}>
          {rows.map((row) => {
            const file = fileFor(row);
            return (
              <DocumentRow
                key={row.key}
                row={row}
                file={file}
                onView={() => onViewFile?.({
                  requestId: item.id,
                  entryId: file.entryId,
                  index: file.index,
                  name: file.originalName || row.fileName,
                  label: row.label,
                  mimeType: file.mimeType || row.mimeType,
                  byteSize: file.byteSize ?? null,
                })}
              />
            );
          })}
        </ul>
      ) : <EmptyNote>{hasFiles ? 'La solicitud no trae archivos.' : 'La solicitud no trae requisitos evaluados.'}</EmptyNote>}

      {missing.length ? (
        <div className="rounded-lg border-[1px] border-dashed px-[0.875rem] py-2.5">
          <p className="mb-1 text-xs font-semibold text-foreground">Requisitos obligatorios sin archivo en el portal</p>
          <ul className="mb-0 list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
            {missing.map((doc) => <li key={doc.key}>{doc.label} <span className="font-mono">({doc.code})</span></li>)}
          </ul>
        </div>
      ) : null}

      {note ? (
        <Alert variant="neutral" role="note" className="py-2.5">
          <Info aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1 text-[13px]">{note}</AlertDescription>
        </Alert>
      ) : null}
    </DetailCard>
  );
}
