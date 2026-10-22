import { describe, expect, it } from 'vitest';
import { controlSheetCategory, controlSheetCounts, controlSheetGroups, controlSheetRows, filterControlSheetRows } from './controlSheetModel';

const item = (id, extra) => ({ id, documentKey: `k-${id}`, documentClass: 'requirement', documentCode: '511', title: 'Formulario', listKey: 'list_61', isCurrent: true, vrLabel: 'VR-10', pagesPhysical: 3, pagesDigital: null, ...extra });
const inventory = {
  items: [
    item(1, { isCurrent: false, pagesPhysical: 9 }),
    item(2, { pagesPhysical: 4, vrLabel: 'VR-11' }),
    item(3, { documentKey: 'k-3b', pagesPhysical: null, pagesDigital: 2, vrLabel: 'VR-12' }),
    item(4, { documentClass: 'annex', documentCode: null, title: 'Carta', listKey: null, pagesPhysical: 1 }),
    item(5, { documentClass: 'vr_slip', documentCode: null, title: 'Comprobante', listKey: null }),
    item(6, { documentCode: '701', title: 'Licencia', listKey: 'list_Z', pagesPhysical: null, pagesDigital: 5 }),
    item(7, { documentClass: 'annex', documentCode: '999', title: 'Plano extra', listKey: 'list_62', pagesPhysical: 2 }),
  ],
  requirements: [
    { documentCode: '511', title: 'Formulario único', status: 'present' },
    { documentCode: '512', title: 'Certificado', status: 'missing' },
    { documentCode: '900', title: 'Opcional', status: 'not_applicable' },
    { documentCode: '901', title: 'Indeciso', status: 'unknown' },
  ],
};

describe('control sheet selection', () => {
  const rows = controlSheetRows(inventory);

  it('categorises deliveries as requirements, annexes or expedidos (list_Z first)', () => {
    expect(controlSheetCategory(item(1))).toBe('requirements');
    expect(controlSheetCategory(item(1, { documentClass: 'annex', listKey: null }))).toBe('annexes');
    expect(controlSheetCategory(item(1, { documentClass: 'annex', listKey: 'list_Z' }))).toBe('issued');
  });

  it('lists current deliveries only, merging multi-instance codes and skipping VR slips', () => {
    expect(rows.map((row) => [row.category, row.code, row.name, row.pages, row.status])).toEqual([
      ['requirements', '511', 'Formulario único', '6', '1'],
      ['requirements', '512', 'Certificado', '', '0'],
      ['annexes', '', 'Carta', '1', '1'],
      ['annexes', '999', 'Plano extra', '2', '1'],
      ['issued', '701', 'Licencia', '5', '1'],
    ]);
    expect(rows[0].vrLabels).toEqual(['VR-11', 'VR-12']);
    expect(rows[1].delivered).toBe(false);
  });

  it('filters by category and keeps every row for "all"', () => {
    expect(filterControlSheetRows(rows, 'all')).toHaveLength(5);
    expect(filterControlSheetRows(rows, 'annexes').map((row) => row.name)).toEqual(['Carta', 'Plano extra']);
    expect(filterControlSheetRows(rows, 'issued').map((row) => row.code)).toEqual(['701']);
    expect(controlSheetCounts(rows)).toEqual({ all: 5, requirements: 2, annexes: 2, issued: 1 });
  });

  it('groups the printed selection under category headers with their row offset', () => {
    expect(controlSheetGroups(rows).map((group) => [group.title, group.offset, group.rows.length])).toEqual([['REQUISITOS', 0, 2], ['ANEXOS', 2, 2], ['DOCUMENTOS EXPEDIDOS', 4, 1]]);
    expect(controlSheetGroups(filterControlSheetRows(rows, 'issued'))).toEqual([expect.objectContaining({ category: 'issued', offset: 0 })]);
    expect(controlSheetGroups([])).toEqual([]);
  });
});
