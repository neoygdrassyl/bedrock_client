import { describe, expect, it } from 'vitest';
import { checklistDefaultMarks, checklistInitialMarks, checklistOverrides, checklistOverridesStored, checklistReviewOf, controlSheetDefaults, controlSheetReviewPlan, filterByReadiness, groupBlockers, instancesByKey, inventorySheetCommand, missingFactLabels, pendingGroups, reviewedByLine, rowReadiness, selectedByLine, sortByReadiness, SOURCE_FACT_LABELS } from './legalFormModel';

const instance = (extra) => ({ documentKey: 'k-1', instanceLabel: null, currentRowId: 10, review: null, reviewRevision: 0, verdict: 'pending', source: 'review', ...extra });
const requirement = (extra) => ({ documentCode: '511', title: 'Formulario', delivered: true, allowsMultipleInstances: false, instances: [instance()], ...extra });
const legalForm = (requirements, extra = {}) => ({ requirements, sheet: null, ...extra });

describe('legalFormModel', () => {
  it('groups blockers by code in a stable order', () => {
    const groups = groupBlockers([{ code: 'VERDICT_PENDING' }, { code: 'NOT_DELIVERED' }, { code: 'VERDICT_PENDING' }]);
    expect(groups.map((group) => [group.code, group.items.length])).toEqual([['NOT_DELIVERED', 1], ['VERDICT_PENDING', 2]]);
    expect(groups[0].label).toBe('Sin entregar');
  });

  it('maps the control sheet SI/NO/N-A to reviewer verdicts with folio ranges', () => {
    const plan = controlSheetReviewPlan(legalForm([requirement(), requirement({ documentCode: '512', instances: [instance({ documentKey: 'k-2', reviewRevision: 3 })] })]),
      [{ code: '511', check: '1', pages: '1-4' }, { code: '512', check: '2', pages: '' }, { code: '999', check: '1', pages: '3' }], 'Hoja');
    expect(plan.skipped).toEqual([]);
    expect(plan.commands).toEqual([
      { documentCode: '511', body: { verdict: 'complies', folioRange: '1-4', observation: null, expectedReviewRevision: 0, idempotencyKey: expect.any(String), reason: 'Hoja' } },
      { documentCode: '512', body: { verdict: 'not_applicable', folioRange: null, observation: null, expectedReviewRevision: 3, idempotencyKey: expect.any(String), reason: 'Hoja' } },
    ]);
  });

  it('skips unchanged reviews, Central controls, undelivered codes and NO without observation', () => {
    const reviewed = instance({ review: { verdict: 'complies', stale: false, folioRange: '1-4', observation: null }, reviewRevision: 1 });
    const plan = controlSheetReviewPlan(legalForm([
      requirement({ instances: [reviewed] }),
      requirement({ documentCode: '600', instances: [instance({ source: 'controls' })] }),
      requirement({ documentCode: '700', delivered: false, instances: [] }),
      requirement({ documentCode: '800' }),
      requirement({ documentCode: '900', instances: [instance({ review: { verdict: 'complies', stale: false, observation: 'Faltan firmas' }, reviewRevision: 2 })] }),
    ]), [
      { code: '511', check: '1', pages: '1-4' }, { code: '600', check: '1', pages: '' }, { code: '700', check: '0', pages: '' },
      { code: '800', check: '0', pages: '' }, { code: '900', check: '0', pages: '' },
    ], 'Hoja');
    expect(plan.skipped).toEqual([{ code: '600', reason: 'controls' }, { code: '800', reason: 'observation' }]);
    expect(plan.commands).toHaveLength(1);
    expect(plan.commands[0]).toMatchObject({ documentCode: '900', body: { verdict: 'does_not_comply', observation: 'Faltan firmas', expectedReviewRevision: 2 } });
  });

  it('addresses every instance of a multi-instance document by its documentKey', () => {
    const plan = controlSheetReviewPlan(legalForm([requirement({ allowsMultipleInstances: true, instances: [instance({ documentKey: 'a' }), instance({ documentKey: 'b', reviewRevision: 1 })] })]),
      [{ code: '511', check: '1', pages: '' }], 'Hoja');
    expect(plan.commands.map((command) => [command.body.documentKey, command.body.expectedReviewRevision])).toEqual([['a', 0], ['b', 1]]);
  });

  it('reads the sheet defaults only from a current single-instance review', () => {
    const form = legalForm([requirement({ instances: [instance({ review: { verdict: 'does_not_comply', stale: false, folioRange: '2-3' } })] })]);
    expect(controlSheetDefaults(form, '511')).toEqual({ check: '0', folioRange: '2-3' });
    expect(controlSheetDefaults(legalForm([requirement()]), '511')).toBeNull();
    expect(controlSheetDefaults(form, '999')).toBeNull();
  });

  it('builds the archive sheet command with the legacy JSON shape and the stored revision', () => {
    const command = inventorySheetCommand(legalForm([], { sheet: { sheet: {}, sheetRevision: 4 } }), {
      date_create: '2026-10-01', user_archive: 'Ana', user_retrieve: '', date_retrieve: '2026-10-02', items: [{ name: 'CD', date: '', n: 2, label: 'CD(s)' }],
    }, 'Inventario');
    expect(command).toEqual({ sheet: { date_create: '2026-10-01', user_archive: 'Ana', user_retrieve: '', date_retrieve: '2026-10-02', items: [{ name: 'CD', date: '', n: '2', label: 'CD(s)' }] },
      expectedSheetRevision: 4, idempotencyKey: expect.any(String), reason: 'Inventario' });
    expect(inventorySheetCommand(null, { items: [] }, 'x').expectedSheetRevision).toBe(0);
  });

  it('labels the missing facts of an incomplete evaluation, deduplicated and tolerant of older payloads', () => {
    expect(missingFactLabels({})).toEqual([]);
    expect(missingFactLabels({ warnings: [], evaluation: { missingFacts: [] } })).toEqual([]);
    expect(missingFactLabels({
      warnings: [{ code: 'REQUIREMENTS_INCOMPLETE', sourceKeys: ['usosAny', 'personaAny'] }, { code: 'OTHER', sourceKeys: ['areaAny'] }],
      evaluation: { missingFacts: ['usosAny', 'mUrbAny', 'nuevaAny'] },
    })).toEqual(['Usos', 'Modalidad urbanización', 'nuevaAny', 'Tipo de persona del solicitante']);
    expect(SOURCE_FACT_LABELS.tipoAny).toBe('Tipo de solicitud');
    expect(SOURCE_FACT_LABELS.tipo).toBe('Tipo de solicitud');
    ['tramiteAny', 'mSubAny', 'mLicAny', 'areaAny', 'viviendaAny', 'culturalAny', 'calidadAny', 'profesionalAny'].forEach((key) => expect(SOURCE_FACT_LABELS[key]).toBeTruthy());
  });

  it('starts the checklist from the saved mark, then the server default, then N/A', () => {
    const data = { checklist: { marks: { a: '0', b: 'x' } }, checklistDefaults: { a: '1', b: '1', c: '0', d: 'bad' } };
    expect(checklistInitialMarks(data, ['a', 'b', 'c', 'd', 'e'])).toEqual({ a: '0', b: '1', c: '0', d: '2', e: '2' });
    expect(checklistDefaultMarks(data, ['a', 'c', 'e'])).toEqual({ a: '1', c: '0', e: '2' });
    expect(checklistInitialMarks({ checklist: null }, ['a'])).toEqual({ a: '2' });
    expect(checklistInitialMarks(null, ['a'])).toEqual({ a: '2' });
  });

  it('builds the legacy review shape of the checklist in code order', () => {
    expect(checklistReviewOf(['511', '512', '513'], { 511: '1', 512: '0' })).toEqual({ code: '511,512,513', checked: '1,0,2' });
  });

  it('keeps as checklist overrides only the marks that differ from the defaults', () => {
    const data = { checklistDefaults: { a: '1', b: '0' } };
    const codes = ['a', 'b', 'c'];
    expect(checklistOverrides(data, codes, { a: '1', b: '0', c: '2' })).toEqual({});
    expect(checklistOverrides(data, codes, { a: '0', b: '0', c: '1' })).toEqual({ a: '0', c: '1' });
    expect(checklistOverrides(data, codes, { a: 'x' })).toEqual({}); // invalid or missing marks fall back to the default
    expect(checklistOverrides(data, codes, checklistDefaultMarks(data, codes))).toEqual({});
    expect(checklistOverrides(null, ['a'], { a: '0' })).toEqual({ a: '0' }); // no default counts as N/A
    expect(checklistOverrides(null, ['a'], { a: '2' })).toEqual({});
  });

  it('compares checklist overrides with the stored ones, both empty being equal', () => {
    expect(checklistOverridesStored({ checklist: null }, {})).toBe(true);
    expect(checklistOverridesStored({}, { a: '0' })).toBe(false);
    expect(checklistOverridesStored({ checklist: { marks: { a: '0', b: '1' } } }, { b: '1', a: '0' })).toBe(true);
    expect(checklistOverridesStored({ checklist: { marks: { a: '0', b: '1' } } }, { a: '0' })).toBe(false);
    expect(checklistOverridesStored({ checklist: { marks: { a: '0' } } }, {})).toBe(false); // reset must clear what is stored
    expect(checklistOverridesStored({ checklist: { marks: { a: '0' } } }, { a: '1' })).toBe(false);
    expect(checklistOverridesStored({ checklist: { marks: { a: 'bad' } } }, {})).toBe(true);
  });

  it('formats who reviewed, with the id as fallback and nothing without a previous decision', () => {
    expect(reviewedByLine({})).toBeNull();
    expect(reviewedByLine({ name: 'Ana', at: '2026-10-14T15:00:00.000Z' })).toMatch(/^Revisado por Ana · \d/);
    expect(reviewedByLine({ id: 9 })).toBe('Revisado por usuario 9');
    expect(reviewedByLine({ name: 'Ana' })).toBe('Revisado por Ana');
  });

  describe('pendingGroups', () => {
    const blocker = (code, extra = {}) => ({ code, message: code, documentCode: null, groupCode: null, documentKey: null, ...extra });
    const data = {
      requirements: [
        { documentCode: '511', title: 'Formulario único', instances: [{ documentKey: 'k-1', instanceLabel: null, vrLabel: 'VR-2', selection: { rowId: 9, vrLabel: 'VR-1' } }] },
        { documentCode: '600', title: 'Plano', instances: [] },
      ],
      groups: [{ code: 'G1', optionLabel: 'Opción A', typologyName: 'Vivienda' }],
      sections: [{ typologyCode: 'T1', typologyName: 'Tipología uno' }],
      blockers: [
        blocker('TYPOLOGY_SELECTION_REQUIRED', { typologyCode: 'T1' }),
        blocker('VR_NOT_SELECTED', { documentCode: '511', documentKey: 'k-1' }),
        blocker('VERDICT_PENDING', { documentCode: '511', documentKey: 'k-1' }),
        blocker('GROUP_NOT_SATISFIED', { groupCode: 'G1' }),
        blocker('DOES_NOT_COMPLY', { documentCode: '511', documentKey: 'k-1' }),
        blocker('NOT_DELIVERED', { documentCode: '600' }),
        blocker('REQUIREMENTS_STALE'),
        blocker('SELECTION_INVALID', { documentCode: '511', documentKey: 'k-1', rowId: 9 }),
        blocker('SOMETHING_NEW', { documentCode: '600' }),
      ],
    };

    it('puts evaluation blockers as alerts and orders the groups: sin entregar, rechazados, sin evaluar, VR, tipología', () => {
      const { alerts, groups } = pendingGroups(data);
      expect(alerts.map((alert) => alert.code)).toEqual(['REQUIREMENTS_STALE']);
      expect(groups.map((group) => group.key)).toEqual(['not_delivered', 'rejected', 'pending_review', 'vr_not_selected', 'typology', 'other']);
      expect(groups.find((group) => group.key === 'not_delivered').items.map((item) => item.code)).toEqual(['NOT_DELIVERED', 'GROUP_NOT_SATISFIED']);
    });

    it('labels each item with code, title and VR; only items with a delivery open the evaluation', () => {
      const { groups } = pendingGroups(data);
      const byKey = Object.fromEntries(groups.map((group) => [group.key, group.items]));
      expect(byKey.not_delivered[0]).toMatchObject({ label: '600 · Plano', openable: false });
      expect(byKey.not_delivered[1].label).toBe('Vivienda · Opción A: falta al menos una alternativa');
      expect(byKey.rejected[0]).toMatchObject({ label: '511 · Formulario único · VR-2', openable: true, documentKey: 'k-1' });
      expect(byKey.typology[0]).toMatchObject({ label: 'Tipología uno', typologyCode: 'T1', openable: false });
    });

    it('explains an invalid choice with the VR that was chosen', () => {
      const invalid = pendingGroups(data).groups.find((group) => group.key === 'vr_not_selected').items.find((item) => item.code === 'SELECTION_INVALID');
      expect(invalid).toMatchObject({ vrLabel: 'VR-1', note: 'La entrega elegida ya no está aprobada', openable: true });
    });

    it('leaves empty groups out and tolerates a payload without blockers', () => {
      expect(pendingGroups({ requirements: [], blockers: [] })).toEqual({ alerts: [], groups: [] });
      expect(pendingGroups(null)).toEqual({ alerts: [], groups: [] });
    });
  });

  describe('row readiness', () => {
    const chosenApproved = { selection: { rowId: 1 }, selectedEvaluation: { status: 'approved' } };
    const row = (status, extra) => ({ documentKey: `k-${status}`, evaluation: { status }, ...extra });
    it('ranks rejected, pending, approved without chosen VR and ready', () => {
      expect(rowReadiness(row('rejected'))).toBe(0);
      expect(rowReadiness(row('pending'))).toBe(1);
      expect(rowReadiness(row('approved'))).toBe(2);
      expect(rowReadiness(row('approved', { ldfSelected: true }))).toBe(3);
      expect(rowReadiness(row('pending'), chosenApproved)).toBe(3);
      expect(rowReadiness(row('approved'), { selection: { rowId: 1 }, selectedEvaluation: { status: 'rejected' } })).toBe(0);
    });

    it('sorts stably by readiness and filters Por resolver / Listos with their counts', () => {
      const rows = [row('approved', { ldfSelected: true }), row('pending'), row('approved'), row('rejected'), row('pending', { documentKey: 'b' })];
      expect(sortByReadiness(rows).map((item) => item.documentKey)).toEqual(['k-rejected', 'k-pending', 'b', 'k-approved', 'k-approved']);
      const unresolved = filterByReadiness(rows, 'unresolved');
      expect(unresolved.rows).toHaveLength(4);
      expect(unresolved.counts).toEqual({ all: 5, unresolved: 4, ready: 1 });
      expect(filterByReadiness(rows, 'ready').rows).toHaveLength(1);
      expect(filterByReadiness(rows, '').rows).toHaveLength(5);
    });
  });

  it('indexes instances by documentKey and writes who chose the VR', () => {
    expect(instancesByKey({ requirements: [{ documentCode: '1', instances: [{ documentKey: 'a' }] }] }).get('a').requirement.documentCode).toBe('1');
    expect(selectedByLine(null)).toBeNull();
    expect(selectedByLine({ selectedBy: 4, selectedByName: 'Marta Ruiz', selectedAt: '2026-10-14T15:00:00.000Z' })).toMatch(/^Elegido por Marta Ruiz · /);
    expect(selectedByLine({ selectedBy: 4 })).toBe('Elegido por usuario 4');
  });
});
