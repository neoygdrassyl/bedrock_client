import FUNService from './fun.service';

const textOf = (value) => (value === null || value === undefined ? '' : String(value).trim());

const SANCTIONED = [true, 1, '1', 'true'];
const sanctionOf = (value) => (value === null || value === undefined || value === '' ? undefined : SANCTIONED.includes(value));

/**
 * A professional as this curaduría's own FUN 5.2 history wrote them (name and surname already split).
 * @returns {import('../../professionals/search/professionalSuggestion').ProfessionalSuggestion}
 */
export const fromInternal = (row, index) => ({
  key: `internal:${textOf(row.id_number) || index}`,
  source: 'internal',
  givenNames: textOf(row.name),
  surnames: textOf(row.surname),
  cc: textOf(row.id_number),
  email: textOf(row.email),
  phone: textOf(row.number),
  registration: textOf(row.registration),
  registrationDate: textOf(row.registration_date).slice(0, 10),
  sanction: sanctionOf(row.sanction),
  nameNeedsReview: false,
});

/** FUN 5.2 history of the main API (`consult_Profesional`), as a professional search source. */
export const internalProfessionalSource = {
  name: 'internal',
  async search(query, { signal } = {}) {
    const response = await FUNService.consult_Profesional(query, { signal, skipErrorLog: true });
    return Array.isArray(response?.data) ? response.data.map(fromInternal) : [];
  },
};
