import { Fragment, useEffect, useId, useState } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, ListChecks, RefreshCw, Scale, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import FUN_SERVICE from '@/app/services/fun.service';
import { declareLegalForm, revokeLegalForm } from '@/app/services/documentaryLegalForm.service';
import { Tag } from '../atoms/Tag';
import { VrBadge } from '../atoms/VrBadge';
import { ChecklistDialog, CommandDialog, ControlsSheet, ReviewSheet } from './LegalFormDialogs';
import { useLegalForm } from '../../hooks/useLegalForm';
import { formatDocumentaryDate } from '../../canonicalDocumentaryModel';
import { controlsSummary, groupBlockers, LEGAL_FORM_STATE_META, missingFactLabels, reviewSourceOf, VERDICT_META } from '../../legalFormModel';

const CONFLICT_MESSAGE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
const ITEM_ERROR = 'No fue posible cargar el expediente para generar el formato. Cierre e intente nuevamente.';
const HEAD_CLASS = 'h-9 px-[0.75rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

function VerdictTag({ verdict }) {
  const meta = VERDICT_META[verdict] || VERDICT_META.pending;
  return <Tag tone={meta.tone}>{meta.label}</Tag>;
}

function blockerTarget(blocker, requirements) {
  const requirement = requirements.find((item) => item.documentCode === blocker.documentCode);
  const instance = blocker.documentKey ? requirement?.instances.find((item) => item.documentKey === blocker.documentKey) : null;
  if (requirement) return [requirement.documentCode, requirement.title, instance?.instanceLabel].filter(Boolean).join(' · ');
  if (blocker.groupCode) return `Grupo ${blocker.groupCode}`;
  return blocker.documentCode || null;
}

/** State line of the expediente plus its blockers grouped by code (expandable). */
function StateBanner({ data }) {
  const ids = useId();
  const [open, setOpen] = useState(false);
  const meta = LEGAL_FORM_STATE_META[data.state] || LEGAL_FORM_STATE_META.not_ready;
  const groups = groupBlockers(data.blockers);
  const incomplete = (data.warnings || []).some((warning) => warning.code === 'REQUIREMENTS_INCOMPLETE');
  const missing = missingFactLabels(data);
  return (
    <div className="flex flex-col gap-2 border-b px-[1rem] py-[0.75rem]" role="region" aria-label="Estado de legal y debida forma">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={meta.tone} data-testid="legal-form-state">{meta.label}</Tag>
        <p className="mb-0 min-w-0 flex-1 text-sm leading-5 text-foreground">{meta.text}</p>
      </div>
      {incomplete || missing.length ? (
        <div className="flex flex-col gap-1.5" data-testid="legal-form-warning">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="warning">Evaluación incompleta</Tag>
            <p className="mb-0 min-w-0 flex-1 text-xs leading-5 text-muted-foreground">Faltan datos del FUN; los documentos de esas tipologías no se listan todavía:</p>
          </div>
          {missing.length ? <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Datos del FUN faltantes">{missing.map((label) => <li key={label}><Tag tone="neutral">{label}</Tag></li>)}</ul> : null}
        </div>
      ) : null}
      {groups.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {groups.map((group) => <Tag key={group.code} tone={group.code === 'DOES_NOT_COMPLY' ? 'danger' : 'warning'}>{group.label} · {group.items.length}</Tag>)}
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" aria-expanded={open} aria-controls={`${ids}-blockers`} onClick={() => setOpen((value) => !value)}>
            {open ? 'Ocultar pendientes' : 'Ver pendientes'}
            <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
          </Button>
        </div>
      ) : null}
      {open && groups.length ? (
        <ul id={`${ids}-blockers`} className="m-0 flex list-none flex-col gap-1 p-0 text-xs leading-5">
          {groups.flatMap((group) => group.items.map((blocker, index) => (
            <li key={`${group.code}:${blocker.documentCode || blocker.groupCode || ''}:${blocker.documentKey || index}`} className="flex flex-wrap gap-x-2">
              <span className="font-medium text-foreground">{group.label}</span>
              <span className="text-muted-foreground">{blockerTarget(blocker, data.requirements) || blocker.message}</span>
            </li>
          )))}
        </ul>
      ) : null}
    </div>
  );
}

