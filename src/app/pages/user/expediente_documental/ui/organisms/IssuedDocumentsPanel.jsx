import { CircleAlert, FileOutput } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { displayValue, formatDocumentaryDate } from '../../canonicalDocumentaryModel';
import { DetailPill } from '../molecules/DetailSection';

const SCOPE_NOTE = 'Por ahora se muestran los consecutivos de salida (CUB). Los archivos de cada documento se agregarán más adelante.';
const HEAD_CLASS = 'h-9 whitespace-nowrap px-[1rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';
const COLUMNS = ['CUB', 'Proceso', 'VR', 'Fecha', 'Descripción'];

// CUB dates are calendar days; a time component is ignored.
function formatIssuedDate(value) {
  const text = displayValue(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? formatDocumentaryDate(text.slice(0, 10)) : text;
}

function LoadingRows() {
  return (
    <div className="flex flex-col gap-2 p-[1rem]" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex items-center gap-[1rem]">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/** Read-only list of the documents issued for an expediente (CUB registry). */
export function IssuedDocumentsPanel({ rows = [], loading = false, error = '', onRetry }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm" aria-labelledby="issued-documents-title">
      <header className="flex flex-wrap items-start justify-between gap-x-[1rem] gap-y-2 border-b bg-muted/30 px-[1rem] py-[0.75rem]">
        <div className="flex min-w-0 items-start gap-[0.75rem]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
            <FileOutput className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="issued-documents-title" className="mb-0 text-[15px] font-semibold leading-5 text-foreground">Documentos expedidos</h2>
            <p className="mb-0 mt-0.5 text-xs leading-4 text-muted-foreground">{SCOPE_NOTE}</p>
          </div>
        </div>
        {!loading && !error ? <DetailPill>{rows.length} {rows.length === 1 ? 'consecutivo' : 'consecutivos'}</DetailPill> : null}
      </header>

      {error ? (
        <div className="p-[1rem]">
          <Alert variant="destructive" className="flex-wrap items-center">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="min-w-0 flex-1">{error}</AlertDescription>
            {onRetry ? <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={onRetry}>Reintentar</Button> : null}
          </Alert>
        </div>
      ) : null}

      {loading ? (
        <>
          <p role="status" className="sr-only">Consultando documentos expedidos…</p>
          <LoadingRows />
        </>
      ) : null}

      {!loading && !error && !rows.length ? (
        <EmptyState
          icon="FileOutput"
          message="Aún no hay documentos expedidos para este expediente."
          description="Los consecutivos CUB del expediente aparecerán aquí cuando se expidan."
          className="py-10"
        />
      ) : null}

      {!loading && rows.length ? (
        <Table aria-label="Documentos expedidos">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {COLUMNS.map((column) => <TableHead key={column} scope="col" className={HEAD_CLASS}>{column}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `${row.cub}-${index}`} className="border-border/60">
                <TableCell className="whitespace-nowrap px-[1rem] py-2.5 font-mono text-xs font-semibold text-foreground">{displayValue(row.cub)}</TableCell>
                <TableCell className="px-[1rem] py-2.5 text-sm">{displayValue(row.process)}</TableCell>
                <TableCell className="whitespace-nowrap px-[1rem] py-2.5 font-mono text-xs">{displayValue(row.vr)}</TableCell>
                <TableCell className="whitespace-nowrap px-[1rem] py-2.5 text-sm tabular-nums">{formatIssuedDate(row.date)}</TableCell>
                <TableCell className="min-w-[14rem] px-[1rem] py-2.5 text-sm text-foreground">{displayValue(row.desc)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </section>
  );
}

export default IssuedDocumentsPanel;
