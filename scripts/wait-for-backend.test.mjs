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

test('falls back to the backend root when the readiness route is missing', async () => {
  const readinessUrl = 'http://127.0.0.1:3001/health/ready';
  const requestedUrls = [];
  let elapsed = 0;

  const result = await waitForBackend({
    url: readinessUrl,
    fetchReady: async url => {
      requestedUrls.push(url);
      return url === readinessUrl
        ? { ok: false, status: 404 }
        : { ok: true, status: 200 };
    },
    sleep: async () => { elapsed += 10; },
    timeoutMs: 100,
    retryMs: 10,
    now: () => elapsed,
  });

  expect(result.attempts).toBe(1);
  expect(requestedUrls).toEqual([
    readinessUrl,
    'http://127.0.0.1:3001/',
  ]);
});

test('does not bypass a readiness route that reports unavailable', async () => {
  const readinessUrl = 'http://127.0.0.1:3001/health/ready';
  const requestedUrls = [];
  let elapsed = 0;

  await expect(waitForBackend({
    url: readinessUrl,
    fetchReady: async url => {
      requestedUrls.push(url);
      return { ok: false, status: 503 };
    },
    sleep: async () => { elapsed += 100; },
    timeoutMs: 250,
    retryMs: 100,
    now: () => elapsed,
  })).rejects.toThrow('Backend readiness timed out');

  expect(requestedUrls).toEqual([
    readinessUrl,
    readinessUrl,
    readinessUrl,
  ]);
});
