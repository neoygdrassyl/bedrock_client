import { LegacyModal } from '@/components/legacy-modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

const EMPTY_ARRAY = [];

const SOURCE_LABELS = {
  snapshot: 'Snapshot activo',
  legacy_snapshot: 'Checklist legado',
  no_snapshot: 'Sin snapshot',
  insufficient_inputs: 'Insumos insuficientes',
};

const GROUPS = [
  {
    key: 'missing',
    title: 'Faltantes',
    description: 'Requisitos exigibles sin evidencia física o digital registrada.',
    statuses: ['missing', 'unknown_code'],
    icon: 'AlertTriangle',
    toneClass: 'border-destructive/40 bg-destructive/10 text-foreground',
    emptyText: 'No hay faltantes legales reportados por el endpoint.',
  },
  {
    key: 'pendingScan',
    title: 'Pendientes de escaneo',
    description: 'Documentos aportados en físico que aún requieren evidencia digital.',
    statuses: ['pending_scan'],
    icon: 'FileUp',
    toneClass: 'border-warning/40 bg-warning/10 text-foreground',
    emptyText: 'No hay documentos físicos pendientes de escaneo.',
  },
  {
    key: 'present',
    title: 'Presentes',
    description: 'Requisitos con evidencia digital o evaluación positiva registrada.',
    statuses: ['present'],
    icon: 'CheckCircle',
    toneClass: 'border-accent/40 bg-accent/10 text-foreground',
    emptyText: 'No hay documentos presentes reportados.',
  },
];

function normalizeString(value) {
  return String(value ?? '').trim();
}

function normalizeStatus(value) {
  return normalizeString(value).toLowerCase();
}

function getResultRequirements(result) {
  return Array.isArray(result?.requirements) ? result.requirements : EMPTY_ARRAY;
}

function getSummaryValue(summary, key) {
  const value = Number(summary?.[key]);
  return Number.isFinite(value) ? value : 0;
}

function getSourceLabel(source) {
  return SOURCE_LABELS[source] || source || 'Sin fuente';
}

function groupRequirements(result) {
  const requirements = getResultRequirements(result);
  return GROUPS.reduce((groups, group) => {
    groups[group.key] = requirements.filter((requirement) => group.statuses.includes(normalizeStatus(requirement.status)));
    return groups;
  }, {});
}

