import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  CloudDownload,
  Database,
  Eye,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  DovelaBadge,
  DovelaButton,
  DovelaCard,
  DovelaCardContent,
  DovelaField,
  DovelaInlineAlert,
  DovelaInput,
  DovelaPageHeader,
  DovelaSectionPanel,
  DovelaTextarea,
} from '@/components/dovela-ui';
import { Checkbox } from '@/components/ui/checkbox';
import DocumentRequirementService from '../../../services/document_requirement.service.js';

function unwrapResponse(response) {
  const first = response?.data ?? response;
  return first?.data ?? first;
}

function asProfiles(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.profiles)) return payload.profiles;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message
    || error?.response?.data?.error
    || error?.message
    || fallback;
}

function formatDate(value) {
  if (!value) return 'Fecha no informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function profileId(profile) {
  return String(profile?.id ?? profile?.profileId ?? '');
}

function profileVersion(profile) {
  const value = profile?.releaseVersion ?? profile?.version;
  return value === undefined || value === null ? 'Sin versión' : `Release ${value}`;
}

function profileJson(detail) {
  const profile = detail?.profile ?? detail;
  const raw = profile?.payloadJson
    ?? profile?.payload_json
    ?? profile?.payload
    ?? detail?.payloadJson
    ?? detail?.payload_json
    ?? detail?.payload
    ?? (detail?.tables || detail?.schemaVersion ? detail : null)
    ?? null;

  if (typeof raw === 'string') {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch (_error) {
      return raw;
    }
  }

  return raw ? JSON.stringify(raw, null, 2) : '';
}

function ProfileRow({ profile, selected, activating, onSelect, onActivate }) {
  const id = profileId(profile);
  const isDefault = Boolean(profile?.isDefault ?? profile?.is_default);
  const enabled = profile?.enabled !== false;

  return (
    <DovelaCard
      tone={selected ? 'primary' : 'default'}
      className="overflow-hidden"
    >
      <DovelaCardContent compact className="flex flex-col gap-3 pt-[var(--card-padding-compact)] sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => onSelect(id)}
          aria-pressed={selected}
        >
          <span className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-sm font-semibold text-foreground">
              {profile?.name || `Configuración ${id}`}
            </strong>
            {isDefault ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium text-foreground">
                <CheckCircle2 size={13} aria-hidden="true" /> Predeterminada
              </span>
            ) : null}
            {!enabled ? (
              <span className="inline-flex items-center rounded-full border border-warning/35 bg-warning/10 px-2 py-1 text-xs font-medium text-foreground">
                Inactiva
              </span>
            ) : null}
          </span>
          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-muted-foreground">
            <span>{profileVersion(profile)}</span>
            <span>{profile?.tenantCode || profile?.tenant_code || 'Tenant no informado'}</span>
            <span>{formatDate(profile?.publishedAt ?? profile?.published_at)}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <DovelaButton
            tone="ghost"
            size="sm"
            leadingIcon={Eye}
            onClick={() => onSelect(id)}
            aria-label={`Ver JSON de ${profile?.name || id}`}
          >
            Ver JSON
          </DovelaButton>
          {!isDefault ? (
            <DovelaButton
              tone="neutral"
              size="sm"
              leadingIcon={ShieldCheck}
              loading={activating}
              loadingLabel="Activando..."
              onClick={() => onActivate(id)}
            >
              Usar por defecto
            </DovelaButton>
          ) : null}
        </div>
      </DovelaCardContent>
    </DovelaCard>
  );
}

