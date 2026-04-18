import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { funServiceMock, pqrsServiceMock, userServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    loadSubmit2: vi.fn(() => Promise.resolve({ data: [] })),
    getAll_incDocs: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroAsigns: vi.fn(() => Promise.resolve({ data: [] })),
  },
  pqrsServiceMock: {
    loadSubmit: vi.fn(() => Promise.resolve({ data: [] })),
  },
  userServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: pqrsServiceMock,
}));

vi.mock('../app/services/users.service', () => ({
  __esModule: true,
  default: userServiceMock,
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));

vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  }),
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen }) => (isOpen ? React.createElement('div', null, children) : null),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser_finalDate: vi.fn(() => '2024-01-01'),
  dateParser_timeLeft: vi.fn(() => 5),
  formsParser1: vi.fn(() => 'Licencia'),
}));

vi.mock('../app/components/ui', () => ({
  MDBBadge: ({ children }) => React.createElement('span', null, children),
  MDBBtn: ({ children, onClick, ...props }) => React.createElement('button', { onClick, ...props }, children),
  MDBPopover: ({ children }) => React.createElement('div', null, children),
  MDBPopoverBody: ({ children }) => React.createElement('div', null, children),
  MDBTooltip: ({ children }) => React.createElement('span', null, children),
  MDBTypography: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ title }) => React.createElement('div', { 'data-testid': 'datatable-stub' }, title),
}));

vi.mock('../app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'table-expanded-stub' }),
}));

import SUBMIT_X_FUN from '../app/pages/user/submit/submit_x_fun.component';

describe('SUBMIT_X_FUN simple mode loading', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
    funServiceMock.loadSubmit2.mockClear();
    funServiceMock.getAll_incDocs.mockClear();
    funServiceMock.loadMacroAsigns.mockClear();
    pqrsServiceMock.loadSubmit.mockClear();
    userServiceMock.getAll.mockClear();
  });

  afterAll(() => {
    delete window.user;
  });

  test('skips heavy fetches on first render and loads the missing-docs list only when expanded', async () => {
    render(
      <MemoryRouter>
        <SUBMIT_X_FUN
          translation={{}}
          globals={{}}
          swaMsg={{ text_btn: 'OK' }}
          type="LIC"
          simple
          setSubtmitRows={vi.fn()}
          openModal={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/solicitudes para declarar en lydf/i)).toBeInTheDocument();
    expect(funServiceMock.loadSubmit2).not.toHaveBeenCalled();
    expect(userServiceMock.getAll).not.toHaveBeenCalled();
    expect(funServiceMock.getAll_incDocs).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(funServiceMock.getAll_incDocs).toHaveBeenCalledTimes(1);
    });
    expect(funServiceMock.loadSubmit2).not.toHaveBeenCalled();
    expect(userServiceMock.getAll).not.toHaveBeenCalled();
  });
});
