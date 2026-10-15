import http from '../../http-common';
import { documentaryProjectId } from './documentary.service';
import { isCanonicalExpediente } from '../pages/user/expediente_documental/expedienteMode';
import { validateDocumentaryView, validateDocumentaryReceipt, validateDocumentaryInventory, validateRowEvaluation } from '../pages/user/expediente_documental/documentaryViewContract';
const ROOT = '/fun/documentary/v1';
const projectUrl = (id) => `${ROOT}/projects/${documentaryProjectId(id)}`;
const fail = () => { throw new Error('La respuesta no corresponde al expediente o a su publicación.'); };
// The shared client defaults to multipart; documentary commands are strict JSON contracts.
const JSON_BODY = { headers: { 'Content-Type': 'application/json' } };
// Control ids are Dovela Central identifiers (central_check_control.id, up to 80 chars).
const centralControlId = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 80) fail();
  return encodeURIComponent(value);
};
export async function getDocumentaryOrigin({ fun0Id, submitId }, signal) {
  const url = submitId ? `${ROOT}/submits/${documentaryProjectId(submitId)}/source` : `${projectUrl(fun0Id)}/source`;
  const { data } = await http.get(url, { signal });
  if (data?.schemaVersion !== 'dovela-backoffice/documentary-origin/v1'
    || !['traditional', 'unlinked', 'canonical'].includes(data.mode)
    || (submitId ? data.submit?.id !== Number(submitId) : data.project?.fun0Id !== Number(fun0Id))) fail();
  if (data.mode === 'canonical' && (!data.publication?.checksum || !Array.isArray(data.catalogue?.documents) || !Array.isArray(data.catalogue?.classifications))) fail();
  return data;
}
function checkedView(data, origin) {
  validateDocumentaryView(data);
  if (data?.schemaVersion !== 'dovela-backoffice/documentary-view/v1' || data.mode !== 'canonical'
    || data.project?.fun0Id !== origin.project.fun0Id || data.configuration?.id !== origin.publication.configurationId
    || data.configuration?.checksum !== origin.publication.checksum || !Array.isArray(data.rows)
    || !Array.isArray(data.submits) || !data.capabilities || !data.pagination
    || data.rows.some((row) => !row.receipt || !Array.isArray(row.controls) || !row.catalogueDisplay)) fail();
  return data;
}
// `scope` ('input' | 'issued') and `documentClass` filter on the server; both are optional (default: input, every class).
export async function getCanonicalDocuments(origin, afterId = 0, signal, { scope, documentClass } = {}) {
  const params = { afterId, limit: 25 };
  if (scope) params.scope = scope;
  if (documentClass) params.documentClass = documentClass;
  const { data } = await http.get(`${projectUrl(origin.project.fun0Id)}/view`, { signal, params });
  return checkedView(data, origin);
}
/** Current view row of one document by its documentKey (any page of the list), or null when it has none. */
export async function getCanonicalDocumentRow(origin, documentKey, signal) {
  if (typeof documentKey !== 'string' || !documentKey.trim()) fail();
  const { data } = await http.get(`${projectUrl(origin.project.fun0Id)}/view`, { signal, params: { documentKey } });
  return checkedView(data, origin).rows.find((row) => row.documentKey === documentKey) || null;
}
const MISSING_STATES = ['current', 'stale', 'missing_cache', 'incomplete', 'not_applicable'];
export async function getMissingRequirements(fun0Id, signal) {
  const { data } = await http.get(`${projectUrl(fun0Id)}/requirements/missing`, { signal });
  if (data?.schemaVersion !== 'dovela-backoffice/documentary-missing/v1' || data.project?.fun0Id !== Number(fun0Id)
    || !['canonical', 'traditional', 'unlinked'].includes(data.mode) || !MISSING_STATES.includes(data.state)
    || typeof data.applicable !== 'boolean' || (data.applicable !== (data.mode === 'canonical')) || (!data.applicable && data.state !== 'not_applicable')
    || ![true, false, null].includes(data.allRequirementsSatisfied)
    || !Array.isArray(data.requirements) || data.requirements.some((item) => !item || typeof item.code !== 'string' || !['missing', 'present'].includes(item.status))
    || !Array.isArray(data.groups) || !Array.isArray(data.warnings)
    || !data.summary || ![data.summary.total, data.summary.missing, data.summary.present].every(Number.isInteger)
    || !data.refresh || typeof data.refresh.allowed !== 'boolean') fail();
  return data;
}
// Inventory port for document generators (every input document delivery + requirement status).
export async function getDocumentaryInventory(fun0Id, signal) {
  const { data } = await http.get(`${projectUrl(fun0Id)}/inventory`, { signal });
  return validateDocumentaryInventory(data, fun0Id);
}
export async function receiveCanonicalDocument(fun0Id, command, digital, scan) {
  const body = new FormData(); body.set('command', JSON.stringify(command));
  if (digital) body.set('digital', digital);
  if (scan) body.set('scan', scan);
  return (await http.post(`${projectUrl(fun0Id)}/documents`, body)).data;
}
export async function saveCanonicalControl(fun0Id, rowId, controlId, command) {
  return (await http.put(`${projectUrl(fun0Id)}/documents/${documentaryProjectId(rowId)}/controls/${centralControlId(controlId)}`, command, JSON_BODY)).data;
}
const REVIEW_VERDICTS = ['complies', 'does_not_comply', 'not_applicable'];
/** Reviewer verdict of ONE delivery row (a VR version) of a document without Central controls. */
export async function saveCanonicalReview(fun0Id, rowId, command) {
  if (!REVIEW_VERDICTS.includes(command?.verdict)) throw new Error('Seleccione un veredicto válido.');
  return (await http.put(`${projectUrl(fun0Id)}/documents/${documentaryProjectId(rowId)}/review`, command, JSON_BODY)).data;
}
export async function createCanonicalSubmit(fun0Id, command) {
  return (await http.post(`${projectUrl(fun0Id)}/submits`, command, JSON_BODY)).data;
}
export async function getCanonicalVersions(fun0Id, row, afterId = 0) {
  const { data } = await http.get(`${projectUrl(fun0Id)}/documents/${row.receivedDocumentRowId}/versions`, { params: { afterId, limit: 25 } });
  if (data?.schemaVersion !== 'dovela-backoffice/documentary-versions/v1' || data.documentKey !== row.documentKey || !Array.isArray(data.rows)) fail();
  data.rows.forEach(receipt=>{ validateDocumentaryReceipt(receipt,fun0Id); validateRowEvaluation(receipt.evaluation); });
  return data;
}

