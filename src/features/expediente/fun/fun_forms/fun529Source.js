// Where FUN 5.2.9 (specific experience in the role) comes from (no React).
// - BD PROFESIONALES knows the professional and has certified experiences for the role ("Experiencia" tab): 5.2.9 is
//   the server's certified sum, in whole months, and the user cannot change it.
// - Otherwise (no BD person, no certificates for that role, an older backend or BD unreachable): 5.2.9 is typed as
//   before. That value is only used to continue the radication; it is saved in fun_52s but does not feed BD
//   PROFESIONALES.
// TRANSITIONAL: the manual path exists while BD PROFESIONALES is being completed; remove it once every professional's
// experience is certified there.
import { professionalRegistryService } from '@/features/professional-registry';

export const CERTIFIED_SOURCE = 'certificados';

export const MANUAL_529_HINT = 'Valor digitado: solo se usa para continuar la radicación; no se registra en BD Profesionales.';

const certificatesText = (count) => `${count} ${count === 1 ? 'certificación' : 'certificaciones'}`;

export const certifiedHint = (count) => `Tomada de BD Profesionales (${certificatesText(count)}).`;

/**
 * The certified 5.2.9 of one role-eligibility entry, or null when the role has no certified experience (or the server
 * is older and does not compute it from certificates).
 * @returns {{ months: number, count: number }|null}
 */
export function certifiedExperience(role) {
  if (!role || role.specificSource !== CERTIFIED_SOURCE) return null;
  const count = Number(role.certificateCount) || 0;
  if (!count || role.specificMonths === null || role.specificMonths === undefined) return null;
  return { months: Number(role.specificMonths), count };
}

/** The eligibility entry of a 5.2.5 role label (the value stored in fun_52s.role), or null. */
export function roleOfLabel(eligibility, label) {
  const roles = Array.isArray(eligibility?.roles) ? eligibility.roles : [];
  return roles.find((role) => role.label === label) || null;
}

/** The certified 5.2.9 of a role label for a loaded eligibility answer, or null. */
export const certifiedForLabel = (eligibility, label) => certifiedExperience(roleOfLabel(eligibility, label));

const digitsOf = (value) => String(value ?? '').replace(/\D/g, '');
const MIN_CC_DIGITS = 5;

/**
 * The BD PROFESIONALES id of the person with exactly this cédula (5.2.2, dots allowed), through the FUN 5.2 search
 * endpoint. Resolves null when the cédula is too short, nobody or more than one person matches, or the search fails.
 */
export async function registryIdByCc(cc, { signal } = {}) {
  const digits = digitsOf(cc);
  if (digits.length < MIN_CC_DIGITS) return null;
  try {
    const response = await professionalRegistryService.lookup(digits, { signal });
    const items = Array.isArray(response?.data?.data) ? response.data.data : [];
    const matches = items.filter((item) => item.registryId && digitsOf(item.cc) === digits);
    return matches.length === 1 ? matches[0].registryId : null;
  } catch {
    return null;
  }
}
