import { Tag } from '../atoms/Tag';
import { Archive, ClipboardCheck, FileSearch, History, Layers, Monitor, UserCheck, Wrench } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { cn } from '@/shared/lib/utils';
import { VrBadge } from '../atoms/VrBadge';
import { DocumentTitleButton } from '../molecules/DocumentTitleButton';
import { ReceiptStatus } from '../molecules/DocumentReceiptStatus';
import { EvaluationStatus } from '../molecules/EvaluationStatus';
import { handleSelectableRowKeyDown, selectableRowClass, selectedRowAccent } from '../selectableRows';
import { effectiveDeliveryLabel, effectiveOf } from '../../legalFormModel';
import { canEvaluateRow, evaluationOf, evaluationReviewer, EVALUATION_META, formatDocumentaryDate, rowCode, rowMetaLine, rowName, rowSupport, versionCountOf } from '../../canonicalDocumentaryModel';
import { applicantSummaryLabel, applicantSummaryTitle, technicalControlsOf, technicalSummary, technicalSummaryLabel, technicalSummaryTone } from '../../technicalEvaluationModel';

/** One line, never wrapping: the cells of a document row stay single-line (full text in `title`). */
const LINE = 'flex min-w-0 items-center gap-1.5 whitespace-nowrap';
const MUTED = 'min-w-0 truncate text-[11px] leading-4 text-muted-foreground';

