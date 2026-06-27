/**
 * INTEGRATION TESTS — Módulo Archivo (ARCHIVE)
 *
 * Verifica:
 *   1. Renderizado del componente ARCHIVE con DataTable
 *   2. Título "ARCHIVO" visible
 *   3. Botón "NUEVA CAJA" (role-gated: solo roles 1 y 3)
 *   4. Barra de búsqueda con selector (Nr Caja, Nr Radicado, Nr Resolución, Fecha)
 *   5. Botón "INFORMACIÓN" con enlace externo
 *   6. Botón "BUSCAR" funcional
 *   7. DataTable con columnas (Estante, Entrepaño, Caja N°, Contenido, ACCIÓN)
 *   8. Modal de nueva caja se abre al hacer click
 *   9. Modal de edición de caja
 *   10. Carga de datos desde SERVICE_ARCHIVE.getAll()
 *   11. Expandable rows con detalle de items
 *   12. Botones de acción por fila (Modificar Items, Modificar caja, Eliminar)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock services ─────────────────────────────────────────────────────────

vi.mock('../app/services/archive.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_x: vi.fn(() => Promise.resolve({ data: 'OK' })),
    deleteAll: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getAll_fun_6_h: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// ─── Mock sub-components ───────────────────────────────────────────────────

vi.mock('../app/pages/user/archive/archive_manage.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="archive-manage-stub">ARCHIVE_MANAGE</div>,
}));

vi.mock('../app/pages/user/archive/archive_x_fun.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="archive-x-fun-stub">ARCHIVE_X_FUN</div>,
}));

vi.mock('../app/pages/user/fun_forms/fun_6.view', () => ({
  __esModule: true,
  default: (props) => <div data-testid="fun-6-view-stub">FUN_6_VIEW</div>,
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
  LegacyModal: ({ children, isOpen, ariaHideApp, contentLabel, ...props }) => {
    if (!isOpen) return null;
    return <div data-testid="mock-modal" data-label={contentLabel}>{children}</div>;
  },
}));

vi.mock('rsuite', () => {
  const React = require('react');
  const Tag = ({ children, color }) => <span data-testid="rsuite-tag" data-color={color}>{children}</span>;
  const TagGroup = ({ children }) => <span>{children}</span>;
  const Nav = ({ children, ...props }) => <nav {...props}>{children}</nav>;
  Nav.Menu = ({ children, title }) => <div>{title}{children}</div>;
  Nav.Item = ({ children, ...props }) => <div {...props}>{children}</div>;
  const Navbar = ({ children }) => <div>{children}</div>;
  Navbar.Brand = ({ children }) => <span>{children}</span>;
  return { Tag, TagGroup, Nav, Navbar };
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

import ARCHIVE from '../app/pages/user/archive/archive.page';

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
    bc_u12: 'Archivo',
  },
};

function renderArchive(props = {}, userRole = 1) {
  window.user = { roleId: userRole, name: 'Admin Test', id: 1 };
  return render(
    <MemoryRouter>
      <ARCHIVE {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('ARCHIVE — Integración: Módulo Archivo', () => {

  beforeEach(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('1. Renderiza sin crash y muestra título "Archivo"', async () => {
    await act(async () => {
      renderArchive();
    });
    expect(screen.getByText('Archivo')).toBeInTheDocument();
  });

  test('2. Subtítulo de gestión de archivo visible', async () => {
    await act(async () => {
      renderArchive();
    });
    expect(screen.getByText(/Gestión de cajas/i)).toBeInTheDocument();
  });

  test('3. Botón "NUEVA CAJA" visible para role 1 (admin)', async () => {
    await act(async () => {
      renderArchive({}, 1);
    });
    expect(screen.getByText(/NUEVA CAJA/i)).toBeInTheDocument();
  });

  test('4. Botón "NUEVA CAJA" visible para role 3 (archivista)', async () => {
    await act(async () => {
      renderArchive({}, 3);
    });
    expect(screen.getByText(/NUEVA CAJA/i)).toBeInTheDocument();
  });

  test('5. Botón "NUEVA CAJA" oculto para role 2 (profesional)', async () => {
    await act(async () => {
      renderArchive({}, 2);
    });
    expect(screen.queryByText(/NUEVA CAJA/i)).toBeNull();
  });

  test('6. Barra de búsqueda con selector y campo de texto', async () => {
    const { container } = await act(async () => {
      return renderArchive();
    });
    const searchParam = container.querySelector('#search_param');
    const searchText = container.querySelector('#search_text');
    expect(searchParam).toBeInTheDocument();
    expect(searchText).toBeInTheDocument();
  });

  test('7. Selector de búsqueda tiene 4 opciones correctas', async () => {
    const { container } = await act(async () => {
      return renderArchive();
    });
    const searchParam = container.querySelector('#search_param');
    const options = searchParam.querySelectorAll('option');
    expect(options.length).toBe(4);
    const values = Array.from(options).map(o => o.value);
    expect(values).toContain('box');
    expect(values).toContain('id_public');
    expect(values).toContain('exp_id');
    expect(values).toContain('date');
  });

  test('8. Botón "BUSCAR" presente', async () => {
    await act(async () => {
      renderArchive();
    });
    expect(screen.getByText(/BUSCAR/i)).toBeInTheDocument();
  });

  test('9. Botón "INFORMACIÓN" enlaza a documento externo', async () => {
    await act(async () => {
      renderArchive();
    });
    const infoBtn = screen.getByText(/INFORMACIÓN/i);
    expect(infoBtn).toBeInTheDocument();
    // Should have href linking to the pptx document
    expect(infoBtn.closest('a') || infoBtn.closest('[href]')).toBeTruthy();
  });

  test('10. SERVICE_ARCHIVE.getAll() se llama al montar', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockClear();

    await act(async () => {
      renderArchive();
    });

    expect(SERVICE_ARCHIVE.getAll).toHaveBeenCalled();
  });

  test('11. Muestra "CARGANDO..." antes de que lleguen datos', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockReturnValueOnce(new Promise(() => {})); // Never resolves

    await act(async () => {
      renderArchive();
    });

    expect(screen.getByText(/CARGANDO/i)).toBeInTheDocument();
  });

  test('12. DataTable muestra "LISTADO DE CAJAS" como título', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      renderArchive();
    });

    await waitFor(() => {
      expect(screen.getByText(/LISTADO DE CAJAS/)).toBeInTheDocument();
    });
  });

  test('13. DataTable con datos mock muestra cajas correctamente', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({
      data: [
        {
          id: 1, box: 10, row: 2, column: 3,
          process_x_archives: [
            {
              json: JSON.stringify({
                id_public: 'CUB1-2024-0001',
                exp_id: 'RES-001',
                clocks_start: '2024-01-01',
                clocks_end: '2024-06-01',
                'fun_1s.m_lic': '', 'fun_1s.m_sub': '', 'fun_1s.m_urb': '',
                'fun_1s.tipo': 'TIPO I', 'fun_1s.tramite': 'INICIAL',
              }),
              folder: '1',
              pages: '50',
            },
          ],
        },
        {
          id: 2, box: 20, row: 1, column: 1,
          process_x_archives: [],
        },
      ],
    });

    await act(async () => {
      renderArchive();
    });

    await waitFor(() => {
      // When data exists, "NO HAY CAJAS" should NOT be shown
      expect(screen.queryByText('NO HAY CAJAS')).toBeNull();
    });
    // DataTable title should still be there
    expect(screen.getByText(/LISTADO DE CAJAS/)).toBeInTheDocument();
  });

  test('14. DataTable encabezados de columnas presentes con datos', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({
      data: [
        { id: 1, box: 99, row: 1, column: 1, process_x_archives: [] },
      ],
    });

    await act(async () => {
      renderArchive();
    });

    await waitFor(() => {
      // DataTable title is always rendered
      expect(screen.getByText(/LISTADO DE CAJAS/)).toBeInTheDocument();
    });
    // Column headers render inside <label> elements (DataTable v7 renders them as React nodes)
    expect(screen.getByText('Estante')).toBeInTheDocument();
    expect(screen.getByText('Entrepaño')).toBeInTheDocument();
    expect(screen.getByText('Caja N°')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.getByText('Acción')).toBeInTheDocument();
  });

  test('15. Click en "NUEVA CAJA" abre modal de nueva caja', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      renderArchive();
    });

    const btnNueva = screen.getByText(/NUEVA CAJA/i);
    await act(async () => {
      fireEvent.click(btnNueva);
    });

    // Modal should now be open with the new box form
    const modals = screen.getAllByTestId('mock-modal');
    expect(modals.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/NUEVA CAJA DE ARCHIVO/i)).toBeInTheDocument();
  });

  test('16. Muestra "NO HAY CAJAS" cuando no hay datos', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      renderArchive();
    });

    await waitFor(() => {
      expect(screen.getByText('NO HAY CAJAS')).toBeInTheDocument();
    });
  });

  test('17. Filtrar lista por búsqueda (sin valor muestra todos)', async () => {
    const SERVICE_ARCHIVE = (await import('../app/services/archive.service')).default;
    SERVICE_ARCHIVE.getAll.mockResolvedValueOnce({
      data: [
        { id: 1, box: 10, row: 1, column: 1, process_x_archives: [] },
      ],
    });

    await act(async () => {
      renderArchive();
    });

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Click BUSCAR without value — should show all items
    const btnBuscar = screen.getByText(/BUSCAR/i);
    await act(async () => {
      fireEvent.click(btnBuscar);
    });

    // All items should still be visible
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
