import { useState, useEffect, useCallback, useRef } from 'react';
import AlarmService from '../../../../services/alarm.service';

/**
 * useAlarmsV2 - hook extendido para el sistema de alarmas v2 (Licencias nuevo).
 *
 * Soporta filtros v2: level, actor, action, phaseCode, assignedOnly.
 * Expone: markRead, archive y refresh manual del scheduler.
 *
 * Coexiste con `useAlarms` legacy — no lo reemplaza para no romper AlarmBell viejo.
 */
export function useAlarmsV2({
  pollMs = 60000,
  level = null,
  actor = null,
  action = null,
  phaseCode = null,
  assignedOnly = false,
  includeAttended = false,
  includeHidden = false,
  includeArchived = false,
  limit = null,
} = {}) {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await AlarmService.list({
        level,
        actor,
        action,
        phaseCode,
        assignedOnly,
        includeAttended,
        includeHidden,
        includeArchived,
        limit,
      });
      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
      setAlarms(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [
    level,
    actor,
    action,
    phaseCode,
    assignedOnly,
    includeAttended,
    includeHidden,
    includeArchived,
    limit,
  ]);

  const attend = useCallback(async (id) => { await AlarmService.attend(id); await refetch(); }, [refetch]);
  const hide = useCallback(async (id) => { await AlarmService.hide(id); await refetch(); }, [refetch]);
  const markRead = useCallback(async (id) => { await AlarmService.markRead(id); await refetch(); }, [refetch]);
  const archive = useCallback(async (id) => { await AlarmService.archive(id); await refetch(); }, [refetch]);

  const refreshScheduler = useCallback(async () => {
    await AlarmService.refresh();
    // Dar tiempo al scheduler a correr antes de refetch
    setTimeout(() => { refetch(); }, 1500);
  }, [refetch]);

  useEffect(() => {
    refetch();
    if (pollMs > 0) {
      timerRef.current = setInterval(refetch, pollMs);
      return () => clearInterval(timerRef.current);
    }
    return undefined;
  }, [refetch, pollMs]);

  return {
    alarms,
    loading,
    error,
    refetch,
    attend,
    hide,
    markRead,
    archive,
    refreshScheduler,
  };
}

/**
 * useAlarmsBell - hook dedicado a la campana de notificaciones.
 * Filtra automaticamente por action=show_alarm + actor=CUR; assignedOnly es opcional.
 */
export function useAlarmsBell({ pollMs = 60000, includeRead = false, assignedOnly = false, limit = 50 } = {}) {
  const [alarms, setAlarms] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await AlarmService.bell({ includeRead, assignedOnly, limit });
      const payload = resp.data?.data ?? resp.data ?? [];
      setAlarms(Array.isArray(payload) ? payload : []);
      setUnread(Number(resp.data?.unread) || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [includeRead, assignedOnly, limit]);

  const markRead = useCallback(async (id) => { await AlarmService.markRead(id); await refetch(); }, [refetch]);
  const archive = useCallback(async (id) => { await AlarmService.archive(id); await refetch(); }, [refetch]);
  const attend = useCallback(async (id) => { await AlarmService.attend(id); await refetch(); }, [refetch]);

  useEffect(() => {
    refetch();
    if (pollMs > 0) {
      timerRef.current = setInterval(refetch, pollMs);
      return () => clearInterval(timerRef.current);
    }
    return undefined;
  }, [refetch, pollMs]);

  return { alarms, unread, loading, error, refetch, markRead, archive, attend };
}
