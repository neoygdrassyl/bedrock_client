import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { cn } from '@/shared/lib/utils';
import RegistryForm from './RegistryForm';
import RegistryPicker from './RegistryPicker';
import RegistryRolesTable from './RegistryRolesTable';
import { DIALOG_CLOSE_CLASS, DIFF_LABELS, DUPLICATE_REASONS, errorCode, errorText, formatCc, formatDate, formatMonths, isImplausibleMonths } from './professionalRegistry.utils';

const TABS = [
  ['datos', 'Datos'],
  ['roles', 'Roles y experiencia'],
  ['expedientes', 'Expedientes'],
  ['nombres', 'Nombres mal registrados'],
  ['historial', 'Historial'],
];

function Field({ label, children }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{children || 'Sin registro'}</dd>
    </div>
  );
}

export default function RegistryDetail({ id, canWrite, onClose, onChanged, onOpen }) {
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('datos');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState(null);
  const [relinkFor, setRelinkFor] = useState(null);
  const [relinkTarget, setRelinkTarget] = useState(null);
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    try {
      const response = await ProfessionalRegistryService.get(id);
      if (request !== latestRequest.current) return;
      setDetail(response?.data || null);
      setError('');
    } catch (e) {
      if (request !== latestRequest.current) return;
      setError(errorText(e, 'No fue posible cargar el profesional.'));
    }
  }, [id]);

  useEffect(() => {
    setDetail(null);
    setTab('datos');
    setNotice('');
    setNameDraft(null);
    setConfirmDelete(false);
    load();
  }, [id, load]);

  const run = async (work, success) => {
    setBusy(true);
    setError('');
    try {
      await work();
      setNotice(success);
      await load();
      onChanged?.();
    } catch (e) {
      if (errorCode(e) === 'VERSION_CONFLICT') await load();
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const saveName = () => run(async () => {
    await ProfessionalRegistryService.setCanonicalName(id, { expectedVersion: detail.version, name: nameDraft });
    setNameDraft(null);
  }, 'Nombre actualizado.');

  const removeOrRestore = () => run(async () => {
    if (detail.deleted) await ProfessionalRegistryService.restore(id, { expectedVersion: detail.version });
    else await ProfessionalRegistryService.remove(id, { expectedVersion: detail.version });
    setConfirmDelete(false);
  }, detail?.deleted ? 'Profesional restaurado.' : 'Profesional eliminado.');

  const merge = async () => {
    setBusy(true);
    setError('');
    try {
      await ProfessionalRegistryService.merge(id, { expectedVersion: detail.version, targetId: mergeTarget.id });
      setMergeOpen(false);
      onChanged?.();
      onOpen?.(mergeTarget.id);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const relink = () => run(async () => {
    await ProfessionalRegistryService.relink(id, relinkFor.participationId, { registryId: relinkTarget.id });
    setRelinkFor(null);
    setRelinkTarget(null);
  }, 'Expediente asignado al otro profesional.');

  // Resolves true when saved, so the role's editor can close; errors are shown by `run`.
  const saveSpecific = async (role, value) => {
    let saved = false;
    await run(async () => {
      const fields = value || { years: null, months: null, days: null };
      await ProfessionalRegistryService.setSpecificExperience(id, role.code, { ...fields, expectedVersion: detail.version });
      saved = true;
    }, value ? 'Experiencia específica guardada.' : 'Experiencia específica quitada.');
    return saved;
  };

  const markReviewed = (participationId) => run(
    () => ProfessionalRegistryService.resolve({ type: 'nombres', id: participationId, action: 'reviewed' }),
    'Marcado como revisado.',
  );

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onClose?.(); }}>
      <DialogContent className={`max-h-[90vh] max-w-4xl overflow-auto ${DIALOG_CLOSE_CLASS}`}>
        <DialogHeader>
          <DialogTitle>{detail ? detail.name : 'Profesional'}</DialogTitle>
          <DialogDescription>{detail ? `Cédula ${formatCc(detail.cc)}` : 'Cargando información del profesional.'}</DialogDescription>
        </DialogHeader>

        {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        {notice ? <p className="text-sm text-emerald-700" role="status">{notice}</p> : null}

        {detail ? (
          <>
            <nav className="flex flex-wrap gap-1 border-b border-border pb-2" aria-label="Secciones del profesional">
              {TABS.map(([key, label]) => (
                <Button key={key} type="button" size="sm" variant={tab === key ? 'default' : 'ghost'} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>
                  {label}{key === 'nombres' && detail.misregistered.length ? ` (${detail.misregistered.length})` : ''}
                </Button>
              ))}
            </nav>

            {tab === 'datos' ? (
              <div className="space-y-4">
                <dl className="grid gap-2 sm:grid-cols-2">
                  <Field label="Nombre">
                    {nameDraft === null ? detail.name : (
                      <span className="flex gap-2">
                        <Label htmlFor="registry-canonical-name" className="sr-only">Nombre canónico</Label>
                        <Input id="registry-canonical-name" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
                        <Button type="button" size="sm" onClick={saveName} disabled={busy}>Guardar nombre</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setNameDraft(null)}>Cancelar</Button>
                      </span>
                    )}
                  </Field>
                  <Field label="Origen del nombre">{detail.nameSource === 'MANUAL' ? 'Corregido manualmente' : 'Más frecuente en los expedientes'}</Field>
                  <Field label="Cédula">{detail.cc ? formatCc(detail.cc) : null}</Field>
                  <Field label="Estado">
                    {detail.deleted ? 'Eliminado' : detail.status === 'PENDIENTE_REVISION' ? 'Pendiente de revisión' : 'Activo'}
                  </Field>
                  <Field label="Correo">{detail.email}</Field>
                  <Field label="Teléfono">{detail.phone}</Field>
                  <Field label="Identificadores">
                    <ul>
                      {detail.identifiers.map((item) => (
                        <li key={`${item.kind}-${item.value}`}>
                          {item.kind === 'CC' ? 'Cédula' : 'Matrícula'}: {item.value}
                          {item.principal
                            ? <span className="ml-1 text-xs text-muted-foreground">(principal)</span>
                            : null}
                        </li>
                      ))}
                    </ul>
                  </Field>
                  <Field label="Expedientes sin origen">{detail.unlinked ? `${detail.unlinked} (el registro de origen fue eliminado)` : null}</Field>
                </dl>

                {detail.duplicates.length ? (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm" role="region" aria-label="Posibles duplicados">
                    <p className="font-semibold">Posibles duplicados</p>
                    <ul className="mt-1 space-y-1">
                      {detail.duplicates.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span>{item.otherName} · {formatCc(item.otherCc)} · {DUPLICATE_REASONS[item.reason] || item.reason}</span>
                          <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.otherId)}>Abrir</Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {canWrite ? (
                  <div className="flex flex-wrap gap-2">
                    {!detail.deleted ? <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>Editar datos</Button> : null}
                    {!detail.deleted && nameDraft === null ? <Button type="button" variant="outline" onClick={() => setNameDraft(detail.name)}>Corregir nombre</Button> : null}
                    {!detail.deleted ? <Button type="button" variant="outline" onClick={() => { setMergeTarget(null); setMergeOpen(true); }}>Fusionar con otro…</Button> : null}
                    {confirmDelete ? (
                      <span className="flex items-center gap-2 text-sm">
                        {detail.deleted ? '¿Restaurar este profesional?' : '¿Eliminar este profesional? Podrá restaurarlo después.'}
                        <Button type="button" size="sm" variant={detail.deleted ? 'default' : 'destructive'} onClick={removeOrRestore} disabled={busy}>Confirmar</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                      </span>
                    ) : (
                      <Button type="button" variant={detail.deleted ? 'default' : 'destructive'} onClick={() => setConfirmDelete(true)}>{detail.deleted ? 'Restaurar' : 'Eliminar'}</Button>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {tab === 'roles' ? (
              detail.roles.length ? (
                <RegistryRolesTable detail={detail} canWrite={canWrite} busy={busy} onSaveSpecific={saveSpecific} />
              ) : <p className="text-sm text-muted-foreground">Este profesional no tiene roles registrados.</p>
            ) : null}

            {tab === 'expedientes' ? (
              detail.roles.length ? detail.roles.map((role) => (
                <section key={role.code} className="space-y-1" aria-label={role.label}>
                  <h4 className="text-sm font-semibold">{role.label} <span className="font-normal text-muted-foreground">({role.projects})</span></h4>
                  <ul className="space-y-0.5 text-sm">
                    {role.expedientes.map((item) => (
                      <li key={item.participationId} className={cn('flex flex-wrap gap-x-3 rounded-md px-2 py-0.5', isImplausibleMonths(item.months) && 'border border-destructive bg-destructive/5')} data-implausible={isImplausibleMonths(item.months) ? 'true' : undefined}>
                        <span className="font-medium tabular-nums">{item.expediente}</span>
                        <span className="text-muted-foreground">{formatDate(item.date)}</span>
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className={isImplausibleMonths(item.months) ? 'font-semibold text-destructive' : 'text-muted-foreground'}>{formatMonths(item.months)}</span>
                        {isImplausibleMonths(item.months) ? <Badge variant="destructive">Experiencia improbable: revisar este expediente</Badge> : null}
                        {item.registration ? <span className="text-muted-foreground">Matrícula: {item.registration}</span> : null}
                        {item.registrationOwner ? (
                          <span className="inline-flex items-center gap-2 rounded-md bg-amber-100 px-2 text-xs font-medium text-amber-900">
                            Esta matrícula pertenece a {item.registrationOwner.name}
                            <button type="button" className="underline text-amber-900" onClick={() => onOpen?.(item.registrationOwner.id)}>Abrir</button>
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              )) : <p className="text-sm text-muted-foreground">Este profesional no tiene expedientes.</p>
            ) : null}

            {tab === 'nombres' ? (
              detail.misregistered.length ? (
                <table className="w-full text-sm" aria-label="Nombres mal registrados">
                  <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th>Expediente</th><th>Nombre registrado</th><th>Tipo</th><th>Similitud</th><th /></tr></thead>
                  <tbody>
                    {detail.misregistered.map((item) => (
                      <tr key={item.participationId} className={cn('border-t border-border/60', item.reviewed && 'opacity-60')}>
                        <td className="py-1 tabular-nums">{item.expediente}</td>
                        <td>{item.name}</td>
                        <td>{DIFF_LABELS[item.diffType] || item.diffType}</td>
                        <td>{item.similarity === null ? '—' : `${Math.round(item.similarity * 100)}%`}</td>
                        <td className="text-right">
                          {canWrite ? (
                            <span className="flex justify-end gap-1">
                              {!item.reviewed ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => markReviewed(item.participationId)}>Marcar revisado</Button> : <Badge variant="outline">Revisado</Badge>}
                              <Button type="button" size="sm" variant="outline" onClick={() => { setRelinkTarget(null); setRelinkFor(item); }}>Asignar a otro</Button>
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-sm text-muted-foreground">Todos los expedientes usan el nombre canónico.</p>
            ) : null}

            {tab === 'historial' ? (
              detail.audit.length ? (
                <ul className="space-y-1 text-xs" aria-label="Historial">
                  {detail.audit.map((row) => (
                    <li key={row.id} className="rounded-md border border-border/60 px-2 py-1">
                      <span className="font-semibold">{row.operation}</span> · {row.field} · {row.origin} · {row.user} · {formatDate(row.at)}
                      {row.previous || row.next ? <span className="block text-muted-foreground">{row.previous || '—'} → {row.next || '—'}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">Sin cambios registrados.</p>
            ) : null}
          </>
        ) : !error ? <p className="text-sm text-muted-foreground">Cargando…</p> : null}

        <RegistryForm
          open={editOpen}
          mode="edit"
          registry={detail}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); setNotice('Datos actualizados.'); load(); onChanged?.(); }}
          onOpenExisting={(otherId) => { setEditOpen(false); onOpen?.(otherId); }}
          onConflict={() => { setEditOpen(false); load(); }}
        />

        <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
          <DialogContent className={DIALOG_CLOSE_CLASS}>
            <DialogHeader>
              <DialogTitle>Fusionar con otro profesional</DialogTitle>
              <DialogDescription>Los expedientes, cédulas y matrículas de este profesional pasan al que elija. El registro actual quedará eliminado.</DialogDescription>
            </DialogHeader>
            <RegistryPicker excludeId={id} selectedId={mergeTarget?.id} onSelect={setMergeTarget} label="Profesional que se conserva" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMergeOpen(false)}>Cancelar</Button>
              <Button type="button" disabled={!mergeTarget || busy} onClick={merge}>{mergeTarget ? `Fusionar en ${mergeTarget.name}` : 'Fusionar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(relinkFor)} onOpenChange={(next) => { if (!next) setRelinkFor(null); }}>
          <DialogContent className={DIALOG_CLOSE_CLASS}>
            <DialogHeader>
              <DialogTitle>Asignar el expediente a otro profesional</DialogTitle>
              <DialogDescription>{relinkFor ? `Expediente ${relinkFor.expediente}, registrado como «${relinkFor.name}».` : ''}</DialogDescription>
            </DialogHeader>
            <RegistryPicker excludeId={id} selectedId={relinkTarget?.id} onSelect={setRelinkTarget} label="Profesional correcto" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRelinkFor(null)}>Cancelar</Button>
              <Button type="button" disabled={!relinkTarget || busy} onClick={relink}>Asignar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
