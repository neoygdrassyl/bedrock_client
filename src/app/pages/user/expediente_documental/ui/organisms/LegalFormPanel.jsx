import { useEffect, useId, useState } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, ListChecks, RefreshCw, Scale, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import FUN_SERVICE from '@/app/services/fun.service';
import { declareLegalForm, revokeLegalForm } from '@/app/services/documentaryLegalForm.service';
import { Tag } from '../atoms/Tag';
import { ChecklistDialog, CommandDialog } from './LegalFormDialogs';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import { useLegalForm } from '../../hooks/useLegalForm';
import { formatDocumentaryDate } from '../../canonicalDocumentaryModel';
import { groupBlockers, LEGAL_FORM_STATE_META, missingFactLabels } from '../../legalFormModel';

const CONFLICT_MESSAGE = 'Los datos cambiaron. Revise el estado actualizado y confirme nuevamente su decisión.';
const ITEM_ERROR = 'No fue posible cargar el expediente para generar el formato. Cierre e intente nuevamente.';

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

/** Compact list of the requirements still to deliver (NOT_DELIVERED) and the unsatisfied groups. */
function MissingRequirements({ data }) {
  const titleId = useId();
  const items = (data.blockers || []).filter((blocker) => blocker.code === 'NOT_DELIVERED' || blocker.code === 'GROUP_NOT_SATISFIED');
  if (!items.length) return null;
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-1.5 border-b px-[1rem] py-[0.75rem]" data-testid="legal-form-missing">
      <h3 id={titleId} className="mb-0 flex items-center gap-2 text-sm font-semibold leading-5 text-foreground">
        Requisitos sin entregar <Tag tone="warning" pill>{items.length}</Tag>
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {items.map((blocker, index) => (
          <li key={`${blocker.code}:${blocker.documentCode || blocker.groupCode || index}`}>
            <Tag tone="neutral">
              {blocker.code === 'GROUP_NOT_SATISFIED'
                ? (blocker.groupCode ? `Grupo ${blocker.groupCode}: falta cumplir el grupo` : 'Grupo sin cumplir')
                : blockerTarget(blocker, data.requirements) || blocker.message}
            </Tag>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Read-only legal-form summary of a traditional expediente (declaration and clock of the legacy module). */
function LegacyConsult({ legacy }) {
  const declared = Boolean(legacy?.declared);
  const state = legacy?.state;
  return (
    <div className="flex flex-col gap-[0.75rem] px-[1rem] py-[1rem]" data-testid="legal-form-legacy" role="region" aria-label="Legal y debida forma de la documentación tradicional">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={declared ? 'info' : 'neutral'}>
          {declared ? `Declarada el ${formatDocumentaryDate(legacy.declaredAt)}` : 'No declarada'}
        </Tag>
        {state != null && state !== '' ? <span className="text-xs text-muted-foreground">Estado actual del expediente: <span className="font-medium text-foreground">{String(state)}</span></span> : null}
      </div>
      {legacy?.clockName || legacy?.clockDesc ? (
        <dl className="m-0 grid gap-x-[1rem] gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-xs font-medium text-muted-foreground">Término</dt>
          <dd className="mb-0 text-foreground">{[legacy.clockName, legacy.clockDesc].filter(Boolean).join(' · ')}</dd>
        </dl>
      ) : null}
      <p className="mb-0 text-xs leading-5 text-muted-foreground">Este expediente usa la documentación tradicional: la evaluación de los documentos se hace en el módulo «Chequeo». Aquí solo puede consultar el resultado.</p>
    </div>
  );
}

/**
 * "Legal y debida forma" tab: state, blockers, requirements still to deliver, the declaration, and the same
 * documents table as Radicación filtered to requirement documents, where each delivery is evaluated with the
 * shared evaluation sheet. Traditional expedientes only get a read-only consult card of the legacy declaration.
 * `onDeclarationChanged` lets the module reload origin, inventory and the expediente state.
 * The "Lista de chequeo" action needs `currentVersion` (hidden without it); the FUN it prints is
 * `currentItem` or, when absent, loaded from the expediente when the dialog opens.
 */
export function LegalFormPanel({ origin, canManage = false, onDeclarationChanged, currentItem = null, currentVersion = null, swaMsg }) {
  const titleId = useId();
  const fun0Id = origin?.project?.fun0Id;
  const legal = useLegalForm(fun0Id) || { status: 'loading', data: null, error: '', reload: () => {} };
  const [dialog, setDialog] = useState(null); // 'declare' | 'revoke'
  const [notice, setNotice] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [loadedItem, setLoadedItem] = useState(null);
  const [itemError, setItemError] = useState('');
  // Bumped when the legal-form state is refreshed so the documents table reloads with it.
  const [tableRevision, setTableRevision] = useState(0);
  const data = legal.data;
  const traditional = data?.mode === 'traditional';
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

  function refresh(message = '') { setNotice(message); legal.reload(); setTableRevision((value) => value + 1); }
  // An evaluation saved in the table: the table reloads itself, the legal-form state follows.
  const evaluationSaved = () => legal.reload();
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
          {data && !traditional && currentVersion != null ? (
            <Button type="button" variant="outline" size="sm" onClick={() => { setNotice(''); setChecklistOpen(true); }}>
              <ListChecks aria-hidden="true" />Lista de chequeo
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={legal.status === 'loading'} onClick={() => refresh()}>
            <RefreshCw aria-hidden="true" className={cn(legal.status === 'loading' && data && 'animate-spin motion-reduce:animate-none')} />Actualizar
          </Button>
          {traditional ? null : declared ? (
            actions.revoke && canManage ? <Button type="button" variant="outline" size="sm" onClick={() => setDialog('revoke')}>Anular declaración</Button> : null
          ) : data ? (
            <Button type="button" size="sm" disabled={!canDeclare} onClick={() => setDialog('declare')}>Declarar legal y debida forma</Button>
          ) : null}
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

        {traditional ? <LegacyConsult legacy={data.legacy} /> : null}

        {data && !traditional ? (
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
            <MissingRequirements data={data} />
          </>
        ) : null}
      </div>

      {data && !traditional && origin?.publication ? (
        <CanonicalDocumentaryWorkspace
          origin={origin}
          canManage={canReview}
          variant="legalForm"
          embedded
          reloadKey={tableRevision}
          onEvaluationSaved={evaluationSaved}
        />
      ) : null}

      {currentVersion != null && data && !traditional ? (
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
