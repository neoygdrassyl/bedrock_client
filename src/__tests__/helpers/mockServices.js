/**
 * Factorías de mock para services.
 * Permiten crear mocks de service con datos realistas y personalizables.
 *
 * Uso:
 *   import { createMockService, createMockFunService } from './helpers/mockServices';
 */

/**
 * Crea un mock de service genérico con métodos CRUD estándar.
 * @param {Object} overrides - Métodos a sobreescribir o agregar
 */
export function createMockService(overrides = {}) {
  return {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
    ...overrides,
  };
}

/**
 * Crea mock para fun.service.js (el más extenso, 200+ métodos).
 * Solo incluye los métodos más usados en tests.
 */
export function createMockFunService(overrides = {}) {
  return {
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: {} })),
    getLastIdPublic: vi.fn(() => Promise.resolve({ data: '' })),
    getLastOA: vi.fn(() => Promise.resolve({ data: '' })),
    getAll_fun_6_h: vi.fn(() => Promise.resolve({ data: [] })),
    create_fun: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_fun: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_fun: vi.fn(() => Promise.resolve({ data: 'OK' })),
    ...overrides,
  };
}

/**
 * Crea mock para submit.service.js.
 */
export function createMockSubmitService(overrides = {}) {
  return {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    getlastid: vi.fn(() => Promise.resolve({ data: 'VR26-0001' })),
    verifyid: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
    ...overrides,
  };
}

/**
 * Crea mock para archive.service.js.
 */
export function createMockArchiveService(overrides = {}) {
  return {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
    ...overrides,
  };
}

/**
 * Crea mock para record_*.service.js (ENG, LAW, ARC, PH).
 */
export function createMockRecordService(overrides = {}) {
  return {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    getByFun: vi.fn(() => Promise.resolve({ data: [] })),
    ...overrides,
  };
}
