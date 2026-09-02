const pendingRequests = new Map();
const resolvedRequests = new Map();

export function dedupeGet(key, requestFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = Promise.resolve(requestFn()).finally(() => {
    pendingRequests.delete(key);
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
