// Pure selection of the "Hoja de control documental" rows of a canonical expediente.
//
// Inventory fields the sheet needs (documentaryInventory.inventory.raw, see documentaryInventoryModel.js):
//   items[]         isCurrent (only the current delivery of each document counts), documentClass
//                   ('requirement' | 'annex' | 'vr_slip', slips are never listed), documentCode
//                   (null for annexes outside the catalogue), title, listKey ('list_Z' = documentos
//                   expedidos, category EXP), vrLabel (ventanilla of the delivery), pagesPhysical /
//                   pagesDigital (folios).
//   requirements[]  documentCode, title, status ('present' | 'missing' | 'not_applicable' | 'unknown'):
//                   a required document that was not delivered yet is still listed with status NO.
// Reviewer verdicts and stored folio ranges come from legal y debida forma (controlSheetDefaults).
import { inventoryCategory } from './documentaryInventoryModel';

export const CONTROL_SHEET_CATEGORIES = [
  { key: 'all', label: 'Todos' },
  { key: 'requirements', label: 'Requisitos' },
  { key: 'annexes', label: 'Anexos' },
  { key: 'issued', label: 'Expedidos' },
];
export const CONTROL_SHEET_ALL = 'all';
const GROUP_TITLES = { requirements: 'REQUISITOS', annexes: 'ANEXOS', issued: 'DOCUMENTOS EXPEDIDOS' };
const GROUP_ORDER = ['requirements', 'annexes', 'issued'];

const text = (value) => (value == null ? '' : String(value).trim());
const folios = (item) => (item.pagesPhysical != null ? item.pagesPhysical : item.pagesDigital != null ? item.pagesDigital : 0);
const isCurrent = (item) => item.isCurrent && item.documentClass !== 'vr_slip';

/** Category of a current delivery: expedidos (list_Z / EXP) first, then annexes, then requirements. */
export function controlSheetCategory(item) {
  if (inventoryCategory(item.listKey) === 'EXP') return 'issued';
  return item.documentClass === 'annex' ? 'annexes' : 'requirements';
}

// One row per code (multi-instance documents are summed); deliveries without code stay one row each.
function rowOf(category, items, base) {
  const pages = items.reduce((total, item) => total + folios(item), 0);
  const vrLabels = Array.from(new Set(items.map((item) => text(item.vrLabel)).filter(Boolean)));
  return { category, delivered: items.length > 0, pages: pages ? String(pages) : '', vrLabels, ...base };
}

/** Every document of the expediente as sheet rows: requirements, then annexes, then expedidos. */
export function controlSheetRows(inventory) {
  const items = (inventory?.items || []).filter(isCurrent);
  const used = new Set();
  const rows = [];
  (inventory?.requirements || []).forEach((requirement) => {
    const code = text(requirement.documentCode);
    const matching = code ? items.filter((item) => controlSheetCategory(item) !== 'issued' && text(item.documentCode) === code && !used.has(item)) : [];
    matching.forEach((item) => used.add(item));
    // Not delivered: only what is still required (NO); "no aplica" and undecided requirements add noise.
    if (!matching.length && requirement.status !== 'missing') return;
    rows.push(rowOf('requirements', matching, { key: `requirements:${code}`, code, name: text(requirement.title) || code, status: matching.length ? '1' : '0' }));
  });
  const merged = new Map();
  items.filter((item) => !used.has(item)).forEach((item) => {
    const category = controlSheetCategory(item);
    const code = text(item.documentCode);
    const key = code ? `${category}:${code}` : `${category}:item:${item.id ?? item.documentKey}`;
    if (!merged.has(key)) merged.set(key, { category, code, key, items: [] });
    merged.get(key).items.push(item);
  });
  const extra = Array.from(merged.values()).map(({ category, code, key, items: group }) => rowOf(category, group, { key, code, name: text(group[0].title) || code, status: '1' }));
  GROUP_ORDER.forEach((category) => rows.push(...extra.filter((row) => row.category === category)));
  return rows;
}

/** Rows of the chosen category ('all' keeps every row). */
export function filterControlSheetRows(rows, category = CONTROL_SHEET_ALL) {
  return category === CONTROL_SHEET_ALL ? rows : rows.filter((row) => row.category === category);
}

/** Row counts per category, plus the total under 'all'. */
export function controlSheetCounts(rows) {
  const counts = { all: rows.length, requirements: 0, annexes: 0, issued: 0 };
  rows.forEach((row) => { counts[row.category] += 1; });
  return counts;
}

/** Rows grouped under category headers; `offset` is the number of rows printed before the header. */
export function controlSheetGroups(rows) {
  const groups = [];
  let offset = 0;
  GROUP_ORDER.forEach((category) => {
    const members = rows.filter((row) => row.category === category);
    if (!members.length) return;
    groups.push({ category, title: GROUP_TITLES[category], offset, rows: members });
    offset += members.length;
  });
  return groups;
}
