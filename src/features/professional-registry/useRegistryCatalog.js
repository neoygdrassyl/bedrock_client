import { useEffect, useState } from 'react';

import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';

// The /catalog of BD PROFESIONALES (roles and professions) is the same for every person, so the list, the form and the
// "Experiencia" tab share one request while any of them is on screen: the first consumer asks the server, the others
// reuse its answer. When the last one goes away the answer is dropped, so the next visit to the page asks again. A
// failed request is not kept: the next consumer retries.
const shared = { promise: null, users: 0 };

function request() {
  try {
    return Promise.resolve(ProfessionalRegistryService.catalog());
  } catch (error) {
    return Promise.reject(error);
  }
}

function acquire() {
  shared.users += 1;
  if (!shared.promise) {
    const promise = request();
    shared.promise = promise;
    promise.catch(() => { if (shared.promise === promise) shared.promise = null; });
  }
  return shared.promise;
}

function release() {
  shared.users = Math.max(0, shared.users - 1);
  if (!shared.users) shared.promise = null;
}

// Forgets the shared request (tests).
export function resetRegistryCatalog() {
  shared.promise = null;
  shared.users = 0;
}

const NOT_LOADED = { roles: [], professions: null, loaded: false, failed: false };

// { roles, professions, loaded, failed }: the catalog roles ([] until loaded) and its professions, null when the server
// does not send them (an older backend), so each consumer keeps its own fallback. `enabled` false waits (a closed form).
export function useRegistryCatalog(enabled = true) {
  const [catalog, setCatalog] = useState(NOT_LOADED);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    acquire().then((response) => {
      if (!active) return;
      const sent = response?.data?.professions;
      setCatalog({
        roles: response?.data?.data || [],
        professions: Array.isArray(sent) && sent.length ? sent : null,
        loaded: true,
        failed: false,
      });
    }, () => { if (active) setCatalog((current) => ({ ...current, failed: true })); });
    return () => {
      active = false;
      release();
    };
  }, [enabled]);

  return catalog;
}
