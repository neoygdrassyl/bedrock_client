import React, { useCallback, useEffect, useId, useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, PlugZap, RefreshCcw, Save } from 'lucide-react';
import {
  DovelaBadge, DovelaButton, DovelaField, DovelaInlineAlert, DovelaInput, DovelaSectionPanel,
} from '@/shared/dovela-ui';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import IntegrationSettingsService from './api/integration_settings.service.js';

function unwrap(response) {
  const first = response?.data ?? response;
  return first?.data && !first?.central ? first.data : first;
}

function requestMessage(error, fallback) {
  if (error?.response?.status === 403) return 'No tienes permiso para gestionar las integraciones.';
  return error?.response?.data?.message || fallback;
}

function SourceBadge({ entry }) {
  if (entry?.source === 'app') return <DovelaBadge tone="success">Guardada en la aplicación</DovelaBadge>;
  if (entry?.source === 'env') return <DovelaBadge tone="warning">Desde variable de entorno {entry.variable}</DovelaBadge>;
  return <DovelaBadge tone="neutral">Sin configurar</DovelaBadge>;
}

function SecretInput({ value, onChange, placeholder, label }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setVisible(true);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <DovelaInput
        id={inputId}
        type={visible ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 font-mono"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      />
      <DovelaButton tone="ghost" size="sm" leadingIcon={visible ? EyeOff : Eye} onClick={() => setVisible((current) => !current)} aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}>
        {visible ? 'Ocultar' : 'Ver'}
      </DovelaButton>
      <DovelaButton tone="ghost" size="sm" leadingIcon={Copy} disabled={!value} onClick={copy} aria-label={`Copiar ${label}`}>
        {copied ? 'Copiada' : 'Copiar'}
      </DovelaButton>
    </div>
  );
}