function RowAction({ requirement, instance, canReview, onReview, onControls }) {
  if (!instance) return null;
  const label = [requirement.documentCode, instance.instanceLabel].filter(Boolean).join(' · ');
  if (reviewSourceOf(instance) === 'controls') {
    return <Button type="button" variant="outline" size="sm" className="h-8 text-xs" aria-label={`Revisar controles ${label}`} onClick={() => onControls(requirement, instance)}>Revisar controles</Button>;
  }
  if (!canReview) return null;
  return <Button type="button" variant="outline" size="sm" className="h-8 text-xs" aria-label={`Revisar ${label}`} onClick={() => onReview(requirement, instance)}>Revisar</Button>;
}

function InstanceCells({ instance }) {
  const summary = controlsSummary(instance.controls);
  return (
    <>
      <TableCell className="px-[0.75rem] py-2">{instance.vrLabel ? <VrBadge value={instance.vrLabel} /> : null}</TableCell>
      <TableCell className="px-[0.75rem] py-2 font-mono text-xs tabular-nums">{summary || <span className="font-sans text-muted-foreground">Revisión</span>}</TableCell>
      <TableCell className="px-[0.75rem] py-2"><VerdictTag verdict={instance.verdict} />{instance.review?.stale ? <span className="mt-0.5 block text-[11px] text-muted-foreground">Desactualizada</span> : null}</TableCell>
    </>
  );
}

function RequirementRows({ requirement, canReview, onReview, onControls }) {
  const multi = requirement.instances.length > 1;
  const single = requirement.instances.length === 1 ? requirement.instances[0] : null;
  return (
    <>
      <TableRow className="border-border/60" data-testid={`legal-form-row-${requirement.documentCode}`}>
        <TableCell className="px-[1rem] py-2 font-mono text-xs">{requirement.documentCode || '—'}</TableCell>
        <TableCell className="px-[0.75rem] py-2">
          <span className="block text-[13px] font-medium leading-5 text-foreground">{requirement.title || 'Documento sin nombre'}</span>
          <span className="mt-0.5 flex flex-wrap gap-1">
            {requirement.required ? <Tag>Requerido</Tag> : null}
            {requirement.additional ? <Tag tone="slate">Adicional</Tag> : null}
            {requirement.groupCode ? <Tag tone="code" mono>{requirement.groupCode}</Tag> : null}
          </span>
        </TableCell>
        {single ? <InstanceCells instance={single} /> : (
          <>
            <TableCell className="px-[0.75rem] py-2 text-xs text-muted-foreground">{requirement.delivered ? `${requirement.instances.length} instancias` : 'Sin entrega'}</TableCell>
            <TableCell className="px-[0.75rem] py-2 font-mono text-xs tabular-nums">{controlsSummary(requirement.controls) || ''}</TableCell>
            <TableCell className="px-[0.75rem] py-2"><VerdictTag verdict={requirement.verdict} /></TableCell>
          </>
        )}
        <TableCell className="px-[0.75rem] py-2 text-right">
          {multi ? null : <RowAction requirement={requirement} instance={single} canReview={canReview} onReview={onReview} onControls={onControls} />}
        </TableCell>
      </TableRow>
      {multi ? requirement.instances.map((instance) => (
        <TableRow key={instance.documentKey} className="border-border/40 bg-muted/10" data-testid={`legal-form-instance-${instance.documentKey}`}>
          <TableCell className="px-[1rem] py-1.5" />
          <TableCell className="px-[0.75rem] py-1.5 pl-[1.5rem] text-xs text-foreground">{instance.instanceLabel || 'Instancia sin nombre'}</TableCell>
          <InstanceCells instance={instance} />
          <TableCell className="px-[0.75rem] py-1.5 text-right"><RowAction requirement={requirement} instance={instance} canReview={canReview} onReview={onReview} onControls={onControls} /></TableCell>
        </TableRow>
      )) : null}
    </>
  );
}

