import { useId, useState } from 'react';
import { ArrowRightLeft, CircleAlert, CircleCheck, Info, SearchCheck, TriangleAlert } from 'lucide-react';
import FunUpdateSectionLegend from '@/app/pages/user/fun_forms/components/FunUpdateSectionLegend.jsx';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Tag } from '../atoms/Tag';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { useLegacyMigration } from '../../hooks/useLegacyMigration';
import {
  CHECKLIST_STATUS_LABELS, CLASS_LABELS, EXCLUDE_VALUE, FILE_STATUS_LABELS, deliveryMedium, groupIssues, pendingDigitalFiles, releaseLabel, summaryFacts,
} from '../../legacyMigrationModel';
import { DOCUMENTAL_SCOPE } from '../documentalScope';

const SEVERITY_STYLE = {
  blocking: { tone: 'danger', icon: CircleAlert },
  warning: { tone: 'warning', icon: TriangleAlert },
};

const CLASS_TONES = { requirement: 'info', annex: 'slate', vr_slip: 'teal' };
const DELIVERY_STATUS = { import: { label: 'Importar', tone: 'success' }, merged: { label: 'Unida', tone: 'neutral' }, excluded: { label: 'Excluida', tone: 'warning' } };
const DIGITAL_CELL = 'px-[0.5rem] py-1 text-sm align-middle';
const TIGHT_CELL = 'px-[0.5rem] py-[0.25rem] text-xs align-middle';
const TIGHT_HEAD = 'h-[2rem] px-[0.5rem] py-[0.25rem] text-[11px] font-semibold uppercase tracking-wide text-slate-600';

function shortDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return match ? `${match[3]}/${match[2]}/${match[1].slice(2)}` : '—';
}

