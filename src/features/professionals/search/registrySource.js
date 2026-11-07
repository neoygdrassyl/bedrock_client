import { professionalRegistryService } from '../../professional-registry';
import { textOf } from './professionalSuggestion';

/** @returns {import('./professionalSuggestion').ProfessionalSuggestion} */
export const fromRegistry = (item) => ({
  key: `registry:${item.registryId}`,
  source: 'registry',
  registryId: item.registryId,
  givenNames: textOf(item.givenNames),
  surnames: textOf(item.surnames),
  cc: textOf(item.cc),
  email: textOf(item.email),
  phone: textOf(item.phone),
  registration: textOf(item.registration),
  registrationDate: textOf(item.registrationDate),
  sanction: undefined,
  nameNeedsReview: Boolean(item.nameNeedsReview),
});

/** BD PROFESIONALES (main API, with the session JWT). */
export const registrySource = {
  name: 'registry',
  async search(query, { signal } = {}) {
    const response = await professionalRegistryService.lookup(query, { signal });
    const items = response?.data?.data;
    return Array.isArray(items) ? items.map(fromRegistry) : [];
  },
};
