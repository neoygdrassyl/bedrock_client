import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  list: vi.fn(), catalog: vi.fn(), get: vi.fn(), reviewSummary: vi.fn(), review: vi.fn(), consolidate: vi.fn(), create: vi.fn(), resolve: vi.fn(),
}));
const session = vi.hoisted(() => ({ user: { role_short: 'Admin.', role: 'Administrador' } }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));
vi.mock('@/shared/api/data.service', () => ({ default: { getUserData: () => session.user } }));

import ProfessionalRegistryPage from './ProfessionalRegistryPage';

const rows = [{ id: 1, identityType: 'CC', cc: '13439751', name: 'ANA MARIA LOPEZ', nameSource: 'AUTO', status: 'ACTIVO', version: 0, deleted: false, projects: 2, flagged: 0, roles: [] }];

describe('ProfessionalRegistryPage', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    session.user = { role_short: 'Admin.', role: 'Administrador' };
    service.list.mockResolvedValue({ data: { data: rows, total: 1, page: 1, limit: 25 } });
    service.catalog.mockResolvedValue({ data: { data: [] } });
    service.reviewSummary.mockResolvedValue({ data: { duplicados: 4, nombres: 0, identidad: 0, experiencia: 0, roles: 0 } });
    service.review.mockResolvedValue({ data: { type: 'duplicados', data: [], total: 0, page: 1, limit: 25 } });
    service.get.mockResolvedValue({ data: { id: 1, name: 'ANA MARIA LOPEZ', cc: '13439751', nameSource: 'AUTO', status: 'ACTIVO', version: 0, deleted: false, identifiers: [], roles: [], misregistered: [], audit: [], duplicates: [], unlinked: 0 } });
  });

  it('shows the module title, the list and the write actions to an administrator', async () => {
    render(<ProfessionalRegistryPage />);

    expect(screen.getByRole('heading', { name: 'BD PROFESIONALES' })).toBeInTheDocument();
    expect(await screen.findByText('ANA MARIA LOPEZ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo profesional' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reconciliar' })).toBeInTheDocument();
  });

  it('is consultation only for a lawyer: no create or reconcile buttons, not even in the review view', async () => {
    const user = userEvent.setup();
    session.user = { role_short: 'Abg.', role: 'Abogado' };
    render(<ProfessionalRegistryPage />);

    expect(await screen.findByText('ANA MARIA LOPEZ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nuevo profesional' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reconciliar' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Por revisar' }));
    expect(await screen.findByText('No hay casos pendientes en esta cola.')).toBeInTheDocument();
  });

  it('switches between the list and the review queues', async () => {
    const user = userEvent.setup();
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');

    await user.click(screen.getByRole('button', { name: 'Por revisar' }));
    expect(await screen.findByRole('region', { name: 'Por revisar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Por revisar' })).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByRole('button', { name: 'Profesionales' }));
    expect(await screen.findByRole('region', { name: 'Listado de profesionales' })).toBeInTheDocument();
  });

  it('opens the detail of a professional from the list', async () => {
    const user = userEvent.setup();
    render(<ProfessionalRegistryPage />);

    await user.click(await screen.findByRole('button', { name: 'Ver ANA MARIA LOPEZ' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(service.get).toHaveBeenCalledWith(1));
  });

  it('creates a professional, refreshes the list and opens the new one', async () => {
    const user = userEvent.setup();
    service.create.mockResolvedValue({ data: { id: 9, version: 0 } });
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');
    service.list.mockClear();

    await user.click(screen.getByRole('button', { name: 'Nuevo profesional' }));
    await user.type(screen.getByLabelText('Nombre completo *'), 'Pedro Gómez');
    await user.type(screen.getByLabelText('Cédula'), '70111222');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(service.get).toHaveBeenCalledWith(9));
    expect(service.list).toHaveBeenCalled();
  });

  it('opens the reconciliation without computing; the dry run starts from its button and applies on confirmation', async () => {
    const user = userEvent.setup();
    service.consolidate
      .mockResolvedValueOnce({ data: { sourceRows: 5934, participationsNew: 3, participationsUpdated: 1, registriesNew: 1, duplicateCandidatesNew: 0, unidentified: 10, plannedWrites: 9 } })
      .mockResolvedValueOnce({ data: { sourceRows: 5934, participationsNew: 3, participationsUpdated: 1, registriesNew: 1, duplicateCandidatesNew: 0, unidentified: 10, plannedWrites: 9 } });
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');

    await user.click(screen.getByRole('button', { name: 'Reconciliar' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Calcular cambios' })).toBeEnabled();
    expect(within(dialog).getByRole('button', { name: 'Aplicar cambios' })).toBeDisabled();
    expect(service.consolidate).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Calcular cambios' }));
    expect(await within(dialog).findByText('Cambios a escribir')).toBeInTheDocument();
    expect(service.consolidate).toHaveBeenCalledTimes(1);
    expect(service.consolidate).toHaveBeenCalledWith({ apply: false });

    await user.click(within(dialog).getByRole('button', { name: 'Aplicar cambios' }));
    await waitFor(() => expect(service.consolidate).toHaveBeenLastCalledWith({ apply: true }));
    expect(await within(dialog).findByText('Cambios aplicados.')).toBeInTheDocument();
  });

  it('disables the compute button while the dry run is running', async () => {
    const user = userEvent.setup();
    let finish;
    service.consolidate.mockReturnValueOnce(new Promise((resolve) => { finish = resolve; }));
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');

    await user.click(screen.getByRole('button', { name: 'Reconciliar' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Calcular cambios' }));

    expect(within(dialog).getByRole('button', { name: 'Calcular cambios' })).toBeDisabled();
    expect(within(dialog).getByText('Calculando…')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Calcular cambios' }));
    expect(service.consolidate).toHaveBeenCalledTimes(1);

    finish({ data: { sourceRows: 5934, plannedWrites: 2 } });
    expect(await within(dialog).findByText('Cambios a escribir')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Calcular cambios' })).toBeEnabled();
  });

  it('does not offer to apply when there is nothing to change, and explains a refusal', async () => {
    const user = userEvent.setup();
    service.consolidate.mockResolvedValueOnce({ data: { sourceRows: 5934, plannedWrites: 0 } });
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');

    await user.click(screen.getByRole('button', { name: 'Reconciliar' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Calcular cambios' }));
    expect(await within(dialog).findByRole('button', { name: 'Sin cambios pendientes' })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }));

    service.consolidate.mockRejectedValueOnce({ response: { status: 403, data: {} } });
    await user.click(screen.getByRole('button', { name: 'Reconciliar' }));
    const reopened = await screen.findByRole('dialog');
    await user.click(within(reopened).getByRole('button', { name: 'Calcular cambios' }));
    expect(await screen.findByText('No tiene permisos para realizar esta acción.')).toBeInTheDocument();
  });

  it('explains that another consolidation is running', async () => {
    const user = userEvent.setup();
    const message = 'Hay otra consolidación en curso. Intente de nuevo en unos minutos.';
    service.consolidate.mockRejectedValueOnce({ response: { status: 409, data: { code: 'CONSOLIDATION_RUNNING', message } } });
    render(<ProfessionalRegistryPage />);
    await screen.findByText('ANA MARIA LOPEZ');

    await user.click(screen.getByRole('button', { name: 'Reconciliar' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Calcular cambios' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(message);
    expect(within(dialog).getByRole('button', { name: 'Calcular cambios' })).toBeEnabled();
  });
});
