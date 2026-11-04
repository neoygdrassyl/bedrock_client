import { describe, expect, it } from 'vitest';
import {
  ROLE_STATUS, buildBatchRoles, disabledReason, draftOf, roleRowState, selectionProblem,
} from './fun52RoleSelection';

const role = (overrides) => ({
  roleCode: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', requiredYears: 2, specificMonths: null,
  specificSource: null, specificExceedsGeneral: false, status: ROLE_STATUS.SIN_REGISTRO, selectable: true, ...overrides,
});
const NO_EXIGE = role({ roleCode: 'OTROS_ESP', label: 'OTROS PROFESIONALES ESPECIALISTAS', requiredYears: null, status: ROLE_STATUS.NO_EXIGE });
const typed = (years, months = '') => ({ years: String(years), months: String(months) });

describe('roleRowState', () => {
  it.each([
    ['equal to the required years', role(), typed(2, 0), 120, ROLE_STATUS.CUMPLE, '', 24],
    ['one month short', role(), typed(1, 11), 120, ROLE_STATUS.NO_CUMPLE, /no alcanza los 2 años/, 23],
    ['blank for a role that requires years', role(), typed('', ''), 120, ROLE_STATUS.SIN_REGISTRO, /Indique la experiencia específica/, null],
    ['blank where none is required', NO_EXIGE, typed('', ''), 120, ROLE_STATUS.NO_EXIGE, '', null],
    ['typed where none is required', NO_EXIGE, typed(3), 120, ROLE_STATUS.NO_EXIGE, '', 36],
    ['above the general experience', role(), typed(5), 48, ROLE_STATUS.CUMPLE, /no puede superar la experiencia general \(4 años\)/, 60],
    ['equal to the general experience', role(), typed(4), 48, ROLE_STATUS.CUMPLE, '', 48],
    ['general experience unknown', role(), typed(40), null, ROLE_STATUS.CUMPLE, '', 480],
    ['above the general one where none is required', NO_EXIGE, typed(1), 6, ROLE_STATUS.NO_EXIGE, /no puede superar/, 12],
  ])('%s', (_case, input, value, general, status, error, months) => {
    const state = roleRowState(input, value, general);
    expect(state.status).toBe(status);
    expect(state.months).toBe(months);
    if (error) expect(state.error).toMatch(error);
    else expect(state.error).toBe('');
  });

  it.each([
    ['months 12', typed(1, 12), /meses deben ser un número entero entre 0 y 11/],
    ['negative years', typed('-1'), /años deben ser un número entero/],
    ['decimal months', typed(1, '1.5'), /meses deben ser un número entero/],
  ])('refuses %s and keeps the registered status', (_case, value, error) => {
    const state = roleRowState(role({ status: ROLE_STATUS.CUMPLE, specificMonths: 30 }), value, 120);
    expect(state).toMatchObject({ status: ROLE_STATUS.CUMPLE, months: null });
    expect(state.error).toMatch(error);
  });

  it('keeps a role the registry marks NO_CUMPLE not selectable', () => {
    expect(roleRowState(role({ status: ROLE_STATUS.NO_CUMPLE, selectable: false, specificMonths: 10 }), typed(0, 10), 120).selectable).toBe(false);
  });
});

describe('draftOf and disabledReason', () => {
  it('pre-fills 5.2.9 with the registered specific experience', () => {
    expect(draftOf(role({ specificMonths: 40 }))).toEqual({ years: '3', months: '4' });
    expect(draftOf(role({ specificMonths: 0 }))).toEqual({ years: '0', months: '0' });
    expect(draftOf(role())).toEqual({ years: '', months: '' });
  });

  it('tells why a role cannot be ticked', () => {
    expect(disabledReason(role())).toBe('');
    expect(disabledReason(role({ status: ROLE_STATUS.NO_CUMPLE, selectable: false, specificMonths: 13 })))
      .toBe('La experiencia específica registrada (1 año 1 mes) no alcanza los 2 años que exige el rol.');
  });
});

describe('selectionProblem and buildBatchRoles', () => {
  const GEO = role({ roleCode: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', requiredYears: 3, specificMonths: 40, status: ROLE_STATUS.CUMPLE });
  const roles = [role(), GEO, NO_EXIGE];

  it('asks for at least one role', () => {
    expect(selectionProblem({}, roles, 120)).toBe('Seleccione al menos un rol.');
  });

  it('names the roles to review', () => {
    expect(selectionProblem({ ARQ_PROY: typed(''), GEOTEC: typed(3, 4) }, roles, 120))
      .toBe('Revise la experiencia específica de: ARQUITECTO PROYECTISTA.');
  });

  it('accepts a valid selection and builds the batch roles in catalog order', () => {
    const selection = { OTROS_ESP: typed(''), GEOTEC: typed(3, 4), ARQ_PROY: typed(2, 6) };
    expect(selectionProblem(selection, roles, 120)).toBe('');
    expect(buildBatchRoles(selection, roles)).toEqual([
      { role: 'ARQUITECTO PROYECTISTA', expirience: 30 },
      { role: 'INGENIERO CIVIL GEOTECNISTA', expirience: 40 },
      { role: 'OTROS PROFESIONALES ESPECIALISTAS', expirience: null },
    ]);
  });
});
