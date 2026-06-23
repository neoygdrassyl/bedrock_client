const pendingRequests = new Map();

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

export function clearPendingRequests() {
  pendingRequests.clear();
}
