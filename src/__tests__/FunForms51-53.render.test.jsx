/**
 * RENDER TESTS — fun_n_51, fun_n_52, fun_n_53
 *
 * Regression render tests: verify each component mounts without crashing.
 * fun_n_52 imports moment, rsuite/Divider, profesionals.service and the shared ProfessionalSearchBox.
 */

import React from 'react';
import { render, act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { swalFire } = vi.hoisted(() => ({
  swalFire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
}));

// ─── External mocks ──────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.returnObjects ? {} : key),
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) =>
    React.createElement(Component, { ...props, t: (k) => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: swalFire,
    close: vi.fn(),
  },
}));

vi.mock('../shared/api/http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../shared/config/jsons/vars', () => ({
  infoCud: { name: 'Test', city: 'test', nit: '0', email: 'test@test.com' },
  nomens: 'CUB1',
}));

// moment — used by fun_n_52 via require('moment')
vi.mock('moment', () => {
  const momentFn = (val) => ({
    format: () => '2024-01-01',
    subtract: () => momentFn(val),
    add: () => momentFn(val),
    diff: () => 0,
    isBefore: () => false,
    isAfter: () => false,
    isValid: () => true,
    toDate: () => new Date(),
  });
  momentFn.isMoment = () => false;
  return { default: momentFn, __esModule: true };
});

// ─── Service mocks ───────────────────────────────────────────────────────────

vi.mock('../features/expediente/api/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create_fun51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun53: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_53: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../features/professionals/api/profesionals.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    getByName: vi.fn(() => Promise.resolve({ data: [] })),
    createOrFind: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// ─── UI component mocks ──────────────────────────────────────────────────────

vi.mock('../shared/components/legacy-ui', () => ({
  MDBBtn: ({ children, onClick, className }) =>
    React.createElement('button', { onClick, className }, children),
  MDBTooltip: ({ children }) => React.createElement('span', null, children),
}));

vi.mock('@/shared/components/data-table-bridge', () => ({
  __esModule: true,
  default: ({ columns = [], data = [], noDataComponent }) =>
    React.createElement(
      'div',
      { 'data-testid': 'datatable-stub' },
      data.length
        ? data.map((row) => React.createElement(
          'div',
          { key: row.id },
          columns.map((column, index) => React.createElement(
            'span',
            { key: `${row.id}-${index}` },
            column.cell ? column.cell(row) : column.selector?.(row),
          )),
        ))
        : noDataComponent,
    ),
}));

vi.mock('../shared/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'vizualizer-stub' }),
}));

