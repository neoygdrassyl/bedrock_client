import { AlertTriangle, CheckCircle2, ClipboardList, FileSearch, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function getRequirementCountLabel(count) {
  return `${count} requisito${count === 1 ? '' : 's'}`;
}

function getDocumentLabel(document) {
  return document?.label || document?.document_name || document?.documentName || document?.name || 'Documento sin nombre';
}

function getDocumentCode(document) {
  return document?.code || document?.document_code || document?.documentCode || document?.requirement_code || '';
}

function getDocumentGroup(document) {
  return document?.groupLabel || document?.group_label || document?.groupKey || document?.group_key || 'Sin grupo';
}

function getRuleSummary(rule) {
  return rule?.conditionSummary
    || rule?.condition_summary
    || (Array.isArray(rule?.documentCodes) ? `Documentos: ${rule.documentCodes.join(', ')}` : '')
    || 'Regla sin resumen';
}

function StatusCallout({ type, children }) {
  const Icon = type === 'warning' ? AlertTriangle : type === 'loading' ? Loader2 : Info;
  const toneClass = type === 'warning'
    ? 'border-warning/40 bg-warning/10 text-foreground'
    : 'border-border bg-muted/30 text-muted-foreground';
  const iconClass = type === 'loading' ? 'animate-spin' : '';

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${toneClass}`} role="status" aria-live="polite">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} aria-hidden="true" />
      <div className="min-w-0 leading-5">{children}</div>
    </div>
  );
}

function SnapshotBadge({ snapshotInfo }) {
  if (!snapshotInfo?.id) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-foreground" title={`Snapshot actualizado ${snapshotInfo.id}`}>
      <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      Snapshot actualizado
      <span className="font-semibold text-muted-foreground">{snapshotInfo.id}</span>
    </span>
  );
}

export default function RequirementPreviewPanel({ state, snapshotInfo = null }) {
  const preview = state?.preview || {};
  const documents = Array.isArray(preview.requiredDocuments) ? preview.requiredDocuments : [];
  const rules = Array.isArray(preview.matchedRules) ? preview.matchedRules : [];
  const status = state?.status || 'idle';

  return (
    <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm" aria-labelledby="requirement-preview-title" data-testid="requirement-preview-panel">
      <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileSearch className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview documental</p>
            <h3 id="requirement-preview-title" className="mb-1 text-base font-semibold leading-6 text-foreground">Requisitos antes de guardar</h3>
            <p className="mb-0 text-sm leading-5 text-muted-foreground">
              Resolución read-only con la configuración publicada y los valores actuales del formulario.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={preview.source === 'published' || preview.source === 'draft' ? 'default' : 'outline'}>{preview.sourceLabel || 'Publicada'}</Badge>
          <Badge variant="outline">{getRequirementCountLabel(documents.length)}</Badge>
          {preview.configVersion ? <Badge variant="secondary">v{preview.configVersion}</Badge> : null}
          <SnapshotBadge snapshotInfo={snapshotInfo} />
        </div>
      </div>

      <div className="space-y-3 p-4">
        {status === 'insufficient' ? (
          <StatusCallout>{state.message}</StatusCallout>
        ) : null}

        {status === 'loading' ? (
          <StatusCallout type="loading">Resolviendo requisitos documentales configurados…</StatusCallout>
        ) : null}

        {status === 'warning' ? (
          <StatusCallout type="warning">
            <span className="block font-medium text-foreground">{state.message}</span>
            <span className="block text-muted-foreground">Puedes seguir editando y guardar la actuación; el snapshot se resolverá en backend.</span>
          </StatusCallout>
        ) : null}

        {status === 'ready' && documents.length === 0 ? (
          <StatusCallout>No hay requisitos aplicables para los valores actuales.</StatusCallout>
        ) : null}

        {status === 'ready' && documents.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.38fr)]">
            <div className="overflow-hidden rounded-lg border border-border bg-background/70">
              <div className="border-b border-border/70 px-3 py-2">
                <p className="mb-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documentos requeridos</p>
              </div>
              <ul className="m-0 max-h-[24rem] list-none overflow-auto p-0">
                {documents.map((document, index) => {
                  const code = getDocumentCode(document);
                  const documentKey = code || getDocumentLabel(document);
                  return (
                    <li key={documentKey} className="border-b border-border/60 px-3 py-2 last:border-b-0">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="mb-1 text-sm font-medium leading-5 text-foreground">{getDocumentLabel(document)}</p>
                          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                            {code ? <span className="rounded-full bg-muted px-2 py-0.5 font-semibold">{code}</span> : null}
                            <span className="rounded-full bg-muted px-2 py-0.5">{getDocumentGroup(document)}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="rounded-lg border border-border bg-background/70 p-3" aria-label="Contexto de reglas aplicadas">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                Reglas aplicadas
              </div>
              {rules.length ? (
                <div className="space-y-2">
                  {rules.slice(0, 4).map((rule) => (
                    <div key={rule?.key || getRuleSummary(rule)} className="rounded-md border border-border bg-card px-2.5 py-2 text-xs leading-5">
                      <p className="mb-1 font-semibold text-foreground">{rule?.key || 'Regla sin clave'}</p>
                      <p className="mb-0 text-muted-foreground">{getRuleSummary(rule)}</p>
                    </div>
                  ))}
                  {rules.length > 4 ? <p className="mb-0 text-xs text-muted-foreground">+{rules.length - 4} regla(s) adicionales.</p> : null}
                </div>
              ) : (
                <p className="mb-0 text-xs leading-5 text-muted-foreground">El backend no retornó metadata de reglas para este resultado.</p>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
