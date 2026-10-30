import { describe, expect, it } from 'vitest';
import { buildCuratedVrList, legacyLastVr } from './confirmLegalVr';

const submits = [
  { id_public: 'VR1-1', date: '2026-02-01', time: '10:00', sub_lists: [{ list_name: 'Cédula;Plano', list_category: 'A,B', list_code: '10,20', list_pages: '2,5', list_review: 'SI,NO' }] },
  { id_public: 'VR2-1', date: '2026-03-01', time: '09:00', sub_lists: [{ list_name: 'Plano', list_category: 'B', list_code: '20', list_pages: '7', list_review: 'SI' }] },
  { id_public: 'VR3-1', date: '2026-04-01', time: '09:00' },
];

describe('confirmlegal legacy VR', () => {
  it('keeps only the reviewed (SI) documents of every VR', () => {
    expect(buildCuratedVrList(submits)).toEqual([
      { id_public: 'VR1-1', date: '2026-02-01', time: '10:00', name: 'Cédula', category: 'A', page: '2', code: '10' },
      { id_public: 'VR2-1', date: '2026-03-01', time: '09:00', name: 'Plano', category: 'B', page: '7', code: '20' },
    ]);
    expect(buildCuratedVrList(undefined)).toEqual([]);
  });

  it('returns the latest VR that delivered a required document', () => {
    const curated = buildCuratedVrList(submits);
    const funR = { code: '10,20,30', checked: '1,0,2' };
    expect(legacyLastVr(curated, funR, '2026-01-15')).toEqual({ date: '2026-03-01', vr: 'VR2-1' });
    // Only code 10 required: the VR of code 20 does not count.
    expect(legacyLastVr(curated, { code: '10,20', checked: '1,2' }, '2026-01-15')).toEqual({ date: '2026-02-01', vr: 'VR1-1' });
    // Nothing after the clock start: no VR.
    expect(legacyLastVr(curated, funR, '2026-05-01')).toEqual({ date: '2026-05-01', vr: '' });
    expect(legacyLastVr([], {}, '2026-01-15')).toEqual({ date: '2026-01-15', vr: '' });
  });
});
