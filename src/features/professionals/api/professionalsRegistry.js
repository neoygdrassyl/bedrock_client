// External professionals registry (find-or-create of the professionals of FUN 5.2, lookup by name).
// It is a separate, shared host: a local or development run must never write to the production registry by default.
//   VITE_PROFESSIONALS_API_URL  explicit base URL (any mode); empty/absent = registry disabled
//   VITE_API_PROF_URL           legacy name, honoured ONLY in production builds so existing deployments keep working
// When the registry is disabled the callers skip it silently: the professional is still saved in the expediente.

/** Base URL of the professionals registry for `env`, or '' when it must not be called. */
export function professionalsApiUrl(env = import.meta.env) {
  const explicit = String(env?.VITE_PROFESSIONALS_API_URL ?? '').trim();
  if (explicit) return explicit;
  return env?.PROD === true ? String(env?.VITE_API_PROF_URL ?? '').trim() : '';
}

export const isProfessionalsRegistryEnabled = (env = import.meta.env) => Boolean(professionalsApiUrl(env));

export const PROFESSIONALS_REGISTRY_DISABLED_MESSAGE = 'El registro externo de profesionales no está configurado en este entorno (VITE_PROFESSIONALS_API_URL).';
