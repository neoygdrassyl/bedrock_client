import { formatHistoryDate, getHistoryDocumentLabel } from './funHistory.utils';

describe('FUN history display helpers', () => {
  it('preserves the server-provided document name', () => {
    expect(getHistoryDocumentLabel({ documentName: 'FUN ENTRADA' })).toBe('FUN ENTRADA');
  });

  it('uses a readable fallback when a legacy record has no document name', () => {
    expect(getHistoryDocumentLabel({ sequence: 3 })).toBe('FUN VERSION 3');
  });

  it('formats the server daily key without changing its calendar day', () => {
    expect(formatHistoryDate('2026-09-04')).toBe('04/09/2026');
  });
});
