import { useState } from 'react';
import { Download, FilePlus2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { downloadCanonicalFile, getCanonicalVersions } from '@/app/services/documentaryOperations.service';
import { VrBadge } from '../atoms/VrBadge';
import { DocumentSupportList } from '../molecules/DocumentSupportList';
import { DocumentalDetailShell } from './DocumentalDetailShell';
import { ControlDecision, ErrorMessage } from './CanonicalDocumentForms';
import { CHANNEL_LABELS, CLASS_LABELS, CONTRIBUTOR_LABELS, documentClassOf, EMPTY_VALUE, formatDocumentaryDate, rowCode, rowListTitle, rowName, rowSupport, versionCountOf } from '../../canonicalDocumentaryModel';

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
        <Button key={slot} type="button" variant="outline" size={size} className="h-8 text-xs" disabled={busy} onClick={() => download(slot)}>
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
      <div className="relative flex w-4 shrink-0 justify-center">
        {!last ? <span className="absolute bottom-[-16px] top-3 w-px bg-border" aria-hidden="true" /> : null}
        <span className={cn('relative mt-1.5 h-2 w-2 rounded-full border', current ? 'border-primary bg-primary' : 'border-border bg-muted')} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-foreground">Versión {sequence}</span>
          <VrBadge value={receipt.vrLabel} />
          {current ? <span className="text-[11px] font-medium text-[hsl(var(--primary))]">Vigente</span> : null}
        </div>
        <p className="m-0 text-xs leading-5 text-muted-foreground">
          {formatDocumentaryDate(receipt.registeredAt || receipt.receivedAt)}
          {caption ? <><span className="mx-1.5" aria-hidden="true">·</span>{caption}</> : null}
        </p>
        <DocumentFiles origin={origin} receipt={receipt} onError={onError} />
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
    <section aria-labelledby={`versions-${row.rowKey}`}>
      <div className="mb-[0.75rem] flex items-center justify-between gap-2">
        <h4 id={`versions-${row.rowKey}`} className="m-0 text-xs font-semibold text-foreground">Versiones</h4>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{total}</span>
      </div>
      <ol className="m-0 list-none p-0">
        {items.map((receipt, index) => (
          <TimelineItem key={receipt.id} origin={origin} receipt={receipt} sequence={receipt.versionSequence} current={receipt.id === row.receivedDocumentRowId} onError={setError} last={index === items.length - 1} />
        ))}
      </ol>
      {total > 1 && (!history || history.nextAfterId) ? (
        <Button type="button" variant="ghost" size="sm" className="mt-2 h-8 px-2 text-xs" disabled={busy} onClick={load}>
          {busy ? 'Consultando…' : history ? 'Más versiones' : 'Ver versiones anteriores'}
        </Button>
      ) : null}
      <ErrorMessage error={error} />
    </section>
  );
}

function Fact({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-normal text-muted-foreground">{label}</dt>
      <dd className="mb-0 mt-1 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

/** "Ficha documental" of a catalogue-based document. */
export function CanonicalDocumentDetail({ origin, row, canReceive, canReview, headingId, onReceiveVersion, onUpdateEvidence, onSaved, onConflict }) {
  const documentClass = documentClassOf(row);
  const support = rowSupport(row);
  const receipt = row.receipt;
  // vr_slip rows cannot get new versions; their evidence can still be corrected.
  const canUpdateEvidence = canReceive && (row.actions?.replace || (documentClass === 'vr_slip' && row.actions?.receive));
  const canReceiveVersion = canReceive && row.actions?.replace;
  const footer = canUpdateEvidence || canReceiveVersion ? (
    <>
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
      {row.isAdditional === true ? <p className="mb-3 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">Documento adicional: no hace parte de los requisitos del expediente.</p> : null}
      <section className="border-y border-border/70 py-[1rem]" aria-label="Soportes recibidos">
        <DocumentSupportList row={support} scanned={support.scanned} />
        <dl className="mb-0 mt-[1rem] grid grid-cols-2 gap-[1rem] border-t border-border/70 pt-[1rem]">
          <Fact label="Folios físicos"><span className="font-mono tabular-nums">{support.pagesPhysical ?? EMPTY_VALUE}</span></Fact>
          <Fact label="Ubicación física">{receipt.location || EMPTY_VALUE}</Fact>
          <Fact label="Aportado por">{CONTRIBUTOR_LABELS[receipt.contributor] || EMPTY_VALUE}</Fact>
          <Fact label="Medio">{CHANNEL_LABELS[receipt.channel] || EMPTY_VALUE}</Fact>
          <div className="col-span-2"><Fact label="Lista">{rowListTitle(row)}</Fact></div>
        </dl>
      </section>
      <div className="pt-[1.25rem]">
        <VersionTimeline origin={origin} row={row} />
      </div>
      {row.controls.length ? (
        <section className="mt-[1.25rem] space-y-2 border-t border-border/70 pt-[1.25rem]" aria-labelledby={`controls-${row.rowKey}`}>
          <h4 id={`controls-${row.rowKey}`} className="m-0 text-xs font-semibold text-foreground">Legal y debida forma</h4>
          {row.controls.map((control) => (
            <ControlDecision key={control.controlId} origin={origin} row={row} control={control} canReview={canReview} onSaved={onSaved} onConflict={onConflict} />
          ))}
        </section>
      ) : null}
    </DocumentalDetailShell>
  );
}

export default CanonicalDocumentDetail;
