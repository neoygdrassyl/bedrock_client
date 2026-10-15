export const DOCUMENTARY_VIEW_SCHEMA = 'dovela-backoffice/documentary-view/v1';

/**
 * Canonical view wire contract (GET /projects/:fun0Id/view): readOnly flag, project {fun0Id,idPublic},
 * pinned configuration, governance, requirements {documents,requirementGroups,typologyOptions,warnings},
 * submits, pagination and rows with persistence:'canonical'. documentId is the Dovela Central c_document
 * id (string); controlId is the Central control id.
 */
const object = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const string = (value) => typeof value === 'string';
const nullableString = (value) => value === null || string(value);
const id = (value) => Number.isInteger(value) && value > 0 && value <= 2147483647;
// Central identifiers: c_document.id (varchar 36) and central_check_control.id (varchar 80).
const documentId = (value) => string(value) && value.length > 0 && value.length <= 36;
const controlId = (value) => string(value) && value.length > 0 && value.length <= 80;
const count = (value) => Number.isSafeInteger(value) && value >= 0;
const arrayOf = (value, check) => Array.isArray(value) && value.every(check);
const hash = (value) => string(value) && /^[a-f0-9]{64}$/i.test(value);
const warning = (value) => object(value) && string(value.code) && string(value.message);
const configuration = (value) => object(value) && id(value.id) && id(value.releaseVersion)
  && ['tenantCode', 'sourceReleaseId', 'schemaVersion'].every((key) => string(value[key]) && value[key].length > 0)
  && hash(value.checksum) && value.selection === 'preview-target';

function invalidContract() {
  throw new Error('La respuesta documental no cumple el contrato de vista previa. No se mostraron datos incompletos.');
}

// GET /projects/:fun0Id/view only answers canonical projects; this client never reads the backend's /legacy-preview endpoint.
export function validateDocumentaryView(value) {
  if (value?.mode !== 'canonical') invalidContract();
  return validateCanonicalView(value);
}

// v5 input documents: requirement rows reference a Central document; annex and vr_slip rows do not.
const DOCUMENT_CLASSES = ['requirement', 'annex', 'vr_slip'];
const optional = (check) => (value) => value === undefined || value === null || check(value);
const optionalString = optional(string);
const optionalCount = optional(count);
const optionalId = optional(id);
// Older backends omit documentClass; their rows are always Central requirements.
const documentClassOf = (value) => value.documentClass ?? 'requirement';
function documentIdentity(value) {
  const documentClass = documentClassOf(value);
  if (!DOCUMENT_CLASSES.includes(documentClass)) return false;
  return documentClass === 'requirement' ? documentId(value.documentId) : value.documentId === null || value.documentId === undefined;
}
// New v5 fields are validated leniently so v3/v4 responses keep passing.
const inputDocumentFields = (value) => ['documentCode', 'title', 'instanceLabel', 'listKey', 'listTitle'].every((key) => optionalString(value[key]))
  && optionalCount(value.versionCount) && optionalId(value.inputDocumentId) && optionalId(value.currentVersionId);

export function validateDocumentaryReceipt(value, fun0Id) {
  if (!object(value) || !id(value.id) || value.fun0Id !== Number(fun0Id) || !id(value.configurationId) || !documentIdentity(value)
    || !inputDocumentFields(value) || !['contributor', 'channel'].every((key) => optionalString(value[key]))
    || !string(value.documentKey) || !id(value.versionSequence) || !id(value.rowVersion) || !id(value.evidenceRevision)
    || !object(value.files) || Object.keys(value.files).length !== 2) invalidContract();
  for (const slot of ['digital','scan']) {
    const file = value.files[slot];
    if (file === null) continue;
    if (!object(file) || 'storageKey' in file || !hash(file.sha256) || !id(file.bytes) || file.bytes > 52428800
      || !['application/pdf','image/png','image/jpeg'].includes(file.mimeType) || !string(file.originalName) || file.evidenceRevision !== value.evidenceRevision) invalidContract();
  }
  return value;
}

