/**
 * INTEGRATION TESTS — Módulo Gestión de Solicitudes (FUN_MANAGE)
 *
 * Verifica:
 *   1. Renderizado del componente FUN_MANAGE con sus 3 tabs
 *   2. Tab "PROCESOS DIARIOS" — FUN_DAILY_COMPONENT (stubbed)
 *   3. Tab "ENTRADA DE DOCUMENTOS" — SUBMIT_X_FUN (stubbed)
 *   4. Tab "CARGA PROFESIONAL" — FUN_ASIGNS_COMPONENT (stubbed)
 *   5. Sección ACCIONES: CARGAR MACROTABLA card visible
 *   6. Navegación entre tabs
 *   7. FUN_WORKER_ASIGN stubs (3 instancias: law/arc/eng)
 *   8. Breadcrumb navigation presente
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock ALL heavy sub-components as stubs ────────────────────────────────
// FUN_MANAGE imports 18+ sub-components, each with own service dependencies.
// We stub them to isolate the FUN_MANAGE shell (tabs, breadcrumb, ACCIONES section).

vi.mock('../app/pages/user/fun_forms/components/fun_daily.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-daily-stub">FUN_DAILY_COMPONENT</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_asign.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-asigns-stub">FUN_ASIGNS_COMPONENT</div>,
}));

vi.mock('../app/pages/user/submit/submit_x_fun.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="submit-x-fun-stub">SUBMIT_X_FUN</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid={`fun-worker-asign-stub-${props.type || 'unknown'}`}>FUN_WORKER_ASIGN</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_c', () => ({
  __esModule: true,
  default: (props) => <div data-testid="func-stub">FUNC</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_g', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fung-stub">FUNG</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_n', () => ({
  __esModule: true,
  default: (props) => <div data-testid="funn-stub">FUNN</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_docs', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fund-stub">FUND</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_alertn', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-alert-stub">FUN_ALERT</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_clock', () => ({
  __esModule: true,
  default: (props) => <div data-testid="funclock-stub">FUNCLOCK</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_macrotable.', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-macrotable-stub">FUN_MACROTABLE</div>,
}));

vi.mock('../app/pages/user/records/record_arc', () => ({
  __esModule: true,
  default: (props) => <div data-testid="record-arc-stub">RECORD_ARC</div>,
}));

vi.mock('../app/pages/user/records/record_law', () => ({
  __esModule: true,
  default: (props) => <div data-testid="record-law-stub">RECORD_LAW</div>,
}));

vi.mock('../app/pages/user/records/record_ph', () => ({
  __esModule: true,
  default: (props) => <div data-testid="record-ph-stub">RECORD_PH</div>,
}));

vi.mock('../app/pages/user/records/record_eng', () => ({
  __esModule: true,
  default: (props) => <div data-testid="record-eng-stub">RECORD_ENG</div>,
}));

vi.mock('../app/pages/user/records/record_review', () => ({
  __esModule: true,
  default: (props) => <div data-testid="record-review-stub">RECORD_REVIEW</div>,
}));

vi.mock('../app/pages/user/expeditions/expedition.page', () => ({
  __esModule: true,
  default: (props) => <div data-testid="expedition-stub">EXPEDITION</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_reports/fun_gen.report', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-report-gen-stub">FUN_REPORT_GEN</div>,
}));

// ─── Mock services ─────────────────────────────────────────────────────────

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacro: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroSingle: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroRange: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroAsigns: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacronegative: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroClocksControl: vi.fn(() => Promise.resolve({ data: [] })),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
    loadSubmit2: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: {} })),
    getLastIdPublic: vi.fn(() => Promise.resolve({ data: '' })),
    getLastOA: vi.fn(() => Promise.resolve({ data: '' })),
    getAll_incDocs: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/users.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getAllWorkers: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// ─── Mock external libs ────────────────────────────────────────────────────

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.returnObjects) return {};
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) => <Component {...props} t={(k) => k} />,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen }) => {
    if (!isOpen) return null;
    return <div data-testid="mock-modal">{children}</div>;
  },
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
  nomens: 'CUB1',
}));

vi.mock('../app/components/global', () => {
  const React = require('react');
  return { GlobalStyles: () => <style data-testid="global-styles" /> };
});

// ─── Import component under test ──────────────────────────────────────────

import FUN_MANAGE from '../app/pages/user/funmanage.page';

// ─── Test helpers ──────────────────────────────────────────────────────────

const defaultProps = {
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
    bc_u7: 'Gestión',
  },
};

function renderFunManage(props = {}) {
  return render(
    <MemoryRouter>
      <FUN_MANAGE {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('FUN_MANAGE — Integración: Gestión de Solicitudes', () => {

  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('1. Renderiza sin crash y muestra título "GESTIÓN DE SOLICITUDES"', async () => {
    await act(async () => {
      renderFunManage();
    });
    expect(screen.getByText('Gestión de Solicitudes')).toBeInTheDocument();
  });

  test('2. Page header muestra título y subtítulo', async () => {
    await act(async () => {
      renderFunManage();
    });
    expect(screen.getByText('Gestión de Licencias')).toBeInTheDocument();
    expect(screen.getByText(/Detalle y administración/i)).toBeInTheDocument();
  });

  test('3. Los 3 tabs están presentes: PROCESOS DIARIOS, ENTRADA DE DOCUMENTOS, CARGA PROFESIONAL', async () => {
    await act(async () => {
      renderFunManage();
    });
    expect(screen.getByText('Procesos Diarios')).toBeInTheDocument();
    expect(screen.getByText('Entrada de Documentos')).toBeInTheDocument();
    expect(screen.getByText('Carga Profesional')).toBeInTheDocument();
  });

  test('4. Tab PROCESOS DIARIOS está activo por defecto — stub visible', async () => {
    await act(async () => {
      renderFunManage();
    });
    const dailyTabLabel = screen.getByText('Procesos Diarios');
    expect(dailyTabLabel).toBeInTheDocument();
    // The stub for FUN_DAILY_COMPONENT should be rendered in the active pane
    expect(screen.getByTestId('fun-daily-stub')).toBeInTheDocument();
  });

  test('5. Sección ACCIONES visible con cards: CARGAR MACROTABLA y REPORTES', async () => {
    await act(async () => {
      renderFunManage();
    });
    expect(screen.getByText('ACCIONES')).toBeInTheDocument();
    expect(screen.getByText('CARGAR MACROTABLA')).toBeInTheDocument();
    expect(screen.getByText('REPORTES')).toBeInTheDocument();
  });

  test('6. Botón CARGAR en MACROTABLA card presente', async () => {
    await act(async () => {
      renderFunManage();
    });
    const cargarButtons = screen.getAllByText('CARGAR');
    expect(cargarButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('7. Campos de fecha para MACROTABLA están presentes', async () => {
    const { container } = await act(async () => {
      return renderFunManage();
    });
    const dateInput1 = container.querySelector('#load_macro_date_1');
    const dateInput2 = container.querySelector('#load_macro_date_2');
    expect(dateInput1).toBeInTheDocument();
    expect(dateInput2).toBeInTheDocument();
    expect(dateInput1).toHaveAttribute('type', 'date');
    expect(dateInput2).toHaveAttribute('type', 'date');
  });

  test('8. Cambiar al tab ENTRADA DE DOCUMENTOS muestra stub SUBMIT_X_FUN', async () => {
    await act(async () => {
      renderFunManage();
    });
    const docTabLabel = screen.getByText('Entrada de Documentos');
    await act(async () => {
      fireEvent.click(docTabLabel);
    });
    const stubs = screen.getAllByTestId('submit-x-fun-stub');
    expect(stubs.length).toBeGreaterThanOrEqual(1);
  });

  test('9. Cambiar al tab CARGA PROFESIONAL muestra stub FUN_ASIGNS_COMPONENT', async () => {
    await act(async () => {
      renderFunManage();
    });
    const cargaTabLabel = screen.getByText('Carga Profesional');
    await act(async () => {
      fireEvent.click(cargaTabLabel);
    });
    expect(screen.getByTestId('fun-asigns-stub')).toBeInTheDocument();
  });

  test('10. FUNService.getAll_fun() no se llama al montar: la lista es diferida', async () => {
    // e2240166 moved retrievePublish() behind the urlParams guard on purpose:
    // the default tab is the daily one, which does not need the FUN list, so
    // the request waits until a tab that needs it mounts. FunManage.load-behavior
    // covers the on-demand half.
    const FUNService = (await import('../app/services/fun.service')).default;
    FUNService.getAll_fun.mockClear();

    await act(async () => {
      renderFunManage();
    });

    expect(FUNService.getAll_fun).not.toHaveBeenCalled();
  });

  test('11. Campos de fecha REPORTES están presentes', async () => {
    const { container } = await act(async () => {
      return renderFunManage();
    });
    const dateInput1 = container.querySelector('#load_macro_date_1_s');
    const dateInput2 = container.querySelector('#load_macro_date_2_s');
    expect(dateInput1).toBeInTheDocument();
    expect(dateInput2).toBeInTheDocument();
  });

  test('12. Renderiza sin crash con datos mock del servicio', async () => {
    const FUNService = (await import('../app/services/fun.service')).default;
    FUNService.getAll_fun.mockResolvedValueOnce({
      data: [
        { id: 1, id_public: 'CUB1-2024-0001', state: 1, version: 1, clock_payment: '2024-01-15' },
        { id: 2, id_public: 'CUB1-2024-0002', state: 5, version: 1, clock_payment: '2024-02-10' },
        { id: 3, id_public: 'CUB1-2024-0003', state: 50, version: 2, clock_payment: '2024-03-01' },
      ],
    });

    await act(async () => {
      renderFunManage();
    });

    expect(screen.getByText('Gestión de Solicitudes')).toBeInTheDocument();
  });
});
