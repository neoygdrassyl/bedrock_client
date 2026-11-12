import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  __getQueuedEventsForTests,
  __resetLoggerForTests,
  clearLocalLogs,
  clearLogQueue,
  exportLocalLogs,
  flushLogs,
  getRequestIdFromError,
  installGlobalErrorListeners,
  installLogConsole,
  listLocalLogs,
  logError,
  logEvent,
  newRequestId,
  redactObject,
  setLogTransport,
} from './logger';

const BACKEND_REQUEST_ID = /^[A-Za-z0-9_.:-]{8,80}$/;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('client logger', () => {
  beforeEach(() => {
    __resetLoggerForTests();
    localStorage.clear();
    // The local ring buffer is mirrored to sessionStorage and reloaded from it.
    sessionStorage.clear();
    localStorage.setItem('dovela_token', 'jwt');
  });

  afterEach(() => {
    vi.useRealTimers();
    __resetLoggerForTests();
    localStorage.clear();
  });

  it('batches events and flushes them after 5 seconds', async () => {
    vi.useFakeTimers();
    const transport = vi.fn().mockResolvedValue({ status: 202 });
    setLogTransport(transport);

    logEvent('info', 'first_event', { message: 'a' });
    logEvent('warn', 'second_event', { message: 'b', data: { password: 'x', count: 2 } });
    expect(transport).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5000);

    expect(transport).toHaveBeenCalledTimes(1);
    const [batch] = transport.mock.calls[0];
    expect(batch.map((event) => event.event)).toEqual(['first_event', 'second_event']);
    expect(batch[1]).toMatchObject({ level: 'warn', data: { password: '[REDACTED]', count: 2 } });
    expect(batch[0].clientEventId).toMatch(BACKEND_REQUEST_ID);
    expect(__getQueuedEventsForTests()).toEqual([]);
  });

  it('flushes immediately once 10 events are queued', async () => {
    const transport = vi.fn().mockResolvedValue({ status: 202 });
    setLogTransport(transport);

    for (let index = 0; index < 10; index += 1) logEvent('info', 'burst', { message: `m${index}` });
    await settle();

    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0]).toHaveLength(10);
  });

  it('keeps events queued while there is no session', () => {
    localStorage.removeItem('dovela_token');
    const transport = vi.fn().mockResolvedValue({});
    setLogTransport(transport);

    logEvent('error', 'before_login', { message: 'x' });
    flushLogs();

    expect(transport).not.toHaveBeenCalled();
    expect(__getQueuedEventsForTests()).toHaveLength(1);
  });

  it('never sends events recorded before login or under another session', async () => {
    const transport = vi.fn().mockResolvedValue({});
    setLogTransport(transport);

    localStorage.removeItem('dovela_token');
    logEvent('error', 'before_login', { message: 'x' });
    localStorage.setItem('dovela_token', 'jwt-user-a');
    logEvent('error', 'user_a', { message: 'a' });
    localStorage.setItem('dovela_token', 'jwt-user-b');
    logEvent('error', 'user_b', { message: 'b' });

    flushLogs();
    await settle();

    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0][0].map((event) => event.event)).toEqual(['user_b']);
    expect(__getQueuedEventsForTests()).toEqual([]);
  });

  it('clears the queue when the session is torn down', async () => {
    const transport = vi.fn().mockResolvedValue({});
    setLogTransport(transport);

    logEvent('error', 'pending', { message: 'x' });
    clearLogQueue();
    flushLogs();
    await settle();

    expect(transport).not.toHaveBeenCalled();
    expect(__getQueuedEventsForTests()).toEqual([]);
    // The dedupe memory is cleared too, so the next session can record it again.
    expect(logEvent('error', 'pending', { message: 'x' })).not.toBeNull();
    expect(__getQueuedEventsForTests()).toHaveLength(1);
  });

  it('deduplicates identical event+message pairs and answers with the first id', () => {
    const first = logEvent('error', 'same', { message: 'boom' });
    const second = logEvent('error', 'same', { message: 'boom' });
    logEvent('error', 'same', { message: 'other' });

    expect(second).toBe(first);
    expect(__getQueuedEventsForTests()).toHaveLength(2);
  });

  it('keeps events with the same message but a different related request', () => {
    const first = logEvent('warn', 'ui_load_failed', { message: 'boom', relatedRequestId: 'req_first_1234' });
    const second = logEvent('warn', 'ui_load_failed', { message: 'boom', relatedRequestId: 'req_second_1234' });

    expect(second).not.toBe(first);
    expect(__getQueuedEventsForTests().map((event) => event.relatedRequestId)).toEqual(['req_first_1234', 'req_second_1234']);
  });

  it('accepts at most 50 events per rolling 10-minute window', () => {
    vi.useFakeTimers();
    for (let index = 0; index < 60; index += 1) logEvent('info', 'capped', { message: `m${index}` });

    expect(__getQueuedEventsForTests()).toHaveLength(50);
    expect(logEvent('info', 'capped', { message: 'late' })).toBeNull();

    vi.advanceTimersByTime(10 * 60 * 1000 - 1);
    expect(logEvent('info', 'capped', { message: 'still late' })).toBeNull();

    vi.advanceTimersByTime(1);
    expect(logEvent('info', 'capped', { message: 'next window' })).not.toBeNull();
  });

  it('truncates data to under 4000 UTF-8 bytes', () => {
    // 3000 accented characters: 3000 chars but about 6000 bytes in UTF-8.
    const text = 'á'.repeat(3000);
    logEvent('info', 'big_data', { data: { a: text.slice(0, 1100), b: text.slice(0, 1100), c: text.slice(0, 1100) } });

    const [event] = __getQueuedEventsForTests();
    const bytes = new TextEncoder().encode(JSON.stringify(event.data)).length;
    expect(event.data.truncated).toBe(true);
    // The kind tag survives truncation and counts toward the byte budget.
    expect(event.data.kind).toBe('runtime');
    expect(bytes).toBeLessThanOrEqual(4000);
    expect(bytes).toBeGreaterThan(3900);
  });

  it('keeps data that fits in the byte limit untouched', () => {
    logEvent('info', 'small_data', { data: { note: 'ñandú' } });
    // Only the `kind` tag is added to a payload that already fits.
    expect(__getQueuedEventsForTests()[0].data).toEqual({ kind: 'runtime', note: 'ñandú' });
  });

  it('drops a failed batch without logging it again', async () => {
    const transport = vi.fn().mockRejectedValue({ response: { status: 500 } });
    setLogTransport(transport);

    logEvent('error', 'will_fail', { message: 'x' });
    flushLogs();
    await settle();

    expect(transport).toHaveBeenCalledTimes(1);
    expect(__getQueuedEventsForTests()).toEqual([]);
  });

  it('stops sending when the backend has no client-events endpoint', async () => {
    const transport = vi.fn().mockRejectedValue({ response: { status: 404 } });
    setLogTransport(transport);

    logEvent('error', 'old_backend', { message: 'x' });
    flushLogs();
    await settle();
    logEvent('error', 'old_backend', { message: 'y' });
    flushLogs();
    await settle();

    expect(transport).toHaveBeenCalledTimes(1);
  });

  it('never throws, even when the transport throws synchronously', async () => {
    setLogTransport(() => { throw new Error('transport down'); });

    expect(() => logError('sync_failure', new Error('x'))).not.toThrow();
    expect(() => flushLogs()).not.toThrow();
    await settle();
    expect(() => logEvent('info', '')).not.toThrow();
  });

  it('generates request ids the backend accepts', () => {
    const id = newRequestId();
    expect(id).toMatch(/^req_[a-z0-9]+_[a-z0-9]{8}$/);
    expect(id).toMatch(BACKEND_REQUEST_ID);
    expect(newRequestId()).not.toBe(id);
  });

  it('reads the request id from the response header, then the body, then the sent id', () => {
    const config = { dovelaRequestId: 'req_sent_12345678' };
    expect(getRequestIdFromError({
      config,
      response: { headers: { 'x-dovela-request-id': 'req_header_1234' }, data: { requestId: 'req_body_12345678' } },
    })).toBe('req_header_1234');
    expect(getRequestIdFromError({ config, response: { headers: {}, data: { requestId: 'req_body_12345678' } } }))
      .toBe('req_body_12345678');
    expect(getRequestIdFromError({ config, response: { headers: {}, data: { error: { requestId: 'req_nested_1234' } } } }))
      .toBe('req_nested_1234');
    expect(getRequestIdFromError({ config })).toBe('req_sent_12345678');
    expect(getRequestIdFromError({ cause: { config } })).toBe('req_sent_12345678');
    expect(getRequestIdFromError({ response: { data: { requestId: 'bad id with spaces' } } })).toBeNull();
    expect(getRequestIdFromError(null)).toBeNull();
  });

  it('logs uncaught errors and non-HTTP unhandled rejections from global listeners', () => {
    const target = new window.EventTarget();
    installGlobalErrorListeners(target);

    const errorEvent = new Event('error');
    errorEvent.error = new TypeError('x is undefined');
    target.dispatchEvent(errorEvent);

    const rejection = new Event('unhandledrejection');
    rejection.reason = new Error('promise failed');
    target.dispatchEvent(rejection);

    const axiosRejection = new Event('unhandledrejection');
    axiosRejection.reason = { isAxiosError: true, config: {}, message: 'Request failed' };
    target.dispatchEvent(axiosRejection);

    const events = __getQueuedEventsForTests();
    expect(events.map((event) => event.event)).toEqual(['js_error', 'unhandled_rejection']);
    expect(events[0].message).toBe('TypeError: x is undefined');
  });

  it('redacts sensitive keys and query secrets before queueing', () => {
    logEvent('error', 'redaction_check', {
      message: 'GET /api/x?token=abc123&page=2',
      data: { password: 'p4ss', nested: { authorization: 'Bearer x', url: '/a?jwt=zzz' }, keep: 'ok' },
    });

    const [event] = __getQueuedEventsForTests();
    expect(event.message).toBe('GET /api/x?token=[REDACTED]&page=2');
    expect(event.data).toMatchObject({
      password: '[REDACTED]',
      nested: { authorization: '[REDACTED]', url: '/a?jwt=[REDACTED]' },
      keep: 'ok',
    });
    expect(JSON.stringify(event)).not.toMatch(/p4ss|Bearer x|abc123|zzz/);
  });

  it('marks circular references instead of throwing', () => {
    const value = { name: 'loop' };
    value.self = value;
    expect(redactObject(value)).toEqual({ name: 'loop', self: '[CIRCULAR]' });
  });

  it('collapses repeated local entries into one line with a count', () => {
    logEvent('warn', 'poll_failed', { message: 'timeout', relatedRequestId: 'req_aaaaaaaa_1' });
    logEvent('warn', 'poll_failed', { message: 'timeout', relatedRequestId: 'req_bbbbbbbb_2' });

    const entries = listLocalLogs({ text: 'poll_failed' });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ count: 2, level: 'warn', requestId: 'req_bbbbbbbb_2' });
    expect(entries[0]).not.toHaveProperty('key');
  });

  it('keeps only the last 200 entries in the local ring buffer', () => {
    for (let index = 0; index < 205; index += 1) logEvent('info', `ring_${index}`, { localOnly: true });

    const entries = listLocalLogs();
    expect(entries).toHaveLength(200);
    expect(entries[0].event).toBe('ring_5');
    expect(entries.at(-1).event).toBe('ring_204');
  });

  it('keeps localOnly events out of the send queue', () => {
    logEvent('error', 'optional_endpoint_failed', { localOnly: true });

    expect(__getQueuedEventsForTests()).toEqual([]);
    expect(listLocalLogs('error')).toHaveLength(1);
  });

  it('filters, exports and clears the local buffer', () => {
    logEvent('error', 'http_error', { kind: 'http', data: { status: 500, url: '/api/a' } });
    logEvent('info', 'note', { message: 'hello' });

    expect(listLocalLogs({ status: 500 })).toHaveLength(1);
    expect(listLocalLogs('info')).toHaveLength(1);
    expect(JSON.parse(exportLocalLogs()).entries).toHaveLength(2);

    clearLocalLogs();
    expect(listLocalLogs()).toEqual([]);
  });

  it('exposes a frozen window.__dovelaLogs console API once', () => {
    const target = {};
    installLogConsole(target);
    const api = target.__dovelaLogs;

    expect(Object.keys(api).sort()).toEqual(['clear', 'export', 'flush', 'list']);
    expect(Object.isFrozen(api)).toBe(true);
    installLogConsole(target);
    expect(target.__dovelaLogs).toBe(api);

    logEvent('warn', 'console_api', { localOnly: true });
    expect(api.list('warn')).toHaveLength(1);
    api.clear();
    expect(api.list()).toEqual([]);
  });
});
