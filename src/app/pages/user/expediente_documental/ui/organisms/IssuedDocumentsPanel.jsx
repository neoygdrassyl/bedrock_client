import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const EMPTY_VALUE = '—';
const CENTRAL_NOTE = 'La clasificación y los archivos de los documentos expedidos se integrarán desde Dovela Central.';

function formatDate(value) {
  if (!value) return EMPTY_VALUE;
  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
}

/** Read-only list of the documents issued for an expediente (CUB registry). */
export function IssuedDocumentsPanel({ rows = [], loading = false, error = '', onRetry }) {
  return (
    <section className="space-y-3" aria-labelledby="issued-documents-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="issued-documents-title" className="text-base font-semibold">Documentos expedidos</h2>
        <p className="text-xs text-muted-foreground">{CENTRAL_NOTE}</p>
      </div>

      {error ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <span>{error}</span>
          {onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>Reintentar</Button> : null}
        </div>
      ) : null}

      {loading ? <p role="status" className="text-sm text-muted-foreground">Consultando documentos expedidos…</p> : null}

      {!loading && !error && !rows.length ? (
        <EmptyState
          icon="FileOutput"
          message="No hay documentos expedidos"
          description="Este expediente aún no registra consecutivos CUB."
          className="rounded-lg border border-dashed border-border py-8"
        />
      ) : null}

      {!loading && rows.length ? (
        <div className="rounded-lg border border-border">
          <Table aria-label="Documentos expedidos">
            <TableHeader>
              <TableRow>
                <TableHead>CUB</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>VR</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id ?? `${row.cub}-${index}`}>
                  <TableCell className="whitespace-nowrap font-medium">{row.cub || EMPTY_VALUE}</TableCell>
                  <TableCell>{row.process || EMPTY_VALUE}</TableCell>
                  <TableCell className="whitespace-nowrap">{row.vr || EMPTY_VALUE}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                  <TableCell className="text-muted-foreground">{row.desc || EMPTY_VALUE}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </section>
  );
}

export default IssuedDocumentsPanel;
