import { describe, expect, it } from 'vitest';
import {
  ARC_SECTIONS,
  LEGAL_SECTIONS,
  buildReviewJson,
  criterionKeys,
  itemsOf,
  modalityFromFun,
  normalizeReview,
  suggestDecision,
  visibleSections,
} from './subdivisionCriteria.js';

const keysOf = sections => itemsOf(sections).map(item => item.key);

describe('subdivisionCriteria', () => {
  it('reads the modality from the latest fun_1s version or the requested one', () => {
    const fun = { fun_1s: [{ version: 1, m_sub: 'A' }, { version: 2, m_sub: 'C' }] };
    expect(modalityFromFun(fun)).toBe('reloteo');
    expect(modalityFromFun(fun, 1)).toBe('rural');
    expect(modalityFromFun({ fun_1s: [{ version: 1, m_sub: 'B' }] }, 1)).toBe('urbana');
    expect(modalityFromFun({ fun_1s: [{ version: 1, m_sub: 'A,B' }] })).toBeNull();
    expect(modalityFromFun({ fun_1s: [{ version: 1, m_sub: '' }] })).toBeNull();
    expect(modalityFromFun(null)).toBeNull();
  });

  it('filters criteria by modality and keeps everything without one', () => {
    const rural = keysOf(visibleSections(LEGAL_SECTIONS, 'rural'));
    expect(rural).toEqual(expect.arrayContaining(['proc_uaf', 'doc_excepcion_uaf']));
    expect(rural).not.toEqual(expect.arrayContaining(['proc_reloteo']));
    expect(rural).not.toContain('doc_plano_base');
    expect(rural).not.toContain('proc_situacion_urbana');

    const all = keysOf(visibleSections(LEGAL_SECTIONS, null));
    expect(all).toEqual(expect.arrayContaining(['proc_uaf', 'proc_situacion_urbana', 'proc_reloteo', 'doc_plano_base']));

    expect(visibleSections(ARC_SECTIONS, 'rural').map(section => section.id)).toEqual(['planimetria']);
    expect(visibleSections(ARC_SECTIONS, 'urbana').map(section => section.id)).toEqual(['planimetria', 'norma']);
  });

  it('suggests a decision only from the given criteria keys', () => {
    const keys = ['a', 'b'];
    expect(suggestDecision({ a: 'SI' }, keys)).toBeNull();
    expect(suggestDecision({ a: 'SI', b: 'NA' }, keys)).toBe('procedente');
    expect(suggestDecision({ a: 'NO' }, keys)).toBe('no_procedente');
    expect(suggestDecision({ a: 'SI', b: 'SI', c: 'NO' }, keys)).toBe('procedente');
    expect(suggestDecision({}, [])).toBeNull();
  });

  it('excludes the CLT findings from the suggestion keys', () => {
    expect(criterionKeys(LEGAL_SECTIONS)).not.toContain('anot_bic');
  });

  it('normalizes stored json and builds the exact persisted shape', () => {
    const stored = JSON.stringify(JSON.stringify({ criteria: { a: 'SI', b: 'X' }, notes: { a: 'ok', b: '' }, observations: 'obs', decision: 'otro' }));
    expect(normalizeReview(stored)).toEqual({ criteria: { a: 'SI' }, notes: { a: 'ok' }, observations: 'obs', decision: null });
    expect(normalizeReview(null)).toEqual({ criteria: {}, notes: {}, observations: '', decision: null });

    expect(buildReviewJson({ criteria: { a: 'NO', hidden: 'SI' }, notes: { a: '  falta  ', hidden: 'x' }, observations: ' revisar ', decision: 'no_procedente' }, ['a']))
      .toEqual({ criteria: { a: 'NO' }, notes: { a: 'falta' }, observations: 'revisar', decision: 'no_procedente' });
  });
});
