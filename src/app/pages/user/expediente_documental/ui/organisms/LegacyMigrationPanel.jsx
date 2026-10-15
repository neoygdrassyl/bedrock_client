import { useId, useState } from 'react';
import { ArrowRightLeft, CircleAlert, CircleCheck, Info, SearchCheck, TriangleAlert } from 'lucide-react';
import FunUpdateSectionLegend from '@/app/pages/user/fun_forms/components/FunUpdateSectionLegend.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLegacyMigration } from '../../hooks/useLegacyMigration';
import {
  CHECKLIST_STATUS_LABELS, CLASS_LABELS, EXCLUDE_VALUE, FILE_STATUS_LABELS, deliveryMedium, groupIssues, pendingDigitalFiles, releaseLabel, summaryFacts,
} from '../../legacyMigrationModel';
import { DOCUMENTAL_SCOPE } from '../documentalScope';

const SEVERITY_STYLE = {
  blocking: { variant: 'destructive', icon: CircleAlert },
  warning: { variant: 'warning', icon: TriangleAlert },
};

function SummaryFacts({ preview }) {
  return (
    <dl className="m-0 grid gap-[0.75rem] sm:grid-cols-2 xl:grid-cols-4">
      {summaryFacts(preview).map((fact) => (
        <div key={fact.key} className="min-w-0 rounded-lg border bg-muted/20 px-[0.75rem] py-2">
          <dt className="text-xs font-medium text-muted-foreground">{fact.label}</dt>
          <dd className="mb-0 text-lg font-semibold leading-6 text-foreground tabular-nums">{fact.value}</dd>
          {fact.hint ? <dd className="mb-0 text-[11px] leading-4 text-muted-foreground">{fact.hint}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

function IssueGroups({ issues }) {
  const groups = groupIssues(issues);
  if (!groups.length) return <Alert variant="success" className="py-2.5"><CircleCheck aria-hidden="true" /><AlertDescription>Sin incidencias.</AlertDescription></Alert>;
  return groups.map((group) => {
    const style = SEVERITY_STYLE[group.severity];
    return (
      <Alert key={group.severity} variant={style.variant} role={group.severity === 'blocking' ? 'alert' : 'status'} className="py-2.5">
        <style.icon aria-hidden="true" />
        <AlertDescription className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-semibold">{group.label}</p>
          <ul className="mb-0 space-y-0.5 pl-4 text-xs">
            {group.entries.map((entry) => <li key={entry.code}><span className="font-medium">{entry.label}</span> · {entry.count}</li>)}
          </ul>
        </AlertDescription>
      </Alert>
    );
  });
}

function DigitalResolutions({ preview, choices, onChoose, disabled }) {
  const files = pendingDigitalFiles(preview);
  if (!files.length) return null;
  return (
    <section aria-label="Archivos digitales sin VR" className="flex min-w-0 flex-col gap-2">
      <h4 className="mb-0 text-sm font-semibold text-foreground">Archivos digitales sin VR</h4>
      <p className="mb-0 text-xs text-muted-foreground">Asigne cada archivo a una ventanilla del expediente o exclúyalo; luego vuelva a analizar.</p>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Archivo</TableHead><TableHead>Código</TableHead><TableHead>Registrado</TableHead><TableHead className="w-[16rem]">Decisión</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="max-w-[22rem] truncate text-xs" title={file.originalName || ''}>{file.description || file.originalName || `Archivo ${file.id}`}</TableCell>
              <TableCell className="font-mono text-xs">{file.code || 'Sin código'}</TableCell>
              <TableCell className="text-xs">{file.createdAt ? file.createdAt.slice(0, 10) : 'Sin fecha'}</TableCell>
              <TableCell>
                <Select value={choices[file.id] || ''} onValueChange={(value) => onChoose(file.id, value)} disabled={disabled}>
                  <SelectTrigger aria-label={`Decisión para el archivo ${file.id}`} className="h-8 text-xs"><SelectValue placeholder="Elegir…" /></SelectTrigger>
                  <SelectContent>
                    {preview.vrs.map((vr) => <SelectItem key={vr.submitId} value={String(vr.submitId)}>{`Asignar a ${vr.vrLabel}${vr.date ? ` (${vr.date})` : ''}`}</SelectItem>)}
                    <SelectItem value={EXCLUDE_VALUE}>Excluir de la migración</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function DeliveriesTable({ preview }) {
  const rows = preview.deliveries;
  return (
    <details className="min-w-0 rounded-lg border">
      <summary className="cursor-pointer px-[0.75rem] py-2 text-sm font-semibold text-foreground">Entregas que se importarán ({preview.stats.deliveries})</summary>
      <div className="max-h-[28rem] overflow-auto border-t">
        <Table>
          <TableHeader>
            <TableRow><TableHead>VR</TableHead><TableHead>Código</TableHead><TableHead>Documento</TableHead><TableHead>Tipo</TableHead><TableHead>Versión</TableHead><TableHead>Soporte</TableHead><TableHead>Estado</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.legacyKey} className={cn(row.status !== 'import' && 'opacity-60')}>
                <TableCell className="whitespace-nowrap font-mono text-xs">{row.vrLabel}</TableCell>
                <TableCell className="font-mono text-xs">{row.documentCode || row.legacyCode || '—'}</TableCell>
                <TableCell className="max-w-[24rem] text-xs">{row.instanceLabel || row.title}</TableCell>
                <TableCell><Badge variant={row.documentClass === 'requirement' ? 'secondary' : 'outline'}>{CLASS_LABELS[row.documentClass] || row.documentClass}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-xs tabular-nums">{row.versionSequence ? `${row.versionSequence} de ${row.versionCount}${row.isCurrent ? ' · vigente' : ''}` : '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-xs">{deliveryMedium(row)}</TableCell>
                <TableCell className="text-xs">{row.status === 'import' ? 'Importar' : row.status === 'merged' ? 'Unida (repetida)' : 'Excluida'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </details>
  );
}

function FilesAndChecklist({ preview }) {
  const statuses = preview.files.reduce((acc, file) => Object.assign(acc, { [file.status]: (acc[file.status] || 0) + 1 }), {});
  const checklist = preview.stats.checklist;
  return (
    <div className="grid gap-[0.75rem] lg:grid-cols-2">
      <div className="rounded-lg border px-[0.75rem] py-2">
        <h4 className="mb-1 text-sm font-semibold text-foreground">Archivos</h4>
        <ul className="mb-0 space-y-0.5 pl-4 text-xs text-muted-foreground">
          {Object.keys(statuses).map((status) => <li key={status}>{FILE_STATUS_LABELS[status] || status}: {statuses[status]}</li>)}
          <li>Se conservan las rutas de almacenamiento actuales; los archivos no se copian.</li>
        </ul>
      </div>
      <div className="rounded-lg border px-[0.75rem] py-2">
        <h4 className="mb-1 text-sm font-semibold text-foreground">Lista de chequeo antigua frente a Central</h4>
        {checklist ? (
          <ul className="mb-0 space-y-0.5 pl-4 text-xs text-muted-foreground">
            {['consistent', 'mismatch', 'missing', 'not_applicable'].map((status) => <li key={status}>{CHECKLIST_STATUS_LABELS[status]}: {checklist[status === 'not_applicable' ? 'notApplicable' : status]}</li>)}
            <li>La lista de chequeo antigua no se importa; solo se compara.</li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, onOpenChange, preview, busy, onConfirm }) {
  const reasonId = useId();
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!busy) onOpenChange(value); }}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-lg')}>
        <DialogHeader>
          <DialogTitle>Migrar el expediente al modelo nuevo</DialogTitle>
          <DialogDescription>
            Se fijará la {releaseLabel(preview.release)} y se importarán {preview.stats.deliveries} entregas de {preview.stats.vrs} VR. La operación es atómica y no modifica las tablas antiguas.
          </DialogDescription>
        </DialogHeader>
        <form id={`${reasonId}-form`} onSubmit={(event) => { event.preventDefault(); if (reason.trim()) onConfirm(reason); }} className="flex flex-col gap-1.5">
          <label htmlFor={reasonId} className="text-sm font-medium text-foreground">Motivo de la migración</label>
          <Textarea id={reasonId} value={reason} maxLength={1000} required rows={3} onChange={(event) => setReason(event.target.value)} disabled={busy} />
          <p className="mb-0 text-xs text-muted-foreground">Queda registrado en el historial documental del expediente.</p>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
          <Button type="submit" form={`${reasonId}-form`} disabled={busy || !reason.trim()}>{busy ? 'Migrando…' : 'Migrar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "Migrar al modelo nuevo": analysis, resolutions and atomic migration of a legacy expediente. */
export function LegacyMigrationPanel({ fun0Id, onMigrated = () => {} }) {
  const titleId = useId();
  const migration = useLegacyMigration(fun0Id);
  const [confirming, setConfirming] = useState(false);
  const { preview } = migration;
  const options = preview?.releaseOptions || [];
  const canMigrate = Boolean(preview) && !preview.blocking && !migration.resolutionsChanged && !migration.loading;

  async function confirm(reason) {
    const result = await migration.commit(reason);
    if (!result) { setConfirming(false); return; }
    setConfirming(false);
    onMigrated(`Expediente migrado al modelo nuevo: ${result.imported.deliveries} entregas importadas.`);
  }

  return (
    <Card aria-labelledby={titleId} className="min-w-0">
      <CardHeader className="gap-1 border-b px-[1rem] py-[0.75rem]">
        <FunUpdateSectionLegend as="h3" id={titleId} step={<ArrowRightLeft className="h-4 w-4" aria-hidden="true" />} className="m-0">
          Migrar al modelo nuevo
        </FunUpdateSectionLegend>
        <p className="mb-0 text-xs text-muted-foreground">Importa las entregas de las ventanillas antiguas al modelo documental nuevo, correlacionadas con el catálogo de Dovela Central.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-[1rem] p-[1rem]">
        <div className="flex flex-wrap items-end gap-[0.75rem]">
          <div className="flex min-w-[16rem] flex-col gap-1">
            <span id={`${titleId}-release`} className="text-xs font-medium text-muted-foreground">Publicación de Central</span>
            <Select value={migration.configurationId == null ? 'current' : String(migration.configurationId)}
              onValueChange={(value) => migration.chooseRelease(value === 'current' ? null : value)} disabled={migration.loading || migration.committing}>
              <SelectTrigger aria-labelledby={`${titleId}-release`} className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {options.length ? options.map((option) => <SelectItem key={option.configurationId} value={String(option.configurationId)}>{releaseLabel(option)}</SelectItem>)
                  : <SelectItem value="current">Publicación vigente</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => migration.analyze()} disabled={migration.loading || migration.committing}>
            <SearchCheck aria-hidden="true" />{preview ? 'Analizar de nuevo' : 'Analizar'}
          </Button>
          <Button type="button" size="sm" onClick={() => setConfirming(true)} disabled={!canMigrate || migration.committing}>Migrar</Button>
        </div>

        {migration.error ? <Alert role="alert" variant="destructive" className="py-2.5"><CircleAlert aria-hidden="true" /><AlertDescription>{migration.error}</AlertDescription></Alert> : null}
        {migration.loading ? <div className="flex flex-col gap-2" aria-hidden="true"><Skeleton className="h-16 w-full" /><Skeleton className="h-24 w-full" /></div> : null}
        {!preview && !migration.loading ? (
          <Alert variant="neutral" className="py-2.5"><Info aria-hidden="true" /><AlertDescription>Analice el expediente para ver las entregas que se importarán y las incidencias antes de migrar.</AlertDescription></Alert>
        ) : null}

        {preview && !migration.loading ? (
          <>
            <SummaryFacts preview={preview} />
            <IssueGroups issues={preview.issues} />
            <DigitalResolutions preview={preview} choices={migration.choices} onChoose={migration.choose} disabled={migration.committing} />
            {migration.resolutionsChanged ? (
              <Alert variant="warning" className="py-2.5"><TriangleAlert aria-hidden="true" /><AlertDescription>Cambió las decisiones: analice de nuevo antes de migrar.</AlertDescription></Alert>
            ) : null}
            <FilesAndChecklist preview={preview} />
            <DeliveriesTable preview={preview} />
          </>
        ) : null}
      </CardContent>
      {preview && confirming ? <ConfirmDialog open={confirming} onOpenChange={setConfirming} preview={preview} busy={migration.committing} onConfirm={confirm} /> : null}
    </Card>
  );
}

export default LegacyMigrationPanel;
