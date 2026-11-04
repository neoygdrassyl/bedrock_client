import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { cn } from '@/shared/lib/utils';
import RegistryMatriculaCase from './RegistryMatriculaCase';
import RegistryMergeCase from './RegistryMergeCase';
import RegistryPairCase from './RegistryPairCase';
import { DIFF_LABELS, errorText, formatMonths, isImplausibleMonths } from './professionalRegistry.utils';

const QUEUES = [
  ['duplicados', 'Posibles duplicados'],
  ['fusionar', 'Fusionar'],
  ['compartida', 'Matrícula compartida'],
  ['nombres', 'Nombres dudosos'],
  ['matricula', 'Matrícula múltiple'],
  ['experiencia', 'Experiencia atípica'],
  ['roles', 'Rol sin clasificar'],
];

export default function RegistryReview({ canWrite, onChanged, onOpen }) {
  const [type, setType] = useState('duplicados');
  const [page, setPage] = useState(1);
  // null until the first counts arrive, so no queue is drawn with a provisional 0.
  const [summary, setSummary] = useState(null);
  const [queue, setQueue] = useState({ type: null, data: [], total: 0, limit: 25 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
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

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      onChanged?.();
      await load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const resolve = (body) => run(() => ProfessionalRegistryService.resolve(body));
  const saveRegistration = (item, registration) => run(() => ProfessionalRegistryService.update(item.registryId, { expectedVersion: item.version, registration }));

  // The rows of the previous queue must never be drawn with the renderer of the new one while it loads.
  const rows = queue.type === type ? queue.data : [];
  // Only the queues with pending cases. A queue an older backend does not report ("Fusionar", "Matrícula
  // compartida") counts as empty.
  const queues = summary ? QUEUES.filter(([key]) => Number(summary[key]) > 0) : [];
  const firstQueue = queues.length ? queues[0][0] : null;
  const typeVisible = queues.some(([key]) => key === type);
  const allClear = summary !== null && !queues.length;
  const caseProps = { canWrite, busy, onResolve: resolve, onOpen };
  const pages = Math.max(Math.ceil(queue.total / queue.limit), 1);
  const selectType = (next) => { setType(next); setPage(1); };

  // The selected queue has no cases (the initial one, or one whose last case was just resolved): open the first
  // queue that still has some instead of leaving a hidden queue selected.
  useEffect(() => {
    if (firstQueue && !typeVisible) {
      setType(firstQueue);
      setPage(1);
    }
  }, [firstQueue, typeVisible]);

  return (
    <section aria-label="Por revisar" className="space-y-3">
      {queues.length ? (
        <nav className="flex flex-wrap gap-2" aria-label="Colas de revisión">
          {queues.map(([key, label]) => (
            <Button key={key} type="button" size="sm" variant={type === key ? 'default' : 'outline'} aria-current={type === key ? 'page' : undefined} onClick={() => selectType(key)}>
              {label} <Badge variant="secondary" className="ml-2">{summary[key]}</Badge>
            </Button>
          ))}
        </nav>
      ) : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {allClear && !error ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No hay casos pendientes por revisar.</p> : null}
      {!allClear && queue.type === type && !rows.length && !error ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No hay casos pendientes en esta cola.</p> : null}

      <ul className="space-y-2">
        {type === 'duplicados' || type === 'compartida' ? rows.map((item) => (
          <RegistryPairCase key={item.id} type={type} item={item} {...caseProps} />
        )) : null}

        {type === 'fusionar' ? rows.map((item) => (
          <RegistryMergeCase key={item.id} item={item} {...caseProps} />
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

        {type === 'matricula' ? rows.map((item) => (
          <RegistryMatriculaCase
            key={`${item.kind}-${item.registryId}-${item.valueNorm || ''}`}
            item={item}
            onSaveRegistration={saveRegistration}
            {...caseProps}
          />
        )) : null}

        {type === 'experiencia' ? rows.map((item) => {
          const absurd = isImplausibleMonths(item.monthsMax);
          return (
          <li key={`${item.registryId}-${item.roleCode}`} className={cn('rounded-lg border p-3 text-sm', absurd ? 'border-destructive bg-destructive/5' : 'border-border bg-card')} data-implausible={absurd ? 'true' : undefined}>
            <div className="flex flex-wrap items-center gap-x-1">
              <span className="font-medium">{item.name}</span> <span className="text-muted-foreground">{item.roleCode}</span>
              {absurd ? <Badge variant="destructive" className="ml-2">Valor improbable: revisar expedientes</Badge> : null}
            </div>
            <p className="text-xs text-muted-foreground">Último: {formatMonths(item.monthsLatest)} · Máximo: <span className={absurd ? 'font-semibold text-destructive' : undefined}>{formatMonths(item.monthsMax)}</span></p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button>
              {canWrite && item.monthsLatest ? <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'experiencia', action: 'override', registryId: item.registryId, roleCode: item.roleCode, months: item.monthsLatest })}>Aceptar {formatMonths(item.monthsLatest)}</Button> : null}
            </div>
          </li>
          );
        }) : null}

        {type === 'roles' ? rows.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-card p-3 text-sm">
            <span className="font-medium">{item.role || 'Sin rol'}</span> <span className="text-muted-foreground">en {item.expediente}</span>
          </li>
        )) : null}
      </ul>

      {allClear ? null : (
        <nav className="flex items-center justify-between text-sm" aria-label="Paginación de la cola">
          <span className="text-muted-foreground">{queue.total} casos · página {page} de {pages}</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
            <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Siguiente</Button>
          </div>
        </nav>
      )}
    </section>
  );
}
