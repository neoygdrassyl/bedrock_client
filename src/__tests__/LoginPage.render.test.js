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
    i18n: { changeLanguage: vi.fn() }
  }),
}));

vi.mock('react-google-recaptcha', () => {
  const React = require('react');
  const ReCAPTCHA = ({ ref, sitekey, size }) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: vi.fn(),
    }));
    return <div data-testid="recaptcha-mock" data-sitekey={sitekey} data-size={size} />;
  };
  return { default: ReCAPTCHA };
});

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
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

const originalCaptchaSiteKey = import.meta.env.VITE_GOOGLE_CAPTCHA_HTML;
const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function renderLogin() {
  return render(
    <MemoryRouter future={routerFutureFlags}>
      <LoginPage signin={vi.fn()} />
    </MemoryRouter>
  );
}

describe('LoginPage (redesigned)', () => {
  beforeEach(() => {
    import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = 'test-site-key';
  });

  afterEach(() => {
    import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = originalCaptchaSiteKey;
  });

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

  it('passes the configured site key to the invisible recaptcha', () => {
    renderLogin();
    expect(screen.getByTestId('recaptcha-mock')).toHaveAttribute('data-sitekey', 'test-site-key');
    expect(screen.getByTestId('recaptcha-mock')).toHaveAttribute('data-size', 'invisible');
  });

  it('does not mount recaptcha when the site key is missing', () => {
    import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = '';

    renderLogin();

    expect(screen.queryByTestId('recaptcha-mock')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/captcha no configurado/i);
  });
});
