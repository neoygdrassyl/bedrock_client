import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import DataService from '@/app/services/data.service';

describe('DataService session shape', () => {
  beforeEach(() => {
    window.user = {
      id: 7,
      name: 'Diego',
      surname: 'Lopez',
      role: 'Administrador',
      role_short: 'ADMIN',
      roleDesc: 'Admin completo',
      active: 1,
      roleId: 1,
      name_short: 'Diego Lopez',
      name_full: 'Diego Andres Lopez Perez',
    };
  });

  afterEach(() => {
    window.user = null;
    localStorage.clear();
  });

  it('preserves shell session fields required after restore', () => {
    expect(DataService.getUserData()).toMatchObject({
      id: 7,
      role: 'Administrador',
      role_short: 'ADMIN',
      roleDesc: 'Admin completo',
      name_short: 'Diego Lopez',
      name_full: 'Diego Andres Lopez Perez',
    });
  });
});
