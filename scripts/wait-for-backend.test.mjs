import { expect, test } from 'vitest';
import { waitForBackend } from './wait-for-backend.mjs';

test('waits through connection failures until readiness succeeds', async () => {
  let attempts = 0;
  const result = await waitForBackend({
    fetchReady: async () => {
      attempts += 1;
      if (attempts < 3) throw new Error('ECONNREFUSED');
      return { ok: true };
    },
    sleep: async () => {},
    timeoutMs: 1000,
    now: () => attempts * 10,
  });

  expect(result.attempts).toBe(3);
});

test('fails after the configured readiness timeout', async () => {
  let elapsed = 0;

  await expect(waitForBackend({
      fetchReady: async () => ({ ok: false }),
      sleep: async () => { elapsed += 100; },
      timeoutMs: 250,
      now: () => elapsed,
      retryMs: 100,
    })).rejects.toThrow('Backend readiness timed out');
});
