import { describe, expect, it } from 'vitest';

import { canWriteRegistry, errorCode, errorText, formatCc, formatDate, formatMonths } from './professionalRegistry.utils';

describe('professional registry utils', () => {
  it('formats months as years and months, with a fallback for missing or zero values', () => {
    expect(formatMonths(84)).toBe('7 años');
    expect(formatMonths(13)).toBe('1 año 1 mes');
    expect(formatMonths(5)).toBe('5 meses');
    expect(formatMonths(0)).toBe('Sin dato');
    expect(formatMonths(null)).toBe('Sin dato');
    expect(formatMonths(undefined)).toBe('Sin dato');
    expect(formatMonths('abc')).toBe('Sin dato');
  });

  it('formats cédulas with thousands dots and handles a missing one', () => {
    expect(formatCc('13439751')).toBe('13.439.751');
    expect(formatCc('1098602764')).toBe('1.098.602.764');
    expect(formatCc(null)).toBe('Sin cédula');
  });

  it('formats dates and tolerates bad input', () => {
    expect(formatDate('2026-01-15')).toMatch(/2026/);
    expect(formatDate(null)).toBe('Sin fecha');
    expect(formatDate('no es fecha')).toBe('Sin fecha');
  });

  it('only shows server messages for known codes and explains a 403', () => {
    expect(errorText({ response: { data: { code: 'CC_EXISTS', message: 'Ya existe.' } } })).toBe('Ya existe.');
    expect(errorText({ response: { data: { code: 'SQL_ERROR', message: 'ER_DUP 13439751' } } }, 'Falló')).toBe('Falló');
    expect(errorText({ response: { status: 403, data: {} } })).toBe('No tiene permisos para realizar esta acción.');
    expect(errorText(new Error('network'))).toBe('No fue posible completar la operación.');
    expect(errorCode({ response: { data: { code: 'VERSION_CONFLICT' } } })).toBe('VERSION_CONFLICT');
    expect(errorCode(null)).toBeNull();
  });

  it('allows writing for ADM, CUR and the programmer role only', () => {
    expect(canWriteRegistry({ role_short: 'ADM' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'CUR' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'PROG' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'ABG' })).toBe(false);
    expect(canWriteRegistry({ role_short: 'SECRETARIO' })).toBe(false);
    expect(canWriteRegistry(null)).toBe(false);
    expect(canWriteRegistry({})).toBe(false);
  });
});