// VRs (submit ids) already used by the versions of a document: a new version needs another VR.
export async function getCanonicalVersionSubmitIds(fun0Id, row) {
  const used = new Set();
  let afterId = 0;
  do {
    const page = await getCanonicalVersions(fun0Id, row, afterId);
    page.rows.forEach((receipt) => { if (Number.isInteger(receipt.submitId)) used.add(receipt.submitId); });
    afterId = page.nextAfterId;
  } while (afterId);
  return used;
}
// Receipt rule violations that the user can fix in the form (not stale data).
const RECEIPT_ERROR_MESSAGES = {
  VERSION_VR_CONFLICT: 'Este documento ya tiene una versión en ese VR. Seleccione otro VR o actualice la evidencia de la versión existente.',
  NEW_VERSION_NOT_ALLOWED: 'Un volante de radicación pertenece a un único VR y no admite nuevas versiones.',
  MULTIPLICITY_CONFLICT: 'Ya existe este documento en el expediente (o el volante de este VR). Reciba una nueva versión del documento existente.',
};
export function documentaryReceiptRuleError(error) {
  const code = error?.response?.data?.error?.code;
  return error?.response?.status === 409 && RECEIPT_ERROR_MESSAGES[code] ? RECEIPT_ERROR_MESSAGES[code] : null;
}

