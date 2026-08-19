import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Database, Loader2, Save, Settings2 } from 'lucide-react';
import {
  DovelaBadge,
  DovelaButton,
  DovelaField,
  DovelaInlineAlert,
  DovelaSectionPanel,
  DovelaSelect,
} from '@/components/dovela-ui';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DocumentRequirementService from '../../../services/document_requirement.service.js';

const REQUIREMENT_MODE_LABELS = Object.freeze({
  all: 'Todos los documentos',
  at_least_one: 'Al menos un documento',
  complementary: 'Documentos complementarios',
});

function unwrapResponse(response) {
  const first = response?.data ?? response;
  return first?.data ?? first;
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || fallback;
}

function normalizeSelections(rawSelections) {
  if (!rawSelections || typeof rawSelections !== 'object' || Array.isArray(rawSelections)) return {};
  return Object.entries(rawSelections).reduce((result, [typologyCode, selected]) => {
    const values = Array.isArray(selected) ? selected : selected ? [selected] : [];
    result[typologyCode] = [...new Set(values.map(String).filter(Boolean))];
    return result;
  }, {});
}

function getProfileId(profile) {
  return String(profile?.id ?? profile?.profileId ?? '');
}

function getAvailableProfiles(payload) {
  if (Array.isArray(payload?.availableProfiles)) return payload.availableProfiles;
  if (Array.isArray(payload?.profiles)) return payload.profiles;
  return [];
}

function normalizeTypology(entry) {
  const config = entry?.optionsConfig ?? entry?.options_config ?? entry?.config ?? entry ?? {};
  return {
    code: String(entry?.typologyCode ?? entry?.code ?? entry?.classificationCode ?? ''),
    name: entry?.typologyName ?? entry?.name ?? entry?.classificationName ?? 'Subtipología',
    selectionMode: config?.selectionMode === 'multiple' ? 'multiple' : 'single',
    options: Array.isArray(config?.options)
      ? config.options
      : Array.isArray(entry?.items)
        ? entry.items
        : [],
  };
}

function getTypologies(payload) {
  const raw = Array.isArray(payload?.typologyOptions)
    ? payload.typologyOptions
    : Array.isArray(payload?.requirements?.typologyOptions)
      ? payload.requirements.typologyOptions
      : [];
  return raw.map(normalizeTypology).filter((typology) => typology.code && typology.options.length);
}

function getWarnings(payload) {
  const warnings = payload?.requirements?.warnings ?? payload?.warnings;
  if (!Array.isArray(warnings)) return [];
  return warnings.map((warning) => (
    typeof warning === 'string' ? warning : warning?.message || warning?.code
  )).filter(Boolean);
}

function selectedProfileId(payload) {
  const assigned = payload?.assignment?.profileId
    ?? payload?.assignment?.centralConfigurationProfileId
    ?? payload?.assignment?.profile_id
    ?? payload?.profile?.id;
  return assigned === undefined || assigned === null ? '' : String(assigned);
}

function selectedTypologyValues(payload) {
  return normalizeSelections(
    payload?.assignment?.typologySelections
      ?? payload?.assignment?.typology_selections
      ?? payload?.typologySelections
      ?? {}
  );
}

function formatProfileOption(profile) {
  const version = profile?.releaseVersion ?? profile?.release_version ?? profile?.version;
  const defaultLabel = profile?.isDefault ?? profile?.is_default ? ' · predeterminada' : '';
  return {
    value: getProfileId(profile),
    label: `${profile?.name || `Configuración ${getProfileId(profile)}`}${version === undefined || version === null ? '' : ` · release ${version}`}${defaultLabel}`,
    disabled: profile?.enabled === false,
  };
}