export default function IntegrationsPanel() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [centralUrl, setCentralUrl] = useState('');
  const [centralToken, setCentralToken] = useState('');
  const [frontofficeToken, setFrontofficeToken] = useState('');
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const applyOverview = useCallback((data) => {
    setOverview(data);
    setCentralUrl(data?.central?.apiUrl?.value || '');
    setCentralToken(data?.central?.apiToken?.value || '');
    setFrontofficeToken(data?.frontoffice?.apiToken?.value || '');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      applyOverview(unwrap(await IntegrationSettingsService.getOverview()));
    } catch (requestError) {
      setError(requestMessage(requestError, 'No fue posible consultar las integraciones.'));
    } finally {
      setLoading(false);
    }
  }, [applyOverview]);

  useEffect(() => { load(); }, [load]);

  const run = async (key, work, successMessage) => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      const message = await work();
      setNotice(message || successMessage);
    } catch (requestError) {
      setError(requestMessage(requestError, 'No fue posible completar la acción.'));
    } finally {
      setBusy('');
    }
  };

  const saveCentral = () => run('central-save', async () => {
    applyOverview(unwrap(await IntegrationSettingsService.updateCentral({ apiUrl: centralUrl, apiToken: centralToken })));
  }, 'Conexión con Dovela Central guardada.');

  const testCentral = () => run('central-test', async () => {
    const result = unwrap(await IntegrationSettingsService.testCentral({ apiUrl: centralUrl, apiToken: centralToken }));
    return `Conexión correcta: Dovela Central respondió con la versión ${result?.releaseVersion} publicada.`;
  });

  const saveFrontoffice = () => run('frontoffice-save', async () => {
    applyOverview(unwrap(await IntegrationSettingsService.updateFrontoffice({ apiToken: frontofficeToken })));
  }, 'Llave de FrontOffice guardada. Actualízala también en FrontOffice.');

  const rotateFrontoffice = async () => {
    await run('frontoffice-rotate', async () => {
      applyOverview(unwrap(await IntegrationSettingsService.updateFrontoffice({ generate: true })));
    }, 'Se generó una nueva llave. Cópiala y actualízala en FrontOffice.');
    setConfirmRotate(false);
  };

  const disabled = loading || Boolean(busy) || overview?.storeAvailable === false;

  return (
    <section className="flex min-w-0 flex-col gap-4" data-testid="integrations-panel" aria-labelledby="integrations-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="integrations-title" className="m-0 text-lg font-semibold text-foreground">Integraciones</h2>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Conexión con Dovela Central y llave de acceso de FrontOffice. Los valores guardados aquí reemplazan las variables de entorno.
          </p>
        </div>
        <DovelaButton tone="ghost" size="sm" leadingIcon={RefreshCcw} disabled={loading || Boolean(busy)} onClick={() => { setError(''); setNotice(''); load(); }}>
          Actualizar
        </DovelaButton>
      </header>

      {overview?.storeAvailable === false && (
        <DovelaInlineAlert tone="warning">
          La tabla de integraciones aún no existe. Aplica la migración del backend (npm run db:migrate) para poder guardar. Mientras tanto se usan las variables de entorno.
        </DovelaInlineAlert>
      )}
      {error && <DovelaInlineAlert tone="danger" onDismiss={() => setError('')}>{error}</DovelaInlineAlert>}
      {notice && <div role="status"><DovelaInlineAlert tone="success" onDismiss={() => setNotice('')}>{notice}</DovelaInlineAlert></div>}

      <DovelaSectionPanel
        title="Conexión con Dovela Central"
        description="Backoffice usa esta URL y esta llave para sincronizar las versiones del catálogo documental. La llave se copia desde Dovela Central > Integraciones."
        actions={<SourceBadge entry={overview?.central?.apiToken} />}
      >
        <div className="grid gap-4">
          <DovelaField label="URL de Dovela Central" helperText="Origen de Central, por ejemplo http://127.0.0.1:3100. Fuera de localhost debe usar HTTPS.">
            <DovelaInput
              type="url"
              autoComplete="off"
              value={centralUrl}
              placeholder="http://127.0.0.1:3100"
              onChange={(event) => setCentralUrl(event.target.value)}
            />
          </DovelaField>
          <div className="grid gap-2">
            <span className="text-sm font-semibold leading-5 text-foreground">Llave de Dovela Central</span>
            <SecretInput label="llave de Dovela Central" value={centralToken} onChange={setCentralToken} placeholder="Pega aquí la llave de Central" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <DovelaButton tone="neutral" size="sm" leadingIcon={PlugZap} loading={busy === 'central-test'} loadingLabel="Probando…" disabled={loading || Boolean(busy) || !centralUrl || !centralToken} onClick={testCentral}>
              Probar conexión
            </DovelaButton>
            <DovelaButton size="sm" leadingIcon={Save} loading={busy === 'central-save'} loadingLabel="Guardando…" disabled={disabled || !centralUrl || !centralToken} onClick={saveCentral}>
              Guardar conexión
            </DovelaButton>
          </div>
        </div>
      </DovelaSectionPanel>

      <DovelaSectionPanel
        title="Llave de FrontOffice"
        description="FrontOffice presenta esta llave al radicar solicitudes y al consultar el historial público. Cópiala y configúrala en FrontOffice."
        actions={<SourceBadge entry={overview?.frontoffice?.apiToken} />}
      >
        <div className="grid gap-4">
          {overview?.frontoffice?.tokensDiverge && (
            <DovelaInlineAlert tone="warning">
              Las variables BACKOFFICE_PUBLIC_RADICATION_TOKEN y PUBLIC_DOVELA_HISTORY_TOKEN tienen valores distintos. Al guardar una llave aquí, ambas integraciones usarán la misma.
            </DovelaInlineAlert>
          )}
          <SecretInput label="llave de FrontOffice" value={frontofficeToken} onChange={setFrontofficeToken} placeholder="Genera o pega una llave" />
          <div className="flex flex-wrap justify-end gap-2">
            <DovelaButton tone="neutral" size="sm" leadingIcon={KeyRound} disabled={disabled} onClick={() => setConfirmRotate(true)}>
              Generar nueva llave
            </DovelaButton>
            <DovelaButton size="sm" leadingIcon={Save} loading={busy === 'frontoffice-save'} loadingLabel="Guardando…" disabled={disabled || !frontofficeToken} onClick={saveFrontoffice}>
              Guardar llave
            </DovelaButton>
          </div>
        </div>
      </DovelaSectionPanel>

      <AlertDialog open={confirmRotate} onOpenChange={(open) => { if (!busy) setConfirmRotate(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Generar una nueva llave para FrontOffice?</AlertDialogTitle>
            <AlertDialogDescription>
              La llave actual dejará de funcionar de inmediato. FrontOffice no podrá radicar ni consultar el historial hasta que configures la nueva llave allí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busy)}>Cancelar</AlertDialogCancel>
            <DovelaButton tone="danger" loading={busy === 'frontoffice-rotate'} loadingLabel="Generando…" onClick={rotateFrontoffice}>
              Generar nueva llave
            </DovelaButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
