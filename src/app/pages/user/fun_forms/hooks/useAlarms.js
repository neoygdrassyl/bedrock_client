import { useState, useEffect, useCallback, useRef } from 'react';
import AlarmService from '../../../../services/alarm.service';

export function useAlarms({ enabled = true, pollMs = 60000, includeAttended = false, includeHidden = false } = {}) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await AlarmService.list({ includeAttended, includeHidden });
      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
      setAlarms(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [includeAttended, includeHidden]);

  const attend = useCallback(
    async (id) => {
      await AlarmService.attend(id);
      await refetch();
    },
    [refetch]
  );

  const hide = useCallback(
    async (id) => {
      await AlarmService.hide(id);
      await refetch();
    },
    [refetch]
  );

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    refetch();
    if (pollMs > 0) {
      timerRef.current = setInterval(refetch, pollMs);
      return () => clearInterval(timerRef.current);
    }
    return undefined;
  }, [enabled, refetch, pollMs]);

  return { alarms, loading, error, refetch, attend, hide };
}