/**
 * "Legal y debida forma" tab of canonical expedientes: state, blockers, per-document verdicts,
 * reviewer verdicts (documents without Central controls), Central controls and the declaration.
 * `onDeclarationChanged` lets the module reload origin, inventory and the expediente state.
 * The "Lista de chequeo" action needs `currentVersion` (hidden without it); the FUN it prints is
 * `currentItem` or, when absent, loaded from the expediente when the dialog opens.
 */
export function LegalFormPanel({ origin, canManage = false, onDeclarationChanged, currentItem = null, currentVersion = null, swaMsg }) {
  const titleId = useId();
  const fun0Id = origin.project.fun0Id;
  const legal = useLegalForm(fun0Id);
  const [review, setReview] = useState(null);
  const [controls, setControls] = useState(null);
  const [dialog, setDialog] = useState(null); // 'declare' | 'revoke'
  const [notice, setNotice] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [loadedItem, setLoadedItem] = useState(null);
  const [itemError, setItemError] = useState('');
  const data = legal?.data;
  const actions = data?.actions || {};
  const canReview = Boolean(canManage && actions.review);
  const canDeclare = Boolean(canManage && actions.declare && data?.state === 'ready');
  const declared = Boolean(data?.declaration);

  // The checklist PDF prints the FUN: use the given one or load a fresh copy each time the dialog opens.
  useEffect(() => {
    if (!checklistOpen || currentItem) return undefined;
    let ignore = false;
    setLoadedItem(null); setItemError('');
    FUN_SERVICE.get(fun0Id)
      .then((response) => { if (!ignore) setLoadedItem(response.data); })
      .catch(() => { if (!ignore) setItemError(ITEM_ERROR); });
    return () => { ignore = true; };
  }, [checklistOpen, currentItem, fun0Id]);

  function refresh(message = '') { setNotice(message); legal.reload(); }
  function conflict() { setReview(null); refresh(CONFLICT_MESSAGE); }
  // A rejected declaration command (409) means the state moved: reload it behind the dialog.
  async function run(command, values, message) {
    try { await command(fun0Id, values); } catch (failure) { if (failure.response?.status === 409) legal.reload(); throw failure; }
    setDialog(null); refresh(message); onDeclarationChanged?.();
  }
  const declare = (values) => run(declareLegalForm, values, 'Expediente declarado en legal y debida forma.');
  const revoke = (values) => run(revokeLegalForm, values, 'Declaración anulada.');

  const conflictNotice = notice === CONFLICT_MESSAGE;
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-[0.75rem]">
      {notice ? (
        <Alert role="status" variant={conflictNotice ? 'warning' : 'success'} className="py-2.5">
          {conflictNotice ? <TriangleAlert aria-hidden="true" /> : <CircleCheck aria-hidden="true" />}
          <AlertDescription className="min-w-0 flex-1">{notice}</AlertDescription>
        </Alert>
      ) : null}
      <div className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm">
        <header className="flex flex-wrap items-center gap-[0.75rem] border-b bg-muted/30 px-[1rem] py-[0.75rem]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
            <Scale className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="mb-0 min-w-0 flex-1 text-[15px] font-semibold leading-5 text-foreground">Legal y debida forma</h2>
          {data && currentVersion != null ? (
            <Button type="button" variant="outline" size="sm" onClick={() => { setNotice(''); setChecklistOpen(true); }}>
              <ListChecks aria-hidden="true" />Lista de chequeo
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={legal.status === 'loading'} onClick={() => refresh()}>
            <RefreshCw aria-hidden="true" className={cn(legal.status === 'loading' && data && 'animate-spin motion-reduce:animate-none')} />Actualizar
          </Button>
          {declared ? (
            actions.revoke && canManage ? <Button type="button" variant="outline" size="sm" onClick={() => setDialog('revoke')}>Anular declaración</Button> : null
          ) : (
            <Button type="button" size="sm" disabled={!canDeclare} onClick={() => setDialog('declare')}>Declarar legal y debida forma</Button>
          )}
        </header>

        {legal.error ? (
          <div className="p-[1rem]">
            <Alert variant="destructive" className="flex-wrap items-center">
              <CircleAlert aria-hidden="true" />
              <AlertDescription className="min-w-0 flex-1">{legal.error}</AlertDescription>
              <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={() => refresh()}>Reintentar</Button>
            </Alert>
          </div>
        ) : null}

        {!data && !legal.error ? (
          <div className="flex flex-col gap-2 p-[1rem]" aria-hidden="true"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>
        ) : null}

        {data ? (
          <>
            <StateBanner data={data} />
            {declared ? (
              <p className="mb-0 border-b px-[1rem] py-2 text-xs leading-5 text-muted-foreground" data-testid="legal-form-declaration">
                Declarada el {formatDocumentaryDate(data.declaration.at)}{data.declaration.byName ? ` por ${data.declaration.byName}` : data.declaration.by != null ? ` por el usuario ${data.declaration.by}` : ''}.
              </p>
            ) : null}
            {data.checklist ? (
              <p className="mb-0 border-b px-[1rem] py-2 text-[11px] leading-4 text-muted-foreground" data-testid="legal-form-checklist-line">
                Lista de chequeo guardada por {data.checklist.updatedByName || (data.checklist.updatedBy != null ? `usuario ${data.checklist.updatedBy}` : 'un usuario')} · {formatDocumentaryDate(data.checklist.updatedAt)}
              </p>
            ) : null}
            <div className="max-h-[60dvh] min-w-0 overflow-auto" role="region" aria-label="Documentos de legal y debida forma" tabIndex={0}>
              <table className="w-full min-w-[760px] table-fixed border-collapse text-sm" aria-label="Documentos de legal y debida forma">
                <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--card))]">
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[9%] px-[1rem]')}>Código</TableHead>
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[35%]')}>Documento</TableHead>
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[13%]')}>Entrega</TableHead>
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[11%]')}>Controles</TableHead>
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[13%]')}>Veredicto</TableHead>
                    <TableHead scope="col" className={cn(HEAD_CLASS, 'w-[19%] text-right')}><span className="sr-only">Acción</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.requirements.map((requirement) => (
                    <Fragment key={requirement.documentId || requirement.documentCode}>
                      <RequirementRows requirement={requirement} canReview={canReview} onReview={(req, instance) => { setNotice(''); setReview({ requirement: req, instance }); }} onControls={(req, instance) => { setNotice(''); setControls({ requirement: req, instance }); }} />
                    </Fragment>
                  ))}
                  {!data.requirements.length ? (
                    <TableRow><TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">Aún no hay requisitos evaluados para este expediente.</TableCell></TableRow>
                  ) : null}
                </TableBody>
              </table>
            </div>
          </>
        ) : null}
      </div>

      <ReviewSheet target={review} fun0Id={fun0Id} onClose={() => setReview(null)} onSaved={(message) => { setReview(null); refresh(message); }} onConflict={conflict} />
      <ControlsSheet target={controls} origin={origin} canReview={canReview} onClose={() => setControls(null)} onSaved={(message) => { setControls(null); refresh(message); }} onConflict={() => { setControls(null); refresh(CONFLICT_MESSAGE); }} />
      {currentVersion != null ? (
        <ChecklistDialog
          open={checklistOpen}
          data={data}
          fun0Id={fun0Id}
          currentItem={currentItem || loadedItem}
          itemError={itemError}
          currentVersion={currentVersion}
          swaMsg={swaMsg}
          canEdit={Boolean(canManage && actions.checklist)}
          onClose={() => setChecklistOpen(false)}
          onSaved={(message) => { setChecklistOpen(false); refresh(message); }}
          onConflict={() => { setChecklistOpen(false); refresh(CONFLICT_MESSAGE); }}
        />
      ) : null}
      <CommandDialog
        open={dialog === 'declare'}
        title="Declarar legal y debida forma"
        description="El expediente pasa al estado de legal y debida forma y se registra el término correspondiente."
        confirmLabel="Declarar"
        withDate
        onConfirm={declare}
        onClose={() => setDialog(null)}
      />
      <CommandDialog
        open={dialog === 'revoke'}
        title="Anular declaración"
        description="El expediente vuelve al estado anterior a la declaración."
        confirmLabel="Anular declaración"
        destructive
        onConfirm={revoke}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}

export default LegalFormPanel;
