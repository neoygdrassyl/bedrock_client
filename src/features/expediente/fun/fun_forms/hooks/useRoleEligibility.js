import { useEffect, useState } from 'react';
import { professionalRegistryService } from '@/features/professional-registry';

const IDLE = { status: 'idle', data: null };
const LOADING = { status: 'loading', data: null };
const UNAVAILABLE = { status: 'unavailable', data: null };
const isEligibility = (data) => Boolean(data) && Array.isArray(data.roles);

/**
 * The FUN 5.2 role eligibility of a BD PROFESIONALES professional. A new id cancels the request in flight and a late
 * answer for a previous id is ignored. Any failure (404 on an older backend, 400, network) settles 'unavailable', so
 * the caller can fall back to the single-role form.
 * @param {number|null} registryId
 * @returns {{ status: 'idle'|'loading'|'ready'|'unavailable', data: object|null }}
 */
export function useRoleEligibility(registryId) {
  const [result, setResult] = useState({ registryId: null, ...IDLE });

  useEffect(() => {
    if (!registryId) {
      // Forget the last answer, so picking the same professional again asks the server again.
      setResult({ registryId: null, ...IDLE });
      return undefined;
    }
    const controller = new AbortController();
    const settle = (next) => { if (!controller.signal.aborted) setResult({ registryId, ...next }); };
    professionalRegistryService.roleEligibility(registryId, { signal: controller.signal })
      .then((response) => settle(isEligibility(response?.data) ? { status: 'ready', data: response.data } : UNAVAILABLE))
      .catch(() => settle(UNAVAILABLE));
    return () => controller.abort();
  }, [registryId]);

  if (!registryId) return IDLE;
  return result.registryId === registryId ? { status: result.status, data: result.data } : LOADING;
}