export async function updateCanonicalEvidence(fun0Id, rowId, command, digital, scan) {
  const body = new FormData(); body.set('command',JSON.stringify(command));
  if (digital) body.set('digital',digital); if (scan) body.set('scan',scan);
  const {data} = await http.patch(`${projectUrl(fun0Id)}/documents/${documentaryProjectId(rowId)}/evidence`,body);
  validateDocumentaryReceipt(data.row,fun0Id); if(data.row.id!==Number(rowId)) fail(); return data;
}
export async function getCanonicalHistory(fun0Id, afterEventId=0, limit=25) {
  const {data}=await http.get(`${projectUrl(fun0Id)}/history`,{params:{afterEventId,limit}});
  if(!Array.isArray(data)||data.length>limit||data.some(event=>!Number.isInteger(event.id)||event.id<=afterEventId||event.fun0Id!==Number(fun0Id))) fail();
  const events=data.map(event=>({...event,beforeJson:typeof event.beforeJson==='string'?JSON.parse(event.beforeJson):event.beforeJson,afterJson:typeof event.afterJson==='string'?JSON.parse(event.afterJson):event.afterJson}));
  return {events,nextAfterId:events.length===limit?events[events.length-1].id:null};
}
// Documents added by hand to the requirements of an expediente (from the pinned Central catalogue).
const centralDocumentId = (value) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 36) fail();
  return encodeURIComponent(value);
};
export async function getRequirementAdditions(fun0Id, signal) {
  const { data } = await http.get(`${projectUrl(fun0Id)}/requirements/additions`, { signal });
  if (!data || !Array.isArray(data.additions) || !Array.isArray(data.catalogue)) fail();
  return data;
}
export async function addRequirementAddition(fun0Id, command) {
  return (await http.post(`${projectUrl(fun0Id)}/requirements/additions`, command, JSON_BODY)).data;
}
export async function removeRequirementAddition(fun0Id, documentId, command) {
  return (await http.delete(`${projectUrl(fun0Id)}/requirements/additions/${centralDocumentId(documentId)}`, { data: command, headers: JSON_BODY.headers })).data;
}
export async function getDocumentaryGovernance(fun0Id, signal) {return (await http.get(`${projectUrl(fun0Id)}/governance`,{signal})).data;}
export async function activateDocumentaryProject(fun0Id,command) {return (await http.post(`${projectUrl(fun0Id)}/activation`,command,JSON_BODY)).data;}
export async function changeDocumentaryConfiguration(fun0Id,command) {return (await http.put(`${projectUrl(fun0Id)}/configuration`,command,JSON_BODY)).data;}
// Returns the expediente to traditional documentation; allowed only before any received evidence.
export async function returnDocumentaryProjectToLegacy(fun0Id,command) {return (await http.post(`${projectUrl(fun0Id)}/legacy`,command,JSON_BODY)).data;}
export async function refreshDocumentaryRequirements(fun0Id,command) {return (await http.post(`${projectUrl(fun0Id)}/requirements/refresh`,command,JSON_BODY)).data;}
export function appendDocumentarySourceCommand(formData, root) {
  if (!isCanonicalExpediente(root)) return formData;
  if (!Number.isInteger(root.documentaryRevision)) throw new Error('Recargue el expediente antes de guardar su versión.');
  formData.set('documentaryExpectedInputRevision',String(root.documentaryRevision));
  if (!formData.has('documentaryCommandKey')) formData.set('documentaryCommandKey',crypto.randomUUID());
  return formData;
}
export function documentaryVersionIndex(root, rows, version) {
  if (!isCanonicalExpediente(root)) return Number(version)-1;
  const matches=(Array.isArray(rows)?rows:[]).map((row,index)=>({row,index})).filter(({row})=>Number(row.version)===Number(version));
  return matches.length===1?matches[0].index:-1;
}
export async function recoverDocumentarySourceConflict(error, {root,formData,reload,notify}) {
  if (!isCanonicalExpediente(root) || error.response?.status !== 409) return false;
  formData?.delete('documentaryCommandKey');
  try {
    await reload(root.id);
    notify({title:'El expediente cambió',text:'Se solicitó recargar el expediente. Revise los datos y confirme nuevamente; el cambio no se reintentó.'});
  } catch (_) {
    notify({title:'Debe recargar el expediente',text:'No fue posible actualizar los datos. Recargue la página antes de confirmar nuevamente.'});
  }
  return true;
}
// Files imported from the legacy model are served by the legacy-migration router; the view
// contract pins that path so a crafted downloadUrl cannot point anywhere else.
const LEGACY_FILE_PATH = /^\/api\/fun\/documentary\/v1\/projects\/(\d+)\/legacy-migration\/files\/(\d+)\/(digital|scan)$/;
export function canonicalFileRequest(fun0Id, rowId, slot, file) {
  const legacy = typeof file?.downloadUrl === 'string' ? LEGACY_FILE_PATH.exec(file.downloadUrl) : null;
  if (legacy && Number(legacy[1]) === Number(fun0Id) && Number(legacy[2]) === Number(rowId) && legacy[3] === slot) {
    // The http client already carries the /api prefix in its base URL.
    return { url: `${projectUrl(fun0Id)}/legacy-migration/files/${documentaryProjectId(rowId)}/${slot}`, params: {} };
  }
  return { url: `${projectUrl(fun0Id)}/documents/${documentaryProjectId(rowId)}/files/${slot}`, params: { evidenceRevision: file.evidenceRevision } };
}
export async function downloadCanonicalFile(fun0Id, rowId, slot, file) {
  if (!['digital', 'scan'].includes(slot)) fail();
  if (file?.missing) throw new Error('El archivo no está disponible en el almacenamiento.');
  const request = canonicalFileRequest(fun0Id, rowId, slot, file);
  const { data } = await http.get(request.url, { params: request.params, responseType: 'blob' });
  const url = URL.createObjectURL(data); const link = document.createElement('a');
  link.href = url; link.download = file.originalName || 'documento'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
