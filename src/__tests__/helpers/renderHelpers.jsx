/**
 * Helpers de renderizado para tests de integración.
 * Provee wrappers con MemoryRouter, props por defecto, y utilidades comunes.
 *
 * Uso:
 *   import { renderWithRouter, defaultProps, setWindowUser } from './helpers/renderHelpers';
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Props por defecto que la mayoría de páginas reciben desde App.js.
 * Incluye translation, swaMsg, globals, y breadCrums genéricos.
 */
export const defaultProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    text_btn: 'OK',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: { id: '1' },
  breadCrums: {
    bc_01: 'Inicio',
    bc_u1: 'Dashboard',
  },
};

/**
 * Establece window.user que muchos componentes consultan para role-gating.
 * @param {Object} userData - Datos del usuario
 * @returns {Object} - El objeto user establecido
 */
export function setWindowUser(userData = {}) {
  const user = {
    roleId: 1,
    name: 'Admin Test',
    id: 1,
    ...userData,
  };
  window.user = user;
  return user;
}

/**
 * Limpia window.user después de los tests.
 */
export function clearWindowUser() {
  delete window.user;
}

/**
 * Renderiza un componente dentro de MemoryRouter con props por defecto.
 * @param {React.ComponentType} Component - Componente a renderizar
 * @param {Object} props - Props adicionales (se mezclan con defaultProps)
 * @param {Object} options - { route, userRole, breadCrums }
 */
export function renderWithRouter(Component, props = {}, options = {}) {
  const { route = '/', userRole = 1, breadCrums = {} } = options;

  setWindowUser({ roleId: userRole });

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Component
        {...defaultProps}
        breadCrums={{ ...defaultProps.breadCrums, ...breadCrums }}
        {...props}
      />
    </MemoryRouter>
  );
}

/**
 * Establece las variables de entorno de test.
 */
export function setTestEnv() {
  import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
  import.meta.env.VITE_GLOBAL_ID = '1';
  import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
}
