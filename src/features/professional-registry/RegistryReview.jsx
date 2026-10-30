import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { cn } from '@/shared/lib/utils';
import RegistryMergeCase from './RegistryMergeCase';
import RegistryPairCase from './RegistryPairCase';
import {
  DIFF_LABELS, errorText, formatCc, formatDate, formatMonths, isImplausibleMonths,
} from './professionalRegistry.utils';

const QUEUES = [
  ['duplicados', 'Posibles duplicados'],
  ['fusionar', 'Fusionar'],
  ['compartida', 'Matrícula compartida'],
  ['nombres', 'Nombres dudosos'],
  ['matricula', 'Matrícula múltiple'],
  ['experiencia', 'Experiencia atípica'],
  ['roles', 'Rol sin clasificar'],
];

// Same rule as the server: 4 to 40 letters or digits once separators are removed.
const registrationLength = (value) => String(value || '').replace(/[^A-Za-z0-9]/g, '').length;

// "None of these is right": the person types the correct matrícula. It goes through the same update as "Editar datos".
function OtherRegistration({ item, busy, onSave }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [problem, setProblem] = useState('');
  const id = `other-registration-${item.registryId}`;

  if (!open) return <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Ninguna es correcta</Button>;

  const submit = (event) => {
    event.preventDefault();
    const length = registrationLength(value);
    if (length < 4 || length > 40) { setProblem('La matrícula debe tener entre 4 y 40 caracteres alfanuméricos.'); return; }
    setProblem('');
    onSave(item, value.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2" noValidate>
      <div className="space-y-1">
        <label htmlFor={id} className="sr-only">Matrícula correcta de {item.name}</label>
        <Input id={id} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Matrícula correcta" aria-invalid={Boolean(problem)} autoFocus />
        {problem ? <p className="text-xs text-destructive" role="alert">{problem}</p> : null}
      </div>
      <Button type="submit" size="sm" disabled={busy}>Guardar matrícula</Button>
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => { setOpen(false); setValue(''); setProblem(''); }}>Cancelar</Button>
    </form>
  );
}

export default function RegistryReview({ canWrite, onChanged, onOpen }) {
  const [type, setType] = useState('duplicados');
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({});
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
  const saveRegistrationDate = (item, registrationDate) => run(() => ProfessionalRegistryService.update(item.registryId, { expectedVersion: item.version, registrationDate }));
  const saveRegistration = (item, registration) => run(() => ProfessionalRegistryService.update(item.registryId, { expectedVersion: item.version, registration }));

  // The rows of the previous queue must never be drawn with the renderer of the new one while it loads.
  const rows = queue.type === type ? queue.data : [];
  // Only the queues this backend reports: an older one does not know "Fusionar" nor "Matrícula compartida".
  const queues = Object.keys(summary).length ? QUEUES.filter(([key]) => key in summary) : QUEUES;
  const caseProps = { canWrite, busy, onResolve: resolve, onOpen };
  const pages = Math.max(Math.ceil(queue.total / queue.limit), 1);
  const selectType = (next) => { setType(next); setPage(1); };

  return (
    <section aria-label="Por revisar" className="space-y-3">
      <nav className="flex flex-wrap gap-2" aria-label="Colas de revisión">
        {queues.map(([key, label]) => (
          <Button key={key} type="button" size="sm" variant={type === key ? 'default' : 'outline'} aria-current={type === key ? 'page' : undefined} onClick={() => selectType(key)}>
            {label} <Badge variant="secondary" className="ml-2">{summary[key] ?? 0}</Badge>
          </Button>
        ))}
      </nav>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {queue.type === type && !rows.length && !error ? <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">No hay casos pendientes en esta cola.</p> : null}

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
          <li key={item.registryId} className="rounded-lg border border-border bg-card p-3 text-sm">
            <p><span className="font-medium">{item.name}</span> <span className="text-muted-foreground">{item.cc ? formatCc(item.cc) : 'Sin cédula'}</span></p>
            <p className="text-xs text-muted-foreground">Un profesional solo puede tener una matrícula. Indique la correcta; las demás quedan descartadas.</p>
            <ul className="mt-2 space-y-1" aria-label={`Matrículas de ${item.name}`}>
              {item.options.map((option) => (
                <li key={option.valueNorm} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium tabular-nums">{option.value}</span>
                  {option.variants.length ? <span className="text-xs text-muted-foreground">(misma matrícula: {option.variants.join(', ')})</span> : null}
                  <span className="text-xs text-muted-foreground">{option.projects} {option.projects === 1 ? 'expediente' : 'expedientes'}</span>
                  {canWrite ? <Button type="button" size="sm" disabled={busy} onClick={() => resolve({ type: 'matricula', action: 'choose', registryId: item.registryId, value: option.valueNorm, expectedVersion: item.version })}>Usar esta matrícula</Button> : null}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-start gap-2">
              {canWrite ? <OtherRegistration item={item} busy={busy} onSave={saveRegistration} /> : null}
              <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button>
            </div>
          </li>
        )) : null}

        {type === 'experiencia' ? rows.map((item) => {
          if (item.kind === 'fecha') {
            return (
              <li key={`fecha-${item.registryId}`} className="rounded-lg border border-border bg-card p-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-1">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary" className="ml-2">Fechas de expedición distintas</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Un profesional tiene una sola fecha de expedición de la matrícula y de ella depende su experiencia. Indique la correcta.</p>
                <ul className="mt-2 space-y-1" aria-label={`Fechas de expedición de ${item.name}`}>
                  {item.dates.map((option) => (
                    <li key={option.date} className="flex flex-wrap items-center gap-2">
                      <span className="font-medium tabular-nums">{formatDate(option.date)}</span>
                      <span className="text-xs text-muted-foreground">{option.projects} {option.projects === 1 ? 'expediente' : 'expedientes'}</span>
                      {canWrite ? <Button type="button" size="sm" disabled={busy} onClick={() => saveRegistrationDate(item, option.date)}>Usar esta fecha</Button> : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>Ver profesional</Button>
                </div>
              </li>
            );
          }
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

      <nav className="flex items-center justify-between text-sm" aria-label="Paginación de la cola">
        <span className="text-muted-foreground">{queue.total} casos · página {page} de {pages}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Siguiente</Button>
        </div>
      </nav>
    </section>
  );
}
