import { regexChecker_isOA_3 } from '../../../../components/customClasses/typeParse';
import FUN_PDF from './fun_pdf';
import FUN_PDF_CHECK from './fun_pdf_check';
import FUN_DOC_CONFIRM_INCOMPLETE from './fun_doc_confirminc';
import FUN_DOC_CONFIRMLEGAL from './fun_doc_confirmlegal';
import FUN_SIGN_PDF from './fun_sign_pdf.component';
import FUN_SEAL from './fun_seals';
import FUN_ALERT_NEIGHBOUR from './fun_alertNeighbour';
import FUN_D_CONTROL from './fun_d_control.component';
import FUN_D_CONTROL_2 from './fun_d_control.component_2';
import FUN_D_ABDICATE from './fun_doc_abdicate.component';
import FUN_REPORT_DATA_EDIT from './fun_report_data_edit';
import FUN_CERTIFICATION from './fun_doc_certification.component';
import { isCanonicalSaveBlocked } from './generatorSavePolicy';

export const GENERATOR_SECTION_AUTOMATIC = 'automatic';
export const GENERATOR_SECTION_SPECIAL = 'special';

const MIN_STATE_REASON = 'Disponible desde el estado radicado en legal y debida forma.';
const NEIGHBOUR_REASON = 'No aplica: la modalidad del trámite no requiere citación a vecinos.';

// `edit` is deliberately not passed to fun_doc_confirmlegal / fun_doc_confirminc: it is only set by the
// "5. CONTROL DE LYDF" section of fun_c.js (the data-entry form) to show SAVE and GENERAR CUB. The legacy
// FUND module (fun_docs.js) never passed it, so the generators list keeps parity: PDF generation only.
const withRequestUpdate = (ctx) => ({ requestUpdate: ctx.requestUpdate });

/**
 * Single source of truth of the automatic document generators of an expediente.
 * Rendered by the legacy FUND module (fun_docs.js) and by the "Generar documentos" tab of the
 * documentary module, so both lists can never diverge. Order matters: it is the legacy order.
 *
 * - label: exact legacy collapsible text; title/description: copy of the documentary module.
 * - gates: minState (fun0.state), neighbourNotice (rules[0] != 1 or OA modality), tenant (VITE_GLOBAL_ID).
 * - canonicalSave: false when the generator has no save action that works on a canonical expediente
 *   (it never saves, or it writes tables the backend protects: fun_r). Such generators receive
 *   `canonicalSaveBlocked` and must hide their save buttons in the new model. The control sheets
 *   (fun_d_control, fun_d_control_2) save through the legal y debida forma reviews and sheet instead.
 * - usesDocumentaryInventory: the generator reads the new documentary model when the expediente is in it
 *   (the inventory through useDocumentaryInventory, or /requirements/missing for confirminc) and its
 *   legacy data otherwise.
 */
