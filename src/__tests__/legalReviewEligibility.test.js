import { describe, expect, test } from 'vitest';
import {
  evaluateLegalReviewEligibility,
  getVisibleLegalReviewEntries,
  resolveLegalReviewCondition,
} from '../app/pages/user/fun_forms/utils/legalReviewEligibility';

const COMMON_CODES = ['511', '512', '513', '516', '517', '518', '519'];
const RECOGNITION_CODES = ['651', '652', '653'];
const CONSTRUCTION_CODES = [
  '6601', '6602', '6603', '6604', '6605',
  '660a', '660b', '660c', '660d', '660e', '660f',
  '6611', '6612', '6613', '6614', '6615', '6616', '6617', '6618',
];
const OTHER_ACTION_CODES = ['681', '682', '683', '684', '685', '6861', '687', '6862', '688', '689'];

function makeItem({ tipo, codes, values, tramite = '', version = 1 }) {
  return {
    fun_1s: [{ version, tipo, tramite, m_urb: '', m_sub: '', m_lic: 'D,F,g', cultural: 'B' }],
    fun_rs: [{ version, code: codes.join(','), checked: values.join(',') }],
  };
}

describe('legal review eligibility from visible legacy checklist', () => {
  test('allows expediente 68001-1-25-0130 without evaluating hidden section 6.8', () => {
    const visibleCodes = [...COMMON_CODES, ...RECOGNITION_CODES, ...CONSTRUCTION_CODES];
    const item = makeItem({
      tipo: 'D,F',
      codes: [...visibleCodes, '911', '6607', '6608', '6609', '6610', '6619'],
      values: [...visibleCodes.map(() => '1'), '0', '0', '0', '0', '0', '0'],
    });

    const entries = getVisibleLegalReviewEntries(item, 1);
    const eligibility = evaluateLegalReviewEligibility(item, 1);

    expect(entries.map(({ storageCode }) => storageCode)).toEqual(visibleCodes);
    expect(entries.some(({ storageCode }) => OTHER_ACTION_CODES.includes(storageCode))).toBe(false);
    expect(eligibility).toEqual({ allowed: true, blockers: [] });
  });

  test('blocks a visible NO selection', () => {
    const codes = [...COMMON_CODES, ...RECOGNITION_CODES, ...CONSTRUCTION_CODES];
    const values = codes.map(() => '1');
    values[codes.indexOf('6603')] = '0';
    const item = makeItem({ tipo: 'D,F', codes, values });

    expect(evaluateLegalReviewEligibility(item, 1)).toEqual({
      allowed: false,
      blockers: [{ displayCode: '6603', storageCode: '6603', descriptionCode: '6603' }],
    });
  });

  test('blocks a visible item without a selection', () => {
    const codes = COMMON_CODES.filter(code => code !== '519');
    const item = makeItem({ tipo: '', codes, values: codes.map(() => '1') });

    expect(evaluateLegalReviewEligibility(item, 1)).toEqual({
      allowed: false,
      blockers: [{ displayCode: '519', storageCode: '519', descriptionCode: '519' }],
    });
  });

  test('evaluates section 6.8 only when otras actuaciones is visible', () => {
    const codes = [...COMMON_CODES, ...OTHER_ACTION_CODES];
    const values = codes.map(() => '2');
    values[codes.indexOf('681')] = '0';
    const item = makeItem({ tipo: 'G', codes, values });

    expect(evaluateLegalReviewEligibility(item, 1)).toEqual({
      allowed: false,
      blockers: [{ displayCode: '681', storageCode: '681', descriptionCode: '681' }],
    });
  });

  test('reads construction evaluations stored with the historical 6607-6614 codes', () => {
    const currentConstructionPrefix = CONSTRUCTION_CODES.slice(0, 11);
    const historicalConstructionCodes = ['6607', '6608', '6609', '6610', '6611', '6612', '6613', '6614'];
    const codes = [...COMMON_CODES, ...currentConstructionPrefix, ...historicalConstructionCodes];
    const item = makeItem({ tipo: 'D', codes, values: codes.map(() => '1') });

    expect(evaluateLegalReviewEligibility(item, 1)).toEqual({ allowed: true, blockers: [] });
  });

  test('maps differentiated historical construction values to their current requirements', () => {
    const currentConstructionPrefix = CONSTRUCTION_CODES.slice(0, 11);
    const historicalConstructionCodes = ['6607', '6608', '6609', '6610', '6611', '6612', '6613', '6614'];
    const codes = [...COMMON_CODES, ...currentConstructionPrefix, ...historicalConstructionCodes];
    const values = codes.map(() => '1');
    values[codes.indexOf('6611')] = '0';
    const item = makeItem({ tipo: 'D', codes, values });

    expect(evaluateLegalReviewEligibility(item, 1)).toEqual({
      allowed: false,
      blockers: [{ displayCode: '6615', storageCode: '6615', descriptionCode: '6611' }],
    });
  });

  test('downgrades a stale LYDF condition when the visible checklist is blocked', () => {
    expect(resolveLegalReviewCondition('1', { allowed: false })).toBe('0');
    expect(resolveLegalReviewCondition('1', { allowed: true })).toBe('1');
    expect(resolveLegalReviewCondition('0', { allowed: true })).toBe('0');
  });
});
