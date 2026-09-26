import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const hoisted = vi.hoisted(() => ({
  create: vi.fn(() => Promise.resolve({ data: 'OK' })),
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: {
    create: hoisted.create,
    getlastid: vi.fn(() => Promise.resolve({ data: [{ id_publico: 'PQRS-0001' }] })),
  },
}));

vi.mock('../app/utils/BusinessDaysCol', () => ({
  DiasHabilesColombia: class {
    esHabil() {
      return true;
    }

    siguienteDiaHabil(date) {
      return date;
    }
  },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import PQRSNEW from '../app/pages/user/pqrs/newpqrs';

describe('PQRSNEW attachments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, name: 'Playwright', surname: 'Test' };
  });

  afterEach(() => {
    delete window.user;
  });

  test('adds an attachment field without submitting the PQRS form', () => {
    render(
      <PQRSNEW
        translation={{}}
        translation_form={{ form_radication_chanel: ['WEB'] }}
        swaMsg={{ title_wait: 'Espere', text_wait: 'Procesando' }}
        globals={{}}
        refreshRequested={vi.fn()}
      />,
    );

    fireEvent.change(document.querySelector('#pqrs_time_1'), { target: { value: '2026-07-24' } });
    fireEvent.change(document.querySelector('#pqrs_time_10'), { target: { value: '10:00' } });

    const addButtons = screen.getAllByRole('button', { name: /AÑADIR OTRO/i });
    fireEvent.click(addButtons.at(-1));

    expect(screen.getByText('DOCUMENTO ANEXO N° 1')).toBeVisible();
    expect(hoisted.create).not.toHaveBeenCalled();
  });
});
