import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  get: vi.fn(), setCanonicalName: vi.fn(), remove: vi.fn(), restore: vi.fn(), merge: vi.fn(), relink: vi.fn(), resolve: vi.fn(),
  list: vi.fn(), update: vi.fn(), create: vi.fn(), setSpecificExperience: vi.fn(),
  catalog: vi.fn(), listExperienceCertificates: vi.fn(), createExperienceCertificate: vi.fn(), deleteExperienceCertificate: vi.fn(),
  downloadExperienceCertificateFile: vi.fn(),
  listValidityCertificates: vi.fn(), createValidityCertificate: vi.fn(), deleteValidityCertificate: vi.fn(),
  downloadValidityCertificateFile: vi.fn(),
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
    service.catalog.mockResolvedValue({ data: { data: [{ code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA' }] } });
    service.listExperienceCertificates.mockResolvedValue({ data: { data: [] } });
    service.listValidityCertificates.mockResolvedValue({ data: { data: [], latest: null } });
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

  it('shows the professions in the Datos tab instead of the name origin', async () => {
    service.get.mockResolvedValue({ data: detail({ nameSource: 'MANUAL', professions: [{ name: 'ARQUITECTO', source: 'CATALOGO' }, { name: 'TOPÓGRAFO', source: 'MANUAL' }] }) });
    const { unmount } = open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    expect(screen.queryByText('Origen del nombre')).not.toBeInTheDocument();
    const card = screen.getByText('Profesión').closest('div');
    expect(card).toHaveTextContent('ARQUITECTO, TOPÓGRAFO');
    expect(screen.getByText('Nombre').closest('div')).toHaveTextContent('Corregido manualmente');
    unmount();

    service.get.mockResolvedValue({ data: detail() });
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });
    expect(screen.getByText('Profesión').closest('div')).toHaveTextContent('Sin registro');
    expect(screen.queryByText('Corregido manualmente')).not.toBeInTheDocument();
  });

  it('shows roles, misregistered names and history', async () => {
    const user = userEvent.setup();
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Roles' }));
    const roles = screen.getByRole('table', { name: 'Roles' });
    expect(roles).toHaveTextContent('ARQUITECTO PROYECTISTA');
    expect(roles).toHaveTextContent('8 años');
    expect(within(roles).getByRole('columnheader', { name: 'Experiencia (último)' })).toBeInTheDocument();
    expect(within(roles).queryByRole('columnheader', { name: 'Experiencia específica' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Incidencias/ }));
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
      await user.click(screen.getByRole('button', { name: 'Roles' }));
      return screen.getByRole('table', { name: 'Roles' });
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

    describe('from the certified experiences (current server)', () => {
      const CERTIFIED = {
        specificExperience: { years: 6, months: 6, days: 15 }, specificSource: 'certificados', specificCertificates: 3,
        specificSourceExpediente: null, specificUpdatedAt: null, specificManual: null,
      };
      const NONE = { ...CERTIFIED, specificExperience: null, specificSource: null, specificCertificates: 0 };

      it('shows the summed value, how many certifications it comes from and how it is computed', async () => {
        const roles = await openRoles(withExperience(CERTIFIED));
        expect(roles).toHaveTextContent('6 años 6 meses 15 días');
        expect(roles).toHaveTextContent('Según 3 certificaciones');
        expect(roles).not.toHaveTextContent('Registrada en BD Profesionales');
        expect(roles).not.toHaveTextContent('Ítem 5.2.9');
        expect(screen.getByText(/suma de las experiencias certificadas en la pestaña Experiencia; el tiempo que se traslapa se cuenta una sola vez/)).toBeInTheDocument();
        expect(screen.getByText(/desde la fecha de expedición de la matrícula en uso/)).toBeInTheDocument();
      });

      it('says certificación for a single one', async () => {
        const one = await openRoles(withExperience({ ...CERTIFIED, specificCertificates: 1 }));
        expect(one).toHaveTextContent('Según 1 certificación');
      });

      it('shows a dash and no source without certificates', async () => {
        const roles = await openRoles(withExperience(NONE));
        expect(within(roles).getAllByRole('cell')[3]).toHaveTextContent(/^—$/);
      });

      it('offers no way to type the specific experience, whoever writes', async () => {
        const roles = await openRoles(withExperience(NONE));
        expect(within(roles).queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByRole('form', { name: /Experiencia específica de/ })).not.toBeInTheDocument();
        expect(service.setSpecificExperience).not.toHaveBeenCalled();
      });

      it('still flags a certified sum above the general experience', async () => {
        const roles = await openRoles(withExperience({ ...CERTIFIED, specificExceedsGeneral: true }));
        expect(roles).toHaveTextContent('Supera la experiencia general');
      });
    });
  });

  it('lists the sections in order, with the validity certificates in Cert. Vigencia', async () => {
    const user = userEvent.setup();
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    const names = ['Datos', 'Roles', 'Experiencia', 'Cert. Vigencia', 'Incidencias', 'Historial'];
    const tabs = screen.getAllByRole('button').filter((button) => names.some((name) => button.textContent.startsWith(name)));
    expect(tabs.map((button) => button.textContent.replace(/\s*\(\d+\)$/, ''))).toEqual(names);
    expect(screen.queryByRole('button', { name: 'Expedientes' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cert. Vigencia' }));
    const section = screen.getByRole('region', { name: 'Cert. Vigencia' });
    expect(await within(section).findByText('Aún no hay certificados de vigencia registrados.')).toBeInTheDocument();
    expect(within(section).getByRole('form', { name: 'Registrar certificado de vigencia' })).toBeInTheDocument();
    expect(service.listValidityCertificates).toHaveBeenCalledWith(5);
  });

  it('shows the certified experiences of the person in the Experiencia section', async () => {
    const user = userEvent.setup();
    open();
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    await user.click(screen.getByRole('button', { name: 'Experiencia' }));
    const section = screen.getByRole('region', { name: 'Experiencia' });
    expect(within(section).getByLabelText('Rol')).toBeInTheDocument();
    expect(await within(section).findByText('Aún no hay experiencias registradas.')).toBeInTheDocument();
    expect(within(section).getByText(/Rol activo para agregar experiencia:/)).toHaveTextContent('ARQUITECTO PROYECTISTA');
    expect(within(section).getByRole('button', { name: '+ Añadir experiencia' })).toBeInTheDocument();
    expect(service.listExperienceCertificates).toHaveBeenCalledWith(5);
  });

  it('is read-only when the user cannot write', async () => {
    const user = userEvent.setup();
    open({ canWrite: false });
    await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' });

    ['Editar datos', 'Corregir nombre', 'Fusionar con otro…', 'Eliminar'].forEach((name) => expect(screen.queryByRole('button', { name })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Incidencias/ }));
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
    await user.click(screen.getByRole('button', { name: /Incidencias/ }));

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
