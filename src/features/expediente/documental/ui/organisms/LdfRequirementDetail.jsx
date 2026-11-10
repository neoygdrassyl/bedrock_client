import { Button } from '@/shared/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { Tag } from '../atoms/Tag';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { groupStatusLabel, VERDICT_META } from '../../legalFormModel';
import { partyById, partyDescription, primaryInstance, requirementReason, requirementStatus, ROW_STATUS, SELECTION_SOURCE_TEXT } from '../../ldfChecklistModel';

/** "Elegir opción" of a typology, or the reason it cannot be chosen here. `option`: { available, reason }. */
function ChooseOption({ option, label, onChoose }) {
  if (option?.available) return <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onChoose}>{label}</Button>;
  return option?.reason ? <span className="text-[11px] leading-4 text-muted-foreground">{option.reason}</span> : null;
}

/**
 * Why a requirement is required (typology and option, or general), for whom, the typology options still to choose for
 * that person and, for documents with several deliveries, the instances to switch between. Shown on top of the
 * evaluation sheet and in the requirement sheet. `optionState(typologyCode, subjectId)` -> { available, reason };
 * `onChoose(typologyCode, subjectId)` opens the option picker; `onOpenInstance(documentKey)` opens an evaluation.
 */
export function LdfRequirementContext({ data, row, optionState, onChoose, onOpenInstance, activeDocumentKey }) {
  const reason = requirementReason(data, row);
  const party = partyById(data, reason.subjectId);
  const person = party ? `${party.label} · ${partyDescription(party)}` : row?.requirement?.subjectLabel || null;
  const instances = row?.type === 'document' ? row.requirement?.instances || [] : [];
  return (
    <div className="mb-[1rem] flex flex-col gap-2 rounded-md border bg-muted/20 px-[0.75rem] py-2 text-xs leading-5" data-testid="ldf-requirement-context" role="group" aria-label="Por qué se exige">
      {person ? <p className="mb-0"><span className="text-muted-foreground">Persona: </span><span className="font-medium text-foreground">{person}</span></p> : null}
      {reason.general ? (
        <p className="mb-0 text-foreground">{reason.subjectId ? 'Documento exigido a esta persona.' : 'Requisito general de la solicitud.'}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <p className="mb-0 min-w-0 flex-1 text-foreground" data-testid="ldf-requirement-typology">
            <span className="text-muted-foreground">Tipología </span><span className="font-medium">{reason.typologyName}</span>
            {reason.optionLabel ? <><span className="text-muted-foreground"> · opción </span><span className="font-medium">{reason.optionLabel}</span></> : null}
            {reason.selectionSource ? <span className="text-muted-foreground"> ({SELECTION_SOURCE_TEXT[reason.selectionSource] || reason.selectionSource})</span> : null}
          </p>
          {optionState(reason.typologyCode, reason.subjectId)?.available ? <ChooseOption option={optionState(reason.typologyCode, reason.subjectId)} label="Cambiar opción" onChoose={() => onChoose(reason.typologyCode, reason.subjectId)} /> : null}
        </div>
      )}
      {reason.groupMode === 'at_least_one' ? <p className="mb-0 text-muted-foreground">Basta con uno de los documentos del grupo.</p> : null}
      {reason.pendingSelections.length ? (
        <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Opciones por elegir">
          {reason.pendingSelections.map((item) => (
            <li key={`${item.typologyCode}@${item.subjectId || ''}`} className="flex flex-wrap items-center gap-2">
              <Tag tone="warning">Falta elegir opción</Tag>
              <span className="min-w-0 flex-1 text-foreground">{item.typologyName}</span>
              <ChooseOption option={optionState(item.typologyCode, item.subjectId)} label="Elegir opción" onChoose={() => onChoose(item.typologyCode, item.subjectId)} />
            </li>
          ))}
        </ul>
      ) : null}
      {instances.length > 1 ? (
        <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Instancias del documento">
          {instances.map((instance, index) => {
            const verdict = VERDICT_META[instance.verdict] || VERDICT_META.pending;
            const active = instance.documentKey === activeDocumentKey;
            return (
              <li key={instance.documentKey} className="flex flex-wrap items-center gap-2">
                <span className={cn('min-w-0 flex-1 text-foreground', active && 'font-semibold')}>{instance.instanceLabel || `Instancia ${index + 1}`} · {instance.vrLabel || 'Sin VR'}</span>
                <Tag tone={verdict.tone}>{verdict.label}</Tag>
                {active ? <span className="text-[11px] text-muted-foreground">En evaluación</span>
                  : onOpenInstance ? <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => onOpenInstance(instance.documentKey)}>Ver</Button> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Alternatives of an at_least_one row, each with its state and, when delivered, its evaluation. */
function Alternatives({ row, onOpenInstance }) {
  const satisfied = row.group?.satisfied === true;
  return (
    <div className="flex flex-col gap-2">
      <p className="mb-0 text-xs font-semibold text-foreground">{groupStatusLabel(row.group) || 'Alternativas'}</p>
      <ul className="m-0 flex list-none flex-col divide-y rounded-md border p-0">
        {row.members.map((member) => {
          const key = requirementStatus(member);
          const status = ROW_STATUS[satisfied && !member.delivered ? 'covered' : key] || ROW_STATUS.missing;
          const instance = primaryInstance(member);
          return (
            <li key={member.requirementKey || member.documentId || member.documentCode} className="flex flex-wrap items-center gap-2 px-[0.75rem] py-1.5 text-xs leading-5">
              <span className="w-12 shrink-0 font-mono text-foreground">{member.documentCode}</span>
              <span className="min-w-0 flex-1 text-foreground">{member.title || 'Documento sin nombre'}</span>
              <Tag tone={status.tone}>{status.label}</Tag>
              {instance && onOpenInstance ? <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => onOpenInstance(instance.documentKey)}>Evaluar</Button> : null}
            </li>
          );
        })}
        {!row.members.length ? <li className="px-[0.75rem] py-1.5 text-xs text-muted-foreground">Ninguna alternativa del grupo está listada: {row.code || row.group?.code}.</li> : null}
      </ul>
    </div>
  );
}

/** Body of a delivered document when its evaluation cannot be opened here: the state of each delivery. */
function Delivered({ row }) {
  return (
    <ul className="m-0 flex list-none flex-col divide-y rounded-md border p-0" aria-label="Entregas del documento">
      {(row.requirement?.instances || []).map((instance, index) => {
        const verdict = VERDICT_META[instance.verdict] || VERDICT_META.pending;
        return (
          <li key={instance.documentKey} className="flex flex-wrap items-center gap-2 px-[0.75rem] py-1.5 text-xs leading-5">
            <span className="min-w-0 flex-1 text-foreground">{instance.instanceLabel || `Instancia ${index + 1}`} · {instance.vrLabel || 'Sin VR'}</span>
            <Tag tone={verdict.tone}>{verdict.label}</Tag>
          </li>
        );
      })}
    </ul>
  );
}

/** Body of a document without a delivery: what is missing and what will be checked once it is received. */
function Undelivered({ row }) {
  const requirement = row.requirement;
  const total = requirement?.controls?.total || 0;
  const status = ROW_STATUS[row.status] || ROW_STATUS.missing;
  return (
    <div className="flex flex-col gap-2 text-xs leading-5">
      <div className="flex flex-wrap items-center gap-2"><Tag tone={status.tone}>{status.label}</Tag>{requirement?.required ? <span className="text-muted-foreground">Obligatorio para declarar.</span> : null}</div>
      <p className="mb-0 text-foreground">
        Aún no hay una entrega vigente. Recíbalo en «Radicación»{requirement?.subjectLabel || row.subjectId ? ' a nombre de esta persona' : ''}; después se evalúa aquí.
      </p>
      <p className="mb-0 text-muted-foreground" data-testid="ldf-requirement-controls">
        {total ? `Al recibirlo se verifican ${total} ${total === 1 ? 'control' : 'controles'} de Central.` : 'Al recibirlo se registra el veredicto del revisor (no tiene controles de Central).'}
      </p>
    </div>
  );
}

const SHEET_TITLES = { alternatives: 'Documentos alternativos', selection: 'Opción de tipología', document: 'Documento requerido' };

/**
 * Side detail of a checklist row without an evaluation to open directly: a document not delivered yet, an
 * at_least_one group or a typology option to choose. Delivered documents open the evaluation sheet instead.
 */
export function LdfRequirementSheet({ target, data, optionState, onChoose, onOpenInstance, onClose }) {
  const row = target?.row || null;
  return (
    <Sheet open={Boolean(row)} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className={cn(DOCUMENTAL_SCOPE, 'flex w-full flex-col gap-0 p-0 sm:max-w-xl')}>
        {row ? (
          <>
            <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-[1rem] pr-12 text-left">
              <SheetTitle className="mb-0 text-base leading-6">{SHEET_TITLES[row.type] || SHEET_TITLES.document}</SheetTitle>
              <SheetDescription className="mb-0 text-xs leading-4">{[row.code, row.title].filter(Boolean).join(' · ')}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-[1.25rem]">
              <LdfRequirementContext data={data} row={row} optionState={optionState} onChoose={onChoose} onOpenInstance={onOpenInstance} />
              {row.type === 'alternatives' ? <Alternatives row={row} onOpenInstance={onOpenInstance} /> : null}
              {row.type === 'document' ? (row.delivered ? <Delivered row={row} /> : <Undelivered row={row} />) : null}
              {row.type === 'selection' ? (
                <p className="mb-0 text-xs leading-5 text-foreground">Debe elegirse la opción de esta tipología para conocer los documentos que se exigen{row.subjectId ? ' a esta persona' : ''}.</p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/30 px-6 py-[0.75rem]">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export default LdfRequirementSheet;
