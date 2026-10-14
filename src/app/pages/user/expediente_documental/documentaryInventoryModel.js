// Pure adapters from the documentary inventory port (canonical expedientes) to the
// shapes the legacy document generators already consume (fun_rs code/checked,
// fun_6s folios, VR sub_lists items). Legacy expedientes never reach this module.
import dayjs from 'dayjs';

// fun_rs.checked values: 1 = SI (delivered), 0 = NO (required, missing), 2 = N/A.
const CHECKED_BY_STATUS = { present: '1', missing: '0', not_applicable: '2' };

const code = (value) => (value == null ? '' : String(value).trim());
const folios = (item) => (item.pagesPhysical != null ? item.pagesPhysical : item.pagesDigital != null ? item.pagesDigital : 0);
// Ventanilla nomenclature used by sub_lists.list_category.
export function inventoryCategory(listKey) {
  if (listKey === 'list_61') return 'DC';
  if (listKey === 'list_Z') return 'EXP';
  return listKey ? 'DA' : 'DC';
}

const currentItems = (inventory) => inventory.items.filter((item) => item.isCurrent && item.documentClass !== 'vr_slip');

// (1) code -> '1' | '0' | '2'. Requirement statuses first ('unknown' leaves the code
// undecided); any current delivery with a code counts as delivered.
export function inventoryStatusByCode(inventory) {
  const statuses = new Map();
  inventory.requirements.forEach((requirement) => {
    const value = CHECKED_BY_STATUS[requirement.status];
    if (value && code(requirement.documentCode)) statuses.set(code(requirement.documentCode), value);
  });
  currentItems(inventory).forEach((item) => { if (code(item.documentCode)) statuses.set(code(item.documentCode), '1'); });
  return statuses;
}

// fun_r replacement for checklist generators: keeps the stored fun_r fields (review,
// check_control...) and replaces code/checked with the canonical statuses.
export function inventoryFunReview(statusByCode, funR) {
  const codes = Array.from(statusByCode.keys());
  return { ...(funR || {}), code: codes.join(','), checked: codes.map((key) => statusByCode.get(key)).join(',') };
}

// (2) folio totals of the current deliveries, by code and by ventanilla list.
export function inventoryFolios(inventory) {
  const byCode = new Map(); const byList = new Map();
  currentItems(inventory).forEach((item) => {
    const pages = folios(item);
    if (code(item.documentCode)) byCode.set(code(item.documentCode), (byCode.get(code(item.documentCode)) || 0) + pages);
    const list = item.listKey || 'none';
    byList.set(list, (byList.get(list) || 0) + pages);
  });
  return { byCode, byList };
}

// (3) every delivery across VRs in the VR sub_lists item shape (VR slips excluded).
export function inventoryReceivedItems(inventory) {
  return inventory.items.filter((item) => item.documentClass !== 'vr_slip').map((item) => {
    const at = item.registeredAt ? dayjs(item.registeredAt) : null;
    const pages = item.pagesPhysical != null ? item.pagesPhysical : item.pagesDigital;
    return {
      id_public: item.vrLabel, date: at ? at.format('YYYY-MM-DD') : '', time: at ? at.format('HH:mm') : '',
      name: item.title || '', category: inventoryCategory(item.listKey), code: code(item.documentCode),
      page: pages == null ? '' : String(pages), pages: pages == null ? '' : String(pages), show: true,
    };
  });
}

// (4) code -> { vr, date } of the delivery that satisfies the requirement.
export function inventorySatisfyingVr(inventory) {
  const byCode = new Map();
  inventory.requirements.forEach((requirement) => {
    if (requirement.status !== 'present' || !requirement.satisfiedBy || !code(requirement.documentCode)) return;
    const at = requirement.satisfiedBy.registeredAt;
    byCode.set(code(requirement.documentCode), { vr: requirement.satisfiedBy.vrLabel || '', date: at ? dayjs(at).format('YYYY-MM-DD') : '' });
  });
  return byCode;
}

// Latest satisfying VR among the given codes, after `since` (fun_doc_confirmlegal rule).
export function inventoryLastVr(satisfyingVr, codes, since) {
  let last = { date: since, vr: '' };
  codes.forEach((key) => {
    const found = satisfyingVr.get(code(key));
    if (found && found.date && (!last.date || dayjs(found.date).isAfter(last.date))) last = { date: found.date, vr: found.vr };
  });
  return last;
}

export function adaptDocumentaryInventory(inventory) {
  const statusByCode = inventoryStatusByCode(inventory);
  return {
    raw: inventory, evaluation: inventory.evaluation, statusByCode,
    funReview: (funR) => inventoryFunReview(statusByCode, funR),
    folios: inventoryFolios(inventory), receivedItems: inventoryReceivedItems(inventory), satisfyingVr: inventorySatisfyingVr(inventory),
  };
}

export const INVENTORY_UNAVAILABLE_MESSAGE = 'El inventario documental del expediente aún no está disponible. Espere a que cargue o recargue el expediente.';
// Generators of canonical expedientes must not print from an unloaded inventory.
export function inventoryBlocker(documentaryInventory) {
  if (!documentaryInventory) return null;
  if (documentaryInventory.status === 'ready') return null;
  return documentaryInventory.error || INVENTORY_UNAVAILABLE_MESSAGE;
}
