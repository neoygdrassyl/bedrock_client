import DataService from '../app/services/data.service';

describe('DataService sesión local de autenticación', () => {
  beforeEach(() => {
    localStorage.clear();
    window.user = null;
  });

  test('guarda token y restaura usuario desde localStorage', () => {
    const user = {
      id: 7,
      name: 'Diego',
      surname: 'Gomez',
      role: 'Admin',
      role_short: 'ADM',
      roleDesc: 'Administrador',
      active: 1,
      roleId: 1,
    };

    DataService.saveToken('jwt-token');
    DataService.setUser(user);
    window.user = null;

    expect(DataService.restoreSession()).toBe(true);
    expect(DataService.getToken()).toBe('jwt-token');
    expect(DataService.getUserData()).toMatchObject(user);
  });

  test('setUserNull limpia usuario y token', () => {
    DataService.saveToken('jwt-token');
    DataService.setUser({ id: 7, name: 'Diego', surname: 'Gomez' });

    DataService.setUserNull();

    expect(window.user).toBeNull();
    expect(localStorage.getItem('dovela_user')).toBeNull();
    expect(localStorage.getItem('dovela_token')).toBeNull();
  });
});