function HeadLabel({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5">
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

const HEAD = 'h-10 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

/**
 * Optional columns after the document title, in display order. A table shows the ones it is given
 * (`columns` prop): Radicación shows all but `actions`; Expedidos hides physical/digital/evaluation;
 * Legal y debida forma adds the applicant self-assessment; Evaluación técnica swaps the evaluation for the technical summary.
 */
export const TABLE_COLUMNS = ['delivery', 'physical', 'digital', 'evaluation', 'applicant', 'technical', 'versions', 'actions'];
export const INPUT_COLUMNS = ['delivery', 'physical', 'digital', 'evaluation', 'versions'];
export const LEGAL_FORM_COLUMNS = ['delivery', 'evaluation', 'applicant', 'versions', 'actions'];
export const TECHNICAL_COLUMNS = ['delivery', 'technical', 'versions', 'actions'];
export const ISSUED_COLUMNS = ['delivery', 'versions'];

/** Row action predicate of the technical layer: the server flags it per row (older backends never do). */
export const canEvaluateTechnicalRow = (row) => Boolean(row?.actions?.reviewTechnical);

const COLUMN_DEFS = {
  delivery: {
    head: <HeadLabel icon={History}>Última entrega</HeadLabel>, className: 'w-[18%] px-[0.75rem]',
    cell: (row) => (
      <span className={LINE}>
        <VrBadge value={row.receipt.vrLabel} />
        <span className={MUTED} title={formatDocumentaryDate(row.receipt.registeredAt || row.receipt.receivedAt)}>{formatDocumentaryDate(row.receipt.registeredAt || row.receipt.receivedAt, { withTime: false })}</span>
      </span>
    ),
  },
  physical: {
    head: <HeadLabel icon={Archive}>Físico</HeadLabel>, className: 'w-[11%] px-2',
    cell: (row) => {
      const support = rowSupport(row);
      return (
        <span className={LINE}>
          <ReceiptStatus row={support} medium="physical" />
          {support.pagesPhysical !== null ? <span className={MUTED}>{support.pagesPhysical} {support.pagesPhysical === 1 ? 'folio' : 'folios'}</span> : null}
        </span>
      );
    },
  },
  digital: { head: <HeadLabel icon={Monitor}>Digital</HeadLabel>, className: 'w-[9%] px-2', cell: (row) => <ReceiptStatus row={rowSupport(row)} medium="digital" /> },
  evaluation: {
    head: <HeadLabel icon={ClipboardCheck}>Evaluación</HeadLabel>, className: 'w-[15%] px-[0.75rem]',
    cell: (row, { instances }) => {
      const effective = effectiveOf(instances?.get(row.documentKey)?.instance);
      // With legal-form data the delivery in use is derived from it; without it only an explicit choice is marked.
      const inUse = effective ? effective.rowId === row.receivedDocumentRowId : Boolean(row.ldfSelected);
      const evaluation = evaluationOf(row);
      const reviewer = evaluationReviewer(evaluation);
      const title = [EVALUATION_META[evaluation.status]?.label, reviewer ? `por ${reviewer}` : null, inUse ? 'En uso en legal y debida forma' : effective ? `Se usa: ${effectiveDeliveryLabel(effective)}` : null].filter(Boolean).join(' · ');
      return (
        <span className={LINE} title={title}>
          <EvaluationStatus row={row} showReviewer={false} />
          {inUse ? <Tag tone="success" title="Entrega que usa legal y debida forma">En uso</Tag>
            : effective ? <span className={MUTED} title="Entrega que usa legal y debida forma">Se usa: {effectiveDeliveryLabel(effective)}</span>
              : reviewer ? <span className={MUTED}>por {reviewer}</span> : null}
        </span>
      );
    },
  },
  applicant: {
    head: <HeadLabel icon={UserCheck}>Solicitante</HeadLabel>, className: 'w-[11%] px-2',
    cell: (row) => {
      const summary = row.applicantAssessment?.summary || null;
      const label = applicantSummaryLabel(summary);
      return <span className={cn('text-xs tabular-nums', label ? 'text-foreground' : 'text-muted-foreground')} title={applicantSummaryTitle(summary)}>{label || '—'}</span>;
    },
  },
  technical: {
    head: <HeadLabel icon={Wrench}>Técnica</HeadLabel>, className: 'w-[12%] px-[0.75rem]',
    cell: (row) => {
      const summary = technicalSummary(technicalControlsOf(row));
      const label = technicalSummaryLabel(summary);
      if (!label) return <span className="text-xs text-muted-foreground" title="Sin controles técnicos">—</span>;
      return (
        <span className={LINE}>
          <Tag tone={technicalSummaryTone(summary)} mono title={`${summary.complies} cumple de ${summary.total} controles técnicos`}>{label}</Tag>
          {summary.pending ? <span className={MUTED}>{summary.pending} {summary.pending === 1 ? 'pendiente' : 'pendientes'}</span> : null}
        </span>
      );
    },
  },
  versions: { head: <HeadLabel icon={Layers}>Versiones</HeadLabel>, className: 'w-[9%] px-2', cellClassName: 'font-mono text-xs tabular-nums text-foreground', cell: (row) => versionCountOf(row) },
  actions: { head: <span className="sr-only">Acciones</span>, className: 'w-[12%] px-[0.75rem] text-right', cellClassName: 'text-right', cell: null },
};


/**
 * One row per current document, grouped by ventanilla list. Presentation only.
 * The whole row selects the document (click, Enter or Space); one row is tabbable at a time.
 * `columns` picks the optional columns (see TABLE_COLUMNS); `onEvaluate(row)` adds the per-row
 * "Evaluar" action to the `actions` column for rows the server allows to evaluate (`rowEvaluable(row)` decides which; by default
 * the checking-layer flags). `instances` (documentKey -> legal-form instance, optional) lets the evaluation cell tag the delivery in use and name it when the row is another one.
 */
export function CanonicalDocumentsTable({ groups, selectedKey, expandedKey, onSelect, loading, hasFilters, onResetFilters, idPrefix, columns = INPUT_COLUMNS, onEvaluate, rowEvaluable = canEvaluateRow, instances, personOf, ariaLabel = 'Documentos recibidos', emptyText = 'Aún no hay documentos recibidos', emptyHint = 'Los documentos que se reciban en este expediente aparecerán aquí.' }) {
  const defs = columns.filter((key) => COLUMN_DEFS[key]).map((key) => ({ key, ...COLUMN_DEFS[key] }));
  const span = defs.length + 1;
  return (
    <table role="grid" className="w-full min-w-[720px] table-fixed border-collapse text-sm" aria-label={ariaLabel} aria-busy={loading}>
      <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--card))]">
        <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
          <TableHead scope="col" className={cn(HEAD, 'px-[1rem]')}>Documento</TableHead>
          {defs.map((def) => <TableHead key={def.key} scope="col" className={cn(HEAD, def.className)}>{def.head}</TableHead>)}
        </TableRow>
      </TableHeader>
      {loading ? (
        <TableBody>
          {Array.from({ length: 6 }, (_, index) => (
            <TableRow key={index} className="border-border/60">
              <TableCell className="px-[1rem] py-[0.75rem]">
                <div className="flex items-center gap-[0.75rem]"><Skeleton className="h-8 w-8 shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-4/5" /><Skeleton className="h-2 w-12" /></div></div>
              </TableCell>
              {defs.map((def) => <TableCell key={def.key} className="px-2"><Skeleton className="h-4 w-12" /></TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      ) : groups.map((group) => (
        <TableBody key={group.title} aria-label={group.title}>
          <TableRow className="border-border/60 bg-muted/15 hover:bg-muted/15">
            <TableHead scope="colgroup" colSpan={span} className="h-8 px-[1rem] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title} <span className="font-mono font-normal tabular-nums">({group.rows.length})</span>
            </TableHead>
          </TableRow>
          {group.rows.map((row) => {
            const selected = row.rowKey === selectedKey;
            return (
              <TableRow
                key={row.rowKey}
                data-row-key={row.rowKey}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelect(row)}
                onKeyDown={(event) => handleSelectableRowKeyDown(event, () => onSelect(row))}
                className={selectableRowClass(selected)}
              >
                <TableCell className={cn('relative px-[1rem] py-2', selected && selectedRowAccent)}>
                  <DocumentTitleButton
                    name={rowName({ ...row, instanceLabel: null })}
                    code={rowCode(row)}
                    meta={rowMetaLine(row, personOf?.(row))}
                    selected={selected}
                    controlsId={`${idPrefix}-${row.receivedDocumentRowId}`}
                    tabIndex={-1}
                  />
                </TableCell>
                {defs.map((def) => (
                  <TableCell key={def.key} className={cn('px-[0.75rem] py-2', def.key === 'physical' || def.key === 'digital' || def.key === 'versions' || def.key === 'applicant' ? 'px-2' : null, def.cellClassName)}>
                    {def.key === 'actions' ? (onEvaluate && rowEvaluable(row) ? (
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" aria-label={`Evaluar ${[rowCode(row), row.instanceLabel].filter(Boolean).join(' · ') || rowName(row)}`}
                        onClick={(event) => { event.stopPropagation(); onEvaluate(row); }}>Evaluar</Button>
                    ) : null) : def.cell(row, { instances })}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      ))}
      {!loading && !groups.length ? (
        <TableBody>
          <TableRow>
            <TableCell colSpan={span} className="px-6 py-16 text-center">
              <FileSearch className="mx-auto mb-[0.75rem] h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mb-1 text-sm font-semibold text-foreground">{hasFilters ? 'Sin coincidencias' : emptyText}</p>
              <p className="mb-[1rem] text-xs text-muted-foreground">
                {hasFilters ? 'Pruebe con otro nombre, código o combinación de filtros.' : emptyHint}
              </p>
              {hasFilters ? <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>Limpiar filtros</Button> : null}
            </TableCell>
          </TableRow>
        </TableBody>
      ) : null}
    </table>
  );
}

export default CanonicalDocumentsTable;
