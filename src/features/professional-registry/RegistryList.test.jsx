import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({ list: vi.fn(), catalog: vi.fn() }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryList from './RegistryList';

const row = (overrides) => ({
  id: 1, identityType: 'CC', cc: '13439751', name: 'ANA MARIA LOPEZ', nameSource: 'AUTO', status: 'ACTIVO', version: 0, deleted: false,
  projects: 12, flagged: 0, roles: [{ code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', projects: 12, months: 96, outlier: false }], ...overrides,
});
const page = (data, extra) => ({ data: { data, total: data.length, page: 1, limit: 25, ...extra } });

describe('RegistryList', () => {
  beforeEach(() => {
    service.list.mockReset().mockResolvedValue(page([row()]));
    service.catalog.mockReset().mockResolvedValue({ data: { data: [{ code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA' }, { code: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA' }] } });
  });

  it('shows each professional with formatted cédula, expedientes, roles and experience', async () => {
    render(<RegistryList onOpen={() => {}} />);

    expect(await screen.findByText('ANA MARIA LOPEZ')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Profesionales' });
    expect(within(table).getByText('13.439.751')).toBeInTheDocument();
    expect(within(table).getByText('12')).toBeInTheDocument();
    expect(within(table).getByText(/ARQUITECTO PROYECTISTA · 12 · 8 años/)).toBeInTheDocument();
    expect(service.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 25, sort: 'name' }));
  });

  it('marks pending, deleted and misregistered people', async () => {
    service.list.mockResolvedValue(page([row({ status: 'PENDIENTE_REVISION', deleted: true, flagged: 3, cc: null })]));
    render(<RegistryList onOpen={() => {}} />);

    expect(await screen.findByText('Pendiente de revisión', { selector: 'div,span' })).toBeInTheDocument();
    expect(screen.getByText('Eliminado')).toBeInTheDocument();
    expect(screen.getByText('3 nombre(s) mal registrado(s)')).toBeInTheDocument();
    expect(screen.getByText('Sin cédula')).toBeInTheDocument();
  });

  it('sends the filters to the server only when searching, converting years to months', async () => {
    const user = userEvent.setup();
    render(<RegistryList onOpen={() => {}} />);
    await screen.findByText('ANA MARIA LOPEZ');
    service.list.mockClear();

    await user.type(screen.getByLabelText('Nombre, cédula o matrícula'), ' 13439751 ');
    await user.selectOptions(screen.getByLabelText('Rol'), 'GEOTEC');
    await user.selectOptions(screen.getByLabelText('Estado'), 'PENDIENTE_REVISION');
    await user.type(screen.getByLabelText('Expediente'), '26-0166');
    await user.type(screen.getByLabelText('Experiencia mínima (años)'), '5');
    await user.type(screen.getByLabelText('Experiencia máxima (años)'), '10');
    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'projects');
    await user.click(screen.getByLabelText('Con nombre mal registrado'));
    await user.click(screen.getByLabelText('Incluir eliminados'));
    expect(service.list).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(service.list).toHaveBeenCalledTimes(1));
    expect(service.list).toHaveBeenCalledWith({
      q: '13439751', role: 'GEOTEC', status: 'PENDIENTE_REVISION', expediente: '26-0166', minMonths: 60, maxMonths: 120,
      nameFlag: '1', includeDeleted: '1', sort: 'projects', page: 1, limit: 25,
    });
  });

  it('clears the filters and goes back to the first page', async () => {
    const user = userEvent.setup();
    service.list.mockResolvedValue(page([row()], { total: 60 }));
    render(<RegistryList onOpen={() => {}} />);
    await screen.findByText('ANA MARIA LOPEZ');
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));

    await waitFor(() => expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, q: '', role: '' })));
  });

  it('paginates on the server and disables the buttons at the edges', async () => {
    const user = userEvent.setup();
    service.list.mockResolvedValue(page([row()], { total: 60, limit: 25 }));
    render(<RegistryList onOpen={() => {}} />);

    expect(await screen.findByText(/60 profesionales · página 1 de 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(service.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
    expect(await screen.findByText(/página 2 de 3/)).toBeInTheDocument();
  });

  it('opens the detail of the chosen row', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<RegistryList onOpen={onOpen} />);

    await user.click(await screen.findByRole('button', { name: 'Ver ANA MARIA LOPEZ' }));

    expect(onOpen).toHaveBeenCalledWith(1);
  });

  it('shows an empty state and a safe error message', async () => {
    service.list.mockResolvedValueOnce(page([]));
    const { unmount } = render(<RegistryList onOpen={() => {}} />);
    expect(await screen.findByText('No hay profesionales con esos filtros.')).toBeInTheDocument();
    unmount();

    service.list.mockRejectedValue({ response: { status: 500, data: { code: 'SQL', message: 'ER_DUP 13439751' } } });
    render(<RegistryList onOpen={() => {}} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible cargar los profesionales.');
    expect(screen.queryByText(/13439751/)).not.toBeInTheDocument();
  });

  it('ignores a slow earlier answer that arrives after a newer search', async () => {
    const user = userEvent.setup();
    let resolveSlow;
    service.list.mockResolvedValueOnce(page([row()]));
    render(<RegistryList onOpen={() => {}} />);
    await screen.findByText('ANA MARIA LOPEZ');

    service.list.mockImplementationOnce(() => new Promise((resolve) => { resolveSlow = resolve; }));
    await user.type(screen.getByLabelText('Nombre, cédula o matrícula'), 'lento');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    service.list.mockResolvedValueOnce(page([row({ id: 2, name: 'PEDRO RAPIDO', cc: '70111222' })]));
    await user.clear(screen.getByLabelText('Nombre, cédula o matrícula'));
    await user.type(screen.getByLabelText('Nombre, cédula o matrícula'), 'rapido');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('PEDRO RAPIDO')).toBeInTheDocument();

    resolveSlow(page([row({ id: 3, name: 'RESPUESTA LENTA', cc: '80111222' })]));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(screen.queryByText('RESPUESTA LENTA')).not.toBeInTheDocument();
    expect(screen.getByText('PEDRO RAPIDO')).toBeInTheDocument();
  });

  it('keeps working when the role catalog cannot be loaded', async () => {
    service.catalog.mockRejectedValue(new Error('offline'));
    render(<RegistryList onOpen={() => {}} />);

    expect(await screen.findByText('ANA MARIA LOPEZ')).toBeInTheDocument();
    expect(screen.getByLabelText('Rol')).toBeInTheDocument();
  });

  it('reloads when the parent asks for a refresh', async () => {
    const { rerender } = render(<RegistryList onOpen={() => {}} refreshToken={0} />);
    await screen.findByText('ANA MARIA LOPEZ');
    service.list.mockClear();

    rerender(<RegistryList onOpen={() => {}} refreshToken={1} />);

    await waitFor(() => expect(service.list).toHaveBeenCalledTimes(1));
  });
});
