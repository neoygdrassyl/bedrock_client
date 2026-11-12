import { useState, useEffect, useCallback, useRef } from 'react';
import AlarmService from '../../../api/alarm.service';

/** Cheap structural comparison: alarm lists are small, plain JSON from the API. */
function isSameAlarmList(previous, next) {
  if (previous === next) return true;
  if (!Array.isArray(previous) || !Array.isArray(next) || previous.length !== next.length) return false;
  try {
    return JSON.stringify(previous) === JSON.stringify(next);
  } catch {
    return false;
  }
}

export function useAlarms({ enabled = true, pollMs = 60000, includeAttended = false, includeHidden = false } = {}) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // `background` is the polling path: it must not toggle `loading`, and an identical
  // payload keeps the previous array so subscribers do not re-render every tick.
  const refetch = useCallback(async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    setError(null);
    try {
      const resp = await AlarmService.list({ includeAttended, includeHidden });
      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
      setAlarms((previous) => (isSameAlarmList(previous, list) ? previous : list));
    } catch (err) {
      setError(err);
    } finally {
      if (!background) setLoading(false);
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
      timerRef.current = setInterval(() => refetch({ background: true }), pollMs);
      return () => clearInterval(timerRef.current);
    }
    return undefined;
  }, [enabled, refetch, pollMs]);

  return { alarms, loading, error, refetch, attend, hide };
}
