import { describe, expect, it } from 'vitest';
import { canonicalMetrics, displayValue, filterCanonicalRows, formatDocumentaryDate, groupRowsByList, requirementStatus, SCAN_FILTER } from './canonicalDocumentaryModel';

const row = (key, extra = {}) => ({ rowKey: key, documentClass: 'requirement', catalogueDisplay: { code: key.toUpperCase(), name: `Documento ${key}` }, receipt: { hasPhysical: false, files: { digital: null, scan: null } }, ...extra });

describe('formatDocumentaryDate', () => {
  it('formats date-times and calendar days in short Colombian Spanish', () => {
    expect(formatDocumentaryDate('2026-09-28T00:48:00')).toBe('28 sep 2026, 00:48');
    expect(formatDocumentaryDate('2026-05-12')).toBe('12 may 2026');
    expect(formatDocumentaryDate('2026-09-28T00:48:00', { withTime: false })).toBe('28 sep 2026');
  });
  it('renders empty or invalid values as a dash', () => {
    [null, undefined, '', 'null', 'no es fecha'].forEach((value) => expect(formatDocumentaryDate(value)).toBe('—'));
  });
});

it('displayValue hides null-like server strings', () => {
  expect(displayValue('null')).toBe('—');
  expect(displayValue('  ')).toBe('—');
  expect(displayValue(null)).toBe('—');
  expect(displayValue('VR-1')).toBe('VR-1');
});

describe('rows', () => {
  const rows = [
    row('a', { listTitle: 'Técnica', receipt: { hasPhysical: true, files: { digital: null, scan: { sha256: 'x' } } } }),
    row('b', { listTitle: 'Técnica', receipt: { hasPhysical: true, files: { digital: null, scan: null } } }),
    row('c', { documentClass: 'annex', title: 'Plano anexo', catalogueDisplay: {}, receipt: { hasPhysical: false, files: { digital: { sha256: 'y' }, scan: null } } }),
  ];
  it('filters by search (accent-insensitive), list, class and scan state', () => {
    expect(filterCanonicalRows(rows, { search: 'plano' }).map((item) => item.rowKey)).toEqual(['c']);
    expect(filterCanonicalRows(rows, { list: 'Técnica' })).toHaveLength(2);
    expect(filterCanonicalRows(rows, { documentClass: 'annex' })).toHaveLength(1);
    expect(filterCanonicalRows(rows, { scan: SCAN_FILTER.PENDING }).map((item) => item.rowKey)).toEqual(['b']);
    expect(filterCanonicalRows(rows, { scan: SCAN_FILTER.SCANNED }).map((item) => item.rowKey)).toEqual(['a']);
  });
  it('groups by list with a fallback title', () => {
    expect(groupRowsByList(rows).map((group) => [group.title, group.rows.length])).toEqual([['Técnica', 2], ['Sin lista', 1]]);
  });
  it('computes metrics from server totals and the loaded page', () => {
    const metrics = canonicalMetrics({ rows, counts: { canonicalDocuments: 30, receivedVersions: 41 }, pagination: { nextAfterId: 9 }, satisfaction: { allRequirementsSatisfied: false, missingDocumentIds: ['x', 'y'] } });
    expect(metrics).toEqual({ documents: 30, deliveries: 41, physical: 2, digital: 1, scanned: 1, missing: 2, partial: true });
    expect(canonicalMetrics({ rows, pagination: {}, satisfaction: { allRequirementsSatisfied: null } }).missing).toBeNull();
  });
});

describe('requirementStatus', () => {
  it('summarizes pending, missing and complete evaluations in plain language', () => {
    expect(requirementStatus({ warnings: [{ code: 'REQUIREMENTS_CACHE_MISSING' }], satisfaction: null })).toMatchObject({ tone: 'pending', message: 'Los requisitos aún no se han evaluado.' });
    expect(requirementStatus({ warnings: [], satisfaction: { allRequirementsSatisfied: false, missingDocumentIds: ['a', 'b'] } })).toMatchObject({ tone: 'missing', message: 'Faltan 2 requisitos por recibir.' });
    expect(requirementStatus({ warnings: [], satisfaction: { allRequirementsSatisfied: true } }).tone).toBe('complete');
  });
});
