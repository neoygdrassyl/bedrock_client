import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAlarmConfig } from './fun_forms/hooks/useAlarmConfig';

const DEFAULT_PHASES = ['fase1', 'fase2', 'fase3', 'fase4'];
const DEFAULT_PHASE_TH = { warning: 70, critical: 90 };
const DEFAULT_SCATTER_TH = { warning: 80, critical: 95, overdue: 100 };

function toNumberOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clampPercent(n) {
  if (n === null) return null;
  return Math.max(0, Math.min(100, n));
}

function normalizeConfig(raw) {
  const cfg = raw || {};
  const phaseThresholds = { ...(cfg.phaseThresholds || {}) };
  DEFAULT_PHASES.forEach((p) => {
    phaseThresholds[p] = {
      warning: Number.isFinite(phaseThresholds[p]?.warning)
        ? phaseThresholds[p].warning
        : DEFAULT_PHASE_TH.warning,
      critical: Number.isFinite(phaseThresholds[p]?.critical)
        ? phaseThresholds[p].critical
        : DEFAULT_PHASE_TH.critical,
    };
  });
  const scatterThresholds = {
    warning: Number.isFinite(cfg.scatterThresholds?.warning)
      ? cfg.scatterThresholds.warning
      : DEFAULT_SCATTER_TH.warning,
    critical: Number.isFinite(cfg.scatterThresholds?.critical)
      ? cfg.scatterThresholds.critical
      : DEFAULT_SCATTER_TH.critical,
    overdue: Number.isFinite(cfg.scatterThresholds?.overdue)
      ? cfg.scatterThresholds.overdue
      : DEFAULT_SCATTER_TH.overdue,
  };
  const suspensionMaxDays = Number.isFinite(cfg.suspensionMaxDays)
    ? cfg.suspensionMaxDays
    : 30;
  return { phaseThresholds, scatterThresholds, suspensionMaxDays };
}

export default function SettingsPage() {
  const { config, loading, saving, error, refetch, save } = useAlarmConfig();
  const [draft, setDraft] = useState(() => normalizeConfig(null));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (config) {
      setDraft(normalizeConfig(config));
      setDirty(false);
    }
  }, [config]);

  const updatePhase = (phase, key, value) => {
    const n = clampPercent(toNumberOrNull(value));
    setDraft((prev) => ({
      ...prev,
      phaseThresholds: {
        ...prev.phaseThresholds,
        [phase]: { ...prev.phaseThresholds[phase], [key]: n ?? 0 },
      },
    }));
    setDirty(true);
  };

  const updateScatter = (key, value) => {
    const n = clampPercent(toNumberOrNull(value));
    setDraft((prev) => ({
      ...prev,
      scatterThresholds: { ...prev.scatterThresholds, [key]: n ?? 0 },
    }));
    setDirty(true);
  };

  const updateSuspension = (value) => {
    const n = toNumberOrNull(value);
    setDraft((prev) => ({ ...prev, suspensionMaxDays: n ?? 0 }));
    setDirty(true);
  };

  const handleReset = () => {
    setDraft(normalizeConfig(null));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await save(draft);
      toast.success('Configuración guardada');
      setDirty(false);
    } catch (e) {
      toast.error(`No se pudo guardar: ${e?.message || 'error desconocido'}`);
    }
  };

  const handleDiscard = () => {
    setDraft(normalizeConfig(config));
    setDirty(false);
  };

  return (
    <div className="space-y-6 p-2 md:p-4" data-testid="settings-page">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Configuración</h2>
        <p className="text-sm text-muted-foreground">
          Parámetros de alarmas y preferencias de la curaduría.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <div className="font-medium">Error cargando configuración</div>
          <div className="text-muted-foreground">
            {error?.message || 'Intenta recargar.'}
            <Button
              variant="link"
              size="sm"
              onClick={refetch}
              className="ml-2 h-auto p-0"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alarmas por fase</CardTitle>
          <CardDescription>
            Porcentaje del plazo legal consumido antes de marcar advertencia y estado crítico.
            Aplica a cada fase procesal (licencias, desistimientos, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEFAULT_PHASES.map((phase) => (
            <div key={phase} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-3 items-end">
              <div className="text-sm font-medium capitalize">{phase}</div>
              <div className="space-y-1">
                <Label htmlFor={`${phase}-warning`}>Advertencia (%)</Label>
                <Input
                  id={`${phase}-warning`}
                  type="number"
                  min="0"
                  max="100"
                  value={draft.phaseThresholds[phase]?.warning ?? ''}
                  onChange={(e) => updatePhase(phase, 'warning', e.target.value)}
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${phase}-critical`}>Crítico (%)</Label>
                <Input
                  id={`${phase}-critical`}
                  type="number"
                  min="0"
                  max="100"
                  value={draft.phaseThresholds[phase]?.critical ?? ''}
                  onChange={(e) => updatePhase(phase, 'critical', e.target.value)}
                  disabled={loading || saving}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Umbrales del gráfico de dispersión</CardTitle>
          <CardDescription>
            Líneas de referencia del scatter en la gestión de licencias. Alternativas a los días,
            expresadas como porcentaje del plazo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="scatter-warning">Advertencia (%)</Label>
            <Input
              id="scatter-warning"
              type="number"
              min="0"
              max="100"
              value={draft.scatterThresholds.warning ?? ''}
              onChange={(e) => updateScatter('warning', e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="scatter-critical">Crítico (%)</Label>
            <Input
              id="scatter-critical"
              type="number"
              min="0"
              max="100"
              value={draft.scatterThresholds.critical ?? ''}
              onChange={(e) => updateScatter('critical', e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="scatter-overdue">Vencido (%)</Label>
            <Input
              id="scatter-overdue"
              type="number"
              min="0"
              max="100"
              value={draft.scatterThresholds.overdue ?? ''}
              onChange={(e) => updateScatter('overdue', e.target.value)}
              disabled={loading || saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suspensiones</CardTitle>
          <CardDescription>
            Días máximos continuos permitidos en una suspensión antes de disparar alerta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-1">
            <Label htmlFor="suspension-max">Días máximos</Label>
            <Input
              id="suspension-max"
              type="number"
              min="0"
              value={draft.suspensionMaxDays ?? ''}
              onChange={(e) => updateSuspension(e.target.value)}
              disabled={loading || saving}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>
            Ajustes personales de la cuenta. Próximamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta sección se habilitará en una próxima iteración.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Disponible próximamente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Cambiar contraseña
          </Button>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t py-3 flex items-center justify-end gap-2 -mx-2 md:-mx-4 px-4">
        <Button variant="ghost" onClick={handleReset} disabled={loading || saving}>
          Restaurar valores por defecto
        </Button>
        <Button
          variant="outline"
          onClick={handleDiscard}
          disabled={!dirty || loading || saving}
        >
          Descartar
        </Button>
        <Button onClick={handleSave} disabled={!dirty || loading || saving} data-testid="settings-save">
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}
