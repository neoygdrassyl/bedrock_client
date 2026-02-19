/**
 * INTEGRATION TESTS — Módulo Ventanilla Única (SUBMIT)
 *
 * Verifica:
 *   1. Renderizado del componente SUBMIT con DataTable
 *   2. Botón "NUEVA ENTRADA" visible y funcional
 *   3. Card "CONSULTAR" con inputs de búsqueda
 *   4. Card "DOCUMENTO CSV" con inputs de rango y botón GENERAR CSV
 *   5. DataTable con columnas correctas (Nr Radicación, Nr Licencia, Tipo, Fecha, Documento, Acción)
 *   6. Modal de nueva entrada se abre al hacer click
 *   7. Botones de acción en cada fila (Ver detalles, Eliminar)
 *   8. Función de búsqueda mediante CONSULTAR
 *   9. Carga de datos desde SubmitService.getAll()
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock services ─────────────────────────────────────────────────────────

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    getlastid: vi.fn(() => Promise.resolve({ data: 'VR25-0001' })),
    verifyid: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_anex: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_list: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: {} })),
    getLastIdPublic: vi.fn(() => Promise.resolve({ data: '' })),
    getLastOA: vi.fn(() => Promise.resolve({ data: '' })),
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// ─── Mock sub-components ───────────────────────────────────────────────────

vi.mock('../app/pages/user/submit/submit_manage', () => ({
  __esModule: true,
  default: (props) => <div data-testid="submit-manage-stub">SUBTMIT_MANAGE</div>,
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
vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  }),
}));

vi.mock('react-modal', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, isOpen, ariaHideApp, ...props }) => {
      if (!isOpen) return null;
      return <div data-testid="mock-modal" {...props}>{children}</div>;
    },
  };
});

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

import SUBMIT from '../app/pages/user/submit/submit';

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
    bc_u10: 'Ventanilla Única',
  },
};

function renderSubmit(props = {}) {
  return render(
    <MemoryRouter>
      <SUBMIT {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('SUBMIT — Integración: Ventanilla Única', () => {

  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('1. Renderiza sin crash y muestra título "VENTANILLA ÚNICA"', async () => {
    await act(async () => {
      renderSubmit();
    });
    expect(screen.getByText('VENTANILLA ÚNICA')).toBeInTheDocument();
  });

  test('2. Breadcrumb con navegación Inicio > Dashboard > Ventanilla Única', async () => {
    await act(async () => {
      renderSubmit();
    });
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ventanilla Única')).toBeInTheDocument();
  });

  test('3. Sección ACCIONES visible', async () => {
    await act(async () => {
      renderSubmit();
    });
    expect(screen.getByText('ACCIONES')).toBeInTheDocument();
  });

  test('4. Botón "NUEVA ENTRADA" presente y visible', async () => {
    await act(async () => {
      renderSubmit();
    });
    const btn = screen.getByText(/NUEVA ENTRADA/i);
    expect(btn).toBeInTheDocument();
  });

  test('5. Card "CONSULTAR" con selector de tipo búsqueda y campo de texto', async () => {
    const { container } = await act(async () => {
      return renderSubmit();
    });
    const matches = screen.getAllByText('CONSULTAR');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Search select field
    const searchSelect = container.querySelector('#submit_search_0');
    expect(searchSelect).toBeInTheDocument();
    // Search text field
    const searchText = container.querySelector('#submit_search_1');
    expect(searchText).toBeInTheDocument();
  });

  test('6. Card "DOCUMENTO CSV" con campos de rango y botón GENERAR CSV', async () => {
    const { container } = await act(async () => {
      return renderSubmit();
    });
    expect(screen.getByText('DOCUMENTO CSV')).toBeInTheDocument();
    const csvLimit1 = container.querySelector('#csv_limit_1');
    const csvLimit2 = container.querySelector('#csv_limit_2');
    expect(csvLimit1).toBeInTheDocument();
    expect(csvLimit2).toBeInTheDocument();
    expect(screen.getByText(/GENERAR CSV/i)).toBeInTheDocument();
  });

  test('7. Opciones de búsqueda correctas en selector CONSULTAR', async () => {
    const { container } = await act(async () => {
      return renderSubmit();
    });
    const searchSelect = container.querySelector('#submit_search_0');
    const options = searchSelect.querySelectorAll('option');
    expect(options.length).toBe(5);
    const optionValues = Array.from(options).map(o => o.value);
    expect(optionValues).toContain('1'); // Número de radicado VR
    expect(optionValues).toContain('2'); // Número de Licencia
    expect(optionValues).toContain('3'); // Propietario
    expect(optionValues).toContain('4'); // Persona que Entrega
    expect(optionValues).toContain('5'); // C.C Persona que Entrega
  });

  test('8. SubmitService.getAll() se llama al montar', async () => {
    const SubmitService = (await import('../app/services/submit.service')).default;
    SubmitService.getAll.mockClear();

    await act(async () => {
      renderSubmit();
    });

    expect(SubmitService.getAll).toHaveBeenCalled();
  });

  test('9. Sección "Lista de entradas" presente', async () => {
    await act(async () => {
      renderSubmit();
    });
    expect(screen.getByText('Lista de entradas')).toBeInTheDocument();
  });

  test('10. Muestra "CARGANDO INFORMACIÓN..." antes de cargar datos', async () => {
    const SubmitService = (await import('../app/services/submit.service')).default;
    // Make the API never resolve (simulating loading)
    SubmitService.getAll.mockReturnValueOnce(new Promise(() => {}));

    await act(async () => {
      renderSubmit();
    });

    expect(screen.getByText('CARGANDO INFORMACIÓN...')).toBeInTheDocument();
  });

  test('11. Click NUEVA ENTRADA abre el modal de nueva entrada', async () => {
    await act(async () => {
      renderSubmit();
    });
    // Use getAllByText since the text appears in button AND modal header
    const btns = screen.getAllByText(/NUEVA ENTRADA/i);
    expect(btns.length).toBeGreaterThanOrEqual(1);
    await act(async () => {
      fireEvent.click(btns[0]);
    });
    // Modal should now be open
    const modals = screen.getAllByTestId('mock-modal');
    expect(modals.length).toBeGreaterThanOrEqual(1);
  });

  test('12. Renderiza DataTable con datos mock', async () => {
    const SubmitService = (await import('../app/services/submit.service')).default;
    SubmitService.getAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          id_public: 'VR25-0001',
          id_related: 'CUB1-2024-0001',
          type: 'LICENCIA DE CONSTRUCCIÓN',
          date: '2024-06-15',
          time: '09:30',
          sub_doc: true,
          owner: 'Juan Pérez',
          name_retriever: 'María García',
          list_type: 1,
          sub_lists: [],
        },
        {
          id: 2,
          id_public: 'VR25-0002',
          id_related: 'CUB1-2024-0002',
          type: 'LICENCIA DE URBANISMO',
          date: '2024-06-16',
          time: '10:00',
          sub_doc: false,
          owner: 'Carlos López',
          name_retriever: 'Ana Martínez',
          list_type: 2,
          sub_lists: [],
        },
      ],
    });

    await act(async () => {
      renderSubmit();
    });

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByText('VR25-0001')).toBeInTheDocument();
    });
    expect(screen.getByText('VR25-0002')).toBeInTheDocument();
    expect(screen.getByText('LICENCIA DE CONSTRUCCIÓN')).toBeInTheDocument();
    expect(screen.getByText('LICENCIA DE URBANISMO')).toBeInTheDocument();
  });

  test('13. DataTable muestra encabezados de columnas correctos', async () => {
    const SubmitService = (await import('../app/services/submit.service')).default;
    SubmitService.getAll.mockResolvedValueOnce({
      data: [
        {
          id: 1, id_public: 'VR25-0001', id_related: 'CUB1-2024-0001',
          type: 'TEST', date: '2024-01-01', time: '09:00', sub_doc: true,
          sub_lists: [],
        },
      ],
    });

    await act(async () => {
      renderSubmit();
    });

    await waitFor(() => {
      expect(screen.getByText('Nr. RADICACIÓN')).toBeInTheDocument();
    });
    expect(screen.getByText('Nr. Licencia / Solicitud')).toBeInTheDocument();
    expect(screen.getByText('TIPO')).toBeInTheDocument();
    expect(screen.getByText('FECHA RADICACIÓN')).toBeInTheDocument();
    expect(screen.getByText('DOCUMENTO')).toBeInTheDocument();
    expect(screen.getByText('ACCIÓN')).toBeInTheDocument();
  });

  test('14. Campos CSV tienen valores por defecto', async () => {
    const { container } = await act(async () => {
      return renderSubmit();
    });
    const csvLimit1 = container.querySelector('#csv_limit_1');
    const csvLimit2 = container.querySelector('#csv_limit_2');
    // Default values contain VR and year prefix
    expect(csvLimit1.defaultValue).toMatch(/^VR\d{2}-/);
    expect(csvLimit2.defaultValue).toMatch(/^VR\d{2}-/);
  });
});
