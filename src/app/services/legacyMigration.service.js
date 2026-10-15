import http from '../../http-common';
import { documentaryProjectId } from './documentary.service';

// Legacy -> documentary model migration of one expediente (backend:
// app/routes/documentary-legacy-migration.routes.js).
export const LEGACY_MIGRATION_SCHEMA = 'dovela-backoffice/documentary-legacy-migration/v1';
const JSON_BODY = { headers: { 'Content-Type': 'application/json' } };
const HASH = /^[a-f0-9]{64}$/;
const migrationUrl = (fun0Id) => `/fun/documentary/v1/projects/${documentaryProjectId(fun0Id)}/legacy-migration`;
const fail = () => { throw new Error('La respuesta de la migración no corresponde al expediente.'); };

/** Throws unless the preview is the analysis of this expediente under the v1 contract. */
export function validateLegacyMigrationPreview(data, fun0Id) {
  if (data?.schemaVersion !== LEGACY_MIGRATION_SCHEMA || data.project?.fun0Id !== Number(fun0Id)
    || !data.release || !Number.isInteger(data.release.configurationId) || !HASH.test(data.release.checksum || '')
    || !HASH.test(data.planHash || '') || typeof data.blocking !== 'boolean' || !Number.isInteger(data.inputRevision)
    || !['vrs', 'deliveries', 'files', 'issues', 'checklistComparison', 'releaseOptions'].every((key) => Array.isArray(data[key]))
    || !data.stats || !data.stats.files || !data.stats.issues
    || data.issues.some((item) => !item || typeof item.code !== 'string' || !['blocking', 'warning'].includes(item.severity) || !Array.isArray(item.sources))
    || data.deliveries.some((item) => !item || typeof item.legacyKey !== 'string' || !['import', 'excluded', 'merged'].includes(item.status))
    || data.files.some((item) => !item || !Number.isInteger(item.id) || typeof item.status !== 'string')) fail();
  return data;
}

/** Throws unless the commit result belongs to this expediente and left it in the documentary model. */
export function validateLegacyMigrationResult(data, fun0Id) {
  if (data?.schemaVersion !== LEGACY_MIGRATION_SCHEMA || data.fun0Id !== Number(fun0Id) || data.mode !== 'canonical'
    || !Number.isInteger(data.configurationId) || !HASH.test(data.planHash || '') || !data.imported || !Number.isInteger(data.imported.deliveries)) fail();
  return data;
}

export async function previewLegacyMigration(fun0Id, { configurationId, resolutions } = {}, signal) {
  const body = {};
  if (configurationId != null) body.configurationId = configurationId;
  if (resolutions) body.resolutions = resolutions;
  const { data } = await http.post(`${migrationUrl(fun0Id)}/preview`, body, Object.assign({ signal }, JSON_BODY));
  return validateLegacyMigrationPreview(data, fun0Id);
}

export async function commitLegacyMigration(fun0Id, command) {
  const { data } = await http.post(migrationUrl(fun0Id), command, JSON_BODY);
  return validateLegacyMigrationResult(data, fun0Id);
}
