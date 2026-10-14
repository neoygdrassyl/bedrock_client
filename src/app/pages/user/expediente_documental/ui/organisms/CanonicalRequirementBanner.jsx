import { useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { refreshDocumentaryRequirements } from '@/app/services/documentaryOperations.service';
import MissingDocumentsModal from '@/app/pages/user/submit/MissingDocumentsModal.jsx';
import { requirementStatus } from '../../canonicalDocumentaryModel';

const TONES = {
  pending: { icon: Info, variant: 'neutral' },
  missing: { icon: CircleAlert, variant: 'warning' },
  complete: { icon: CircleCheck, variant: 'success' },
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
    <Alert role="region" aria-label="Estado de los requisitos" variant={tone.variant} className="flex-wrap items-center gap-y-2">
      <Icon className="self-start" aria-hidden="true" />
      <div className="min-w-0 flex-1 basis-[16rem]">
        <AlertTitle>{status.message}</AlertTitle>
        {status.detail ? <AlertDescription className="mt-0.5 text-xs opacity-90">{status.detail}</AlertDescription> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={() => setMissingOpen(true)}>Ver faltantes</Button>
        {canRefresh && status.tone === 'pending' ? (
          <Button type="button" size="sm" className="h-8" disabled={busy} onClick={refresh}>
            <RefreshCw className={cn(busy && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />
            {busy ? 'Actualizando…' : 'Actualizar requisitos'}
          </Button>
        ) : null}
      </div>
      {error ? <p role="alert" className="mb-0 basis-full text-xs text-destructive">{error}</p> : null}
      <MissingDocumentsModal open={missingOpen} fun0Id={fun0Id} onClose={closeMissing} onRefreshed={() => { refreshedInModal.current = true; }} />
    </Alert>
  );
}

export default CanonicalRequirementBanner;
