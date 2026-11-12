import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logError } from '../observability/logger';
import { parseLegacyJson, resetParseLegacyJsonLog } from './parseLegacyJson';

vi.mock('../observability/logger', () => ({ logError: vi.fn(), logEvent: vi.fn() }));

const payload = { area: '12.5', items: [1, 2], nested: { ok: true } };

describe('parseLegacyJson', () => {
  beforeEach(() => {
    logError.mockClear();
    resetParseLegacyJsonLog();
  });

  it('decodes the historical double-encoded shape', () => {
    expect(parseLegacyJson(JSON.stringify(JSON.stringify(payload)))).toEqual(payload);
    expect(parseLegacyJson(JSON.stringify(JSON.stringify([1, 'a'])), {})).toEqual([1, 'a']);
  });

  it('decodes a single-encoded value', () => {
    expect(parseLegacyJson(JSON.stringify(payload))).toEqual(payload);
    expect(parseLegacyJson('[1,"a",null]')).toEqual([1, 'a', null]);
  });

  it('returns an already parsed value untouched (same reference)', () => {
    const list = [payload];
    expect(parseLegacyJson(payload)).toBe(payload);
    expect(parseLegacyJson(list)).toBe(list);
    expect(parseLegacyJson(payload, [])).toBe(payload);
  });

  it.each([0, 7, false, true])('passes through the non-string value %s', (value) => {
    expect(parseLegacyJson(value, {})).toBe(value);
  });

  it.each(['7', 'true', '0', '"7"'])('decodes the encoded scalar %j', (value) => {
    expect(parseLegacyJson(value, {})).toBe(JSON.parse(JSON.parse(JSON.stringify(JSON.parse(value)))));
  });

  it('never decodes more than two levels', () => {
    const triple = JSON.stringify(JSON.stringify(JSON.stringify(payload)));
    expect(parseLegacyJson(triple)).toBe(JSON.stringify(payload));
  });

  it('keeps a single-encoded scalar string instead of throwing on the second pass', () => {
    expect(parseLegacyJson('"hola"', {})).toBe('hola');
    expect(parseLegacyJson(JSON.stringify('texto libre, sin JSON'), {})).toBe('texto libre, sin JSON');
    expect(parseLegacyJson(JSON.stringify(JSON.stringify('hola')), {})).toBe('hola');
    expect(logError).not.toHaveBeenCalled();
  });

  it.each([null, undefined, '', '   ', '\n'])('returns the fallback for the missing value %j without logging', (value) => {
    const fallback = {};
    expect(parseLegacyJson(value, fallback)).toBe(fallback);
    expect(parseLegacyJson(value, [])).toEqual([]);
    expect(parseLegacyJson(value)).toBeNull();
    expect(logError).not.toHaveBeenCalled();
  });

  it('returns the fallback when the stored JSON is null', () => {
    expect(parseLegacyJson('null', {})).toEqual({});
    expect(parseLegacyJson('"null"', {})).toEqual({});
    expect(parseLegacyJson('null')).toBeNull();
    expect(logError).not.toHaveBeenCalled();
  });

  it.each(['not json', '{"a":', '[object Object]', 'undefined'])('returns the fallback for the invalid string %j instead of throwing', (value) => {
    const fallback = [];
    expect(parseLegacyJson(value, fallback)).toBe(fallback);
    expect(parseLegacyJson(value)).toBeNull();
  });

  it('logs an invalid non-empty string once, with the field context', () => {
    parseLegacyJson('{"a":', {}, 'exp_res:expedition.reso');
    parseLegacyJson('{"a":', {}, 'exp_res:expedition.reso');
    parseLegacyJson('{"a":', {}, 'exp_res:expedition.reso');

    expect(logError).toHaveBeenCalledTimes(1);
    const [event, error, fields] = logError.mock.calls[0];
    expect(event).toBe('legacy_json_invalid');
    expect(error).toBeInstanceOf(SyntaxError);
    expect(fields).toEqual({ level: 'warn', data: { field: 'exp_res:expedition.reso', length: 5 } });
  });

  it('logs each distinct bad field, and accepts an object context', () => {
    parseLegacyJson('{"a":', {}, 'exp_res:expedition.reso');
    parseLegacyJson('{"a":', {}, { field: 'record_arc_33:step.s33.json', recordId: 12 });
    parseLegacyJson('oops', {});

    expect(logError).toHaveBeenCalledTimes(3);
    expect(logError.mock.calls[1][2].data).toEqual({ field: 'record_arc_33:step.s33.json', recordId: 12, length: 5 });
    expect(logError.mock.calls[2][2].data).toEqual({ field: 'unknown', length: 4 });
  });
});
