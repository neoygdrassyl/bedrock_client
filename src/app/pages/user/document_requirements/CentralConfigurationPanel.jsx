import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CloudDownload, ExternalLink, Loader2, RefreshCcw } from 'lucide-react';
import { DovelaBadge, DovelaButton, DovelaInlineAlert } from '@/components/dovela-ui';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DocumentRequirementService from '../../../services/document_requirement.service.js';

function unwrapResponse(response) {
  const first = response?.data ?? response;
  return first?.data ?? first;
}

function asConfigurations(payload) {
  if (Array.isArray(payload?.configurations)) return payload.configurations;
  throw new Error('Unexpected version list');
}

function centralPublicUrl() {
  try {
    const url = new URL(import.meta.env.VITE_DOVELA_CENTRAL_URL);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return '';
    return url.href;
  } catch {
    return '';
  }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date);
}

function configurationId(configuration) {
  return String(configuration?.id ?? '');
}

function configurationVersion(configuration) {
  const value = configuration?.releaseVersion ?? configuration?.version;
  return value === undefined || value === null ? 'Versión sin número' : `Versión ${value}`;
}

function isCurrent(configuration) {
  const value = configuration?.isCurrent;
  return value === true || value === 1 || value === '1';
}

function errorMessage(error, fallback) {
  if (error?.response?.status === 403) return 'No tienes permiso para realizar esta acción. Consulta con la persona administradora.';
  return fallback;
}

