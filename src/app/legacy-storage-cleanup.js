// localStorage keys written by the retired in-app error reporting system. They
// held error/console/action snapshots (paths, messages, user data) that nothing
// reads anymore, so they are dropped on app start.
export const LEGACY_ERROR_REPORT_STORAGE_KEYS = [
  'dovela-last-error-context-v2',
  'dovela-last-http-error-context-v1',
  'dovela-last-user-action-v2',
  'dovela-console-entries-v2',
];

export function purgeLegacyErrorReportStorage(storage = globalThis.localStorage) {
  try {
    if (!storage) return;
    LEGACY_ERROR_REPORT_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
  } catch {
    // Storage can be unavailable (private mode, blocked site data): nothing to clean.
  }
}