function StatusPill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold leading-none ${className}`.trim()}>
      {children}
    </span>
  );
}

function MetadataPill({ label, value }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
      {label}: {value || 'N/D'}
    </span>
  );
}

function RequirementRow({ requirement, toneClass }) {
  const evidenceCount = Array.isArray(requirement.evidence) ? requirement.evidence.length : 0;
  const code = normalizeString(requirement.code) || 'SIN CÓDIGO';
  const label = normalizeString(requirement.label) || 'Documento sin nombre';
  const reason = normalizeString(requirement.statusReason || requirement.reason);
  const groupKey = normalizeString(requirement.groupKey);

  return (
    <article className="rounded-lg border border-border bg-background px-3 py-3 text-sm shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill className={toneClass}>{code}</StatusPill>
            {groupKey ? <StatusPill className="border-border bg-muted/50 text-muted-foreground">{groupKey}</StatusPill> : null}
          </div>
          <h4 className="mb-0 text-sm font-semibold leading-5 text-foreground">{label}</h4>
          {reason ? <p className="mb-0 text-xs leading-5 text-muted-foreground">Motivo: {reason}</p> : null}
        </div>
        <StatusPill className="shrink-0 border-border bg-muted/40 text-muted-foreground">
          Evidencias: {evidenceCount}
        </StatusPill>
      </div>
    </article>
  );
}

function RequirementGroup({ group, requirements }) {
  return (
    <section aria-label={group.title} className="rounded-xl border border-border bg-card text-foreground shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border bg-muted/25 px-4 py-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="mb-0 flex items-center gap-2 text-base font-semibold text-foreground">
            <Icon name={group.icon} size={16} /> {group.title}
          </h3>
          <p className="mb-0 text-sm leading-5 text-muted-foreground">{group.description}</p>
        </div>
        <StatusPill className={group.toneClass}>{requirements.length}</StatusPill>
      </div>
      <div className="space-y-2 p-3">
        {requirements.length
          ? requirements.map((requirement, index) => (
            <RequirementRow key={`${group.key}-${requirement.code || index}`} requirement={requirement} toneClass={group.toneClass} />
          ))
          : <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">{group.emptyText}</div>}
      </div>
    </section>
  );
}

export default function MissingDocumentsModal({ open, result, loading = false, error = '', onClose }) {
  const source = normalizeString(result?.source);
  const groupedRequirements = groupRequirements(result);
  const summary = result?.summary || {};
  const hasNoSnapshot = source === 'no_snapshot';
  const hasInsufficientInputs = source === 'insufficient_inputs';
  const hasAnyRequirements = getResultRequirements(result).length > 0;

  return (
    <LegacyModal
      isOpen={open}
      onRequestClose={onClose}
      contentLabel="Documentos faltantes"
      style={{
        content: {
          top: '5%',
          left: '50%',
          right: 'auto',
          bottom: '5%',
          width: 'min(94vw, 1040px)',
          maxWidth: '1040px',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
          padding: 0,
        },
      }}
    >
      <section className="flex h-full min-h-0 flex-col bg-background text-foreground">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
          <div className="min-w-0 space-y-1">
            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Consulta read-only</p>
            <h2 className="mb-0 text-lg font-semibold leading-tight text-foreground">Documentos faltantes del expediente</h2>
            <p className="mb-0 text-sm leading-5 text-muted-foreground">Resultado oficial del endpoint de requisitos documentales faltantes. Esta vista no guarda ni modifica la ventanilla.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={onClose}>
            <Icon name="XCircle" size={14} /> Cerrar
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <section className="flex flex-wrap items-center gap-2" aria-label="Metadatos de consulta">
            <MetadataPill label="source" value={source || (loading ? 'consultando' : '')} />
            <MetadataPill label="snapshotId" value={result?.snapshotId ?? ''} />
            {result?.configVersionId ? <MetadataPill label="configVersionId" value={result.configVersionId} /> : null}
            {source ? <StatusPill className="border-primary/30 bg-primary/10 text-primary">{getSourceLabel(source)}</StatusPill> : null}
          </section>

          {loading ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              <Icon name="Loader2" size={16} className="animate-spin" /> Consultando documentos faltantes...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm leading-6 text-foreground" role="alert">
              {error}
            </div>
          ) : null}

          {hasNoSnapshot ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-3 text-sm leading-6 text-foreground" role="alert">
              Este expediente aún no tiene snapshot de requisitos; no se infieren todos los documentos.
            </div>
          ) : null}

          {hasInsufficientInputs ? (
            <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-3 text-sm leading-6 text-foreground" role="alert">
              insufficient_inputs · No hay insumos suficientes para resolver requisitos documentales. Revise que el expediente tenga FUN relacionado y datos de actuación disponibles.
            </div>
          ) : null}

          {!loading && !error && !hasInsufficientInputs ? (
            <section className="grid gap-2 md:grid-cols-4" aria-label="Resumen de documentos faltantes">
              <StatusPill className="justify-center border-border bg-background text-foreground">Total: {getSummaryValue(summary, 'totalRequirements')}</StatusPill>
              <StatusPill className="justify-center border-destructive/40 bg-destructive/10 text-foreground">Faltantes: {getSummaryValue(summary, 'missing')}</StatusPill>
              <StatusPill className="justify-center border-warning/40 bg-warning/10 text-foreground">Pendientes: {getSummaryValue(summary, 'pendingScan')}</StatusPill>
              <StatusPill className="justify-center border-accent/40 bg-accent/10 text-foreground">Presentes: {getSummaryValue(summary, 'present')}</StatusPill>
            </section>
          ) : null}

          {!loading && !error && !hasInsufficientInputs && !hasAnyRequirements && !hasNoSnapshot ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
              No hay documentos faltantes por mostrar para esta consulta.
            </div>
          ) : null}

          {!loading && !error && !hasInsufficientInputs ? (
            <div className="grid gap-3">
              {GROUPS.map((group) => (
                <RequirementGroup key={group.key} group={group} requirements={groupedRequirements[group.key] || EMPTY_ARRAY} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </LegacyModal>
  );
}
