import { useState } from 'react';
import { ClipboardCheck, Download, FilePlus2, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { downloadCanonicalFile, getCanonicalVersions } from '@/app/services/documentaryOperations.service';
import { VrBadge } from '../atoms/VrBadge';
import { reviewedByLine } from '../../legalFormModel';
import { DetailFact, DetailPill, DetailSection } from '../molecules/DetailSection';
import { DocumentSupportList } from '../molecules/DocumentSupportList';
import { DocumentalDetailShell } from './DocumentalDetailShell';
import { EvaluationStatus } from '../molecules/EvaluationStatus';
import { effectLabel, ErrorMessage } from './CanonicalDocumentForms';
import { canEvaluateRow, CHANNEL_LABELS, CLASS_LABELS, CONTRIBUTOR_LABELS, documentClassOf, EMPTY_VALUE, evaluationOf, formatDocumentaryDate, rowCode, rowListTitle, rowName, rowSupport, versionCountOf } from '../../canonicalDocumentaryModel';

/** Download buttons for the files of one receipt (digital and/or scan of the physical copy). */
export function DocumentFiles({ origin, receipt, onError, size = 'sm' }) {
  const [busy, setBusy] = useState(false);
  async function download(slot) {
    setBusy(true);
    try { await downloadCanonicalFile(origin.project.fun0Id, receipt.id, slot, receipt.files[slot]); }
    catch (failure) { onError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  const slots = ['digital', 'scan'].filter((slot) => receipt.files?.[slot]);
  if (!slots.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <Button key={slot} type="button" variant="outline" size={size} className="h-8 px-2.5 text-xs" disabled={busy} onClick={() => download(slot)}>
          <Download aria-hidden="true" />
          Descargar {slot === 'digital' ? 'digital' : 'escaneado'}
        </Button>
      ))}
    </div>
  );
}

function receiptCaption(receipt) {
  return [CONTRIBUTOR_LABELS[receipt.contributor] || receipt.contributor, CHANNEL_LABELS[receipt.channel] || receipt.channel].filter(Boolean).join(' · ');
}

function TimelineItem({ origin, receipt, sequence, current, onError, last }) {
  const caption = receiptCaption(receipt);
  return (
    <li className="relative flex gap-[0.75rem] pb-[1rem] last:pb-0">
      <div className="relative flex w-3 shrink-0 justify-center">
        {!last ? <span className="absolute -bottom-1 top-[14px] w-px bg-border" aria-hidden="true" /> : null}
        <span
          className={cn(
            'relative mt-1 h-2.5 w-2.5 rounded-full border-[2px] border-solid',
            current ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
          )}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">Versión {sequence}</span>
          <VrBadge value={receipt.vrLabel} />
          {current ? <DetailPill tone="primary">Vigente</DetailPill> : null}
        </div>
        <p className="mb-0 mt-1 text-xs leading-5 text-muted-foreground">
          {formatDocumentaryDate(receipt.registeredAt || receipt.receivedAt)}
          {caption ? <><span className="mx-1.5" aria-hidden="true">·</span>{caption}</> : null}
        </p>
        <div className="mt-2 empty:hidden">
          <DocumentFiles origin={origin} receipt={receipt} onError={onError} />
        </div>
      </div>
    </li>
  );
}

/** Version timeline: the current version is always shown; older ones load on demand. */
function VersionTimeline({ origin, row }) {
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = versionCountOf(row);
  async function load() {
    setBusy(true); setError('');
    try {
      const page = await getCanonicalVersions(origin.project.fun0Id, row, history?.nextAfterId || 0);
      setHistory({ ...page, rows: [...(history?.rows || []), ...page.rows] });
    } catch (failure) { setError(documentaryError(failure)); }
    finally { setBusy(false); }
  }
  const items = history
    ? [...history.rows].sort((left, right) => right.versionSequence - left.versionSequence)
    : [{ ...row.receipt, versionSequence: row.versionSequence }];
  return (
    <DetailSection id={`versions-${row.rowKey}`} title="Versiones" aside={<DetailPill>{total}</DetailPill>}>
      <ol className="m-0 list-none p-0">
        {items.map((receipt, index) => (
          <TimelineItem key={receipt.id} origin={origin} receipt={receipt} sequence={receipt.versionSequence} current={receipt.id === row.receivedDocumentRowId} onError={setError} last={index === items.length - 1} />
        ))}
      </ol>
      {total > 1 && (!history || history.nextAfterId) ? (
        <Button type="button" variant="ghost" size="sm" className="mt-2 h-8 w-full text-xs text-muted-foreground" disabled={busy} onClick={load}>
          {busy ? 'Consultando…' : history ? 'Más versiones' : 'Ver versiones anteriores'}
        </Button>
      ) : null}
      {error ? <ErrorMessage error={error} className="mt-2" /> : null}
    </DetailSection>
  );
}

