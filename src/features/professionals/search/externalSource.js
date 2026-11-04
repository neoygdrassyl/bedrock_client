import profesionalsService from '../api/profesionals.service';
import { joinNames, textOf, withoutAccents } from './professionalSuggestion';

const SANCTIONED = [true, 1, '1', 'true'];
const sanctionOf = (value) => (value === null || value === undefined || value === '' ? undefined : SANCTIONED.includes(value));

/** @returns {import('./professionalSuggestion').ProfessionalSuggestion} */
export const fromExternal = (worker, index) => ({
  key: `external:${worker.id ?? worker.id_number ?? index}`,
  source: 'external',
  givenNames: joinNames(worker.name, worker.name_2),
  surnames: joinNames(worker.surname, worker.surname_2),
  cc: textOf(worker.id_number),
  email: textOf(worker.email),
  phone: textOf(worker.number),
  registration: textOf(worker.registration),
  registrationDate: textOf(worker.registration_date),
  sanction: sanctionOf(worker.sanction),
  nameNeedsReview: false,
});

/** The external professionals service (VITE_API_PROF_URL), searched by name without accents as before. */
export const externalSource = {
  name: 'external',
  async search(query, { signal } = {}) {
    const response = await profesionalsService.getByName(withoutAccents(query), { signal, skipErrorLog: true });
    return Array.isArray(response?.data) ? response.data.map(fromExternal) : [];
  },
};
