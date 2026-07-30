import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getLastId: vi.fn(() => Promise.resolve({ data: [] })),
    verifyid: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    getLastIdPublic: vi.fn(() => Promise.resolve({ data: [] })),
    getLastOA: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/pages/user/submit/submit_anex.component', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('../app/pages/user/submit/submit_list.component', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  formsParser1: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/icon', () => ({
  Icon: () => <span aria-hidden="true" />,
}));

vi.mock('../app/components/ObservationPanel', () => ({
  default: ({ textareaProps }) => <textarea {...textareaProps} />,
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalConfirm: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import SUBMIT_MANAGE from '../app/pages/user/submit/submit_manage';

describe('SUBMIT_MANAGE request selector', () => {
  beforeEach(() => {
    window.user = { id: 1, name: 'Playwright', surname: 'Test' };
  });

  afterEach(() => {
    delete window.user;
  });

  test('shows the full request number in a widened suggestion menu', () => {
    render(
      <SUBMIT_MANAGE
        translation={{}}
        swaMsg={{}}
        globals={{}}
        closeModal={vi.fn()}
        refreshList={vi.fn()}
        requestOptions={[{ id_related: '680001-1-26-0148' }]}
      />,
    );

    const input = screen.getByLabelText('2. Número de solicitud');
    fireEvent.focus(input);

    expect(screen.getByRole('option', { name: '680001-1-26-0148' })).toBeVisible();
    expect(screen.getByRole('listbox')).toHaveClass('min-w-[250px]');
  });
});