export default function CentralConfigurationPanel() {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activatingId, setActivatingId] = useState('');
  const [pendingConfiguration, setPendingConfiguration] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const activationTriggerRef = useRef(null);
  const titleRef = useRef(null);
  const centralUrl = centralPublicUrl();
  const busy = loading || syncing || Boolean(activatingId);

  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DocumentRequirementService.getCentralConfigurations();
      setConfigurations(asConfigurations(unwrapResponse(response)));
      return true;
    } catch (requestError) {
      // Do not present a stale version as current after a failed refresh.
      setConfigurations([]);
      setError(errorMessage(requestError, 'No fue posible consultar las versiones. Intenta actualizar la lista.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfigurations(); }, [loadConfigurations]);

  const handleRefresh = () => {
    setError('');
    setNotice('');
    loadConfigurations();
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setNotice('');
    try {
      // Central connection and credentials belong to the backend environment.
      const result = unwrapResponse(await DocumentRequirementService.syncCentralProfile({ makeCurrent: false, setDefault: false }));
      if (await loadConfigurations()) {
        setNotice(result?.created === false
          ? 'La última versión publicada ya estaba sincronizada.'
          : 'La última versión publicada ya está disponible. Puedes elegirla como vigente.');
      }
    } catch (requestError) {
      setError(errorMessage(requestError, 'No fue posible sincronizar con Dovela Central. Intenta de nuevo o consulta con la persona administradora.'));
    } finally {
      setSyncing(false);
    }
  };

  const handleActivate = async () => {
    if (!pendingConfiguration || busy) return;
    const selectedVersion = configurationVersion(pendingConfiguration);
    setActivatingId(configurationId(pendingConfiguration));
    setError('');
    setNotice('');
    try {
      await DocumentRequirementService.setCurrentCentralConfiguration(configurationId(pendingConfiguration));
      if (await loadConfigurations()) setNotice(`${selectedVersion} es ahora la vigente. Cambiar la versión vigente no modifica los expedientes existentes.`);
    } catch (requestError) {
      setError(errorMessage(requestError, 'No fue posible cambiar la versión vigente. Actualiza la lista e intenta de nuevo.'));
    } finally {
      setActivatingId('');
      setPendingConfiguration(null);
    }
  };

  return (
    <section className="flex min-w-0 flex-col gap-3" data-testid="central-configuration-panel" aria-labelledby="central-versions-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="central-versions-title" ref={titleRef} tabIndex={-1} className="m-0 text-lg font-semibold text-foreground">Configuración documental</h2>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">Versiones sincronizadas desde Dovela Central.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {centralUrl ? (
            <a href={centralUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Abrir Dovela Central <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : null}
          <DovelaButton size="sm" leadingIcon={CloudDownload} loading={syncing} loadingLabel="Sincronizando…" disabled={busy} onClick={handleSync}>
            Sincronizar versiones
          </DovelaButton>
        </div>
      </header>

      {!centralUrl && <DovelaInlineAlert tone="warning">El acceso a Dovela Central no está disponible. Consulta con la persona administradora.</DovelaInlineAlert>}
      {error && <DovelaInlineAlert tone="danger" onDismiss={() => setError('')}>{error}</DovelaInlineAlert>}
      {notice && <div role="status"><DovelaInlineAlert tone="success" onDismiss={() => setNotice('')}>{notice}</DovelaInlineAlert></div>}

      <div className="overflow-hidden rounded-md border border-border bg-card" aria-busy={busy}>
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">Versiones sincronizadas{!loading && !error ? ` (${configurations.length})` : ''}</span>
          <DovelaButton tone="ghost" size="sm" leadingIcon={RefreshCcw} disabled={busy} onClick={handleRefresh}>Actualizar lista</DovelaButton>
        </div>
        <Table className="table-fixed sm:table-auto" aria-label="Versiones de configuración documental">
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="h-9 px-3">Versión</TableHead>
              <TableHead scope="col" className="hidden h-9 px-3 sm:table-cell">Publicada</TableHead>
              <TableHead scope="col" className="h-9 px-3">Estado</TableHead>
              <TableHead scope="col" className="h-9 px-3 text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="px-3 py-6 text-center text-muted-foreground"><span role="status" className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Consultando versiones…</span></TableCell></TableRow>
            ) : configurations.length ? configurations.map((configuration) => (
              <TableRow key={configurationId(configuration)}>
                <TableCell className="break-words px-2 py-2 font-medium tabular-nums sm:px-3">{configurationVersion(configuration)}</TableCell>
                <TableCell className="hidden px-3 py-2 text-muted-foreground sm:table-cell">{formatDate(configuration.publishedAt ?? configuration.published_at)}</TableCell>
                <TableCell className="px-3 py-2">{isCurrent(configuration) ? <DovelaBadge tone="success" icon={CheckCircle2}>Vigente</DovelaBadge> : <span className="text-sm text-muted-foreground">Disponible</span>}</TableCell>
                <TableCell className="px-3 py-2 text-right">
                  {isCurrent(configuration) ? <span className="text-sm text-muted-foreground">En uso</span> : (
                    <DovelaButton tone="neutral" size="sm" disabled={busy || configuration.enabled === false} className="min-h-11 w-full whitespace-normal px-2 sm:min-h-8 sm:w-auto" onClick={(event) => { activationTriggerRef.current = event.currentTarget; setPendingConfiguration(configuration); }} aria-label={`Usar esta versión: ${configurationVersion(configuration)}`}>
                      Usar esta versión
                    </DovelaButton>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={4} className="px-3 py-6 text-center text-muted-foreground">{error ? 'La lista de versiones no está disponible.' : 'Aún no hay versiones sincronizadas. Sincroniza desde Dovela Central para comenzar.'}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="m-0 text-xs leading-5 text-muted-foreground">Cambiar la versión vigente no modifica los expedientes existentes.</p>

      <AlertDialog open={Boolean(pendingConfiguration)} onOpenChange={(open) => { if (!open && !activatingId) setPendingConfiguration(null); }}>
        <AlertDialogContent onCloseAutoFocus={(event) => {
          event.preventDefault();
          const trigger = activationTriggerRef.current;
          if (trigger?.isConnected && !trigger.disabled) trigger.focus();
          else titleRef.current?.focus();
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Usar {configurationVersion(pendingConfiguration).toLowerCase()} como vigente?</AlertDialogTitle>
            <AlertDialogDescription>Cambiar la versión vigente no modifica los expedientes existentes. Solo cambia la versión vigente del catálogo documental. Puedes volver a elegir otra versión sincronizada cuando lo necesites.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(activatingId)}>Cancelar</AlertDialogCancel>
            <DovelaButton loading={Boolean(activatingId)} loadingLabel="Activando…" disabled={busy} onClick={handleActivate}>Usar esta versión</DovelaButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
