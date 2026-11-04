import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  get: vi.fn(), setCanonicalName: vi.fn(), remove: vi.fn(), restore: vi.fn(), merge: vi.fn(), relink: vi.fn(), resolve: vi.fn(),
  list: vi.fn(), update: vi.fn(), create: vi.fn(), setSpecificExperience: vi.fn(),
}));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryDetail from './RegistryDetail';

const detail = (overrides) => ({
  id: 5, identityType: 'CC', cc: '13439751', name: 'ANA MARIA LOPEZ', nameSource: 'AUTO', email: 'ana@example.com', phone: '3001112233',
  status: 'ACTIVO', version: 2, deleted: false, manualFields: [], unlinked: 0,
  identifiers: [
    { kind: 'CC', value: '13.439.751', source: 'AUTO', principal: false },
    { kind: 'MATRICULA', value: '68202-158428', source: 'AUTO', principal: true },
    { kind: 'MATRICULA', value: '8875STD', source: 'AUTO', principal: false },
  ],
  roles: [{ code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', projects: 2, monthsLatest: 96, monthsMax: 96, monthsOverride: null, outlier: false,
    expedientes: [{ participationId: 11, fun0Id: 1, expediente: '68001-1-26-0001', date: '2026-01-15', name: 'ANA MARIA LOPEZ', months: 96 }, { participationId: 12, fun0Id: 2, expediente: '68001-1-25-0002', date: '2025-02-01', name: 'ANA MARIA LOPES', months: 84 }] }],
  misregistered: [{ participationId: 12, expediente: '68001-1-25-0002', date: '2025-02-01', name: 'ANA MARIA LOPES', diffType: 'ERROR_ORTOGRAFICO', similarity: 0.94, reviewed: false, role: 'ARQ_PROY' }],
  audit: [{ id: 1, entity: 'PERSONA', field: 'persona', operation: 'CREACION', previous: null, next: 'CC', origin: 'CARGA', user: 'Sistema', at: '2026-10-20T10:00:00Z' }],
  duplicates: [{ id: 9, reason: 'MISMO_NOMBRE', otherId: 6, otherName: 'ANA MARIA LOPEZ', otherCc: '13439752' }], ...overrides,
});

const open = (props) => render(<RegistryDetail id={5} canWrite onClose={() => {}} onChanged={() => {}} onOpen={() => {}} {...props} />);

