import { useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { refreshDocumentaryRequirements } from '@/app/services/documentaryOperations.service';
import MissingDocumentsModal from '@/app/pages/user/submit/MissingDocumentsModal.jsx';
import { requirementStatus } from '../../canonicalDocumentaryModel';

const TONES = {
  pending: { icon: Info, className: 'border-border bg-muted/30 text-foreground' },
  missing: { icon: CircleAlert, className: 'border-[hsl(var(--operational-warning-border)/0.4)] bg-[hsl(var(--operational-warning-bg))] text-[hsl(var(--operational-warning-text))]' },
  complete: { icon: CircleCheck, className: 'border-[hsl(var(--operational-success-border)/0.4)] bg-[hsl(var(--operational-success-bg))] text-[hsl(var(--operational-success-text))]' },
};

/**
 * Single requirement status for the expediente (replaces per-document repetitions).
 * "Actualizar requisitos" is offered only to roles allowed to refresh the evaluation.
 */
export function CanonicalRequirementBanner({ view, fun0Id, canRefresh = false, onRefreshed, onConflict }) {
  const status = requirementStatus(view);
  const tone = TONES[status.tone];
  const [missingOpen, setMissingOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Reloading the workspace unmounts this banner, so a refresh made in the modal waits until it closes.
  const refreshedInModal = useRef(false);
  function closeMissing() {
    setMissingOpen(false);
    if (refreshedInModal.current) { refreshedInModal.current = false; onRefreshed?.(); }
  }
  async function refresh() {
    setBusy(true); setError('');
    try {
      await refreshDocumentaryRequirements(fun0Id, {
        expectedInputRevision: view.governance?.inputRevision ?? 0,
        idempotencyKey: crypto.randomUUID(),
        reason: 'Actualización de la evaluación de requisitos',
      });
      onRefreshed?.();
    } catch (failure) {
      if (failure.response?.status === 409) onConflict?.(); else setError(documentaryError(failure));
    } finally { setBusy(false); }
  }
  const Icon = tone.icon;
  return (
    <section aria-label="Estado de los requisitos" className={cn('flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 text-sm', tone.className)}>
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="m-0 min-w-0 flex-1">
        <span className="font-medium">{status.message}</span>
        {status.detail ? <span className="opacity-80"> {status.detail}</span> : null}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={() => setMissingOpen(true)}>Ver faltantes</Button>
        {canRefresh && status.tone === 'pending' ? (
          <Button type="button" size="sm" className="h-8" disabled={busy} onClick={refresh}>
            <RefreshCw className={cn(busy && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />
            {busy ? 'Actualizando…' : 'Actualizar requisitos'}
          </Button>
        ) : null}
      </div>
      {error ? <p role="alert" className="m-0 basis-full text-xs text-destructive">{error}</p> : null}
      <MissingDocumentsModal open={missingOpen} fun0Id={fun0Id} onClose={closeMissing} onRefreshed={() => { refreshedInModal.current = true; }} />
    </section>
  );
}

export default CanonicalRequirementBanner;
