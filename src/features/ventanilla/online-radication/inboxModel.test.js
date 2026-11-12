import { describe, expect, it } from 'vitest';
import {
  actuationLabels,
  documentsRatio,
  formatNumericDate,
  formatNumericDateTime,
  liquidationStatusOf,
  needsAction,
  requestNeedsAction,
  rowStatus,
  waitInfo,
} from './inboxModel';

// Wednesday 12 Nov 2026, 10:00 local time.
const NOW = new Date(2026, 10, 12, 10, 0);

describe('inboxModel', () => {
  it('reads the liquidation status defensively (absent, null, object, string, unknown)', () => {
    expect(liquidationStatusOf(null)).toBeNull();
    expect(liquidationStatusOf({ id: 1, status: 'pending' })).toBeNull();
    expect(liquidationStatusOf({ id: 1, status: 'pending', liquidation: null })).toBeNull();
    expect(liquidationStatusOf({ status: 'pending', liquidation: { status: 'receipt_submitted' } })).toBe('receipt_submitted');
    expect(liquidationStatusOf({ status: 'pending', liquidationStatus: 'awaiting_payment' })).toBe('awaiting_payment');
    expect(liquidationStatusOf({ status: 'approved' })).toBe('approved');
    expect(liquidationStatusOf('receipt_rejected')).toBe('receipt_rejected');
    expect(liquidationStatusOf({ liquidation: { status: 'something_new' } })).toBeNull();
  });

  it('builds one row status from the request and its liquidation stage', () => {
    expect(rowStatus('pending', null)).toMatchObject({ key: 'pending', label: 'Pendiente', tone: 'warning' });
    expect(rowStatus('pending', { liquidation: { status: 'awaiting_payment' } })).toMatchObject({ label: 'En espera de pago', tone: 'info' });
    expect(rowStatus('pending', 'receipt_submitted')).toMatchObject({ label: 'Recibo en revisión', tone: 'warning' });
    expect(rowStatus('pending', 'receipt_rejected')).toMatchObject({ label: 'Recibo rechazado', tone: 'danger' });
    // A decided request shows its own outcome whatever the liquidation says.
    expect(rowStatus('radicated', 'approved')).toMatchObject({ label: 'Radicada', tone: 'success' });
    expect(rowStatus('rejected', 'awaiting_payment')).toMatchObject({ label: 'Rechazada', tone: 'danger' });
    expect(rowStatus(undefined)).toMatchObject({ label: 'Sin estado', tone: 'neutral' });
  });

  it('knows when Ventanilla has to act', () => {
    expect(requestNeedsAction({ status: 'pending' })).toBe(true);
    expect(requestNeedsAction({ status: 'pending', liquidation: { status: 'awaiting_payment' } })).toBe(false);
    expect(requestNeedsAction({ status: 'pending', liquidation: { status: 'receipt_submitted' } })).toBe(true);
    expect(requestNeedsAction({ status: 'radicated' })).toBe(false);
    expect(needsAction({ status: 'radicated', pendingEntryCount: 2 })).toBe(true);
    expect(needsAction({ status: 'pending', liquidation: { status: 'receipt_rejected' } })).toBe(false);
  });

  it('flags requests waiting more than the threshold, only while Ventanilla has to act', () => {
    const old = '2026-10-15T09:00:00';
    expect(waitInfo({ status: 'pending', receivedAt: old }, NOW)).toMatchObject({ overdue: true, days: 20, label: '20 días hábiles' });
    expect(waitInfo({ status: 'pending', receivedAt: '2026-11-11T09:00:00' }, NOW)).toMatchObject({ overdue: false, days: 1 });
    expect(waitInfo({ status: 'pending', receivedAt: old, liquidation: { status: 'awaiting_payment' } }, NOW).overdue).toBe(false);
    expect(waitInfo({ status: 'radicated', receivedAt: old }, NOW)).toMatchObject({ overdue: false, days: 0 });
  });

  it('summarises documents as a ratio and marks it when below the required count', () => {
    expect(documentsRatio({ documentCount: 4, requiredDocumentCount: 4 })).toMatchObject({ short: '4/4', below: false });
    expect(documentsRatio({ documentCount: 2, requiredDocumentCount: 5 })).toMatchObject({
      short: '2/5',
      below: true,
      text: '2 documentos aportados, 5 obligatorios',
    });
    expect(documentsRatio({ documentCount: 3 })).toMatchObject({ short: '3', below: false });
    expect(documentsRatio({})).toMatchObject({ short: '0', below: false });
  });

  it('formats dates as dd/mm/aaaa and lists actuation labels', () => {
    expect(formatNumericDate('2026-03-07')).toBe('07/03/2026');
    expect(formatNumericDateTime(new Date(2026, 0, 2, 8, 5))).toBe('02/01/2026 08:05');
    expect(formatNumericDate('nope')).toBeNull();
    expect(actuationLabels({ actuations: [{ code: 'A', label: 'Obra nueva' }, { code: 'B' }, null, 'Demolición'] }))
      .toEqual(['Obra nueva', 'B', 'Demolición']);
  });
});
