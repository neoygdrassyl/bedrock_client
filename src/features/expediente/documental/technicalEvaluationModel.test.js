import { describe, expect, it } from 'vitest';
import { applicantSummaryLabel, applicantSummaryTitle, filterRowsByTechnicalTags, filterTechnicalControls, splitApplicantItems, technicalSummary, technicalSummaryLabel, technicalSummaryTone, toggleTechnicalTag } from './technicalEvaluationModel';

const control = (controlId, tags, review = null) => ({ controlId, sourceControlId: controlId, layer: 'technical', title: controlId, values: [], tags, review });
const decided = (effect, current = true) => ({ effect, current, selectedSourceValueId: `${effect}-value`, resultRevision: 1 });

describe('technical tag filter', () => {
  const controls = [control('c-jur', ['juridico']), control('c-arq', ['arquitectonico', 'estructural']), control('c-none', [])];

  it('keeps every control without a filter and only the intersecting ones with one', () => {
    expect(filterTechnicalControls(controls, [])).toHaveLength(3);
    expect(filterTechnicalControls(controls, ['estructural']).map((item) => item.controlId)).toEqual(['c-arq']);
    expect(filterTechnicalControls(controls, ['juridico', 'estructural']).map((item) => item.controlId)).toEqual(['c-jur', 'c-arq']);
    expect(filterTechnicalControls(controls, ['Juridico']).map((item) => item.controlId)).toEqual(['c-jur']);
  });

  it('hides rows without technical controls and, with a filter, rows without a matching one', () => {
    const rows = [
      { rowKey: 'a', technicalControls: [control('c-jur', ['juridico'])] },
      { rowKey: 'b', technicalControls: [control('c-arq', ['arquitectonico'])] },
      { rowKey: 'c', technicalControls: [] },
      { rowKey: 'd' },
    ];
    expect(filterRowsByTechnicalTags(rows).map((row) => row.rowKey)).toEqual(['a', 'b']);
    expect(filterRowsByTechnicalTags(rows, ['arquitectonico']).map((row) => row.rowKey)).toEqual(['b']);
    expect(filterRowsByTechnicalTags(undefined, ['juridico'])).toEqual([]);
  });

  it('toggles tags and clears them with null', () => {
    expect(toggleTechnicalTag([], 'juridico')).toEqual(['juridico']);
    expect(toggleTechnicalTag(['juridico'], 'estructural')).toEqual(['juridico', 'estructural']);
    expect(toggleTechnicalTag(['juridico', 'estructural'], 'juridico')).toEqual(['estructural']);
    expect(toggleTechnicalTag(['juridico'], null)).toEqual([]);
  });
});

describe('technical summary', () => {
  it('counts only current decisions and labels cumple/total', () => {
    const summary = technicalSummary([
      control('a', [], decided('complies')),
      control('b', [], decided('does_not_comply')),
      control('c', [], decided('no_decision')),
      control('d', [], decided('complies', false)),
      control('e', []),
    ]);
    expect(summary).toEqual({ total: 5, complies: 1, doesNotComply: 1, noDecision: 1, pending: 2 });
    expect(technicalSummaryLabel(summary)).toBe('1/5');
    expect(technicalSummaryTone(summary)).toBe('danger');
    expect(technicalSummaryLabel(technicalSummary([]))).toBeNull();
    expect(technicalSummaryTone(technicalSummary([control('a', [], decided('complies'))]))).toBe('success');
    expect(technicalSummaryTone(technicalSummary([control('a', [])]))).toBe('warning');
  });
});

describe('applicant self-assessment', () => {
  it('matches the items to the controls of the row and lists the rest apart', () => {
    const row = {
      controls: [control('c-1', ['interno']), control('c-2', ['solicitante'])],
      applicantAssessment: {
        items: [
          { controlId: 'c-1', title: 'Firma', selectedValueId: 'v1', valueLabel: 'Sí', effect: 'complies', observation: null, assessedAt: '2026-10-01T10:00:00.000Z', controlKnown: true },
          { controlId: 'c-9', title: 'Antiguo', selectedValueId: 'v9', valueLabel: 'No', effect: 'does_not_comply', observation: 'x', assessedAt: null, controlKnown: false },
          { controlId: 'c-2', title: 'Folios', selectedValueId: 'v2', valueLabel: 'Sí', effect: 'complies', observation: null, assessedAt: null, controlKnown: false },
        ],
        summary: { total: 3, complies: 2, doesNotComply: 1, noDecision: 0 },
        importedAt: '2026-10-01T10:00:00.000Z',
      },
    };
    const split = splitApplicantItems(row);
    expect([...split.byControl.keys()]).toEqual(['c-1']);
    expect(split.other.map((item) => item.controlId)).toEqual(['c-9', 'c-2']);
    expect(splitApplicantItems({ controls: [] }).other).toEqual([]);
  });

  it('labels the summary column', () => {
    expect(applicantSummaryLabel({ total: 3, complies: 2, doesNotComply: 1, noDecision: 0 })).toBe('2 ✓ / 1 ✗');
    expect(applicantSummaryLabel(null)).toBeNull();
    expect(applicantSummaryTitle({ total: 3, complies: 2, doesNotComply: 1, noDecision: 0 })).toBe('Autoevaluación del solicitante: 2 cumple, 1 no cumple de 3');
    expect(applicantSummaryTitle(null)).toMatch(/no envió autoevaluación/);
  });
});
