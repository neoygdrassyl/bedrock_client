import { useCallback, useEffect, useState } from 'react';
import { LegacyModal } from '@/shared/components/legacy-modal';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/components/icon';
import { getMissingRequirements } from '@/features/expediente/api/documentaryOperations.service';
import { refreshRequirementsFor } from '@/features/expediente/api/documentaryRequirements.service';
import { documentaryError } from '@/features/expediente/api/documentary.service';

const STATE_NOTICES = {
  stale: 'La evaluación de requisitos está desactualizada respecto a los datos del expediente. El listado es orientativo y no confirma que el expediente esté completo.',
  missing_cache: 'El expediente aún no tiene una evaluación de requisitos. Actualice la evaluación para conocer los documentos exigibles.',
  incomplete: 'La evaluación de requisitos está incompleta. El listado es orientativo y no confirma que el expediente esté completo.',
};

const GROUP_MODES = { all: 'Todos requeridos', at_least_one: 'Al menos uno', complementary: 'Complementario' };
const GROUP_STATUSES = { satisfied: 'Cumplido', missing: 'Faltante', not_applicable: 'No aplica' };

function StatusPill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold leading-none ${className}`.trim()}>
      {children}
    </span>
  );
}

function completenessLabel(result) {
  if (result.allRequirementsSatisfied === true) return 'Requisitos completos';
  if (result.allRequirementsSatisfied === false) return 'Requisitos incompletos';
  return 'Completitud no establecida';
}

// Requirements grouped by typology section ({ title, items }), general requirements last. Payloads without
// `section` (older backends) give a single untitled group, i.e. the flat list.
function sectionGroups(requirements) {
  if (!requirements.some((requirement) => requirement.section)) return [{ key: 'all', title: null, items: requirements }];
  const groups = new Map();
  requirements.forEach((requirement) => {
    const section = requirement.section;
    const key = section ? `${section.typologyCode}:${section.optionId ?? ''}` : 'general';
    if (!groups.has(key)) groups.set(key, { key, title: section ? [section.typologyName || section.typologyCode, section.optionLabel].filter(Boolean).join(' · ') : 'Requisitos generales', items: [] });
    groups.get(key).items.push(requirement);
  });
  const general = groups.get('general');
  groups.delete('general');
  return Array.from(groups.values()).sort((left, right) => left.title.localeCompare(right.title, 'es')).concat(general ? [general] : []);
}

function RequirementList({ title, tone, requirements, emptyText }) {
  return (
    <section aria-label={title} className="rounded-xl border border-border bg-card text-foreground shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/25 px-4 py-3">
        <h3 className="mb-0 text-base font-semibold text-foreground">{title}</h3>
        <StatusPill className={tone}>{requirements.length}</StatusPill>
      </div>
      <div className="space-y-2 p-3">
        {requirements.length ? sectionGroups(requirements).map((group) => (
          <div key={group.key} className="space-y-2" role={group.title ? 'group' : undefined} aria-label={group.title || undefined}>
            {group.title ? <h4 className="mb-0 px-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h4> : null}
            {group.items.map((requirement) => (
              <article key={`${requirement.documentId}:${requirement.code}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <StatusPill className={tone}>{requirement.code}</StatusPill>
                <span className="min-w-0 flex-1 font-medium">{requirement.name || 'Documento sin nombre'}</span>
                {requirement.groupCode && !requirement.section ? <StatusPill className="border-border bg-muted/50 text-muted-foreground">Grupo {requirement.groupCode}</StatusPill> : null}
              </article>
            ))}
          </div>
        )) : <p className="mb-0 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">{emptyText}</p>}
      </div>
    </section>
  );
}

function NotApplicable({ result }) {
  const pending = (result?.warnings || []).find((warning) => warning?.code === 'CENTRAL_ACTIVATION_PENDING');
  return (
    <div role="status" className="space-y-2 rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm leading-6 text-foreground">
      <p className="mb-0">La evaluación centralizada de faltantes solo aplica a expedientes activados con una publicación de Dovela Central. Este expediente se gestiona con documentación tradicional.</p>
      {pending ? <p className="mb-0 text-amber-900">{`Radicado desde el portal con la publicación de Central ${pending.releaseVersion != null ? `versión ${pending.releaseVersion}` : 'registrada'}, pendiente de activación.`}</p> : null}
    </div>
  );
}

