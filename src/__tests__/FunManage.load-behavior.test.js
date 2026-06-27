import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { funServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  regexChecker_isPh: vi.fn(() => false),
  regexChecker_isOA: vi.fn(() => false),
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen }) => (isOpen ? React.createElement('div', null, children) : null),
}));

vi.mock('../app/components/ui', () => ({
  MDBRow: ({ children }) => React.createElement('div', null, children),
  MDBCol: ({ children }) => React.createElement('div', null, children),
  MDBCard: ({ children }) => React.createElement('div', null, children),
  MDBCardBody: ({ children }) => React.createElement('div', null, children),
  MDBCardTitle: ({ children }) => React.createElement('div', null, children),
  MDBBtn: ({ children, onClick, ...props }) => React.createElement('button', { onClick, ...props }, children),
  MDBBreadcrumb: ({ children }) => React.createElement('nav', null, children),
  MDBBreadcrumbItem: ({ children }) => React.createElement('div', null, children),
  MDBTabs: ({ children }) => React.createElement('div', null, children),
  MDBTabsItem: ({ children }) => React.createElement('div', null, children),
  MDBTabsLink: ({ children, onClick }) => React.createElement('button', { onClick, type: 'button' }, children),
  MDBTabsContent: ({ children }) => React.createElement('div', null, children),
  MDBTabsPane: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('../app/pages/user/fun_forms/fun_c', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-c-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_g', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-g-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_n', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-n-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_docs', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-docs-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_alertn', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-alert-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_clock', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-clock-modal' }),
}));

vi.mock('../app/pages/user/records/record_arc', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'record-arc-modal' }),
}));

vi.mock('../app/pages/user/records/record_law', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'record-law-modal' }),
}));

vi.mock('../app/pages/user/records/record_eng', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'record-eng-modal' }),
}));

vi.mock('../app/pages/user/records/record_ph', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'record-ph-modal' }),
}));

vi.mock('../app/pages/user/records/record_review', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'record-review-modal' }),
}));

vi.mock('../app/pages/user/expeditions/expedition.page', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'expedition-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_reports/fun_gen.report', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-report-modal' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_macrotable.', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-macrotable-modal' }),
}));

vi.mock('../app/pages/user/submit/submit_x_fun.component', () => ({
  __esModule: true,
  default: ({ simple }) =>
    React.createElement('div', { 'data-testid': simple ? 'submit-summary' : 'submit-docs-tab' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({
  __esModule: true,
  default: ({ type }) => React.createElement('div', { 'data-testid': `worker-${type}` }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_daily.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'daily-tab' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_asign.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'assigns-tab' }),
}));

import FUN_MANAGE from '../app/pages/user/funmanage.page';

const breadCrums = {
  bc_01: 'Inicio',
  bc_u1: 'Panel',
  bc_u7: 'Gestion',
};

describe('FUN_MANAGE initial load behavior', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
    funServiceMock.getAll_fun.mockClear();
    funServiceMock.get.mockClear();
  });

  afterAll(() => {
    delete window.user;
  });

  test('mounts only the active tab on first paint and mounts the rest on demand', async () => {
    render(
      <MemoryRouter>
        <FUN_MANAGE
          translation={{}}
          swaMsg={{}}
          globals={{}}
          breadCrums={breadCrums}
        />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('daily-tab')).toBeInTheDocument();
    expect(screen.getByTestId('submit-summary')).toBeInTheDocument();
    expect(screen.queryByTestId('submit-docs-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('assigns-tab')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /entrada de documentos/i }));
    expect(await screen.findByTestId('submit-docs-tab')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /carga profesional/i }));
    expect(await screen.findByTestId('assigns-tab')).toBeInTheDocument();
  });
});
