import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({ reviewSummary: vi.fn(), review: vi.fn(), resolve: vi.fn(), list: vi.fn() }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryReview from './RegistryReview';

const queues = {
  duplicados: [{ id: 9, reason: 'MISMO_NOMBRE', a: { id: 1, name: 'ANA LOPEZ', cc: '914980007', projects: 3 }, b: { id: 2, name: 'ANA LOPEZ', cc: '91498007', projects: 1 } }],
  nombres: [{ id: 21, registryId: 1, canonicalName: 'ANA MARIA LOPEZ', name: 'JUAN PEREZ', expediente: '68001-1-25-0007', diffType: 'REVISAR_IDENTIDAD', similarity: 0.42 }],
  identidad: [
    { kind: 'persona', id: 4, registryId: 4, name: 'SOLO NOMBRE', expediente: null, version: 2 },
    { kind: 'participacion', id: 30, registryId: null, name: '', expediente: '68001-1-24-0001', version: 0 },
  ],
  experiencia: [{ registryId: 1, name: 'ANA LOPEZ', roleCode: 'ARQ_PROY', monthsLatest: 24, monthsMax: 21731 }],
  roles: [{ id: 50, registryId: 1, role: 'PLOMERO', expediente: '68001-1-24-0009' }],
};

function mockQueues() {
  service.reviewSummary.mockResolvedValue({ data: { duplicados: 1, nombres: 1, identidad: 2, experiencia: 1, roles: 1 } });
  service.review.mockImplementation(({ type }) => Promise.resolve({ data: { type, data: queues[type], total: queues[type].length, page: 1, limit: 25 } }));
  service.resolve.mockResolvedValue({ data: {} });
}

describe('RegistryReview', () => {
  beforeEach(() => { Object.values(service).forEach((fn) => fn.mockReset()); mockQueues(); });

  it('shows the counts of every queue and loads the duplicates first', async () => {
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);

    expect(await screen.findByText('Mismo nombre con otra cédula')).toBeInTheDocument();
    expect(service.review).toHaveBeenCalledWith({ type: 'duplicados', page: 1, limit: 25 });
    expect(screen.getByRole('button', { name: /Identidad pendiente/ })).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /Posibles duplicados/ })).toHaveAttribute('aria-current', 'page');
  });

  it('merges keeping either person or dismisses the pair', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<RegistryReview canWrite onChanged={onChanged} onOpen={() => {}} />);
    await screen.findByText('Mismo nombre con otra cédula');

    await user.click(screen.getAllByRole('button', { name: 'Conservar «ANA LOPEZ»' })[0]);
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'duplicados', id: 9, action: 'merge', keepId: 1 }));
    await user.click(screen.getAllByRole('button', { name: 'Conservar «ANA LOPEZ»' })[1]);
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'duplicados', id: 9, action: 'merge', keepId: 2 }));
    await user.click(screen.getByRole('button', { name: 'No son la misma persona' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'duplicados', id: 9, action: 'dismiss' }));
    expect(onChanged).toHaveBeenCalledTimes(3);
  });

  it('hides every action when the user cannot write', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite={false} onChanged={() => {}} onOpen={() => {}} />);
    await screen.findByText('Mismo nombre con otra cédula');

    expect(screen.queryByRole('button', { name: /Conservar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'No son la misma persona' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Nombres dudosos/ }));
    await screen.findByText('JUAN PEREZ');
    expect(screen.queryByRole('button', { name: 'Marcar revisado' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver profesional' })).toBeInTheDocument();
  });

  it('reviews a doubtful name', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Nombres dudosos/ }));

    expect(await screen.findByText(/Nombre canónico: ANA MARIA LOPEZ · Posible otra persona · 42%/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcar revisado' }));

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'nombres', id: 21, action: 'reviewed' }));
  });

  it('confirms a pending identity and assigns an unidentified participation', async () => {
    const user = userEvent.setup();
    service.list.mockResolvedValue({ data: { data: [{ id: 1, name: 'ANA LOPEZ', cc: '914980007', projects: 3 }] } });
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Identidad pendiente/ }));

    await user.click(await screen.findByRole('button', { name: 'Confirmar identidad' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'identidad', action: 'confirm', id: 4, expectedVersion: 2 }));

    await user.click(screen.getByRole('button', { name: 'Asignar a un profesional' }));
    await user.type(screen.getByLabelText('Profesional correcto'), 'ana');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /ANA LOPEZ/ }));
    await user.click(screen.getByRole('button', { name: 'Asignar' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'identidad', action: 'assign', participationId: 30, registryId: 1 }));
  });

  it('accepts the latest experience of an atypical case', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Experiencia atípica/ }));

    expect(await screen.findByText(/Último: 2 años · Máximo: 1810 años 11 meses/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aceptar 2 años' }));

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'experiencia', action: 'override', registryId: 1, roleCode: 'ARQ_PROY', months: 24 }));
  });

  it('lists participations without a role and shows empty queues and errors', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Rol sin clasificar/ }));
    expect(await screen.findByText('PLOMERO')).toBeInTheDocument();

    service.review.mockImplementation(({ type }) => Promise.resolve({ data: { type, data: [], total: 0, page: 1, limit: 25 } }));
    await user.click(screen.getByRole('button', { name: /Posibles duplicados/ }));
    expect(await screen.findByText('No hay casos pendientes en esta cola.')).toBeInTheDocument();

    service.review.mockRejectedValue({ response: { status: 500, data: { code: 'X', message: 'interno 13439751' } } });
    await user.click(screen.getByRole('button', { name: /Nombres dudosos/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible cargar la cola de revisión.');
    expect(screen.queryByText(/13439751/)).not.toBeInTheDocument();
  });

  it('opens a person from the queue and shows a failed resolution without reloading the list', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    service.resolve.mockRejectedValue({ response: { status: 409, data: { code: 'NOT_FOUND', message: 'El caso ya no está abierto.' } } });
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={onOpen} />);
    await screen.findByText('Mismo nombre con otra cédula');

    await user.click(screen.getAllByRole('button', { name: 'ANA LOPEZ' })[0]);
    expect(onOpen).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'No son la misma persona' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El caso ya no está abierto.');
  });
});
