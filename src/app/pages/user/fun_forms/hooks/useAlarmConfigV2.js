import { useState, useEffect, useCallback, useMemo } from 'react';
import AlarmService from '../../../../services/alarm.service';

function parseConfigMaybe(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

/**
 * useAlarmConfigV2 - expone tanto la config cruda (legacy o v2) como la
 * version migrada a v2 (configJsonV2) para que la UI v2 no tenga que
 * conocer el shape legacy.
 *
 * Los setters disparan PUT al backend con el configJson modificado.
 * Siempre guardamos en version 2 para consolidar la migracion.
 */
export function useAlarmConfigV2() {
  const [rawConfig, setRawConfig] = useState(null);
  const [configV2, setConfigV2] = useState(null);
  const [meta, setMeta] = useState({ isV2: false, updatedAt: null, updatedBy: null, scope: null });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await AlarmService.getConfig();
      const data = resp.data?.data ?? resp.data ?? {};
      const rawConfig = parseConfigMaybe(data.configJson ?? null);
      const migratedConfig = parseConfigMaybe(data.configJsonV2 ?? null);
      const resolvedConfig = Number(rawConfig?.version) >= 2 ? rawConfig : (migratedConfig ?? rawConfig);
      setRawConfig(rawConfig);
      setConfigV2(resolvedConfig);
      setMeta({
        isV2: Boolean(data.isV2),
        updatedAt: data.updatedAt || null,
        updatedBy: data.updatedBy || null,
        scope: data.scope || null,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (nextV2Config) => {
    setSaving(true);
    setError(null);
    try {
      // Asegurarse de que se guarda como v2 (consolida migracion)
      const payload = { version: 2, ...nextV2Config };
      const resp = await AlarmService.updateConfig(payload);
      const data = resp.data?.data ?? resp.data ?? {};
      setRawConfig(parseConfigMaybe(data.configJson ?? payload));
      setConfigV2(parseConfigMaybe(data.configJsonV2 ?? data.configJson ?? payload));
      return resp.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const refreshAlarms = useCallback(async () => {
    return AlarmService.refresh();
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const scatterThresholds = useMemo(() => {
    return configV2?.scatterThresholds || { warning: 80, critical: 95, overdue: 100 };
  }, [configV2]);

  return {
    rawConfig,
    config: configV2,          // atajo: UI v2 usa directo
    meta,
    loading,
    saving,
    error,
    refetch,
    save,
    refreshAlarms,
    scatterThresholds,
  };
}