export default function CentralConfigurationPanel() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [name, setName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activatingId, setActivatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProfiles = useCallback(async (preferredId = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await DocumentRequirementService.getCentralProfiles();
      const nextProfiles = asProfiles(unwrapResponse(response));
      setProfiles(nextProfiles);
      setSelectedId((currentId) => {
        const candidate = preferredId || currentId;
        if (candidate && nextProfiles.some((profile) => profileId(profile) === String(candidate))) {
          return String(candidate);
        }
        const preferred = nextProfiles.find((profile) => Boolean(profile?.isDefault ?? profile?.is_default))
          || nextProfiles[0];
        return preferred ? profileId(preferred) : '';
      });
    } catch (requestError) {
      setProfiles([]);
      setError(getErrorMessage(requestError, 'No fue posible consultar las configuraciones locales de Dovela Central.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return undefined;
    }

    let cancelled = false;
    setLoadingDetail(true);
    DocumentRequirementService.getCentralProfile(selectedId)
      .then((response) => {
        if (!cancelled) setDetail(unwrapResponse(response));
      })
      .catch((requestError) => {
        if (!cancelled) {
          setDetail(null);
          setError(getErrorMessage(requestError, 'No fue posible cargar el JSON de la configuración seleccionada.'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profileId(profile) === selectedId) || null,
    [profiles, selectedId]
  );
  const jsonText = useMemo(() => profileJson(detail), [detail]);

  const handleSync = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanSourceUrl = sourceUrl.trim();
    if (!cleanName || !cleanSourceUrl) {
      setError('Indica un nombre local y la URL base de Dovela Central.');
      return;
    }

    setSyncing(true);
    setError('');
    setNotice('');
    try {
      const response = await DocumentRequirementService.syncCentralProfile({
        name: cleanName,
        sourceUrl: cleanSourceUrl,
        setDefault: setAsDefault,
      });
      const payload = unwrapResponse(response);
      const imported = payload?.profile ?? payload;
      const importedId = profileId(imported);
      await loadProfiles(importedId);
      setName('');
      setSetAsDefault(false);
      setNotice('Release importado. La copia local quedó disponible como un snapshot inmutable.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No fue posible importar la configuración desde Dovela Central.'));
    } finally {
      setSyncing(false);
    }
  };

  const handleActivate = async (id) => {
    setActivatingId(id);
    setError('');
    setNotice('');
    try {
      await DocumentRequirementService.setDefaultCentralProfile(id);
      await loadProfiles(id);
      setNotice('La configuración seleccionada se usará por defecto en los proyectos sin asignación explícita.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No fue posible cambiar la configuración predeterminada.'));
    } finally {
      setActivatingId('');
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="central-configuration-panel">
      <DovelaPageHeader
        eyebrow="Integración documental"
        title="Configuración documental de Dovela Central"
        description="Importa releases publicados y conserva cada versión como un snapshot local. Los proyectos pueden usar la versión predeterminada o una asignación propia."
        meta={(
          <>
            <DovelaBadge tone="info" icon={Database}>{profiles.length} snapshots locales</DovelaBadge>
            <DovelaBadge tone="outline" icon={ShieldCheck}>Credencial protegida en backend</DovelaBadge>
          </>
        )}
        actions={(
          <DovelaButton
            tone="ghost"
            size="sm"
            leadingIcon={RefreshCcw}
            disabled={loading || syncing}
            onClick={() => loadProfiles(selectedId)}
          >
            Recargar
          </DovelaButton>
        )}
      />

      <DovelaInlineAlert tone="info" title="Conexión segura y versionada">
        Dovela actual solicita al backend la importación del release activo. El token de Dovela Central nunca se envía ni se almacena en el navegador.
      </DovelaInlineAlert>

      {error ? (
        <DovelaInlineAlert tone="danger" onDismiss={() => setError('')}>
          {error}
        </DovelaInlineAlert>
      ) : null}
      {notice ? (
        <DovelaInlineAlert tone="success" onDismiss={() => setNotice('')}>
          {notice}
        </DovelaInlineAlert>
      ) : null}

      <DovelaSectionPanel
        title="Importar release activo"
        description="La URL corresponde a la instancia pública de Dovela Central. Si el checksum ya existe, se reutiliza el snapshot local."
        actions={<CloudDownload size={18} aria-hidden="true" />}
      >
        <form className="grid gap-4" onSubmit={handleSync}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <DovelaField label="Nombre local" required helperText="Identifica la versión para quienes configuran los proyectos.">
              <DovelaInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Catálogo documental agosto 2026"
                maxLength={160}
                disabled={syncing}
              />
            </DovelaField>
            <DovelaField label="URL base de Dovela Central" required helperText="Se consultará /api/v1/releases/active desde el backend.">
              <DovelaInput
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://central.ejemplo.gov.co"
                autoComplete="url"
                disabled={syncing}
              />
            </DovelaField>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="central-set-default" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
              <Checkbox
                id="central-set-default"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked === true)}
                disabled={syncing}
              />
              Usar este release como configuración predeterminada
            </label>
            <DovelaButton
              type="submit"
              size="md"
              leadingIcon={CloudDownload}
              loading={syncing}
              loadingLabel="Importando release..."
            >
              Importar configuración
            </DovelaButton>
          </div>
        </form>
      </DovelaSectionPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <DovelaSectionPanel
          title="Snapshots disponibles"
          description="La configuración predeterminada aplica solo cuando un proyecto no tiene una versión asignada."
        >
          {loading ? (
            <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              Consultando snapshots...
            </div>
          ) : profiles.length ? (
            <div className="grid gap-3">
              {profiles.map((profile) => (
                <ProfileRow
                  key={profileId(profile)}
                  profile={profile}
                  selected={profileId(profile) === selectedId}
                  activating={activatingId === profileId(profile)}
                  onSelect={setSelectedId}
                  onActivate={handleActivate}
                />
              ))}
            </div>
          ) : (
            <DovelaInlineAlert tone="warning" title="No hay configuraciones importadas">
              Importa el release activo de Dovela Central para habilitar la asignación documental por proyecto.
            </DovelaInlineAlert>
          )}
        </DovelaSectionPanel>

        <DovelaSectionPanel
          title={selectedProfile ? `JSON · ${selectedProfile.name || profileVersion(selectedProfile)}` : 'JSON del snapshot'}
          description="Contenido completo recibido en el release. Es de solo lectura y no modifica la fuente Central."
          actions={selectedProfile ? <DovelaBadge tone="outline">{profileVersion(selectedProfile)}</DovelaBadge> : null}
        >
          {loadingDetail ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              Cargando JSON...
            </div>
          ) : jsonText ? (
            <DovelaTextarea
              value={jsonText}
              readOnly
              spellCheck="false"
              aria-label="JSON de configuración importada"
              density="editor"
              rows={22}
              className="max-h-[34rem] resize-y font-mono text-xs leading-5"
            />
          ) : (
            <DovelaInlineAlert tone="info">
              Selecciona un snapshot para consultar su configuración JSON completa.
            </DovelaInlineAlert>
          )}
        </DovelaSectionPanel>
      </div>
    </div>
  );
}