vi.mock('../shared/config/customClasses/typeParse', () => ({
  dateParser: (v) => v ?? '',
  dateParser_timePassed: (v) => v ?? '',
  dateParser_yearsPassed: (v) => v ?? '',
  dateParser_finalDate: (v) => v ?? '',
  dateParser_dateDiff: () => 0,
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUNN51 from '../features/expediente/fun/fun_forms/fun_n_51';
import FUNN52 from '../features/expediente/fun/fun_forms/fun_n_52';
import FUNN53 from '../features/expediente/fun/fun_forms/fun_n_53';
import FUNService from '../features/expediente/api/fun.service';

// ─── Shared props ────────────────────────────────────────────────────────────

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  generic_eror_title: 'Error',
  generic_error_text: 'Error genérico',
  text_btn: 'OK',
  publish_success_title: 'Éxito',
  publish_success_text: 'Operación exitosa',
  text_footer: 'Footer',
};

const minimalCurrentItem = {
  id: 1,
  model: 2022,
  version: 1,
  fun_1s: [],
  fun_2: null,
  fun_3s: [],
  fun_4s: [],
  fun_6s: [],
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_clocks: [],
};

const baseProps = {
  translation: {},
  swaMsg,
  globals: { id: '1' },
  currentItem: minimalCurrentItem,
  currentVersion: 1,
  requestUpdate: vi.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FunForms51-53 — Render (fun_n_51, fun_n_52, fun_n_53)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('fun_n_51 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN51 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_51 renders with titular data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_51s: [
          {
            id: 1,
            type: 'PERSONA NATURAL',
            name: 'Juan',
            surname: 'Pérez',
            id_number: '12345678',
            email: 'juan@test.com',
            nunber: '3001234567',
            role: 'PROPIETARIO',
            active: 1,
            docs: '0,0',
            rep_name: '',
            rep_id_number: '',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN51 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_52 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN52 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_52 renders with professional data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_52s: [
          {
            id: 1,
            type: 'Arquitecto',
            name: 'Ana',
            surname: 'López',
            id_number: '87654321',
            email: 'ana@test.com',
            number: '3109876543',
            registration: 'ARQ-12345',
            registration_date: '2020-01-01',
            active: 1,
            docs: '0,0,0,0',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN52 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  describe('fun_n_52 edit', () => {
    const professional = {
      id: 7,
      name: 'Ana',
      surname: 'López',
      id_number: '87654321',
      email: 'ana@test.com',
      number: '3109876543',
      role: 'ARQUITECTO PROYECTISTA',
      registration: 'ARQ-12345',
      registration_date: '2020-01-01',
      supervision: 'NO',
      sanction: false,
      expirience: 24,
      active: 1,
      docs: '-1,-1,-1,-1,-1',
    };

    async function openEditForm() {
      let container;
      await act(async () => {
        ({ container } = render(
          <MemoryRouter>
            <FUNN52 {...baseProps} currentItem={{ ...minimalCurrentItem, fun_52s: [professional] }} />
          </MemoryRouter>
        ));
      });
      await act(async () => {
        fireEvent.click(screen.getByTitle('Modificar Item').firstElementChild);
      });
      return container;
    }

    async function submitEditForm(container) {
      await act(async () => {
        fireEvent.submit(container.querySelector('#form_fun_52_edit'));
      });
    }

    test('shows the 5.2.11 documents read-only and does not send docs', async () => {
      const { default: FUNService } = await import('../features/expediente/api/fun.service');
      FUNService.update_52.mockClear();
      const container = await openEditForm();

      ['f_52_111_edit', 'f_52_112_edit', 'f_52_113_edit', 'f_52_114_edit', 'f_52_115_edit', 'f_52_116_edit']
        .forEach(id => expect(container.querySelector(`#${id}`).disabled).toBe(true));
      expect(container.querySelector('#f_52_116_edit').value).toBe('');

      await submitEditForm(container);

      expect(FUNService.update_52).toHaveBeenCalledTimes(1);
      const [id, formData] = FUNService.update_52.mock.calls[0];
      expect(id).toBe(7);
      expect(formData.has('docs')).toBe(false);
      expect(formData.get('name')).toBe('Ana');
    }, 60000);

    test('fills the edit form from a BD PROFESIONALES suggestion and resets 5.2.10 when the sanction is unknown', async () => {
      const { default: http } = await import('../shared/api/http-common');
      const suggestion = {
        registryId: 9, givenNames: 'María José', surnames: 'Pérez Gómez', cc: '1098765432', email: 'mj@test.com',
        phone: '3001112233', registration: 'A123456', registrationDate: '2015-06-01', nameNeedsReview: true,
      };
      http.get.mockImplementation((url) => Promise.resolve(
        String(url).startsWith('/professional-registry/lookup') ? { data: { data: [suggestion] } } : { data: [] },
      ));
      try {
        const container = await openEditForm();
        const search = container.querySelector('#form_fun_52_edit input[name="search_52"]');
        fireEvent.change(search, { target: { value: 'maria' } });
        await waitFor(() => expect(container.querySelectorAll('#form_fun_52_edit datalist option')).toHaveLength(1));
        fireEvent.change(search, { target: { value: 'MARIA JOSE PEREZ GOMEZ · CC 1098765432 · MAT. A123456' } });

        const value = (id) => container.querySelector(`#${id}`).value;
        expect(value('f_5211_edit')).toBe('MARÍA JOSÉ');
        expect(value('f_5212_edit')).toBe('PÉREZ GÓMEZ');
        expect(value('f_522_edit')).toBe('1098765432');
        expect(value('f_524_edit')).toBe('3001112233');
        expect(value('f_523_edit')).toBe('mj@test.com');
        expect(value('f_526_edit')).toBe('A123456');
        expect(value('f_527_edit')).toBe('2015-06-01');
        expect(value('f_5210_edit')).toBe('0');
        expect(screen.getByText('Revise la separación de nombres y apellidos')).toBeInTheDocument();
      } finally {
        http.get.mockImplementation(() => Promise.resolve({ data: [] }));
      }
    }, 60000);

    test('a later pick with an unknown sanction resets 5.2.10 left by an external pick', async () => {
      const { default: http } = await import('../shared/api/http-common');
      const { default: profesionals } = await import('../features/professionals/api/profesionals.service');
      let registryItems = [];
      http.get.mockImplementation((url) => Promise.resolve(
        String(url).startsWith('/professional-registry/lookup') ? { data: { data: registryItems } } : { data: [] },
      ));
      profesionals.getByName.mockResolvedValue({ data: [{ id: 4, name: 'Pedro', surname: 'Ruiz', id_number: '55', sanction: 1 }] });
      try {
        const container = await openEditForm();
        const search = container.querySelector('#form_fun_52_edit input[name="search_52"]');
        const options = () => container.querySelectorAll('#form_fun_52_edit datalist option');

        fireEvent.change(search, { target: { value: 'pedro' } });
        await waitFor(() => expect(options()).toHaveLength(1));
        fireEvent.change(search, { target: { value: options()[0].value } });
        expect(container.querySelector('#f_5210_edit').value).toBe('1');

        registryItems = [{ registryId: 9, givenNames: 'Luisa', surnames: 'Mora', cc: '66' }];
        fireEvent.change(search, { target: { value: 'luisa' } });
        await waitFor(() => expect(options()[0]?.value).toBe('LUISA MORA · CC 66'));
        fireEvent.change(search, { target: { value: 'LUISA MORA · CC 66' } });
        expect(container.querySelector('#f_5211_edit').value).toBe('LUISA');
        expect(container.querySelector('#f_5210_edit').value).toBe('0');
      } finally {
        http.get.mockImplementation(() => Promise.resolve({ data: [] }));
        profesionals.getByName.mockImplementation(() => Promise.resolve({ data: [] }));
      }
    }, 60000);

    test('shows the server message when the update is rejected', async () => {
      const { default: FUNService } = await import('../features/expediente/api/fun.service');
      const { default: Swal } = await import('sweetalert2');
      FUNService.update_52.mockRejectedValueOnce({ response: { status: 400, data: { message: 'El campo active no se puede modificar.' } } });
      const container = await openEditForm();
      Swal.fire.mockClear();

      await submitEditForm(container);

      expect(Swal.fire).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'El campo active no se puede modificar.' }));
    }, 60000);
  });

  test('fun_n_53 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN53 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_53 renders with responsable data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_53s: [
          {
            id: 1,
            name: 'Carlos',
            surname: 'García',
            id_number: '11223344',
            role: 'APODERADO',
            number: '3001122334',
            email: 'carlos@test.com',
            address: 'Calle 10 #5-20',
            docs: '0,0',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN53 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_53 shows the registration CTA until the active version has an effective responsable', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <FUNN53 {...baseProps} />
        </MemoryRouter>
      );
    });

    const registerButton = screen.getByRole('button', { name: /registrar responsable/i });
    expect(document.querySelector('#form_fun_53_manage')).toBeNull();

    fireEvent.click(registerButton);

    expect(document.querySelector('#form_fun_53_manage')).not.toBeNull();
    expect(screen.getByText('5.3.1 Nombre')).toBeTruthy();
  }, 60000);

  test('fun_n_53 preserves the active version responsable data in the table', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_53s: [
          {
            id: 12,
            version: 1,
            name: 'Carlos',
            surname: 'García',
            id_number: '11223344',
            role: 'APODERADO',
            number: '3001122334',
            email: 'carlos@test.com',
            address: 'Calle 10 #5-20',
            docs: '0,0',
          },
        ],
      },
    };

    await act(async () => {
      render(
        <MemoryRouter>
          <FUNN53 {...props} />
        </MemoryRouter>
      );
    });

    expect(screen.getByTestId('datatable-stub')).toHaveTextContent('Carlos García');
    expect(screen.getByTestId('datatable-stub')).toHaveTextContent('11223344');
    expect(screen.getByTestId('datatable-stub')).toHaveTextContent('carlos@test.com');
    expect(screen.queryByRole('button', { name: /registrar responsable/i })).toBeNull();
    expect(document.querySelector('#form_fun_53_manage')).toBeNull();
  }, 60000);

  test('fun_n_53 opens the prefilled form from the table edit action', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_53s: [
          {
            id: 12,
            version: 1,
            name: 'Carlos',
            surname: 'García',
            id_number: '11223344',
            role: 'APODERADO',
            number: '3001122334',
            email: 'carlos@test.com',
            address: 'Calle 10 #5-20',
            docs: '0,0',
          },
        ],
      },
    };

    await act(async () => {
      render(
        <MemoryRouter>
          <FUNN53 {...props} />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByTitle('Modificar responsable'));

    expect(document.querySelector('#form_fun_53_manage')).not.toBeNull();
    expect(document.querySelector('#f_531').value).toBe('Carlos');
    expect(document.querySelector('#f_535').value).toBe('carlos@test.com');
  }, 60000);

  describe('fun_n_52 5.2.9 as specific experience in the role', () => {
    const openCreate = async (user) => {
      FUNService.create_fun52.mockClear();
      render(<MemoryRouter><FUNN52 {...baseProps} /></MemoryRouter>);
      await user.click(document.querySelector('#funn_52').parentElement.querySelector('input[type="checkbox"]'));
    };
    const typeIn = async (user, id, value) => { await user.clear(document.getElementById(id)); await user.type(document.getElementById(id), value); };

    test('sends 5.2.9 in months marked as specific experience', async () => {
      const user = userEvent.setup();
      await openCreate(user);
      await typeIn(user, 'f_529', '3');
      await typeIn(user, 'f_529m', '4');
      await user.click(screen.getByRole('button', { name: /añadir item/i }));

      await waitFor(() => expect(FUNService.create_fun52).toHaveBeenCalledTimes(1));
      const payload = FUNService.create_fun52.mock.calls[0][0];
      expect([payload.get('expirience'), payload.get('expirience_specific')]).toEqual(['40', 'true']);
    }, 60000);

    test('a blank 5.2.9 sends no experience and 5.2.7 no longer fills it', async () => {
      const user = userEvent.setup();
      await openCreate(user);
      fireEvent.change(document.getElementById('f_527'), { target: { value: '2010-05-01' } });
      expect(document.getElementById('f_529').value).toBe('');
      expect(document.getElementById('f_529_general').textContent).toMatch(/^Experiencia general \(desde 5\.2\.7\): \d+ años/);
      await user.click(screen.getByRole('button', { name: /añadir item/i }));

      await waitFor(() => expect(FUNService.create_fun52).toHaveBeenCalledTimes(1));
      const payload = FUNService.create_fun52.mock.calls[0][0];
      expect(payload.has('expirience')).toBe(false);
      expect(payload.has('expirience_specific')).toBe(false);
    }, 60000);

    test('refuses a specific experience above the general one since 5.2.7', async () => {
      const user = userEvent.setup();
      swalFire.mockClear();
      await openCreate(user);
      const lastYear = `${new Date().getUTCFullYear() - 1}-01-01`;
      fireEvent.change(document.getElementById('f_527'), { target: { value: lastYear } });
      await typeIn(user, 'f_529', '5');
      await user.click(screen.getByRole('button', { name: /añadir item/i }));

      await waitFor(() => expect(swalFire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'error', text: expect.stringMatching(/no puede superar la experiencia general/),
      })));
      expect(FUNService.create_fun52).not.toHaveBeenCalled();
    }, 60000);
  });
});
