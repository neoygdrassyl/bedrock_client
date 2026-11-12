const pendingRequests = new Map();
const resolvedRequests = new Map();

/**
 * Shares one in-flight GET per key. `force` starts a new request instead of joining the
 * pending one (e.g. a reload after a write must not receive a response read before it);
 * later callers then join the forced, fresher request.
 */
export function dedupeGet(key, requestFn, { force = false } = {}) {
  if (!force && pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = Promise.resolve(requestFn()).finally(() => {
    if (pendingRequests.get(key) === request) pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
}

export function cachedGet(key, requestFn, { ttlMs = 30_000, force = false } = {}) {
  const cached = resolvedRequests.get(key);
  if (!force && cached && Date.now() - cached.createdAt < ttlMs) {
    return Promise.resolve(cached.value);
  }

  return dedupeGet(key, requestFn).then((value) => {
    resolvedRequests.set(key, { createdAt: Date.now(), value });
    return value;
  });
}

export function clearPendingRequests() {
  pendingRequests.clear();
}

export function clearResolvedRequests() {
  resolvedRequests.clear();
}
