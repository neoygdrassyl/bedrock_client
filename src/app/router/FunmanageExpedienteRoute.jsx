import { useEffect, useMemo, useState, lazy } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import FUNService from '../../features/expediente/api/fun.service';
import { ErrorReportInlineTrigger } from '../../shared/components/DovelaSupportLayer';
import { parseExpedienteWorkspaceSearch, rememberRecentExpediente } from '../../features/expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';
import LoadingFallback from './LoadingFallback';

const FUN_EXPEDIENTE_FULLSCREEN = lazy(() => import('../../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen').then((mod) => ({ default: mod.FunExpedienteFullscreen })));

export default function FunmanageExpedienteRoute({ translation, globals, swaMsg }) {
  const { radicado } = useParams();
  const location = useLocation();
  const [expediente, setExpediente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('No fue posible cargar el expediente solicitado.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [radicado]);

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
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 space-y-2">
          <h4 className="text-base font-semibold text-destructive">Expediente no disponible</h4>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-sm">
            <ErrorReportInlineTrigger
              context={{
                expediente: { radicado },
                lastError: {
                  source: 'funmanage-expediente-route',
                  error: { message: error },
                },
              }}
            />
            <a href="/licencias/gestion-nueva" className="text-primary hover:underline">
              Volver a Gestión Licencias Nuevo
            </a>
          </div>
        </div>
      </div>
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
