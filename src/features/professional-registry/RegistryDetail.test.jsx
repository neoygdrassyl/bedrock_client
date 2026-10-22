import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  get: vi.fn(), setCanonicalName: vi.fn(), remove: vi.fn(), restore: vi.fn(), merge: vi.fn(), relink: vi.fn(), resolve: vi.fn(),
  list: vi.fn(), update: vi.fn(), create: vi.fn(),
}));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryDetail from './RegistryDetail';

const detail = (overrides) => ({
  id: 5, identityType: 'CC', cc: '13439751', name: 'ANA MARIA LOPEZ', nameSource: 'AUTO', email: 'ana@example.com', phone: '3001112233',
  status: 'ACTIVO', version: 2, deleted: false, manualFields: [], unlinked: 0,
  identifiers: [{ kind: 'CC', value: '13.439.751', source: 'AUTO' }, { kind: 'MATRICULA', value: '68202-158428', source: 'AUTO' }],
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
    [service.setCanonicalName, service.remove, service.restore, service.merge, service.relink, service.resolve, service.update].forEach((fn) => fn.mockResolvedValue({ data: {} }));
  });

  it('shows the person data, identifiers and possible duplicates', async () => {
    open();

    expect(await screen.findByRole('heading', { name: 'ANA MARIA LOPEZ' })).toBeInTheDocument();
    expect(screen.getByText('Cédula 13.439.751')).toBeInTheDocument();
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('Matrícula: 68202-158428')).toBeInTheDocument();
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