/** "Ficha documental" of a catalogue-based document. */
export function CanonicalDocumentDetail({ origin, row, canReceive, canReview, headingId, onReceiveVersion, onUpdateEvidence, onEvaluate }) {
  const documentClass = documentClassOf(row);
  const support = rowSupport(row);
  const receipt = row.receipt;
  // vr_slip rows cannot get new versions; their evidence can still be corrected.
  const canUpdateEvidence = canReceive && (row.actions?.replace || (documentClass === 'vr_slip' && row.actions?.receive));
  const canReceiveVersion = canReceive && row.actions?.replace;
  const evaluation = evaluationOf(row);
  const reviewedBy = reviewedByLine({ name: evaluation.reviewedByName, id: evaluation.reviewedBy, at: evaluation.reviewedAt });
  // Only requirements are evaluated; the server flags the rows the user may evaluate.
  const canEvaluate = Boolean(canReview && onEvaluate && canEvaluateRow(row));
  const footer = canUpdateEvidence || canReceiveVersion || canEvaluate ? (
    <>
      {canEvaluate ? (
        <Button type="button" size="sm" onClick={() => onEvaluate(row)}>
          <ClipboardCheck aria-hidden="true" />Evaluar
        </Button>
      ) : null}
      {canReceiveVersion ? (
        <Button type="button" size="sm" onClick={() => onReceiveVersion(row)}>
          <FilePlus2 aria-hidden="true" />Recibir nueva versión
        </Button>
      ) : null}
      {canUpdateEvidence ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onUpdateEvidence(row)}>
          <RefreshCw aria-hidden="true" />Actualizar evidencia
        </Button>
      ) : null}
    </>
  ) : null;
  return (
    <DocumentalDetailShell
      code={rowCode(row)}
      title={rowName(row)}
      headingId={headingId}
      caption={`${CLASS_LABELS[documentClass] || 'Documento'} · Versión ${row.versionSequence} de ${versionCountOf(row)}`}
      footer={footer}
    >
      {row.isAdditional === true ? (
        <Alert role="note" variant="neutral" className="px-[0.75rem] py-2">
          <Info aria-hidden="true" />
          <AlertDescription className="text-xs">Documento adicional: no hace parte de los requisitos del expediente.</AlertDescription>
        </Alert>
      ) : null}
      <DetailSection id={`supports-${row.rowKey}`} title="Soportes recibidos">
        <DocumentSupportList row={support} scanned={support.scanned} />
        <Separator className="my-[0.75rem]" />
        <dl className="m-0 grid grid-cols-2 gap-x-[1rem] gap-y-[0.75rem]">
          <DetailFact label="Folios físicos"><span className="tabular-nums">{support.pagesPhysical ?? EMPTY_VALUE}</span></DetailFact>
          <DetailFact label="Ubicación física">{receipt.location || EMPTY_VALUE}</DetailFact>
          <DetailFact label="Aportado por">{CONTRIBUTOR_LABELS[receipt.contributor] || EMPTY_VALUE}</DetailFact>
          <DetailFact label="Medio">{CHANNEL_LABELS[receipt.channel] || EMPTY_VALUE}</DetailFact>
          <DetailFact label="Lista" className="col-span-2">{rowListTitle(row)}</DetailFact>
        </dl>
      </DetailSection>
      <VersionTimeline origin={origin} row={row} />
      {documentClass === 'requirement' ? (
        <DetailSection id={`evaluation-${row.rowKey}`} title="Evaluación">
          <div className="flex flex-col gap-2">
            <div><EvaluationStatus row={row} showReviewer={false} /></div>
            {reviewedBy ? <p className="mb-0 text-xs leading-4 text-muted-foreground">{reviewedBy}</p> : null}
            {evaluation.observation ? <p className="mb-0 text-xs leading-5 text-foreground">{evaluation.observation}</p> : null}
            {row.controls.length ? (
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-xs leading-4">
                {row.controls.map((control) => (
                  <li key={control.controlId} className="flex flex-wrap justify-between gap-x-2">
                    <span className="text-foreground">{control.title}</span>
                    <span className="text-muted-foreground">{control.review?.current === false ? 'Requiere nueva revisión' : effectLabel(control.review?.effect)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </DetailSection>
      ) : null}
    </DocumentalDetailShell>
  );
}

export default CanonicalDocumentDetail;