function SummaryFacts({ preview }) {
  return (
    <dl className="m-0 grid gap-[0.5rem] sm:grid-cols-3">
      {summaryFacts(preview).map((fact) => (
        <div key={fact.key} className="flex min-w-0 items-baseline justify-between gap-[0.5rem] rounded-md border bg-card px-[0.75rem] py-[0.375rem]" title={fact.hint || undefined}>
          <dt className="m-0 text-xs font-medium text-slate-600">{fact.label}</dt>
          <dd className="m-0 flex items-baseline gap-1.5 text-base font-semibold leading-6 text-foreground tabular-nums">
            {fact.value}
            {fact.hint ? <span className="truncate text-[11px] font-normal text-slate-600">{fact.hint}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function IssueGroups({ issues }) {
  const groups = groupIssues(issues);
  if (!groups.length) return <Tag tone="success" pill className="self-start"><CircleCheck className="h-3 w-3" aria-hidden="true" />Sin incidencias</Tag>;
  return (
    <div className="flex flex-col gap-[0.375rem]">
      {groups.map((group) => {
        const style = SEVERITY_STYLE[group.severity];
        return (
          <div key={group.severity} role={group.severity === 'blocking' ? 'alert' : 'status'} className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"><style.icon className="h-3.5 w-3.5" aria-hidden="true" />{group.label}</span>
            {group.entries.map((entry) => (
              <Tag key={entry.code} tone={style.tone}>
                {entry.label}<span className="font-bold">{entry.count}</span>
              </Tag>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DigitalResolutions({ preview, choices, onChoose, disabled }) {
  const files = pendingDigitalFiles(preview);
  if (!files.length) return null;
  return (
    <section aria-label="Archivos digitales sin VR" className="flex min-w-0 flex-col gap-1.5">
      <h4 className="mb-0 flex items-center gap-2 text-sm font-semibold text-foreground">
        Archivos digitales sin VR <Tag tone="warning" pill>{files.length}</Tag>
        <span className="text-xs font-normal text-slate-600" title="Asigne cada archivo a una ventanilla del expediente o exclúyalo; luego vuelva a analizar.">Asignar o excluir</span>
      </h4>
      <TooltipProvider delayDuration={150}>
        <div className="max-h-[22rem] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50"><TableHead className={TIGHT_HEAD}>Archivo</TableHead><TableHead className={TIGHT_HEAD}>Código</TableHead><TableHead className={TIGHT_HEAD}>Fecha</TableHead><TableHead className={cn(TIGHT_HEAD, 'w-[12rem]')}>VR</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const name = file.description || file.originalName || `Archivo ${file.id}`;
                return (
                  <TableRow key={file.id}>
                    <TableCell className={cn(DIGITAL_CELL, 'max-w-[20rem]')}>
                      <Tooltip>
                        <TooltipTrigger asChild><span className="block truncate" tabIndex={0}>{name}</span></TooltipTrigger>
                        <TooltipContent className="max-w-sm break-words text-xs">{file.originalName && file.originalName !== name ? `${name} (${file.originalName})` : name}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={DIGITAL_CELL}>{file.code ? <Tag tone="code" mono>{file.code}</Tag> : <span className="text-slate-600">—</span>}</TableCell>
                    <TableCell className={cn(DIGITAL_CELL, 'whitespace-nowrap tabular-nums text-slate-700')}>{shortDate(file.createdAt)}</TableCell>
                    <TableCell className={DIGITAL_CELL}>
                      <Select value={choices[file.id] || ''} onValueChange={(value) => onChoose(file.id, value)} disabled={disabled}>
                        <SelectTrigger aria-label={`Decisión para el archivo ${file.id}`} className="h-8 w-[11rem] px-2 text-sm"><SelectValue placeholder="Elegir…" /></SelectTrigger>
                        <SelectContent>
                          {preview.vrs.map((vr) => <SelectItem key={vr.submitId} value={String(vr.submitId)} className="text-xs">{`${vr.vrLabel}${vr.date ? ` · ${vr.date}` : ''}`}</SelectItem>)}
                          <SelectItem value={EXCLUDE_VALUE} className="text-xs">Excluir</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
    </section>
  );
}

function DeliveriesTable({ preview }) {
  const rows = preview.deliveries;
  return (
    <details className="min-w-0 rounded-md border">
      <summary className="cursor-pointer px-[0.75rem] py-[0.375rem] text-sm font-semibold text-foreground">Entregas a importar <Tag pill>{preview.stats.deliveries}</Tag></summary>
      <div className="max-h-[28rem] overflow-auto border-t">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50"><TableHead className={TIGHT_HEAD}>VR</TableHead><TableHead className={TIGHT_HEAD}>Código</TableHead><TableHead className={TIGHT_HEAD}>Documento</TableHead><TableHead className={TIGHT_HEAD}>Tipo</TableHead><TableHead className={TIGHT_HEAD}>Versión</TableHead><TableHead className={TIGHT_HEAD}>Soporte</TableHead><TableHead className={TIGHT_HEAD}>Estado</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const status = DELIVERY_STATUS[row.status] || DELIVERY_STATUS.excluded;
              return (
                <TableRow key={row.legacyKey}>
                  <TableCell className={cn(TIGHT_CELL, 'whitespace-nowrap')}><Tag tone="code" mono>{row.vrLabel}</Tag></TableCell>
                  <TableCell className={cn(TIGHT_CELL, 'font-mono')}>{row.documentCode || row.legacyCode || '—'}</TableCell>
                  <TableCell className={cn(TIGHT_CELL, 'max-w-[24rem]')}>{row.instanceLabel || row.title}</TableCell>
                  <TableCell className={TIGHT_CELL}><Tag tone={CLASS_TONES[row.documentClass] || 'neutral'}>{CLASS_LABELS[row.documentClass] || row.documentClass}</Tag></TableCell>
                  <TableCell className={cn(TIGHT_CELL, 'whitespace-nowrap tabular-nums')}>
                    {row.versionSequence ? `${row.versionSequence}/${row.versionCount}` : '—'}{row.isCurrent ? <Tag tone="success" className="ml-1">Vigente</Tag> : null}
                  </TableCell>
                  <TableCell className={cn(TIGHT_CELL, 'whitespace-nowrap')}>{deliveryMedium(row)}</TableCell>
                  <TableCell className={TIGHT_CELL}><Tag tone={status.tone}>{status.label}</Tag></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </details>
  );
}

function CountRow({ label, count, tone = 'neutral' }) {
  return <li className="flex items-center justify-between gap-2 text-xs text-foreground"><span>{label}</span><Tag tone={tone} pill>{count}</Tag></li>;
}

function FilesAndChecklist({ preview }) {
  const statuses = preview.files.reduce((acc, file) => Object.assign(acc, { [file.status]: (acc[file.status] || 0) + 1 }), {});
  const checklist = preview.stats.checklist;
  return (
    <details className="min-w-0 rounded-md border">
      <summary className="cursor-pointer px-[0.75rem] py-[0.375rem] text-sm font-semibold text-foreground">Detalles de archivos y lista de chequeo</summary>
      <div className="grid gap-[0.75rem] border-t p-[0.75rem] lg:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-semibold text-foreground" title="Se conservan las rutas actuales; los archivos no se copian.">Archivos</h4>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {Object.keys(statuses).map((status) => <CountRow key={status} label={FILE_STATUS_LABELS[status] || status} count={statuses[status]} />)}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-xs font-semibold text-foreground" title="La lista de chequeo antigua no se importa; solo se compara con Central.">Chequeo antiguo vs. Central</h4>
          {checklist ? (
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {['consistent', 'mismatch', 'missing', 'not_applicable'].map((status) => (
                <CountRow key={status} label={CHECKLIST_STATUS_LABELS[status]} count={checklist[status === 'not_applicable' ? 'notApplicable' : status]} tone={status === 'mismatch' || status === 'missing' ? 'warning' : 'neutral'} />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </details>
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
            Se fijará la {releaseLabel(preview.release)} y se importarán {preview.stats.deliveries} entregas de {preview.stats.vrs} VR. Se hace en un solo paso y no modifica los datos antiguos.
          </DialogDescription>
        </DialogHeader>
        <form id={`${reasonId}-form`} onSubmit={(event) => { event.preventDefault(); if (reason.trim()) onConfirm(reason); }} className="flex flex-col gap-1.5">
          <label htmlFor={reasonId} className="text-sm font-medium text-foreground">Motivo de la migración</label>
          <Textarea id={reasonId} placeholder="Queda en el historial del expediente" value={reason} maxLength={1000} required rows={3} onChange={(event) => setReason(event.target.value)} disabled={busy} />
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
        <p className="mb-0 text-xs text-slate-600">Pasa al modelo nuevo las VR con documentos físicos y los archivos del expediente. No modifica los datos antiguos.</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-[1rem] p-[1rem]">
        <div className="flex flex-wrap items-end gap-[0.75rem]">
          <div className="flex min-w-[16rem] flex-col gap-1">
            <span id={`${titleId}-release`} className="text-xs font-medium text-slate-600">Publicación de Central</span>
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
          <Alert variant="neutral" className="py-2.5"><Info aria-hidden="true" /><AlertDescription>Pulse «Analizar» para ver las VR, los documentos físicos y los archivos que se migrarán.</AlertDescription></Alert>
        ) : null}

        {preview && !migration.loading ? (
          <>
            <SummaryFacts preview={preview} />
            <IssueGroups issues={preview.issues} />
            <DigitalResolutions preview={preview} choices={migration.choices} onChoose={migration.choose} disabled={migration.committing} />
            {migration.resolutionsChanged ? (
              <Alert variant="warning" className="py-2.5"><TriangleAlert aria-hidden="true" /><AlertDescription>Decisiones cambiadas: analice de nuevo.</AlertDescription></Alert>
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
