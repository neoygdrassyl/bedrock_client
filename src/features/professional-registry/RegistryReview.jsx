import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import RegistryPicker from './RegistryPicker';
import { DIFF_LABELS, DUPLICATE_REASONS, errorText, formatCc, formatMonths } from './professionalRegistry.utils';

const QUEUES = [
  ['duplicados', 'Posibles duplicados'],
  ['nombres', 'Nombres dudosos'],
  ['identidad', 'Identidad pendiente'],
  ['experiencia', 'Experiencia atípica'],
  ['roles', 'Rol sin clasificar'],
];

export default function RegistryReview({ canWrite, onChanged, onOpen }) {
  const [type, setType] = useState('duplicados');
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({});
  const [queue, setQueue] = useState({ type: null, data: [], total: 0, limit: 25 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(null);
  const [target, setTarget] = useState(null);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    try {
      const [counts, items] = await Promise.all([ProfessionalRegistryService.reviewSummary(), ProfessionalRegistryService.review({ type, page, limit: 25 })]);
      if (request !== latestRequest.current) return;
      setSummary(counts?.data || {});
      setQueue({ type, data: items?.data?.data || [], total: items?.data?.total || 0, limit: items?.data?.limit || 25 });
      setError('');
    } catch (e) {
      if (request !== latestRequest.current) return;
      setError(errorText(e, 'No fue posible cargar la cola de revisión.'));
    }
  }, [type, page]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (body) => {
    setBusy(true);
    setError('');
    try {
      await ProfessionalRegistryService.resolve(body);
      onChanged?.();
      await load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const assign = async () => {
    const item = picking;
    await resolve({ type: 'identidad', action: 'assign', participationId: item.id, registryId: target.id });
    setPicking(null);
    setTarget(null);
  };

  // The rows of the previous queue must never be drawn with the renderer of the new one while it loads.
  const rows = queue.type === type ? queue.data : [];
  const pages = Math.max(Math.ceil(queue.total / queue.limit), 1);
  const selectType = (next) => { setType(next); setPage(1); };

  return (
    <section aria-label="Por revisar" className="space-y-3">
      <nav className="flex flex-wrap gap-2" aria-label="Colas de revisión">
        {QUEUES.map(([key, label]) => (
          <Button key={key} type="button" size="sm" variant={type === key ? 'default' : 'outline'} aria-current={type === key ? 'page' : undefined} onClick={() => selectType(key)}>
            {label} <Badge variant="secondary" className="ml-2">{summary[key] ?? 0}</Badge>
          </Button>
        ))}
      </nav>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {queue.type === type && !rows.length && !error ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No hay casos pendientes en esta cola.</p> : null}

      <ul className="space-y-2">
        {type === 'duplicados' ? rows.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{DUPLICATE_REASONS[item.reason] || item.reason}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[item.a, item.b].map((person) => (
                <div key={person.id} className="rounded-md border border-border/60 p-2">
                  <button type="button" className="font-medium underline" onClick={() => onOpen?.(person.id)}>{person.name}</button>
                  <p className="text-xs text-muted-foreground">{formatCc(person.cc)} · {person.projects} expedientes</p>
                </div>
              ))}
            </div>
            {canWrite ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'duplicados', id: item.id, action: 'merge', keepId: item.a.id })}>Conservar «{item.a.name}»</Button>
                <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'duplicados', id: item.id, action: 'merge', keepId: item.b.id })}>Conservar «{item.b.name}»</Button>
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => resolve({ type: 'duplicados', id: item.id, action: 'dismiss' })}>No son la misma persona</Button>
              </div>
            ) : null}
          </li>
        )) : null}

        {type === 'nombres' ? rows.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p><span className="font-medium">{item.name}</span> <span className="text-muted-foreground">en {item.expediente}</span></p>
            <p className="text-xs text-muted-foreground">Nombre canónico: {item.canonicalName} · {DIFF_LABELS[item.diffType] || item.diffType} · {Math.round(item.similarity * 100)}%</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button>
              {canWrite ? <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'nombres', id: item.id, action: 'reviewed' })}>Marcar revisado</Button> : null}
            </div>
          </li>
        )) : null}

        {type === 'identidad' ? rows.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p><span className="font-medium">{item.name || 'Sin nombre'}</span> <span className="text-muted-foreground">{item.kind === 'persona' ? 'Persona sin cédula ni matrícula' : `Participación sin identificar en ${item.expediente}`}</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.kind === 'persona' ? <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button> : null}
              {canWrite && item.kind === 'persona' ? <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'identidad', action: 'confirm', id: item.id, expectedVersion: item.version })}>Confirmar identidad</Button> : null}
              {canWrite && item.kind === 'participacion' ? <Button type="button" size="sm" onClick={() => { setTarget(null); setPicking(item); }}>Asignar a un profesional</Button> : null}
            </div>
          </li>
        )) : null}

        {type === 'experiencia' ? rows.map((item) => (
          <li key={`${item.registryId}-${item.roleCode}`} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p><span className="font-medium">{item.name}</span> <span className="text-muted-foreground">{item.roleCode}</span></p>
            <p className="text-xs text-muted-foreground">Último: {formatMonths(item.monthsLatest)} · Máximo: {formatMonths(item.monthsMax)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button>
              {canWrite && item.monthsLatest ? <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'experiencia', action: 'override', registryId: item.registryId, roleCode: item.roleCode, months: item.monthsLatest })}>Aceptar {formatMonths(item.monthsLatest)}</Button> : null}
            </div>
          </li>
        )) : null}

        {type === 'roles' ? rows.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-card p-3 text-sm">
            <span className="font-medium">{item.role || 'Sin rol'}</span> <span className="text-muted-foreground">en {item.expediente}</span>
          </li>
        )) : null}
      </ul>

      <nav className="flex items-center justify-between text-sm" aria-label="Paginación de la cola">
        <span className="text-muted-foreground">{queue.total} casos · página {page} de {pages}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Siguiente</Button>
        </div>
      </nav>

      <Dialog open={Boolean(picking)} onOpenChange={(next) => { if (!next) setPicking(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar a un profesional</DialogTitle>
            <DialogDescription>{picking ? `Expediente ${picking.expediente}, registrado como «${picking.name}».` : ''}</DialogDescription>
          </DialogHeader>
          <RegistryPicker selectedId={target?.id} onSelect={setTarget} label="Profesional correcto" />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPicking(null)}>Cancelar</Button>
            <Button type="button" disabled={!target || busy} onClick={assign}>Asignar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
