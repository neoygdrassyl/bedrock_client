// FUN 5.2 multi-role picker rules (no React). A professional picked from BD PROFESIONALES comes with one eligibility
// entry per catalog role (GET /professional-registry/:id/role-eligibility). The server checks only that 5.2.9 does
// not exceed the general experience, so these rules decide what the form lets the user submit. Falling short of the
// required years never blocks a role: it is a warning, and the legal review (Inf. Jurídico) marks it RECHAZADO.
import { formatYearsMonths, readSpecificExperience } from '@/shared/utils/specificExperience';

export const ROLE_STATUS = {
  CUMPLE: 'CUMPLE',
  NO_CUMPLE: 'NO_CUMPLE',
  SIN_REGISTRO: 'SIN_REGISTRO',
  NO_EXIGE: 'NO_EXIGE',
};

export const STATUS_TEXT = {
  [ROLE_STATUS.CUMPLE]: 'Cumple',
  [ROLE_STATUS.NO_CUMPLE]: 'No cumple',
  [ROLE_STATUS.SIN_REGISTRO]: 'Sin registro',
  [ROLE_STATUS.NO_EXIGE]: 'No exige experiencia',
};

export const EMPTY_DRAFT = { years: '', months: '' };

// The 5.2.9 inputs of a role, pre-filled with the specific experience registered for it.
export function draftOf(role) {
  if (role.specificMonths === null || role.specificMonths === undefined) return EMPTY_DRAFT;
  return { years: String(Math.trunc(role.specificMonths / 12)), months: String(role.specificMonths % 12) };
}

// The years a role requires, as the picker shows them.
export const requiredYearsText = (years) => (years === null || years === undefined ? 'No exige' : `${years} ${years === 1 ? 'año' : 'años'}`);

function statusFor(requiredYears, months) {
  if (requiredYears === null || requiredYears === undefined) return ROLE_STATUS.NO_EXIGE;
  if (months === null) return ROLE_STATUS.SIN_REGISTRO;
  return months >= requiredYears * 12 ? ROLE_STATUS.CUMPLE : ROLE_STATUS.NO_CUMPLE;
}

/**
 * The state of one role row given the 5.2.9 typed for it (`typed`: { years, months } as text).
 * `status` is recomputed from the typed value; `error` blocks submitting the role; `warning` (falling short of the
 * required years) does not; `months` is what 5.2.9 sends (null when left blank).
 * @returns {{ status: string, error: string, warning: string, months: number|null }}
 */
export function roleRowState(role, typed, generalMonths) {
  const read = readSpecificExperience(typed?.years, typed?.months, null);
  if (read.problem) return { status: role.status, error: read.problem, warning: '', months: null };
  const months = read.empty ? null : read.months;
  const status = statusFor(role.requiredYears, months);
  let error = '';
  let warning = '';
  if (status === ROLE_STATUS.SIN_REGISTRO) {
    error = 'Indique la experiencia específica (5.2.9) en este rol.';
  } else if (months !== null && generalMonths !== null && generalMonths !== undefined && months > generalMonths) {
    error = `La experiencia específica (${formatYearsMonths(months)}) no puede superar la experiencia general (${formatYearsMonths(generalMonths)}).`;
  } else if (status === ROLE_STATUS.NO_CUMPLE) {
    warning = `La experiencia específica (${formatYearsMonths(months)}) no alcanza los ${requiredYearsText(role.requiredYears)} `
      + 'que exige el rol. Se puede añadir; la revisión jurídica lo marcará como RECHAZADO.';
  }
  return { status, error, warning, months };
}

/**
 * Why the selection cannot be submitted, or '' when it can. `selection`: { [roleCode]: typed } of the ticked roles.
 */
export function selectionProblem(selection, roles, generalMonths) {
  const picked = roles.filter((role) => selection[role.roleCode]);
  if (!picked.length) return 'Seleccione al menos un rol.';
  const invalid = picked.filter((role) => roleRowState(role, selection[role.roleCode], generalMonths).error);
  return invalid.length ? `Revise la experiencia específica de: ${invalid.map((role) => role.label).join(', ')}.` : '';
}

/**
 * The `roles` of POST /fun/fun52/batch for a valid selection, in catalog order: the role label and 5.2.9 in months
 * (null when left blank).
 * @returns {{ role: string, expirience: number|null }[]}
 */
export function buildBatchRoles(selection, roles) {
  return roles
    .filter((role) => selection[role.roleCode])
    .map((role) => {
      const read = readSpecificExperience(selection[role.roleCode].years, selection[role.roleCode].months, null);
      return { role: role.label, expirience: read.empty || read.problem ? null : read.months };
    });
}