export default function MissingDocumentsModal({ open, fun0Id, onClose, onRefreshed }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback((signal) => {
    if (!fun0Id) { setResult(null); setError(''); return Promise.resolve(); }
    setLoading(true); setError('');
    return getMissingRequirements(fun0Id, signal)
      .then((data) => { if (!signal?.aborted) setResult(data); })
      .catch((failure) => { if (!signal?.aborted) { setResult(null); setError(documentaryError(failure)); } })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, [fun0Id]);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [open, load]);

  const refresh = async () => {
    setRefreshing(true); setError('');
    try {
      await refreshRequirementsFor(fun0Id, result.refresh.expectedInputRevision, 'Actualización de la evaluación de documentos faltantes');
      onRefreshed?.();
      await load();
    } catch (failure) {
      setError(documentaryError(failure));
    } finally {
      setRefreshing(false);
    }
  };

  const applicable = Boolean(result?.applicable);
  const missing = applicable ? result.requirements.filter((requirement) => requirement.status === 'missing') : [];
  const present = applicable ? result.requirements.filter((requirement) => requirement.status === 'present') : [];
  const notice = applicable ? STATE_NOTICES[result.state] : null;

  return (
    <LegacyModal
      isOpen={open}
      onRequestClose={onClose}
      contentLabel="Documentos faltantes"
      style={{ content: { top: '5%', left: '50%', right: 'auto', bottom: '5%', width: 'min(94vw, 1040px)', maxWidth: '1040px', transform: 'translateX(-50%)', overflow: 'hidden', padding: 0 } }}
    >
      <section className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
          <div className="min-w-0 space-y-1">
            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Dovela Central</p>
            <h2 className="mb-0 text-lg font-semibold leading-tight text-foreground">Documentos faltantes del expediente</h2>
            <p className="mb-0 text-sm leading-5 text-muted-foreground">Requisitos de la publicación fijada al expediente frente a los documentos recibidos.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {applicable && result.refresh.allowed ? (
              <Button type="button" variant="outline" size="sm" className="h-8 px-2" disabled={refreshing || loading} onClick={refresh}>
                <Icon name={refreshing ? 'Loader2' : 'RefreshCw'} size={14} className={refreshing ? 'animate-spin' : ''} /> Actualizar evaluación
              </Button>
            ) : null}
            <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={onClose}>
              <Icon name="XCircle" size={14} /> Cerrar
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              <Icon name="Loader2" size={16} className="animate-spin" /> Consultando documentos faltantes...
            </div>
          ) : null}

          {error ? (
            <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm leading-6 text-foreground" role="alert">
              <p className="mb-0">{error}</p>
              {fun0Id ? <Button type="button" variant="outline" size="sm" onClick={() => load()}>Reintentar</Button> : null}
            </div>
          ) : null}

          {!loading && !error && (!fun0Id || (result && !applicable)) ? <NotApplicable result={result} /> : null}

          {!loading && applicable ? (
            <>
              {notice ? <div role="alert" className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-3 text-sm leading-6 text-foreground">{notice}</div> : null}
              <section className="grid gap-2 md:grid-cols-4" aria-label="Resumen de documentos faltantes">
                <StatusPill className="justify-center border-border bg-background text-foreground">Total: {result.summary.total}</StatusPill>
                <StatusPill className="justify-center border-destructive/40 bg-destructive/10 text-foreground">Faltantes: {result.summary.missing}</StatusPill>
                <StatusPill className="justify-center border-accent/40 bg-accent/10 text-foreground">Presentes: {result.summary.present}</StatusPill>
                <StatusPill className="justify-center border-primary/30 bg-primary/10 text-primary">{completenessLabel(result)}</StatusPill>
              </section>
              {result.groups.length ? (
                <section aria-label="Grupos de requisitos" className="flex flex-wrap gap-2">
                  {result.groups.map((group) => (
                    <StatusPill key={group.code} className="border-border bg-muted/40 text-foreground">
                      {`Grupo ${group.code} · ${GROUP_MODES[group.mode] || group.mode} · ${GROUP_STATUSES[group.status] || group.status}`}
                    </StatusPill>
                  ))}
                </section>
              ) : null}
              <div className="grid gap-3">
                <RequirementList title="Faltantes" tone="border-destructive/40 bg-destructive/10 text-foreground" requirements={missing} emptyText="No hay requisitos faltantes en la evaluación disponible." />
                <RequirementList title="Presentes" tone="border-accent/40 bg-accent/10 text-foreground" requirements={present} emptyText="Aún no se han recibido documentos exigibles." />
              </div>
            </>
          ) : null}
        </div>
      </section>
    </LegacyModal>
  );
}
