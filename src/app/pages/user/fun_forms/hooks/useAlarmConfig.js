import { useState, useEffect, useCallback } from 'react';
import AlarmService from '../../../../services/alarm.service';

export function useAlarmConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await AlarmService.getConfig();
        setConfig(resp.data?.data?.configJson ?? resp.data?.configJson ?? null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
    }
  }, []);

  const save = useCallback(
    async (nextConfig) => {
      setSaving(true);
      setError(null);
      try {
        const resp = await AlarmService.updateConfig(nextConfig);
        setConfig(resp.data?.data?.configJson ?? resp.data?.configJson ?? nextConfig);
        return resp.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { config, loading, saving, error, refetch, save };
}
