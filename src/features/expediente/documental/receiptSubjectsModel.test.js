import { describe, expect, it } from 'vitest';
import { partiesById, receiptSubjectsOf, rowsNeedPartyNames, rowsOfSubject, subjectFilterOptions, subjectOfRow, subjectOptionLabel } from './receiptSubjectsModel';
import { filterCanonicalRows } from './canonicalDocumentaryModel';

const view = { requirements: { documents: [
  { documentId: 'd-1', subjectId: 'fun_51:1' }, { documentId: 'd-1', subjectId: 'fun_52:7' }, { documentId: 'd-1', subjectId: 'fun_51:1' },
  { documentId: 'd-2' }, { documentId: 'd-3', subjectId: 'fun_53:4' }, { documentId: 'd-3' },
] } };

describe('receiptSubjectsModel', () => {
  it('lists the persons a document is required of, in order and once, and whether the request also requires it', () => {
    expect(receiptSubjectsOf(view, 'd-1')).toEqual({ subjectIds: ['fun_51:1', 'fun_52:7'], requestLevel: false });
    expect(receiptSubjectsOf(view, 'd-2')).toEqual({ subjectIds: [], requestLevel: true });
    expect(receiptSubjectsOf(view, 'd-3')).toEqual({ subjectIds: ['fun_53:4'], requestLevel: true });
    expect(receiptSubjectsOf(view, '')).toEqual({ subjectIds: [], requestLevel: false });
  });

  it('names a person with its party data or, without it, by kind and FUN row', () => {
    const byId = partiesById({ applicants: [{ id: 'fun_51:1', label: 'Ana Pérez', kindLabel: 'Solicitante' }], professionals: [{ id: 'fun_52:7', label: 'Eva Gil', kindLabel: 'Profesional' }] });
    expect(subjectOptionLabel('fun_51:1', byId)).toBe('Ana Pérez · Solicitante');
    expect(subjectOptionLabel('fun_52:7', byId)).toBe('Eva Gil · Profesional');
    expect(subjectOptionLabel('fun_52:9', new Map())).toBe('Profesional fun_52:9');
    expect(subjectOptionLabel('fun_53:4', null)).toBe('Solicitante fun_53:4');
  });

  it('keeps the received rows of the chosen person only (request-level rows have no person)', () => {
    const rows = [{ rowKey: 'a', subjectId: 'fun_51:1' }, { rowKey: 'b', subjectId: 'fun_52:7' }, { rowKey: 'c' }];
    expect(rowsOfSubject(rows, 'fun_51:1').map((row) => row.rowKey)).toEqual(['a']);
    expect(rowsOfSubject(rows, null).map((row) => row.rowKey)).toEqual(['c']);
  });

  it('names the person of a delivery from the row first, then from the parties, then by kind', () => {
    const byId = partiesById({ applicants: [{ id: 'fun_51:1', label: 'Ana Pérez', kindLabel: 'Solicitante' }], professionals: [] });
    expect(subjectOfRow({ subjectId: 'fun_52:7', subjectLabel: 'Eva Gil Ruiz', subjectKind: 'professional' }, byId)).toMatchObject({ text: 'Eva Gil Ruiz · Profesional' });
    expect(subjectOfRow({ subjectId: 'fun_51:1' }, byId)).toMatchObject({ label: 'Ana Pérez', text: 'Ana Pérez · Solicitante' });
    expect(subjectOfRow({ subjectId: 'fun_52:9' }, byId).text).toBe('Profesional fun_52:9');
    expect(subjectOfRow({ subjectId: null }, byId)).toBeNull();
    expect(rowsNeedPartyNames([{ subjectId: 'fun_51:1', subjectLabel: 'Ana' }])).toBe(false);
    expect(rowsNeedPartyNames([{ subjectId: 'fun_51:1' }])).toBe(true);
  });

  it('offers a person filter only when some delivery has a person, and filters by it', () => {
    const rows = [{ rowKey: 'a', subjectId: 'fun_51:1', subjectLabel: 'Ana' }, { rowKey: 'b', subjectId: 'fun_52:7', subjectLabel: 'Eva', subjectKind: 'professional' }, { rowKey: 'c' }];
    expect(subjectFilterOptions([{ rowKey: 'c' }], new Map())).toEqual([]);
    expect(subjectFilterOptions(rows, new Map()).map((option) => option.label)).toEqual(['Ana · Solicitante', 'Eva · Profesional', 'Solicitud (sin persona)']);
    const named = rows.map((row) => ({ ...row, catalogueDisplay: { code: row.rowKey, name: row.rowKey }, receipt: {} }));
    expect(filterCanonicalRows(named, { subject: 'fun_52:7' }).map((row) => row.rowKey)).toEqual(['b']);
    expect(filterCanonicalRows(named, { subject: '__request__' }).map((row) => row.rowKey)).toEqual(['c']);
  });
});