function TypologySelector({ typology, selectedIds, disabled, onChange }) {
  const titleId = `typology-${typology.code.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  if (typology.selectionMode === 'single') {
    return (
      <fieldset className="grid gap-3 rounded-[var(--card-radius)] border border-border bg-card p-4">
        <legend id={titleId} className="px-1 text-sm font-semibold text-foreground">
          {typology.name}
          <span className="ml-2 font-normal text-muted-foreground">({typology.code})</span>
        </legend>
        <p className="m-0 text-xs leading-5 text-muted-foreground">Selecciona una opción.</p>
        <RadioGroup
          value={selectedIds[0] || ''}
          onValueChange={(value) => onChange([value])}
          disabled={disabled}
          aria-labelledby={titleId}
          className="gap-2"
        >
          {typology.options.map((option) => {
            const optionId = String(option?.id ?? option?.value ?? '');
            const controlId = `${titleId}-${optionId}`;
            return (
              <Label
                key={optionId}
                htmlFor={controlId}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2.5 font-normal transition-colors hover:bg-muted/60"
              >
                <RadioGroupItem id={controlId} value={optionId} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm font-semibold text-foreground">{option?.label || optionId}</strong>
                    <span className="inline-flex rounded-full border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
                      {REQUIREMENT_MODE_LABELS[option?.requirementMode] || option?.requirementMode || 'Requisito documental'}
                    </span>
                  </span>
                  {option?.description ? (
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                  ) : null}
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      </fieldset>
    );
  }

  return (
    <fieldset className="grid gap-3 rounded-[var(--card-radius)] border border-border bg-card p-4">
      <legend id={titleId} className="px-1 text-sm font-semibold text-foreground">
        {typology.name}
        <span className="ml-2 font-normal text-muted-foreground">({typology.code})</span>
      </legend>
      <p className="m-0 text-xs leading-5 text-muted-foreground">Puedes seleccionar varias opciones.</p>
      <div className="grid gap-2" aria-labelledby={titleId}>
        {typology.options.map((option) => {
          const optionId = String(option?.id ?? option?.value ?? '');
          const controlId = `${titleId}-${optionId}`;
          const checked = selectedIds.includes(optionId);
          return (
            <Label
              key={optionId}
              htmlFor={controlId}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2.5 font-normal transition-colors hover:bg-muted/60"
            >
              <Checkbox
                id={controlId}
                checked={checked}
                onCheckedChange={(nextChecked) => {
                  const next = nextChecked === true
                    ? [...new Set([...selectedIds, optionId])]
                    : selectedIds.filter((value) => value !== optionId);
                  onChange(next);
                }}
                disabled={disabled}
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-semibold text-foreground">{option?.label || optionId}</strong>
                  <span className="inline-flex rounded-full border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
                    {REQUIREMENT_MODE_LABELS[option?.requirementMode] || option?.requirementMode || 'Requisito documental'}
                  </span>
                </span>
                {option?.description ? (
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
                ) : null}
              </span>
            </Label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProjectDocumentConfigurationPanel({
  currentPublic,
  compact = false,
  onConfigurationChange,
}) {
  const onConfigurationChangeRef = useRef(onConfigurationChange);
  const [context, setContext] = useState(null);
  const [profileId, setProfileId] = useState('');
  const [typologySelections, setTypologySelections] = useState({});
  const [loading, setLoading] = useState(Boolean(currentPublic));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    onConfigurationChangeRef.current = onConfigurationChange;
  }, [onConfigurationChange]);

  useEffect(() => {
    if (!currentPublic) {
      setContext(null);
      setProfileId('');
      setTypologySelections({});
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    setNotice('');
    DocumentRequirementService.getProjectCentralConfiguration(currentPublic)
      .then((response) => {
        if (cancelled) return;
        const payload = unwrapResponse(response) || {};
        setContext(payload);
        setProfileId(selectedProfileId(payload));
        setTypologySelections(selectedTypologyValues(payload));
        onConfigurationChangeRef.current?.(payload);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setContext(null);
          setError(getErrorMessage(requestError, 'No fue posible consultar la configuración documental del proyecto.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPublic]);

  const profiles = useMemo(() => getAvailableProfiles(context), [context]);
  const typologies = useMemo(() => getTypologies(context), [context]);
  const warnings = useMemo(() => getWarnings(context), [context]);
  const profileOptions = useMemo(() => profiles.map(formatProfileOption), [profiles]);
  const assignedExplicitly = Boolean(context?.assignment?.explicit);
  const loadedProfileId = selectedProfileId(context);
  const profileSelectionChanged = Boolean(profileId && profileId !== loadedProfileId);
  const activeProfile = profiles.find((profile) => getProfileId(profile) === profileId)
    || context?.profile
    || null;

  const updateTypology = (typologyCode, selectedIds) => {
    setTypologySelections((current) => ({
      ...current,
      [typologyCode]: selectedIds,
    }));
    setNotice('');
  };

  const handleProfileChange = (nextProfileId) => {
    setProfileId(nextProfileId);
    setTypologySelections({});
    setNotice('');
  };

  const handleSave = async () => {
    if (!currentPublic || !profileId) {
      setError('Selecciona un snapshot antes de guardar la configuración del proyecto.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');
    try {
      await DocumentRequirementService.updateProjectCentralConfiguration(currentPublic, {
        profileId,
        typologySelections: normalizeSelections(typologySelections),
      });
      const refreshedResponse = await DocumentRequirementService.getProjectCentralConfiguration(currentPublic);
      const payload = unwrapResponse(refreshedResponse) || {};
      setContext(payload);
      setProfileId(selectedProfileId(payload));
      setTypologySelections(selectedTypologyValues(payload));
      setNotice('Configuración documental guardada para este proyecto.');
      onConfigurationChangeRef.current?.(payload);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No fue posible guardar la configuración documental del proyecto.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DovelaSectionPanel
      title="Configuración documental del proyecto"
      description="El snapshot conserva el contrato Central usado por este expediente; las subtipologías determinan sus requisitos documentales."
      tone={compact ? 'subtle' : 'default'}
      className={compact ? 'shadow-none' : undefined}
      actions={activeProfile ? (
        <DovelaBadge tone={assignedExplicitly ? 'info' : 'outline'} icon={Database}>
          {assignedExplicitly ? 'Asignación propia' : 'Configuración predeterminada'}
        </DovelaBadge>
      ) : <Settings2 size={18} aria-hidden="true" />}
    >
      {!currentPublic ? (
        <DovelaInlineAlert tone="warning" title="Proyecto aún no identificado">
          Guarda la información básica del expediente para habilitar su configuración documental.
        </DovelaInlineAlert>
      ) : loading ? (
        <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          Consultando configuración del proyecto...
        </div>
      ) : (
        <div className="grid gap-4">
          {error ? (
            <DovelaInlineAlert tone="danger" onDismiss={() => setError('')}>
              {error}
            </DovelaInlineAlert>
          ) : null}
          {notice ? (
            <DovelaInlineAlert tone="success" icon={CheckCircle2} onDismiss={() => setNotice('')}>
              {notice}
            </DovelaInlineAlert>
          ) : null}

          {profiles.length ? (
            <DovelaField
              label="Snapshot de configuración"
              required
              helperText="Cambiar de snapshot limpia las subtipologías seleccionadas para evitar heredar opciones incompatibles."
            >
              <DovelaSelect
                value={profileId}
                onValueChange={handleProfileChange}
                options={profileOptions}
                placeholder="Selecciona una configuración importada"
                disabled={saving}
              />
            </DovelaField>
          ) : (
            <DovelaInlineAlert tone="warning" title="No hay snapshots disponibles">
              Importa una configuración desde Configuración → Configuración documental antes de asignarla a este proyecto.
            </DovelaInlineAlert>
          )}

          {profileSelectionChanged ? (
            <DovelaInlineAlert tone="info" title="Snapshot pendiente de asignación">
              Guarda el snapshot para cargar sus subtipologías. Las opciones de la configuración anterior no se aplicarán a la nueva versión.
            </DovelaInlineAlert>
          ) : null}

          {!profileSelectionChanged && warnings.length ? (
            <DovelaInlineAlert tone="warning" title="Decisiones documentales pendientes">
              {warnings.map((warning, index) => (
                <span key={`${warning}-${index}`} className="block">{warning}</span>
              ))}
            </DovelaInlineAlert>
          ) : null}

          {!profileSelectionChanged && typologies.length ? (
            <div className="grid gap-3" aria-label="Subtipologías documentales del proyecto">
              {typologies.map((typology) => (
                <TypologySelector
                  key={typology.code}
                  typology={typology}
                  selectedIds={typologySelections[typology.code] || []}
                  disabled={saving || !profileId}
                  onChange={(selectedIds) => updateTypology(typology.code, selectedIds)}
                />
              ))}
            </div>
          ) : !profileSelectionChanged && profiles.length ? (
            <DovelaInlineAlert tone="info">
              La configuración resuelta para este proyecto no requiere escoger subtipologías adicionales.
            </DovelaInlineAlert>
          ) : null}

          <div className="flex justify-end border-t border-border/70 pt-4">
            <DovelaButton
              size={compact ? 'sm' : 'md'}
              leadingIcon={Save}
              loading={saving}
              loadingLabel="Guardando..."
              disabled={!profiles.length || !profileId}
              onClick={handleSave}
            >
              {profileSelectionChanged ? 'Guardar snapshot y cargar subtipologías' : 'Guardar configuración del proyecto'}
            </DovelaButton>
          </div>
        </div>
      )}
    </DovelaSectionPanel>
  );
}

export default ProjectDocumentConfigurationPanel;