export const DOCUMENT_GENERATORS = Object.freeze([
  { id: 'fun_pdf', domId: 'fund_pdf', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_PDF, label: 'PDF Formulario Único Nacional', title: 'Formulario Único Nacional', description: 'PDF del FUN con los datos del expediente.', gates: {}, canonicalSave: false },
  { id: 'fun_pdf_check', domId: 'fund_pdf2', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_PDF_CHECK, label: 'PDF Lista de Chekeo', title: 'Lista de chequeo', description: 'PDF de la lista de chequeo documental.', gates: {}, canonicalSave: false, usesDocumentaryInventory: true },
  { id: 'fun_doc_confirminc', domId: 'fund_212', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_DOC_CONFIRM_INCOMPLETE, label: 'Documento de recordatorio incompleto', title: 'Recordatorio de radicación incompleta', description: 'Carta de documentos faltantes.', gates: {}, canonicalSave: true, usesDocumentaryInventory: true, extraProps: withRequestUpdate },
  { id: 'fun_doc_confirmlegal', domId: 'fund_21', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_DOC_CONFIRMLEGAL, label: 'Documento de Confirmación Legal y Debida Forma', title: 'Constancia de legal y debida forma', description: 'Confirmación de radicación en legal y debida forma.', gates: { minState: 5 }, canonicalSave: true, usesDocumentaryInventory: true, extraProps: withRequestUpdate },
  { id: 'fun_sign_pdf', domId: 'fund_sign', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_SIGN_PDF, label: 'Valla', title: 'Valla', description: 'Valla informativa del trámite.', gates: { minState: 5, neighbourNotice: true }, canonicalSave: false },
  { id: 'fun_seals', domId: 'fund_seal', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_SEAL, label: 'Sello', title: 'Sello', description: 'Sello de radicación.', gates: { tenant: 'cb1' }, canonicalSave: true },
  { id: 'fun_alert_neighbour', domId: 'fund_22', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_ALERT_NEIGHBOUR, label: 'DOCUMENTOS DE CITACIÓN A VECINOS', title: 'Citación a vecinos', description: 'Comunicaciones y publicación a vecinos.', gates: { neighbourNotice: true }, canonicalSave: false },
  { id: 'fun_d_control', domId: 'fund_doc_control', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_D_CONTROL, label: 'HOJA DE CONTROL DOCUMENTAL', title: 'Hoja de control documental', description: 'Control de documentos y folios del expediente.', gates: { minState: 5 }, canonicalSave: true, usesDocumentaryInventory: true, extraProps: withRequestUpdate },
  { id: 'fun_d_control_2', domId: 'fund_doc_control', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_D_CONTROL_2, label: 'HOJA DE CONTROL DE INVENTARIO', title: 'Hoja de control de inventario', description: 'Inventario documental del expediente.', gates: { minState: 5 }, canonicalSave: true, usesDocumentaryInventory: true, extraProps: withRequestUpdate },
  { id: 'fun_doc_abdicate', domId: 'fund_doc_not_abdicate', section: GENERATOR_SECTION_AUTOMATIC, component: FUN_D_ABDICATE, label: 'Notificación Licencia - Renuncia de terminos', title: 'Notificación de licencia y renuncia de términos', description: 'Notificación con renuncia a términos.', gates: {}, canonicalSave: false, extraProps: withRequestUpdate },
  { id: 'fun_report_data_edit', domId: 'fund_23', section: GENERATOR_SECTION_SPECIAL, component: FUN_REPORT_DATA_EDIT, label: 'CONTROL DE DOCUMENTO DE RECONOCIMIENTO', title: 'Documento de reconocimiento', description: 'Control del documento de reconocimiento.', gates: {}, canonicalSave: true, extraProps: withRequestUpdate },
  { id: 'fun_doc_certification', domId: 'fund_23', section: GENERATOR_SECTION_SPECIAL, component: FUN_CERTIFICATION, label: 'CERTIFICACIONES', title: 'Certificaciones', description: 'Certificaciones del expediente.', gates: {}, canonicalSave: true, extraProps: (ctx) => ({ id_related: ctx.currentItem.id_public, related: 'fun' }) },
]);

// Same lookup the legacy module used: the FUN 1 row of the current version.
function currentFun1(currentItem, currentVersion) {
  const child = currentItem?.fun_1s;
  const row = child ? child[currentVersion - 1] : null;
  if (row == null) return { item_0: '', description: '' };
  return { item_0: row.id, tramite: row.tramite, description: row.description ? row.description : '' };
}

export function buildGeneratorContext({ currentItem, currentVersion, requestUpdate, globalId = import.meta.env.VITE_GLOBAL_ID }) {
  return {
    currentItem,
    currentVersion,
    requestUpdate,
    globalId,
    rules: currentItem?.rules ? currentItem.rules.split(';') : [],
    // Lazy, as in the legacy module: only evaluated when rules[0] == 1.
    isOA: () => regexChecker_isOA_3(currentFun1(currentItem, currentVersion)),
  };
}

/** { visible, available, reason }: legacy renders a generator only when visible && available. */
export function evaluateGenerator(entry, ctx) {
  const { minState, neighbourNotice, tenant } = entry.gates;
  // eslint-disable-next-line eqeqeq -- loose comparison preserved from the legacy module
  if (tenant && ctx.globalId != tenant) return { visible: false, available: false, reason: '' };
  if (minState != null && !(ctx.currentItem.state >= minState)) return { visible: true, available: false, reason: MIN_STATE_REASON };
  // eslint-disable-next-line eqeqeq -- rules are strings ('1'), compared loosely as before
  if (neighbourNotice && !(ctx.rules[0] != 1 || ctx.isOA())) return { visible: true, available: false, reason: NEIGHBOUR_REASON };
  return { visible: true, available: true, reason: '' };
}

export function getGeneratorProps(entry, baseProps, ctx) {
  return { ...baseProps, canonicalSaveBlocked: isCanonicalSaveBlocked(entry, ctx.currentItem), ...(entry.extraProps ? entry.extraProps(ctx) : {}) };
}

export function generatorsBySection(section) {
  return DOCUMENT_GENERATORS.filter((entry) => entry.section === section);
}
