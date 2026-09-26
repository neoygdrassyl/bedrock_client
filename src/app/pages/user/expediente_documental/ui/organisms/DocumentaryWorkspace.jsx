import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDocumentaryView } from '../../hooks/useDocumentaryView';
import { documentaryError, downloadDocumentarySource } from '../../../../../services/documentary.service';

const display = (value) => value == null || value === '' ? 'Sin dato' : value;
const statuses = { candidate: 'Candidato', ambiguous: 'Ambiguo', unmatched: 'Sin correspondencia' };
const media = { physical: 'Físico', digital: 'Digital', scan: 'Escaneado', unknown: 'Origen desconocido' };
const receipts = { 'receipt-indicated': 'Recepción indicada en registro', 'listed-only': 'Listado, sin recepción indicada', 'file-recorded': 'Archivo registrado, no verificado' };

function SourceRow({ row, warnings }) {
  const [fileError, setFileError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const source = row.sources[0];
  const download = async () => {
    setFileError('');
    setDownloading(true);
    try { await downloadDocumentarySource(source); }
    catch (error) { setFileError(error?.response?.status === 404 ? 'El archivo registrado no está disponible (404). El registro histórico se conserva.' : documentaryError(error)); }
    finally { setDownloading(false); }
  };
  return (
    <TableRow>
      <TableCell className="align-top whitespace-normal">
        <p className="font-mono text-xs">{source.table} #{source.id}{source.itemIndex === null ? '' : ` · posición ${source.itemIndex}`}</p>
        <p className="text-xs text-muted-foreground">{media[source.medium]} · origen {source.originEvidence === 'explicit' ? 'declarado' : 'inferido'}</p>
        <p className="text-xs">VR: {display(source.vrLabel)}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-primary focus-visible:outline focus-visible:outline-2">Procedencia y advertencias ({warnings.length})</summary>
          <p className="mt-2 break-all font-mono text-xs">SHA-256 del registro: {source.sourceSnapshotHash}</p>
          <p className="text-xs text-muted-foreground">Huella de metadatos y origen; no del contenido del archivo.</p>
          <ul className="mt-2 space-y-1 text-xs">
            {warnings.map((warning, index) => <li key={`${warning.code}:${index}`}><strong>{warning.code}</strong>: {warning.message}</li>)}
            {row.correlation.reasons.map((reason, index) => <li key={`reason:${index}`}><strong>{reason.code}</strong>: {reason.message}</li>)}
          </ul>
          <pre className="mt-2 max-h-64 max-w-sm overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">{JSON.stringify({ raw: source.raw, parent: source.parent, correlation: row.correlation }, null, 2)}</pre>
        </details>
      </TableCell>
      <TableCell className="max-w-sm align-top whitespace-normal">
        <p className="font-mono text-xs whitespace-pre-wrap">{display(row.historical.code)}</p>
        <p className="font-medium whitespace-pre-wrap">{display(row.historical.title)}</p>
        {row.historical.listTitle !== null ? <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">Lista: {display(row.historical.listTitle)}</p> : null}
      </TableCell>
      <TableCell className="max-w-sm align-top whitespace-normal">
        <Badge variant="outline">{statuses[row.correlation.status]}</Badge>
        {row.correlation.targets.map((target) => (
          <div key={target.catalogueId} className="mt-2">
            <p className="font-medium">{target.code} · {target.name}</p>
            <p className="text-xs text-muted-foreground">Destino propuesto #{target.catalogueId} · configuración {target.configurationId}</p>
          </div>
        ))}
        {row.controls.length ? <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-primary">Controles propuestos ({row.controls.length}) · sin evaluación</summary>
          {row.controls.map((control) => <p key={`${control.targetCatalogueId}:${control.sourceControlId}`} className="mt-1">{control.title} · revisión {control.revision} · catálogo #{control.targetCatalogueId}</p>)}
        </details> : <p className="mt-2 text-xs text-muted-foreground">Sin controles disponibles para esta fila.</p>}
      </TableCell>
      <TableCell className="align-top whitespace-normal">
        <p className="text-xs">{receipts[source.receipt.status]}</p>
        <p className="mt-1 text-xs">Páginas históricas: <span className="font-mono whitespace-pre-wrap">{display(row.historical.pagesRaw)}</span></p>
        {row.historical.reviewRaw !== null ? <p className="text-xs">Indicador histórico: {display(row.historical.reviewRaw)} (no es aprobación)</p> : null}
        {row.actions.download ? <Button type="button" variant="outline" size="sm" className="mt-2" disabled={downloading} onClick={download}>{downloading ? 'Descargando…' : 'Descargar archivo histórico'}</Button> : <p className="mt-2 text-xs text-muted-foreground">Sin descarga disponible.</p>}
        {fileError ? <p role="alert" className="mt-2 text-xs text-destructive">{fileError}</p> : null}
      </TableCell>
    </TableRow>
  );
}

function PreviewContent({ view }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(view.rows.length / 25));
  const counts = view.counts;
  const warningGroups = new Map();
  view.warnings.forEach((warning) => {
    const group = warningGroups.get(warning.code) || { message: warning.message, count: 0 };
    group.count += 1;
    warningGroups.set(warning.code, group);
  });
  return (
    <div className="space-y-4">
      <p className="text-sm">Expediente {display(view.project.idPublic)} · FUN interno <span className="font-mono">{view.project.fun0Id}</span></p>
      {!view.configuration ? <p role="status" className="rounded-md border border-border bg-muted p-3 text-sm">Sin configuración objetivo: se muestran los registros históricos sin proponer correspondencias.</p>
        : <p className="text-xs text-muted-foreground">Configuración {view.configuration.id} · versión {view.configuration.releaseVersion} · {view.configuration.schemaVersion}. Selección temporal de consulta.</p>}
      <div className="flex flex-wrap gap-2">
        {[
          ['Físicos listados', counts.physicalItems], ['Digitales', counts.digitalItems], ['Anexos', counts.attachmentItems],
          ['Sin recepción', counts.listedOnlyItems], ['Candidatos', counts.candidate], ['Ambiguos', counts.ambiguous],
          ['Sin correspondencia', counts.unmatched], ['Exactos demostrados', counts['exact-explicit']],
        ].map(([label, value]) => <Badge key={label} variant="outline">{label}: <span className="ml-1 font-mono">{value}</span></Badge>)}
      </div>
      <p className="text-xs text-muted-foreground">Registros fuente: {counts.sourceRecords.subLists} listas · {counts.sourceRecords.fun6} digitales · {counts.sourceRecords.subDocs} anexos. Páginas: {counts.physicalPages} físicas / {counts.digitalPages} digitales / {counts.attachmentPages} anexos. Los totales no eliminan duplicados ni equivalencias con escaneos.</p>
      <details className="rounded-md border border-border p-3" open={view.warnings.some((warning) => warning.rowKeys.length === 0)}>
        <summary className="cursor-pointer text-sm font-medium">Advertencias ({counts.warningCount})</summary>
        <ul className="mt-2 space-y-2 text-xs">
          {Array.from(warningGroups, ([code, group]) => <li key={code}><strong>{code}</strong> ({group.count}): {group.message}</li>)}
        </ul>
      </details>
      {view.rows.length ? <>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Fuente y procedencia</TableHead><TableHead>Título histórico</TableHead>
            <TableHead>Catálogo propuesto / correlación</TableHead><TableHead>Recepción y evidencia</TableHead>
          </TableRow></TableHeader>
          <TableBody>{view.rows.slice((page - 1) * 25, page * 25).map((row) => <SourceRow key={row.rowKey} row={row} warnings={view.warnings.filter((warning) => warning.rowKeys.includes(row.rowKey))} />)}</TableBody>
        </Table>
        <nav aria-label="Paginación de fuentes históricas" className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-xs" aria-live="polite">Página {page} de {totalPages} · {counts.visibleRows} filas</span>
          <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</Button>
        </nav>
      </> : <p role="status" className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">Este expediente no tiene fuentes documentales históricas asociadas.</p>}
      <details className="rounded-md border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">Requisitos de la configuración objetivo ({view.requirements.documents.length})</summary>
        <p className="mt-2 text-xs text-muted-foreground">La propuesta de requisitos no acredita recepción ni crea documentos del expediente.</p>
        {!view.requirements.documents.length ? <p className="mt-2 text-xs">Sin requisitos resueltos. Consulte las advertencias.</p> : <ul className="mt-2 space-y-1 text-xs">
          {view.requirements.documents.map((item) => <li key={item.sourceDocumentId}>{item.code} · {item.name} · {item.required ? 'Requerido' : 'Complementario'}</li>)}
        </ul>}
        {view.requirements.warnings.map((warning, index) => <p key={index} className="mt-2 text-xs">{warning.code}: {warning.message}</p>)}
      </details>
    </div>
  );
}

export function DocumentaryWorkspace({ fun0Id }) {
  const state = useDocumentaryView(fun0Id);
  return (
    <section aria-labelledby="documentary-preview-title" className="space-y-4">
      <Card className="shadow-none">
        <CardHeader className="p-4">
          <CardTitle id="documentary-preview-title" className="flex flex-wrap items-center gap-2 text-base">Vista previa del modelo nuevo <Badge variant="secondary">Solo lectura</Badge></CardTitle>
          <p className="text-xs text-muted-foreground">Cada fuente conserva su identidad. Esta consulta no vincula el expediente, no recibe documentos y no aprueba controles.</p>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full space-y-1 sm:w-96">
              <Label htmlFor="documentary-preview-configuration">Configuración objetivo</Label>
              <Select value={state.configurationId || 'none'} onValueChange={(value) => state.setConfigurationId(value === 'none' ? '' : value)} disabled={state.inventory.loading}>
                <SelectTrigger id="documentary-preview-configuration"><SelectValue placeholder="Sin configuración objetivo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin configuración objetivo</SelectItem>
                  {state.inventory.configurations.map((configuration) => <SelectItem key={configuration.id} value={String(configuration.id)}>Configuración {configuration.id} · versión {configuration.releaseVersion} · {configuration.schemaVersion}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" disabled={state.loading || state.inventory.loading} onClick={state.refresh}>Actualizar consulta</Button>
          </div>
          {state.inventory.loading ? <p role="status" className="text-xs">Consultando configuraciones…</p> : null}
          {state.inventory.error ? <p role="alert" className="text-sm text-destructive">{state.inventory.error}</p> : null}
          {!state.inventory.loading && !state.inventory.error && !state.inventory.configurations.length ? <p role="status" className="text-sm">No hay configuraciones habilitadas para comparar.</p> : null}
        </CardContent>
      </Card>
      {state.loading ? <p role="status" className="p-4 text-sm text-muted-foreground">Leyendo fuentes históricas…</p> : null}
      {state.error ? <p role="alert" className="rounded-md border border-destructive/30 p-4 text-sm text-destructive">{state.error}</p> : null}
      {state.view ? <PreviewContent key={state.key} view={state.view} /> : null}
    </section>
  );
}