describe('RegistryDetail', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.get.mockResolvedValue({ data: detail() });
    [service.setCanonicalName, service.remove, service.restore, service.merge, service.relink, service.resolve, service.update, service.setSpecificExperience].forEach((fn) => fn.mockResolvedValue({ data: {} }));
  });

  it('shows the person data, identifiers and possible duplicates', async () => {
    open();

    expect(await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' })).toBeInTheDocument();
    expect(screen.getByText('Cédula 13.439.751')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('Matrícula: 68202-158428')).toBeInTheDocument();
    expect(screen.getByText('Matrícula: 8875STD')).toBeInTheDocument();
    expect(screen.getAllByText('(en uso)')).toHaveLength(1);
    expect(screen.getByText('(en uso)').closest('li')).toHaveTextContent('68202-158428');
    const duplicates = screen.getByRole('region', { name: 'Posibles duplicados' });
    expect(duplicates).toHaveTextContent('Mismo nombre con otra cédula');
  });

  it('shows roles with experience, expedientes per role, misregistered names and history', async () => {
    const user = userEvent.setup();
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Roles y experiencia' }));
    const roles = screen.getByRole('table', { name: 'Roles y experiencia' });
    expect(roles).toHaveTextContent('ARQUITECTO PROYECTISTA');
    expect(roles).toHaveTextContent('8 años');
    expect(within(roles).getByRole('columnheader', { name: 'Experiencia (último)' })).toBeInTheDocument();
    expect(within(roles).queryByRole('columnheader', { name: 'Experiencia específica' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expedientes' }));
    expect(screen.getByRole('region', { name: 'ARQUITECTO PROYECTISTA' })).toHaveTextContent('68001-1-25-0002');

    await user.click(screen.getByRole('button', { name: /Nombres mal registrados/ }));
    const names = screen.getByRole('table', { name: 'Nombres mal registrados' });
    expect(names).toHaveTextContent('ANA MARIA LOPES');
    expect(names).toHaveTextContent('Error de escritura');
    expect(names).toHaveTextContent('94%');

    await user.click(screen.getByRole('button', { name: 'Historial' }));
    expect(screen.getByRole('list', { name: 'Historial' })).toHaveTextContent('CREACION');
  });

  describe('general and specific experience', () => {
    const GENERAL = { duration: { years: 16, months: 5, days: 29 }, missing: null };
    const withExperience = (roleFields, general = GENERAL) => {
      const base = detail();
      return detail({
        registration: '68202-158428', registrationDate: '2010-05-01', generalExperience: general,
        roles: [{ ...base.roles[0], specificExperience: null, specificExceedsGeneral: false, ...roleFields }],
      });
    };
    const openRoles = async (data) => {
      const user = userEvent.setup();
      service.get.mockResolvedValue({ data });
      open();
      await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });
      await user.click(screen.getByRole('button', { name: 'Roles y experiencia' }));
      return screen.getByRole('table', { name: 'Roles y experiencia' });
    };

    it('shows the general experience and, from an older server without the origin, the specific one read only', async () => {
      const roles = await openRoles(withExperience({ specificExperience: { years: 12, months: 3, days: 0 } }));

      expect(within(roles).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Rol', 'Expedientes', 'Experiencia general', 'Experiencia específica']);
      expect(roles).toHaveTextContent('16 años 5 meses 29 días');
      expect(roles).toHaveTextContent('12 años 3 meses');
      expect(within(roles).queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText(/desde la fecha de expedición de la matrícula en uso \(68202-158428.*5\.2\.9 del expediente más reciente/)).toBeInTheDocument();
    });

    it('flags a specific experience above the general one and explains a missing general one', async () => {
      const roles = await openRoles(withExperience({ specificExperience: { years: 20, months: 0, days: 0 }, specificExceedsGeneral: true }, { duration: null, missing: 'PRINCIPAL_EMPATADA' }));
      expect(roles).toHaveTextContent('Supera la experiencia general');
      expect(roles).toHaveTextContent('Defina la matrícula en uso');
    });

    it('shows a dash for a role without specific experience', async () => {
      const roles = await openRoles(withExperience());
      expect(within(roles).getAllByRole('cell')[3]).toHaveTextContent('—');
    });

    describe('typed in the module (current server)', () => {
      const FROM_EXPEDIENTE = { specificExperience: { years: 4, months: 0, days: 0 }, specificSource: 'expediente', specificSourceExpediente: '68001-1-26-0001', specificUpdatedAt: '2026-01-15T10:00:00Z', specificManual: null };
      const TYPED = { specificExperience: { years: 3, months: 6, days: 0 }, specificSource: 'manual', specificSourceExpediente: null, specificUpdatedAt: '2026-11-04T15:00:00Z', specificManual: { years: 3, months: 6, days: 0 } };
      const NONE = { specificExperience: null, specificSource: null, specificSourceExpediente: null, specificUpdatedAt: null, specificManual: null };
      const fill = async (user, form, years, months) => {
        const [yearsInput, monthsInput] = within(form).getAllByRole('textbox');
        await user.clear(yearsInput);
        if (years !== '') await user.type(yearsInput, years);
        await user.clear(monthsInput);
        if (months !== '') await user.type(monthsInput, months);
      };

      it('shows where the value comes from and explains that the most recent one wins', async () => {
        const roles = await openRoles(withExperience(FROM_EXPEDIENTE));
        expect(roles).toHaveTextContent('Expediente 68001-1-26-0001');
        expect(screen.getByText(/registrada más recientemente, ya sea en el ítem 5\.2\.9 de un expediente o aquí/)).toBeInTheDocument();
      });

      it('shows the date of a value typed here', async () => {
        const roles = await openRoles(withExperience(TYPED));
        expect(roles).toHaveTextContent('3 años 6 meses');
        expect(roles).toHaveTextContent('Registrada en BD Profesionales · 04/11/2026');
      });

      it('adds a specific experience and reloads the professional', async () => {
        const user = userEvent.setup();
        const roles = await openRoles(withExperience(NONE));
        await user.click(within(roles).getByRole('button', { name: 'Añadir la experiencia específica de ARQUITECTO PROYECTISTA' }));
        const form = screen.getByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' });
        expect(within(form).queryByRole('spinbutton')).not.toBeInTheDocument();
        await fill(user, form, '4', '6');
        await user.click(within(form).getByRole('button', { name: 'Guardar' }));

        await waitFor(() => expect(service.setSpecificExperience).toHaveBeenCalledWith(5, 'ARQ_PROY', { expectedVersion: 2, years: 4, months: 6 }));
        expect(await screen.findByText('Experiencia específica guardada.')).toBeInTheDocument();
        expect(service.get).toHaveBeenCalledTimes(2);
        expect(screen.queryByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' })).not.toBeInTheDocument();
      });

      it('edits the value coming from an expediente, starting from it', async () => {
        const user = userEvent.setup();
        const roles = await openRoles(withExperience(FROM_EXPEDIENTE));
        await user.click(within(roles).getByRole('button', { name: 'Editar la experiencia específica de ARQUITECTO PROYECTISTA' }));
        const form = screen.getByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' });
        expect(within(form).getAllByRole('textbox').map((input) => input.value)).toEqual(['4', '0']);
        expect(within(form).queryByRole('button', { name: 'Quitar ajuste' })).not.toBeInTheDocument();
        await fill(user, form, '5', '');
        await user.click(within(form).getByRole('button', { name: 'Guardar' }));

        await waitFor(() => expect(service.setSpecificExperience).toHaveBeenCalledWith(5, 'ARQ_PROY', { expectedVersion: 2, years: 5, months: 0 }));
      });

      it('removes a value typed here', async () => {
        const user = userEvent.setup();
        const roles = await openRoles(withExperience(TYPED));
        await user.click(within(roles).getByRole('button', { name: 'Editar la experiencia específica de ARQUITECTO PROYECTISTA' }));
        await user.click(screen.getByRole('button', { name: 'Quitar ajuste' }));

        await waitFor(() => expect(service.setSpecificExperience).toHaveBeenCalledWith(5, 'ARQ_PROY', { expectedVersion: 2, clear: true }));
        expect(await screen.findByText('Ajuste de experiencia específica quitado.')).toBeInTheDocument();
      });

      it('checks the value before saving, against the general experience too', async () => {
        const user = userEvent.setup();
        const roles = await openRoles(withExperience(NONE));
        await user.click(within(roles).getByRole('button', { name: /Añadir la experiencia específica/ }));
        const form = screen.getByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' });
        const attempt = async (years, months, message) => {
          await fill(user, form, years, months);
          await user.click(within(form).getByRole('button', { name: 'Guardar' }));
          expect(within(form).getByRole('alert')).toHaveTextContent(message);
        };

        await attempt('', '', 'Indique los años o los meses.');
        await attempt('2', '12', 'Los meses deben ser un número entero entre 0 y 11.');
        await attempt('1a', '0', 'Los años deben ser un número entero entre 0 y 99.');
        await attempt('16', '6', 'no puede superar la experiencia general (16 años 5 meses 29 días)');
        expect(service.setSpecificExperience).not.toHaveBeenCalled();

        await fill(user, form, '16', '5');
        await user.click(within(form).getByRole('button', { name: 'Guardar' }));
        await waitFor(() => expect(service.setSpecificExperience).toHaveBeenCalledWith(5, 'ARQ_PROY', { expectedVersion: 2, years: 16, months: 5 }));
      });

      it('keeps the form open and shows the server message when the save is refused', async () => {
        const user = userEvent.setup();
        service.setSpecificExperience.mockRejectedValue({ response: { status: 400, data: { code: 'VALIDATION', message: 'La experiencia específica no puede superar la experiencia general.' } } });
        const roles = await openRoles(withExperience(NONE));
        await user.click(within(roles).getByRole('button', { name: /Añadir la experiencia específica/ }));
        const form = screen.getByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' });
        await fill(user, form, '1', '0');
        await user.click(within(form).getByRole('button', { name: 'Guardar' }));

        expect(await screen.findByText('La experiencia específica no puede superar la experiencia general.')).toBeInTheDocument();
        expect(screen.getByRole('form', { name: 'Experiencia específica de ARQUITECTO PROYECTISTA' })).toBeInTheDocument();
      });

      it('is read only for a person who cannot write and for a deleted professional', async () => {
        service.get.mockResolvedValue({ data: withExperience(TYPED) });
        const { unmount } = open({ canWrite: false });
        await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });
        await userEvent.setup().click(screen.getByRole('button', { name: 'Roles y experiencia' }));
        expect(within(screen.getByRole('table', { name: 'Roles y experiencia' })).queryByRole('button')).not.toBeInTheDocument();
        unmount();

        const roles = await openRoles({ ...withExperience(TYPED), deleted: true });
        expect(within(roles).queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  it('shows the registered matrícula per expediente and flags the ones that belong to another professional', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const base = detail();
    const [role] = base.roles;
    service.get.mockResolvedValue({ data: detail({ roles: [{ ...role, expedientes: [
      { ...role.expedientes[0], registration: '68202-158428', registrationOwner: null },
      { ...role.expedientes[1], registration: 'A68041999-91490031', registrationOwner: { id: 77, name: 'ANGELO QUINTERO' } },
    ] }] }) });
    open({ onOpen });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Expedientes' }));
    const region = screen.getByRole('region', { name: 'ARQUITECTO PROYECTISTA' });
    expect(region).toHaveTextContent('Matrícula: 68202-158428');
    expect(region).toHaveTextContent('Matrícula: A68041999-91490031');
    expect(region).toHaveTextContent('Esta matrícula pertenece a ANGELO QUINTERO');
    expect(region).not.toHaveTextContent('pertenece a ANA');

    await user.click(within(region).getByRole('button', { name: 'Abrir' }));
    expect(onOpen).toHaveBeenCalledWith(77);
  });

  it('is read-only when the user cannot write', async () => {
    const user = userEvent.setup();
    open({ canWrite: false });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    ['Editar datos', 'Corregir nombre', 'Fusionar con otro…', 'Eliminar'].forEach((name) => expect(screen.queryByRole('button', { name })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Nombres mal registrados/ }));
    expect(screen.queryByRole('button', { name: 'Marcar revisado' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Asignar a otro' })).not.toBeInTheDocument();
  });

  it('corrects the canonical name with the expected version and reloads', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    open({ onChanged });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Corregir nombre' }));
    const input = screen.getByLabelText('Nombre canónico');
    await user.clear(input);
    await user.type(input, 'Ana María López Ruiz');
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    await waitFor(() => expect(service.setCanonicalName).toHaveBeenCalledWith(5, { expectedVersion: 2, name: 'Ana María López Ruiz' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Nombre actualizado.');
    expect(onChanged).toHaveBeenCalled();
    expect(service.get).toHaveBeenCalledTimes(2);
  });

  it('asks for confirmation before deleting and restores a deleted person', async () => {
    const user = userEvent.setup();
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(service.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(service.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith(5, { expectedVersion: 2 }));
  });

  it('restores when the person is deleted and hides the edit actions', async () => {
    const user = userEvent.setup();
    service.get.mockResolvedValue({ data: detail({ deleted: true }) });
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    expect(screen.queryByRole('button', { name: 'Editar datos' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Restaurar' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(service.restore).toHaveBeenCalledWith(5, { expectedVersion: 2 }));
  });

  it('merges into the person chosen in the search and opens the target', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    service.list.mockResolvedValue({ data: { data: [{ id: 6, name: 'ANA MARIA LOPEZ', cc: '13439752', projects: 3 }, { id: 5, name: 'ANA MARIA LOPEZ', cc: '13439751', projects: 2 }] } });
    open({ onOpen });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Fusionar con otro…' }));
    await user.type(screen.getByLabelText('Profesional que se conserva'), 'ana');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    const results = await screen.findByRole('list', { name: 'Resultados' });
    expect(results.querySelectorAll('li')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /13\.439\.752/ }));
    await user.click(screen.getByRole('button', { name: 'Fusionar en ANA MARIA LOPEZ' }));

    await waitFor(() => expect(service.merge).toHaveBeenCalledWith(5, { expectedVersion: 2, targetId: 6 }));
    expect(onOpen).toHaveBeenCalledWith(6);
  });

  it('marks a misregistered name as reviewed and reassigns an expediente', async () => {
    const user = userEvent.setup();
    service.list.mockResolvedValue({ data: { data: [{ id: 8, name: 'OTRA PERSONA', cc: '99999999', projects: 1 }] } });
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });
    await user.click(screen.getByRole('button', { name: /Nombres mal registrados/ }));

    await user.click(screen.getByRole('button', { name: 'Marcar revisado' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'nombres', id: 12, action: 'reviewed' }));

    await user.click(screen.getByRole('button', { name: 'Asignar a otro' }));
    await user.type(screen.getByLabelText('Profesional correcto'), 'otra');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /OTRA PERSONA/ }));
    await user.click(screen.getByRole('button', { name: 'Asignar' }));
    await waitFor(() => expect(service.relink).toHaveBeenCalledWith(5, 12, { registryId: 8 }));
  });

  it('explains a version conflict and reloads the current data', async () => {
    const user = userEvent.setup();
    service.setCanonicalName.mockRejectedValue({ response: { status: 409, data: { code: 'VERSION_CONFLICT', message: 'Otra persona modificó este registro. Recárguelo e intente de nuevo.' } } });
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Corregir nombre' }));
    await user.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Otra persona modificó este registro.');
    expect(service.get).toHaveBeenCalledTimes(2);
  });

  it('shows a clear message when the professional does not exist', async () => {
    service.get.mockRejectedValue({ response: { status: 404, data: { code: 'NOT_FOUND', message: 'No existe el profesional.' } } });
    open();

    expect(await screen.findByRole('alert')).toHaveTextContent('No existe el profesional.');
  });

  it('opens a possible duplicate', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    open({ onOpen });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Abrir' }));

    expect(onOpen).toHaveBeenCalledWith(6);
  });
});