function validateCanonicalView(value) {
  if (value.schemaVersion !== DOCUMENTARY_VIEW_SCHEMA || value.context !== null || typeof value.readOnly !== 'boolean'
    || !object(value.project) || !id(value.project.fun0Id) || !nullableString(value.project.idPublic)
    || !configuration({ ...value.configuration, selection:'preview-target' }) || value.configuration.selection !== 'pinned'
    || !object(value.capabilities) || !['createDocument','receivePhysical','receiveDigital','review'].every(key=>typeof value.capabilities[key]==='boolean')
    || !object(value.governance) || !count(value.governance.inputRevision) || !['current','stale','missing'].includes(value.governance.cacheState)
    || !['complete','incomplete','unsupported'].includes(value.governance.evaluationStatus)
    || !object(value.requirements) || !['documents','requirementGroups','typologyOptions','warnings'].every(key=>Array.isArray(value.requirements[key]))
    || !arrayOf(value.warnings,warning) || !arrayOf(value.submits,item=>object(item)&&id(item.id)&&string(item.idPublic))
    || !object(value.pagination) || !id(value.pagination.limit) || value.pagination.limit>100 || !count(value.pagination.afterId)
    || !(value.pagination.nextAfterId===null || id(value.pagination.nextAfterId)) || !Array.isArray(value.rows) || value.rows.length>100) invalidContract();
  const seen = new Set();
  for (const row of value.rows) {
    if (!object(row) || row.persistence!=='canonical' || row.projectDocumentId!==null || !documentIdentity(row) || !inputDocumentFields(row)
      || (row.receipt?.documentClass !== undefined && documentClassOf(row) !== row.receipt.documentClass)
      || row.rowKey!==`canonical:${row.documentKey}` || seen.has(row.rowKey) || row.receivedDocumentRowId!==row.currentVersionId
      || row.receipt?.id!==row.receivedDocumentRowId || row.receipt?.documentKey!==row.documentKey || row.receipt?.documentId!==row.documentId
      || row.receipt?.configurationId!==value.configuration.id || !object(row.catalogueDisplay)
      || !arrayOf(row.controls,control=>object(control)&&controlId(control.controlId)&&control.sourceControlId===control.controlId&&Array.isArray(control.values))
      || !Array.isArray(row.sources) || row.sources.length || !Array.isArray(row.versions)) invalidContract();
    validateDocumentaryReceipt(row.receipt,value.project.fun0Id); seen.add(row.rowKey);
  }
  return value;
}

export const DOCUMENTARY_INVENTORY_SCHEMA = 'dovela-backoffice/documentary-inventory/v1';
const INVENTORY_CLASSES = ['requirement', 'annex', 'vr_slip'];
const REQUIREMENT_STATUSES = ['present', 'missing', 'not_applicable', 'unknown'];
const EVALUATION_STATES = ['current', 'stale', 'missing', 'incomplete', 'not_applicable'];
const nullableCount = (value) => value === null || count(value);
const nullableBoolean = (value) => value === null || typeof value === 'boolean';
function inventoryItem(value) {
  return object(value) && id(value.id) && string(value.documentKey) && INVENTORY_CLASSES.includes(value.documentClass)
    && (value.documentClass === 'requirement' ? documentId(value.documentId) : value.documentId === null)
    && ['documentCode', 'title', 'listKey', 'listTitle', 'vrLabel', 'registeredAt', 'contributor', 'channel'].every((key) => nullableString(value[key]))
    && id(value.versionSequence) && id(value.versionCount) && typeof value.isCurrent === 'boolean' && id(value.submitId)
    && ['hasPhysical', 'hasDigital', 'hasScan'].every((key) => typeof value[key] === 'boolean')
    && nullableCount(value.pagesPhysical) && nullableCount(value.pagesDigital);
}
function inventoryRequirement(value) {
  return object(value) && nullableString(value.documentCode) && documentId(value.documentId) && nullableString(value.title)
    && nullableBoolean(value.required) && nullableBoolean(value.standaloneRequired) && nullableString(value.groupCode)
    && REQUIREMENT_STATUSES.includes(value.status)
    && (value.satisfiedBy === null || (object(value.satisfiedBy) && id(value.satisfiedBy.submitId) && nullableString(value.satisfiedBy.vrLabel) && nullableString(value.satisfiedBy.registeredAt)));
}
// Inventory wire contract (GET /projects/:fun0Id/inventory). Traditional expedientes carry empty lists.
export function validateDocumentaryInventory(value, fun0Id) {
  const traditional = object(value) && value.mode === 'traditional';
  if (!object(value) || value.schemaVersion !== DOCUMENTARY_INVENTORY_SCHEMA || !object(value.project) || value.project.fun0Id !== Number(fun0Id)
    || !['canonical', 'traditional'].includes(value.mode) || value.applicable !== !traditional
    || !arrayOf(value.items, inventoryItem) || !arrayOf(value.requirements, inventoryRequirement)
    || !object(value.evaluation) || !EVALUATION_STATES.includes(value.evaluation.state) || !nullableString(value.evaluation.evaluatedAt)
    || (traditional && (value.items.length || value.requirements.length || value.evaluation.state !== 'not_applicable'))) {
    throw new Error('El inventario documental no corresponde al expediente.');
  }
  return value;
}
