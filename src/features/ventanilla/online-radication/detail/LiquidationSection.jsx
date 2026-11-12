import { useRef, useState } from 'react';
import { CircleAlert, FileText, Receipt, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { DovelaButton } from '@/shared/dovela-ui';
import OnlineRadicationService from '@/features/ventanilla/api/online-radication.service';
import { formatBytes, formatDateTime } from '../onlineRadicationModel';
import { DetailCard, EmptyNote, Fact, FactGrid } from './DetailPrimitives';

const MAX_INVOICE_BYTES = 10 * 1024 * 1024;
const STATUS_LABELS = {
  awaiting_payment: 'En espera de pago',
  receipt_submitted: 'Recibo en revisión',
  receipt_rejected: 'Recibo rechazado',
  approved: 'Pago aprobado',
};
const STATUS_TONE = {
  awaiting_payment: 'bg-[hsl(var(--warning)/0.15)] text-foreground',
  receipt_submitted: 'bg-primary/10 text-[hsl(var(--primary))]',
  receipt_rejected: 'bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]',
  approved: 'bg-[hsl(var(--success)/0.15)] text-foreground',
};

function isPdf(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/**
 * Liquidation stage of a pending request: the operator uploads the pre-liquidation invoice (PDF),
 * the applicant answers with a payment receipt, and the operator rejects it or approves the
 * payment (which radicates; see DetailFooter). Hidden for rejected requests without liquidation.
 */
export function LiquidationSection({ item, liquidation, loaded, error, onRetry, onIssued, onViewFile, onRejectReceipt }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const pending = item.status === 'pending';
  if (!loaded && !error) return null;
  if (loaded && !liquidation && !pending) return null;

  const status = liquidation?.status;
  const canIssue = pending && status !== 'receipt_submitted' && status !== 'approved';
  const view = (kind) => onViewFile({
    requestId: item.id,
    liquidationKind: kind,
    name: kind === 'invoice' ? liquidation.invoice?.fileName : liquidation.receipt?.fileName,
    label: kind === 'invoice' ? 'Preliquidación' : 'Recibo de pago',
    mimeType: kind === 'invoice' ? liquidation.invoice?.mimeType : null,
    byteSize: kind === 'invoice' ? liquidation.invoice?.byteSize : liquidation.receipt?.byteSize,
  });

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    if (!isPdf(file)) { setUploadError('La preliquidación debe ser un archivo PDF.'); return; }
    if (file.size > MAX_INVOICE_BYTES) { setUploadError('La preliquidación puede pesar máximo 10 MiB.'); return; }
    setUploading(true);
    try {
      const updated = await OnlineRadicationService.issueInvoice(item.id, file);
      onIssued(updated);
    } catch (failure) {
      setUploadError(failure?.message || 'No fue posible cargar la preliquidación.');
    } finally {
      setUploading(false);
    }
  }

  const aside = status ? (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${STATUS_TONE[status] || 'bg-muted'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  ) : null;

  return (
    <DetailCard icon={Receipt} title="Liquidación" aside={aside} contentClassName="flex flex-col gap-[0.875rem]">
      {error ? (
        <Alert variant="destructive" className="flex-wrap items-center">
          <CircleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">No fue posible leer la liquidación: {error.message}</AlertDescription>
          <DovelaButton tone="neutral" onClick={onRetry}>Reintentar</DovelaButton>
        </Alert>
      ) : null}

      {!liquidation ? (
        <EmptyNote>
          Esta solicitud aún no tiene preliquidación. Cargue el PDF de la primera factura: la ciudadanía recibirá un aviso,
          verá el estado «En espera de pago» y podrá descargarla y enviar el recibo.
        </EmptyNote>
      ) : (
        <>
          <FactGrid>
            <Fact label="Preliquidación">
              <button type="button" onClick={() => view('invoice')} className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent p-0 text-left text-sm font-medium text-[hsl(var(--primary))] underline-offset-2 hover:underline">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />{liquidation.invoice?.fileName}
              </button>
              <span className="ml-2 text-xs text-muted-foreground">{formatBytes(liquidation.invoice?.byteSize)}</span>
            </Fact>
            <Fact label="Emitida" value={formatDateTime(liquidation.issuedAt)} />
            <Fact label="Recibo de pago">
              {liquidation.receipt ? (
                <>
                  <button type="button" onClick={() => view('receipt')} className="inline-flex cursor-pointer items-center gap-1.5 bg-transparent p-0 text-left text-sm font-medium text-[hsl(var(--primary))] underline-offset-2 hover:underline">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />{liquidation.receipt.fileName}
                  </button>
                  <span className="ml-2 text-xs text-muted-foreground">{formatBytes(liquidation.receipt.byteSize)}</span>
                </>
              ) : null}
            </Fact>
            <Fact label="Recibo enviado" value={formatDateTime(liquidation.receipt?.submittedAt)} />
            {liquidation.receipt?.rejectionReason ? (
              <Fact label={`Recibo rechazado${liquidation.receipt.rejectedAt ? ` el ${formatDateTime(liquidation.receipt.rejectedAt)}` : ''}`} value={liquidation.receipt.rejectionReason} wide />
            ) : null}
            {liquidation.approvedAt ? <Fact label="Pago aprobado" value={formatDateTime(liquidation.approvedAt)} /> : null}
          </FactGrid>

          {pending && status === 'receipt_submitted' ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-[0.875rem] py-2.5 text-xs leading-5 text-muted-foreground">
              <span>Revise el recibo. Si es correcto, apruebe el pago y radique desde el pie; si no, rechácelo con un motivo.</span>
              <DovelaButton tone="neutral" onClick={onRejectReceipt}>Rechazar recibo</DovelaButton>
            </div>
          ) : null}
        </>
      )}

      {uploadError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">{uploadError}</AlertDescription>
        </Alert>
      ) : null}

      {canIssue ? (
        <div className="flex justify-end">
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} aria-label="Archivo PDF de la preliquidación" onChange={handleFile} />
          <DovelaButton tone={liquidation ? 'neutral' : 'primary'} leadingIcon={Upload} loading={uploading} loadingLabel="Cargando…" onClick={() => inputRef.current?.click()}>
            {liquidation ? 'Reemplazar preliquidación' : 'Cargar preliquidación (PDF)'}
          </DovelaButton>
        </div>
      ) : null}
    </DetailCard>
  );
}
