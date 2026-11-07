import { beforeEach, describe, expect, it, vi } from 'vitest';

const registry = vi.hoisted(() => ({ lookup: vi.fn() }));
const external = vi.hoisted(() => ({ getByName: vi.fn() }));
vi.mock('../../professional-registry', () => ({ professionalRegistryService: registry }));
vi.mock('../api/profesionals.service', () => ({ default: external }));

import { externalSource, fromExternal } from './externalSource';
import { fromRegistry, registrySource } from './registrySource';
import { searchTextOf, suggestionLabel, suggestionOptions, withUniqueKeys } from './professionalSuggestion';

describe('professional suggestion mappers', () => {
  it('maps a registry item, with unknown values as empty text and sanction unknown', () => {
    expect(fromRegistry({
      registryId: 7, givenNames: 'Ana María', surnames: 'Pérez', cc: '1098765432', email: null,
      phone: undefined, registration: 'A123', registrationDate: '2010-05-04', nameNeedsReview: 1,
    })).toEqual({
      key: 'registry:7', source: 'registry', registryId: 7, givenNames: 'Ana María', surnames: 'Pérez', cc: '1098765432',
      email: '', phone: '', registration: 'A123', registrationDate: '2010-05-04', sanction: undefined,
      nameNeedsReview: true,
    });
  });

  it('joins the external name parts without breaking on null second names', () => {
    const suggestion = fromExternal({
      id: 3, name: 'Ana', name_2: null, surname: 'Pérez', surname_2: 'Gómez', id_number: '1.098.765',
      number: 300, email: 'a@b.co', registration: 'A1', registration_date: '2001-02-03', sanction: 1,
    });
    expect(suggestion).toMatchObject({
      key: 'external:3', source: 'external', givenNames: 'Ana', surnames: 'Pérez Gómez', cc: '1.098.765',
      phone: '300', sanction: true, nameNeedsReview: false,
    });
    expect(fromExternal({ name: 'Ana' }, 4)).toMatchObject({ key: 'external:4', surnames: '', sanction: undefined });
    expect(fromExternal({ id: 1, sanction: 0 }).sanction).toBe(false);
    expect(fromExternal({ id: 1, sanction: 'true' }).sanction).toBe(true);
  });

  it('labels a suggestion in uppercase without accents, telling namesakes apart', () => {
    const base = fromRegistry({ registryId: 1, givenNames: 'Ana María', surnames: 'Pérez' });
    expect(suggestionLabel(base)).toBe('ANA MARIA PEREZ');
    expect(suggestionLabel({ ...base, cc: '123' })).toBe('ANA MARIA PEREZ · CC 123');
    expect(suggestionLabel({ ...base, registration: 'A1' })).toBe('ANA MARIA PEREZ · MAT. A1');
    expect(suggestionLabel({ ...base, cc: '123', registration: 'A1' })).toBe('ANA MARIA PEREZ · CC 123 · MAT. A1');
  });

  it('makes repeated keys unique and gives namesakes distinct option texts', () => {
    const twin = (key) => fromExternal({ id: key, name: 'Ana', surname: 'Pérez' });
    const unique = withUniqueKeys([twin(1), twin(1), twin(2)]);
    expect(unique.map((item) => item.key)).toEqual(['external:1', 'external:1#2', 'external:2']);
    expect(suggestionOptions([...unique, fromExternal({ id: 3, name: 'Luis', id_number: '9' })])).toEqual([
      { text: 'ANA PEREZ · #1', value: 'external:1' },
      { text: 'ANA PEREZ · #1#2', value: 'external:1#2' },
      { text: 'ANA PEREZ · #2', value: 'external:2' },
      { text: 'LUIS · CC 9', value: 'external:3' },
    ]);
  });

  it('searches only the name part of an edited option label', () => {
    expect(searchTextOf('ANA PEREZ · CC 12')).toBe('ANA PEREZ');
    expect(searchTextOf('ana pe')).toBe('ana pe');
    expect(searchTextOf(undefined)).toBe('');
  });
});

describe('professional search sources', () => {
  beforeEach(() => { registry.lookup.mockReset(); external.getByName.mockReset(); });

  it('asks the registry lookup with the signal and maps its data', async () => {
    const signal = new AbortController().signal;
    registry.lookup.mockResolvedValue({ data: { data: [{ registryId: 9, givenNames: 'Luis' }] } });
    const result = await registrySource.search('luis', { signal });
    expect(registry.lookup).toHaveBeenCalledWith('luis', { signal });
    expect(result.map((item) => item.key)).toEqual(['registry:9']);
    registry.lookup.mockResolvedValue({ data: null });
    expect(await registrySource.search('luis')).toEqual([]);
  });

  it('asks the external service by name without accents, quietly and cancellable', async () => {
    const signal = new AbortController().signal;
    external.getByName.mockResolvedValue({ data: [{ id: 2, name: 'José' }] });
    const result = await externalSource.search('José Núñez', { signal });
    expect(external.getByName).toHaveBeenCalledWith('Jose Nunez', { signal, skipErrorLog: true });
    expect(result.map((item) => item.key)).toEqual(['external:2']);
    external.getByName.mockResolvedValue({ data: 'not a list' });
    expect(await externalSource.search('jose')).toEqual([]);
  });
});
