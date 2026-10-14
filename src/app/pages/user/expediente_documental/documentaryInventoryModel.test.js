import { describe, expect, it } from 'vitest';
import { adaptDocumentaryInventory, inventoryBlocker, inventoryLastVr, INVENTORY_UNAVAILABLE_MESSAGE } from './documentaryInventoryModel';

const item = (id, extra) => ({ id, documentKey: `k-${id}`, documentClass: 'requirement', documentCode: '511', documentId: 'd-511', title: 'Formulario', listKey: 'list_61', listTitle: 'DOCUMENTOS COMUNES',
  versionSequence: 1, versionCount: 1, isCurrent: true, submitId: 10, vrLabel: 'VR-10', registeredAt: '2026-10-01T15:00:00.000Z', registeredBy: 7,
  hasPhysical: true, pagesPhysical: 3, pagesDigital: null, hasDigital: false, hasScan: false, contributor: null, channel: 'counter', ...extra });
const inventory = {
  schemaVersion: 'dovela-backoffice/documentary-inventory/v1', mode: 'canonical', applicable: true, project: { fun0Id: 1, idPublic: 'FUN-1' },
  items: [
    item(1, { isCurrent: false, versionCount: 2 }),
    item(2, { versionSequence: 2, versionCount: 2, submitId: 11, vrLabel: 'VR-11', registeredAt: '2026-10-05T15:00:00.000Z', pagesPhysical: 4 }),
    item(3, { documentKey: 'k-3', documentCode: '701', documentId: 'd-701', title: 'Pago', listKey: 'list_Z', pagesPhysical: null, pagesDigital: 2, hasPhysical: false }),
    item(4, { documentClass: 'annex', documentCode: null, documentId: null, title: 'Carta', listKey: null, pagesPhysical: 1 }),
    item(5, { documentClass: 'vr_slip', documentCode: null, documentId: null, title: 'Comprobante', listKey: null }),
  ],
  requirements: [
    { documentCode: '511', documentId: 'd-511', title: 'Formulario', required: true, standaloneRequired: true, groupCode: null, status: 'present', satisfiedBy: { submitId: 11, vrLabel: 'VR-11', registeredAt: '2026-10-05T15:00:00.000Z' } },
    { documentCode: '512', documentId: 'd-512', title: 'Certificado', required: true, standaloneRequired: true, groupCode: null, status: 'missing', satisfiedBy: null },
    { documentCode: '900', documentId: 'd-900', title: 'Opcional', required: false, standaloneRequired: false, groupCode: null, status: 'not_applicable', satisfiedBy: null },
    { documentCode: '901', documentId: 'd-901', title: 'Indeciso', required: false, standaloneRequired: false, groupCode: null, status: 'unknown', satisfiedBy: null },
  ],
  evaluation: { state: 'current', evaluatedAt: '2026-10-06T00:00:00.000Z' },
};

describe('documentary inventory adapters', () => {
  const adapted = adaptDocumentaryInventory(inventory);
  it('maps requirement statuses to fun_rs checked values and treats deliveries as received', () => {
    expect(Object.fromEntries(adapted.statusByCode)).toEqual({ 511: '1', 512: '0', 900: '2', 701: '1' });
    expect(adapted.statusByCode.has('901')).toBe(false);
  });
  it('builds a fun_r compatible with code/checked parsing and keeps the stored review fields', () => {
    const funR = adapted.funReview({ id: 9, review: '511&1', code: '999', checked: '0' });
    expect(funR.id).toBe(9); expect(funR.review).toBe('511&1');
    const codes = funR.code.split(','); const checks = funR.checked.split(',');
    expect(checks[codes.indexOf('512')]).toBe('0'); expect(checks[codes.indexOf('511')]).toBe('1'); expect(codes.includes('999')).toBe(false);
    expect(adapted.funReview(false).code).toBe(funR.code);
  });
  it('totals folios of current deliveries by code and by list', () => {
    expect(Object.fromEntries(adapted.folios.byCode)).toEqual({ 511: 4, 701: 2 });
    expect(Object.fromEntries(adapted.folios.byList)).toEqual({ list_61: 4, list_Z: 2, none: 1 });
  });
  it('lists every delivery across VRs in the VR item shape, without VR slips', () => {
    expect(adapted.receivedItems.map((row) => [row.id_public, row.code, row.name, row.pages, row.category])).toEqual([
      ['VR-10', '511', 'Formulario', '3', 'DC'], ['VR-11', '511', 'Formulario', '4', 'DC'], ['VR-10', '701', 'Pago', '2', 'EXP'], ['VR-10', '', 'Carta', '1', 'DC']]);
    expect(adapted.receivedItems[0].date).toMatch(/^2026-10-0\d$/);
  });
  it('resolves the satisfying VR per code and the latest one among required codes', () => {
    expect(adapted.satisfyingVr.get('511').vr).toBe('VR-11');
    expect(adapted.satisfyingVr.has('512')).toBe(false);
    expect(inventoryLastVr(adapted.satisfyingVr, ['511', '512'], '2026-09-01').vr).toBe('VR-11');
    expect(inventoryLastVr(adapted.satisfyingVr, ['511'], '2026-12-01')).toEqual({ date: '2026-12-01', vr: '' });
  });
  it('blocks generation only while a canonical inventory is not ready', () => {
    expect(inventoryBlocker(null)).toBeNull();
    expect(inventoryBlocker({ status: 'ready', inventory: adapted })).toBeNull();
    expect(inventoryBlocker({ status: 'loading', inventory: null, error: '' })).toBe(INVENTORY_UNAVAILABLE_MESSAGE);
    expect(inventoryBlocker({ status: 'error', inventory: null, error: 'Sin permisos' })).toBe('Sin permisos');
  });
});
