import { describe, expect, it } from 'vitest';
import { buildSchedulePayload } from '../app/pages/user/clocks/utils/scheduleUtils';

describe('buildSchedulePayload', () => {
  it('produce el contrato {expedienteId, updatedAt, times} que espera el backend (PUT /fun/schedule/:id)', () => {
    const scheduleData = { 5: { type: 'days', value: 3, originalType: 'days' } };
    const currentItem = { id: 42 };

    const payload = buildSchedulePayload(scheduleData, currentItem);

    expect(payload.expedienteId).toBe(42);
    expect(payload.times).toBe(scheduleData);
    expect(typeof payload.updatedAt).toBe('string');
    expect(() => new Date(payload.updatedAt).toISOString()).not.toThrow();
  });

  it('sobrevive el round-trip JSON.stringify/parse igual que centralClocks.component.js al armar el FormData', () => {
    const payload = buildSchedulePayload(
      { 30: { type: 'date', value: '2026-08-15', originalType: 'date' } },
      { id: 7 }
    );

    const raw = JSON.stringify(payload);
    const parsed = JSON.parse(raw);

    expect(parsed).toEqual({
      expedienteId: 7,
      updatedAt: payload.updatedAt,
      times: { 30: { type: 'date', value: '2026-08-15', originalType: 'date' } },
    });
  });
});
