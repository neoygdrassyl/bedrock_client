import { useEffect, useMemo, useState, lazy } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FUNService from '../../features/expediente/api/fun.service';
import { parseExpedienteWorkspaceSearch, rememberRecentExpediente } from '../../features/expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';
import LoadingFallback from './LoadingFallback';
import { IllustratedState } from '../../shared/components/feedback/IllustratedState';

const FUN_EXPEDIENTE_FULLSCREEN = lazy(() => import('../../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen').then((mod) => ({ default: mod.FunExpedienteFullscreen })));

export default function FunmanageExpedienteRoute({ translation, globals, swaMsg }) {
  const { radicado } = useParams();
  const location = useLocation();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // True when the request itself failed (retryable), not when nothing was found.
  const [requestFailed, setRequestFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const workspaceTarget = useMemo(
    () => parseExpedienteWorkspaceSearch(location.search),
    [location.search]
  );

  const closeExpedienteWindow = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('/dashboard');
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (!radicado) {
      setExpediente(null);
      setError('No se encontró el radicado solicitado.');
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError('');
    setRequestFailed(false);

    FUNService.get_fun_IdPublic(radicado)
      .then((response) => {
        if (cancelled) return;
        const data = response?.data?.data ?? response?.data ?? null;
        setExpediente(data);
        if (!data) setError('No fue posible cargar el expediente solicitado.');
      })
      .catch(() => {
        if (cancelled) return;
        setExpediente(null);
        setRequestFailed(true);
        setError('No fue posible cargar el expediente solicitado.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [radicado, reloadKey]);

  useEffect(() => {
    if (!expediente) return;

    rememberRecentExpediente(expediente, {
      section: workspaceTarget.section,
      report: workspaceTarget.report,
      limit: 6,
    });
  }, [expediente, workspaceTarget.report, workspaceTarget.section]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <IllustratedState
        variant={requestFailed ? 'load-error' : 'not-found'}
        title="Expediente no disponible"
        onRetry={requestFailed ? () => setReloadKey((value) => value + 1) : undefined}
        description={error}
        actions={(
          <a href="/licencias/gestion-nueva" className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: 'hsl(var(--primary))' }}>
            Volver a Gestión Licencias Nuevo
          </a>
        )}
      />
    );
  }

  return (
    <FUN_EXPEDIENTE_FULLSCREEN
      expediente={expediente}
      translation={translation}
      globals={globals}
      swaMsg={swaMsg}
      initialSection={workspaceTarget.section}
      initialReport={workspaceTarget.report}
      defaultRightPanelOpen={workspaceTarget.rightPanel}
      onClose={closeExpedienteWindow}
    />
  );
}
