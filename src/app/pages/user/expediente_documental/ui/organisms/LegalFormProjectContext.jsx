import { AlertTriangle, FileCheck2, FolderTree, Link2, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getLegalFormContextCollections } from '../../documentalViewModel';

function text(value, fallback = '') {
  return String(value ?? '').trim() || fallback;
}

function code(value) {
  return text(value).toLocaleUpperCase('es');
}

function name(value) {
  return text(value).toLocaleLowerCase('es');
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) || [];
}

function requirementCode(requirement = {}) {
  return code(requirement.code ?? requirement.documentCode ?? requirement.document_code);
}

function requirementName(requirement = {}) {
  return text(
    requirement.label
    ?? requirement.name
    ?? requirement.documentName
    ?? requirement.document_name,
    'Documento sin nombre',
  );
}

function evidenceKey(evidence = {}, index = 0) {
  return text(
    evidence.entryId
    ?? evidence.sourceEntryId
    ?? evidence.sourceId
    ?? evidence.source_id
    ?? evidence.id,
    `${requirementCode(evidence)}|${text(evidence.vrIdPublic ?? evidence.vr_id_public ?? evidence.vr)}|${index}`,
  );
}

function dedupeEvidence(items = []) {
  const seen = new Set();
  return items.filter((item, index) => {
    const key = evidenceKey(item, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function evidenceVr(evidence = {}) {
  return text(
    evidence.vrIdPublic
    ?? evidence.vr_id_public
    ?? evidence.vr
    ?? evidence.id_replace,
  ).toLocaleUpperCase('es');
}

function evidenceOriginState(evidence = {}) {
  const value = text(
    evidence.originState
    ?? evidence.origin_state
    ?? evidence.origin,
  ).toLocaleUpperCase('es');
  if (['FISICO', 'FÍSICO', 'PHYSICAL', 'VENTANILLA'].includes(value)) return 'physical';
  if (['DIGITALIZADO', 'ESCANEADO', 'SCANNED'].includes(value)) return 'scanned';
  if (['MEDIO_DIGITAL', 'DIGITAL', 'DIGITAL_MEDIO'].includes(value)) return 'digital';
  return '';
}

function flattenRowEvidence(rows = [], selectedVr = '') {
  const normalizedSelectedVr = text(selectedVr).toLocaleUpperCase('es');
  if (!normalizedSelectedVr) return [];

  return rows
    .filter((row) => !row?.isPreviewRow)
    .flatMap((row) => {
      const entries = (row.entries || []).flatMap((entry) => {
      const sources = Array.isArray(entry?.sources) && entry.sources.length ? entry.sources : [entry];
      return sources.map((source) => ({
        ...source,
        entryId: source?.entryId || entry?.entryId,
        sourceId: source?.sourceId || source?.id,
        documentCode: source?.documentCode || entry?.documentCode || row.documentCode,
        documentName: source?.documentName || entry?.documentName || row.documentName,
        vrIdPublic: source?.vrIdPublic || source?.vr || entry?.vr || row.latestVr,
        sourceLabel: source?.sourceLabel || source?.sourceTable || entry?.sourceTable || 'Expediente documental',
      }));
      }).filter((entry) => evidenceVr(entry) === normalizedSelectedVr);

      if (entries.length) return entries;
      const rowContainsSelectedVr = [row.latestVr, ...(row.vrValues || [])]
        .some((value) => text(value).toLocaleUpperCase('es') === normalizedSelectedVr);
      return rowContainsSelectedVr ? [{
        entryId: `${row.id}:vr:${selectedVr}`,
        documentCode: row.documentCode,
        documentName: row.documentName,
        vrIdPublic: selectedVr,
        sourceLabel: 'Expediente documental',
      }] : [];
    });
}

function sameDocument(requirement, evidence) {
  const requiredCode = requirementCode(requirement);
  const evidenceCode = requirementCode(evidence);
  if (requiredCode && evidenceCode) return requiredCode === evidenceCode;
  return Boolean(name(requirementName(requirement))
    && name(requirementName(requirement)) === name(requirementName(evidence)));
}

function mergeRequirements(centralRequirements, fallbackRequirements, rowEvidence, selectedVr) {
  const usesCentralContext = centralRequirements.length > 0;
  const sourceRequirements = usesCentralContext ? centralRequirements : fallbackRequirements;
  const normalizedSelectedVr = text(selectedVr).toLocaleUpperCase('es');

  return sourceRequirements.map((requirement) => {
    const fallback = fallbackRequirements.find((candidate) => sameDocument(requirement, candidate)) || {};
    const configuredEvidence = [
      ...firstArray(requirement?.evidence),
      ...firstArray(fallback?.evidence),
    ].filter((item) => !normalizedSelectedVr || evidenceVr(item) === normalizedSelectedVr);
    const linkedEvidence = dedupeEvidence([
      ...configuredEvidence,
      ...rowEvidence.filter((entry) => sameDocument(requirement, entry)),
    ]);
    const fallbackStatus = text(fallback?.status ?? requirement?.status).toLowerCase();
    const knownOriginStates = linkedEvidence.map(evidenceOriginState).filter(Boolean);
    const selectedVrIsPhysicalOnly = knownOriginStates.length > 0
      && knownOriginStates.every((originState) => originState === 'physical');
    const status = linkedEvidence.length
      ? (selectedVrIsPhysicalOnly
        || (!normalizedSelectedVr && !usesCentralContext && fallbackStatus === 'pending_scan')
        ? 'pending_scan'
        : 'present')
      : fallbackStatus === 'not_applicable'
        ? 'not_applicable'
        : (!normalizedSelectedVr && !usesCentralContext && fallbackStatus === 'present'
          ? 'present'
          : 'missing');

    return {
      ...fallback,
      ...requirement,
      status,
      evidence: linkedEvidence,
    };
  });
}

function normalizeGroup(group = {}, index = 0) {
  const rawDocuments = firstArray(group.documentCodes, group.document_codes, group.documents);
  return {
    ...group,
    key: text(group.key ?? group.code ?? group.id, `group-${index}`),
    label: text(group.label ?? group.name ?? group.title ?? group.code, `Grupo ${index + 1}`),
    mode: text(group.mode ?? group.requirementMode ?? group.requirement_mode, 'all').toLowerCase(),
    documentCodes: rawDocuments.map((item) => (
      typeof item === 'object' ? requirementCode(item) : code(item)
    )).filter(Boolean),
  };
}

function hasIndependentRequiredTrace(requirement = {}) {
  const traces = firstArray(requirement.trace, requirement.traces);
  return traces.some((trace) => trace?.required === true
    && (trace?.source !== 'typology_option' || trace?.requirementMode === 'all'));
}

function groupRequirements(requirements, rawGroups) {
  const groups = rawGroups.map(normalizeGroup);
  if (!groups.length) {
    const required = requirements.filter((requirement) => requirement?.required !== false);
    const complementary = requirements.filter((requirement) => requirement?.required === false);
    return [
      required.length ? {
        key: 'general',
        label: 'Requisitos documentales',
        mode: 'all',
        documentCodes: required.map(requirementCode).filter(Boolean),
        requirements: required,
      } : null,
      complementary.length ? {
        key: 'complementary',
        label: 'Documentos complementarios',
        mode: 'complementary',
        documentCodes: complementary.map(requirementCode).filter(Boolean),
        requirements: complementary,
      } : null,
    ].filter(Boolean);
  }

  const assignedCodes = new Set(groups.flatMap((group) => group.documentCodes));
  const individuallyBlockingCodes = new Set(
    groups
      .filter((group) => group.mode === 'all')
      .flatMap((group) => group.documentCodes),
  );
  const resolvedGroups = groups.map((group) => ({
    ...group,
    requirements: requirements.filter((requirement) => group.documentCodes.includes(requirementCode(requirement))),
  })).filter((group) => group.requirements.length > 0);
  const requiredUnassigned = requirements.filter((requirement) => {
    const requirementDocumentCode = requirementCode(requirement);
    if (requirement?.required === false) return false;
    if (!requirementDocumentCode || !assignedCodes.has(requirementDocumentCode)) return true;
    if (individuallyBlockingCodes.has(requirementDocumentCode)) return false;
    return hasIndependentRequiredTrace(requirement);
  });
  const complementaryUnassigned = requirements.filter((requirement) => {
    const requirementDocumentCode = requirementCode(requirement);
    return requirement?.required === false
      && (!requirementDocumentCode || !assignedCodes.has(requirementDocumentCode));
  });

  if (requiredUnassigned.length) {
    resolvedGroups.push({
      key: 'general',
      label: 'Otros requisitos documentales',
      mode: 'all',
      documentCodes: requiredUnassigned.map(requirementCode).filter(Boolean),
      requirements: requiredUnassigned,
    });
  }

  if (complementaryUnassigned.length) {
    resolvedGroups.push({
      key: 'complementary',
      label: 'Documentos complementarios',
      mode: 'complementary',
      documentCodes: complementaryUnassigned.map(requirementCode).filter(Boolean),
      requirements: complementaryUnassigned,
    });
  }

  return resolvedGroups;
}

function groupResult(group) {
  if (group.mode === 'complementary') {
    return { label: 'Complementario', variant: 'outline', blocking: false };
  }
  const applicableRequirements = group.requirements.filter((requirement) => (
    requirement.status !== 'not_applicable'
  ));
  if (!applicableRequirements.length) {
    return { label: 'No aplica', variant: 'outline', blocking: false };
  }
  const presentCount = applicableRequirements.filter((requirement) => requirement.status === 'present').length;
  const satisfied = group.mode === 'at_least_one'
    ? presentCount > 0
    : presentCount === applicableRequirements.length;
  return {
    label: satisfied ? 'Cumple' : 'Pendiente',
    variant: satisfied ? 'secondary' : 'destructive',
    blocking: true,
  };
}

function statusLabel(status) {
  if (status === 'present') return 'Con evidencia';
  if (status === 'pending_scan') return 'Pendiente de escaneo';
  if (status === 'not_applicable') return 'No aplica';
  return 'Faltante';
}

function statusVariant(status) {
  if (status === 'present') return 'secondary';
  if (status === 'missing') return 'destructive';
  return 'outline';
}

function modeLabel(mode) {
  if (mode === 'at_least_one') return 'Al menos uno';
  if (mode === 'complementary') return 'Complementario';
  return 'Todos';
}

function evidenceLabel(evidence = {}) {
  return text(
    evidence.documentName
    ?? evidence.document_name
    ?? evidence.label
    ?? evidence.name
    ?? evidence.filename,
    'Evidencia documental',
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LegalFormProjectContext({
  projectContext,
  fallbackResult = null,
  evidenceRows = [],
  selectedVr = '',
  sourceLabel = 'Dovela Central',
  loading = false,
  error = '',
}) {
  if (loading) {
    return (
      <div className="grid gap-3" aria-label="Cargando contexto de Legal y debida forma">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error && !projectContext && !fallbackResult) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const central = getLegalFormContextCollections(projectContext || {});
  const fallbackRequirements = Array.isArray(fallbackResult?.requirements) ? fallbackResult.requirements : [];
  const requirements = mergeRequirements(
    central.requirements,
    fallbackRequirements,
    flattenRowEvidence(evidenceRows, selectedVr),
    selectedVr,
  );
  const groups = groupRequirements(requirements, central.groups);
  const warnings = central.warnings;
  const evidence = dedupeEvidence(requirements.flatMap((requirement) => requirement.evidence || []));

  return (
    <div className="space-y-4">
      {error && !projectContext ? (
        <div role="status" className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-foreground">
          No fue posible consultar Dovela Central; se muestra el contexto documental compatible disponible en este expediente.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={FolderTree} label="Grupos" value={groups.length} />
        <SummaryCard icon={FileCheck2} label="Requisitos" value={requirements.length} />
        <SummaryCard icon={Link2} label="Evidencias" value={evidence.length} />
        <SummaryCard icon={AlertTriangle} label="Advertencias" value={warnings.length} />
      </div>

      <Card className="shadow-none">
        <CardContent className="flex flex-wrap items-center gap-2 p-4 text-sm">
          <Scale className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium text-foreground">VR de Legal y debida forma:</span>
          <Badge variant={selectedVr ? 'secondary' : 'outline'}>{selectedVr || 'Sin seleccionar'}</Badge>
          <span className="text-xs text-muted-foreground">Fuente: {sourceLabel}</span>
        </CardContent>
      </Card>

      {warnings.length ? (
        <Card className="border-warning/30 bg-warning/5 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              Advertencias del proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {warnings.map((warning, index) => (
              <p key={text(warning?.code ?? warning?.id, index)} className="text-sm text-foreground">
                {text(warning?.message ?? warning?.label ?? warning, 'Advertencia sin detalle')}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!requirements.length ? (
        <EmptyState
          icon="FileCheck"
          message="Sin contexto documental resuelto"
          description="Configura el perfil y las tipologías del proyecto para resolver sus requisitos."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const result = groupResult(group);
            const groupEvidence = dedupeEvidence(
              group.requirements.flatMap((requirement) => requirement.evidence || []),
            );

            return (
              <Card key={group.key} className="shadow-none">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 border-b border-border p-4">
                  <div>
                    <CardTitle className="text-sm">{group.label}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Regla: {modeLabel(group.mode)}
                      {!result.blocking ? ' · no bloquea Legal y debida forma' : ''}
                    </p>
                  </div>
                  <Badge variant={result.variant}>{result.label}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 p-4 lg:grid-cols-2">
                  <section aria-label={`Requisitos de ${group.label}`}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requisitos
                    </h3>
                    <div className="space-y-2">
                      {group.requirements.length ? group.requirements.map((requirement, index) => {
                        const documentCode = requirementCode(requirement);
                        return (
                          <div key={text(requirement.id ?? documentCode, index)} className="rounded-lg border border-border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{requirementName(requirement)}</p>
                                {documentCode ? <p className="font-mono text-xs text-muted-foreground">{documentCode}</p> : null}
                              </div>
                              <Badge variant={statusVariant(requirement.status)}>
                                {statusLabel(requirement.status)}
                              </Badge>
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-sm text-muted-foreground">Este grupo no tiene documentos configurados.</p>
                      )}
                    </div>
                  </section>

                  <section aria-label={`Evidencias de ${group.label}`}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Evidencias
                    </h3>
                    <div className="space-y-2">
                      {groupEvidence.length ? groupEvidence.map((item, index) => (
                        <div key={evidenceKey(item, index)} className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="truncate text-sm font-medium text-foreground">{evidenceLabel(item)}</p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                            <span>{text(item.vrIdPublic ?? item.vr_id_public ?? item.vr, selectedVr || 'Sin VR')}</span>
                            <span>{text(item.sourceLabel ?? item.sourceTable, 'Expediente documental')}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground">No hay evidencias vinculadas a este grupo.</p>
                      )}
                    </div>
                  </section>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LegalFormProjectContext;
