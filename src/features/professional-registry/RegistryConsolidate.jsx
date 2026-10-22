import { useEffect, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { errorText } from './professionalRegistry.utils';

const LINES = [
  ['sourceRows', 'Registros de profesionales en los expedientes'],
  ['participationsNew', 'Participaciones nuevas'],
  ['participationsUpdated', 'Participaciones modificadas'],
  ['registriesNew', 'Profesionales nuevos'],
  ['duplicateCandidatesNew', 'Posibles duplicados nuevos'],
  ['unidentified', 'Sin identificar'],
  ['plannedWrites', 'Cambios a escribir'],
];

// Safety net for the automatic sync: shows what a full consolidation would change before applying it.
export default function RegistryConsolidate({ open, onClose, onApplied }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [applied, setApplied] = useState(false);

  const run = async (apply) => {
    setBusy(true);
    setError('');
    try {
      const response = await ProfessionalRegistryService.consolidate({ apply });
      setSummary(response?.data || null);
      if (apply) { setApplied(true); onApplied?.(); }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setSummary(null);
    setApplied(false);
    run(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose?.(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reconciliar con los expedientes</DialogTitle>
          <DialogDescription>Compara la base con los profesionales registrados en los expedientes. Las ediciones manuales no se modifican.</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        {busy && !summary ? <p className="text-sm text-muted-foreground">Calculando…</p> : null}
        {summary ? (
          <dl className="space-y-1 text-sm" aria-label="Resultado de la reconciliación">
            {LINES.map(([key, label]) => (
              <div key={key} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold tabular-nums">{summary[key] ?? 0}</dd></div>
            ))}
          </dl>
        ) : null}
        {applied ? <p className="text-sm text-emerald-700" role="status">Cambios aplicados.</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onClose?.()}>Cerrar</Button>
          <Button type="button" disabled={busy || !summary || applied || !summary.plannedWrites} onClick={() => run(true)}>
            {summary && !summary.plannedWrites ? 'Sin cambios pendientes' : 'Aplicar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
