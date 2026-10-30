import { describe, expect, it } from 'vitest';

import { canWriteRegistry, errorCode, errorText, formatCc, formatDate, formatDuration, formatGeneralExperience, formatMonths, isImplausibleMonths } from './professionalRegistry.utils';

describe('professional registry utils', () => {
  it('formats a duration without its zero parts and the general experience or why it is missing', () => {
    expect(formatDuration({ years: 2, months: 3, days: 10 })).toBe('2 años 3 meses 10 días');
    expect(formatDuration({ years: 1, months: 0, days: 1 })).toBe('1 año 1 día');
    expect(formatDuration({ years: 0, months: 0, days: 0 })).toBe('0 días');
    expect(formatDuration(null)).toBe('—');
    expect(formatGeneralExperience({ duration: { years: 16, months: 5, days: 29 }, missing: null })).toBe('16 años 5 meses 29 días');
    expect(formatGeneralExperience({ duration: null, missing: 'SIN_FECHA' })).toBe('Matrícula principal sin fecha de expedición');
    expect(formatGeneralExperience(undefined)).toBe('Sin dato');
  });

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

  it('allows writing for the roles the login really stores: Admin., Curador and Prog.', () => {
    expect(canWriteRegistry({ role_short: 'Admin.', role: 'Administrador' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'Curador', role: 'Curador' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'Prog.', role: 'Programador' })).toBe(true);
    expect(canWriteRegistry({ role: 'Administrador' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'ADM' })).toBe(true);
    expect(canWriteRegistry({ role_short: 'Abg.', role: 'Abogado' })).toBe(false);
    expect(canWriteRegistry({ role_short: 'Arq.', role: 'Arquitecto' })).toBe(false);
    expect(canWriteRegistry({ role_short: 'Ing.', role: 'Ingeniero' })).toBe(false);
    expect(canWriteRegistry({ role_short: 'Secretario', role: 'Secretario' })).toBe(false);
    expect(canWriteRegistry(null)).toBe(false);
    expect(canWriteRegistry({})).toBe(false);
  });
});

describe('isImplausibleMonths', () => {
  it('flags only values above 50 years', () => {
    expect(isImplausibleMonths(21731)).toBe(true);
    expect(isImplausibleMonths(601)).toBe(true);
    expect(isImplausibleMonths(600)).toBe(false);
    expect(isImplausibleMonths(154)).toBe(false);
    expect(isImplausibleMonths(null)).toBe(false);
    expect(isImplausibleMonths(undefined)).toBe(false);
  });
});
