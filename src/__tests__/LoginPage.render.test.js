/**
 * Render tests — LoginPage redesigned (split-screen layout)
 * Verifies the new login page renders correctly with modern UI.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock external dependencies used by LoginPage
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
}));

vi.mock('react-google-recaptcha', () => {
  const React = require('react');
  const ReCAPTCHA = ({ ref, ...props }) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: vi.fn(),
    }));
    return <div data-testid="recaptcha-mock" />;
  };
  return { default: ReCAPTCHA };
});

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));
vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  }),
}));

vi.mock('@/app/components/jsons/vars', () => ({
  infoCud: {
    name: 'CURADURIA URBANA 1',
    city: 'Bucaramanga',
    state: 'Santander',
    dir: 'LUIS CARLOS PARRA SALAZAR',
    icon: 'logo-mock.png',
  },
}));

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

import LoginPage from '@/app/pages/auth/LoginPage';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage signin={vi.fn()} />
    </MemoryRouter>
  );
}

describe('LoginPage (redesigned)', () => {
  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('renders the institution name', () => {
    renderLogin();
    // Appears in both desktop brand panel and mobile header
    const names = screen.getAllByText(/curaduria/i);
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  it('preserves #email and #password IDs for e2e compatibility', () => {
    renderLogin();
    expect(document.querySelector('#email')).toBeInTheDocument();
    expect(document.querySelector('#password')).toBeInTheDocument();
  });

  it('renders the institution logo', () => {
    renderLogin();
    // Two logos: one in desktop brand panel, one in mobile header
    const logos = screen.getAllByAltText(/logo/i);
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });
});
