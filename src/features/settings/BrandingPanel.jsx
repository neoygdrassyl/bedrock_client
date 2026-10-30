import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageUp, RefreshCcw, RotateCcw, Save, X } from 'lucide-react';
import { DovelaBadge, DovelaButton, DovelaInlineAlert, DovelaSectionPanel } from '@/shared/dovela-ui';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import BrandingService from '@/shared/api/branding.service';
import { logoFromBrandingResponse, setCuraduriaLogo, useCuraduriaLogo } from '@/shared/branding/useCuraduriaLogo';
import { infoCud } from '@/shared/config/jsons/vars';
import { LOGO_ACCEPTED_TYPES, rasterizeLogo } from './branding/rasterizeLogo.js';

function requestMessage(error, fallback) {
  const status = error?.response?.status;
  if (status === 403) return 'No tienes permiso para cambiar el logo de la curaduría.';
  if (status === 404) return 'El servidor aún no admite logos personalizados. Actualiza el backend para usar esta opción.';
  if (status === 413) return 'La imagen es demasiado grande para el servidor.';
  return error?.response?.data?.message || fallback;
}

function formatUpdatedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Mirrors the sidebar header: white tile with the logo plus the curaduría name.
function LogoPreview({ src, surface }) {
  const isDark = surface === 'dark';
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {isDark ? 'Barra lateral' : 'Fondo claro'}
      </span>
      <div className={`flex h-16 items-center gap-3 rounded-xl px-4 ${isDark ? 'bg-sidebar' : 'bg-white ring-1 ring-border'}`}>
        <span className={`flex size-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-0.5 shadow-sm ring-1 ${isDark ? 'ring-white/20' : 'ring-black/10'}`}>
          {src ? <img src={src} alt="" className="size-full object-contain" /> : null}
        </span>
        <span className={`truncate text-sm font-semibold ${isDark ? 'text-sidebar-foreground' : 'text-slate-900'}`}>
          {infoCud.name}
        </span>
      </div>
    </div>
  );
}

export default function BrandingPanel() {
  const { logo: currentLogo, isCustom } = useCuraduriaLogo();
  const [updatedAt, setUpdatedAt] = useState(null);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [busy, setBusy] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  const applyResponse = useCallback((response) => {
    const body = response?.data ?? response;
    setCuraduriaLogo(logoFromBrandingResponse(response));
    setUpdatedAt(body?.updatedAt || null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      applyResponse(await BrandingService.getBranding());
    } catch (requestError) {
      setError(requestMessage(requestError, 'No fue posible consultar el logo de la curaduría.'));
    } finally {
      setLoading(false);
    }
  }, [applyResponse]);

  useEffect(() => { load(); }, [load]);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setNotice('');
    setProcessing(true);
    try {
      setPendingLogo(await rasterizeLogo(file));
    } catch (processError) {
      setError(processError?.isLogoError ? processError.message : 'No fue posible procesar la imagen.');
    } finally {
      setProcessing(false);
    }
  };

  const run = async (key, work, successMessage) => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      await work();
      setNotice(successMessage);
    } catch (requestError) {
      setError(requestMessage(requestError, 'No fue posible guardar el logo.'));
    } finally {
      setBusy('');
    }
  };

  const save = () => run('save', async () => {
    applyResponse(await BrandingService.updateLogo(pendingLogo));
    setPendingLogo(null);
  }, 'Logo guardado. Ya se muestra en la barra lateral.');

  const reset = async () => {
    await run('reset', async () => {
      applyResponse(await BrandingService.updateLogo(null));
      setPendingLogo(null);
    }, 'Se restableció el logo por defecto.');
    setConfirmReset(false);
  };

  const previewLogo = pendingLogo || currentLogo;
  const locked = loading || processing || Boolean(busy);
  const updatedLabel = formatUpdatedAt(updatedAt);

  return (
    <section className="flex min-w-0 flex-col gap-4" data-testid="branding-panel" aria-labelledby="branding-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="branding-title" className="m-0 text-lg font-semibold text-foreground">Identidad</h2>
          <p className="mb-0 mt-1 text-sm text-muted-foreground">
            Logo de la curaduría que se muestra en la barra lateral y en la pantalla de ingreso para todos los usuarios.
          </p>
        </div>
        <DovelaButton tone="ghost" size="sm" leadingIcon={RefreshCcw} disabled={locked} onClick={() => { setError(''); setNotice(''); load(); }}>
          Actualizar
        </DovelaButton>
      </header>

      {error && <DovelaInlineAlert tone="danger" onDismiss={() => setError('')}>{error}</DovelaInlineAlert>}
      {notice && <div role="status"><DovelaInlineAlert tone="success" onDismiss={() => setNotice('')}>{notice}</DovelaInlineAlert></div>}

      <DovelaSectionPanel
        title="Logo de la curaduría"
        description="Sube una imagen PNG, JPEG, WebP o SVG. Se ajusta automáticamente a 256 × 256 px con fondo transparente; se recomienda un logo cuadrado."
        actions={pendingLogo
          ? <DovelaBadge tone="warning">Sin guardar</DovelaBadge>
          : isCustom
            ? <DovelaBadge tone="success">Personalizado{updatedLabel ? ` · ${updatedLabel}` : ''}</DovelaBadge>
            : <DovelaBadge tone="neutral">Logo por defecto</DovelaBadge>}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <LogoPreview src={previewLogo} surface="light" />
            <LogoPreview src={previewLogo} surface="dark" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={[...LOGO_ACCEPTED_TYPES, '.svg'].join(',')}
            className="hidden"
            onChange={chooseFile}
            data-testid="branding-logo-input"
          />

          <div className="flex flex-wrap justify-end gap-2">
            <DovelaButton
              tone="ghost"
              size="sm"
              leadingIcon={RotateCcw}
              disabled={locked || !isCustom}
              onClick={() => setConfirmReset(true)}
            >
              Restablecer al logo por defecto
            </DovelaButton>
            {pendingLogo && (
              <DovelaButton tone="ghost" size="sm" leadingIcon={X} disabled={locked} onClick={() => setPendingLogo(null)}>
                Descartar
              </DovelaButton>
            )}
            <DovelaButton
              tone="neutral"
              size="sm"
              leadingIcon={ImageUp}
              loading={processing}
              loadingLabel="Procesando…"
              disabled={locked}
              onClick={() => fileInputRef.current?.click()}
            >
              Seleccionar imagen
            </DovelaButton>
            <DovelaButton
              size="sm"
              leadingIcon={Save}
              loading={busy === 'save'}
              loadingLabel="Guardando…"
              disabled={locked || !pendingLogo}
              onClick={save}
            >
              Guardar
            </DovelaButton>
          </div>
        </div>
      </DovelaSectionPanel>

      <AlertDialog open={confirmReset} onOpenChange={(open) => { if (!busy) setConfirmReset(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer el logo por defecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el logo personalizado y todos los usuarios volverán a ver el logo incluido en la aplicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(busy)}>Cancelar</AlertDialogCancel>
            <DovelaButton tone="danger" loading={busy === 'reset'} loadingLabel="Restableciendo…" onClick={reset}>
              Restablecer
            </DovelaButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
