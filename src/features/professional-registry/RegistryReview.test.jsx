import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({ reviewSummary: vi.fn(), review: vi.fn(), resolve: vi.fn(), update: vi.fn(), list: vi.fn() }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryReview from './RegistryReview';

const queues = {
  duplicados: [{ id: 9, reason: 'MISMO_NOMBRE', a: { id: 1, name: 'ANA LOPEZ', cc: '914980007', projects: 3 }, b: { id: 2, name: 'ANA LOPEZ', cc: '91498007', projects: 1 } }],
  nombres: [{ id: 21, registryId: 1, canonicalName: 'ANA MARIA LOPEZ', name: 'JUAN PEREZ', expediente: '68001-1-25-0007', diffType: 'REVISAR_IDENTIDAD', similarity: 0.42 }],
  matricula: [
    {
      kind: 'principal', registryId: 5, name: 'JHON DOMINGUEZ', cc: '91492000', version: 3,
      options: [
        { value: '68202158428STD', valueNorm: '68202158428STD', projects: 23 },
        { value: 'A68212001-91492000', valueNorm: 'A6821200191492000', projects: 23 },
      ],
    },
    {
      kind: 'fecha', registryId: 6, name: 'ELSA RUIZ', cc: '63111222', version: 2,
      registration: '64001-8875', valueNorm: '640018875',
      dates: [{ date: '2000-07-19', projects: 8 }, { date: '2021-07-19', projects: 1 }],
    },
  ],
  experiencia: [
    { kind: 'rol', registryId: 1, name: 'ANA LOPEZ', roleCode: 'ARQ_PROY', monthsLatest: 24, monthsMax: 21731 },
  ],
  roles: [{ id: 50, registryId: 1, role: 'PLOMERO', expediente: '68001-1-24-0009' }],
  fusionar: [{
    id: 7,
    reason: 'CEDULA_SIMILAR',
    a: { id: 10, name: 'JOSE RAMON OROZCO', cc: '1098612', projects: 4 },
    b: { id: 11, name: 'JOSE RAMON OROSCO', cc: '1097612', projects: 1 },
    differs: { name: true, cc: true },
  }],
  compartida: [{
    id: 8,
    reason: 'MATRICULA_COMPARTIDA',
    a: { id: 20, name: 'JORGE RIOS', cc: '70111222', projects: 2 },
    b: { id: 21, name: 'CARLOS MORA', cc: '80333444', projects: 5 },
  }],
};
const SUMMARY = { duplicados: 1, fusionar: 1, compartida: 1, nombres: 1, matricula: 1, experiencia: 1, roles: 1 };

function mockQueues() {
  service.reviewSummary.mockResolvedValue({ data: SUMMARY });
  service.review.mockImplementation(({ type }) => Promise.resolve({ data: { type, data: queues[type], total: queues[type].length, page: 1, limit: 25 } }));
  service.resolve.mockResolvedValue({ data: {} });
}

describe('RegistryReview', () => {
  beforeEach(() => { Object.values(service).forEach((fn) => fn.mockReset()); mockQueues(); });

  it('shows the counts of every queue and loads the duplicates first', async () => {
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);

    expect(await screen.findByText('Mismo nombre con otra cédula')).toBeInTheDocument();
    expect(service.review).toHaveBeenCalledWith({ type: 'duplicados', page: 1, limit: 25 });
    expect(screen.queryByRole('button', { name: /Identidad pendiente/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Experiencia atípica/ })).toHaveTextContent('1');
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

  it('lets the user choose the principal matrícula when several tie for the most expedientes', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    expect(await screen.findByRole('button', { name: /Matrícula múltiple/ })).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: /Matrícula múltiple/ }));

    expect(await screen.findByText('A68212001-91492000')).toBeInTheDocument();
    expect(screen.getByText('Matrícula principal empatada')).toBeInTheDocument();
    expect(screen.getAllByText('23 expedientes')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Usar como principal' })).toHaveLength(2);
    await user.click(screen.getAllByRole('button', { name: 'Usar como principal' })[0]);

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({
      type: 'matricula', action: 'choose', registryId: 5, value: '68202158428STD', expectedVersion: 3,
    }));
  });

  it('lets the user type the right matrícula when none of the options is correct', async () => {
    const user = userEvent.setup();
    service.update.mockResolvedValue({ data: { id: 5, version: 4 } });
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Matrícula múltiple/ }));
    await user.click(await screen.findByRole('button', { name: 'Ninguna es correcta' }));

    await user.type(screen.getByLabelText('Matrícula correcta de JHON DOMINGUEZ'), '6-8');
    await user.click(screen.getByRole('button', { name: 'Guardar matrícula' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('entre 4 y 40 caracteres');
    expect(service.update).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText('Matrícula correcta de JHON DOMINGUEZ'));
    await user.type(screen.getByLabelText('Matrícula correcta de JHON DOMINGUEZ'), '68202-999999');
    await user.click(screen.getByRole('button', { name: 'Guardar matrícula' }));
    await waitFor(() => expect(service.update).toHaveBeenCalledWith(5, { expectedVersion: 3, registration: '68202-999999' }));
    await waitFor(() => expect(service.review).toHaveBeenCalledTimes(3));
  });

  it('shows the server refusal when the typed matrícula belongs to someone else and lets the user cancel', async () => {
    const user = userEvent.setup();
    service.update.mockRejectedValue({ response: { status: 409, data: { code: 'REGISTRATION_EXISTS', message: 'Ya existe un profesional con esa matrícula.' } } });
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Matrícula múltiple/ }));
    await user.click(await screen.findByRole('button', { name: 'Ninguna es correcta' }));
    await user.type(screen.getByLabelText('Matrícula correcta de JHON DOMINGUEZ'), '68202999999');
    await user.click(screen.getByRole('button', { name: 'Guardar matrícula' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un profesional con esa matrícula.');
    expect(screen.getByLabelText('Matrícula correcta de JHON DOMINGUEZ')).toHaveValue('68202999999');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('button', { name: 'Ninguna es correcta' })).toBeInTheDocument();
  });

  it('hides the choose buttons when the user cannot write', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite={false} onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Matrícula múltiple/ }));
    await screen.findByText('A68212001-91492000');
    expect(screen.queryByRole('button', { name: 'Usar como principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Usar esta fecha' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ninguna es correcta' })).not.toBeInTheDocument();
  });

  it('accepts the latest experience of an atypical case', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Experiencia atípica/ }));

    expect(await screen.findByText(/Último: 2 años · Máximo:/)).toBeInTheDocument();
    expect(screen.getByText('1810 años 11 meses')).toHaveClass('text-destructive');
    expect(screen.getByText('Valor improbable: revisar expedientes').closest('li')).toHaveAttribute('data-implausible', 'true');
    await user.click(screen.getByRole('button', { name: 'Aceptar 2 años' }));

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'experiencia', action: 'override', registryId: 1, roleCode: 'ARQ_PROY', months: 24 }));
  });

  it('lists a matrícula whose expedientes carry different issue dates and lets the user pick the right one', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Matrícula múltiple/ }));

    expect(await screen.findByText('Fechas de expedición distintas')).toBeInTheDocument();
    expect(screen.getByText(/Los expedientes de la matrícula 64001-8875 traen fechas/)).toBeInTheDocument();
    expect(screen.getByText('8 expedientes')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Usar esta fecha' })[0]);
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({
      type: 'matricula', action: 'date', registryId: 6, value: '640018875', date: '2000-07-19', expectedVersion: 2,
    }));
  });

  it('keeps the atypical experience queue for months only', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /Experiencia atípica/ }));
    await screen.findByText(/Último: 2 años/);
    expect(screen.queryByText('Fechas de expedición distintas')).not.toBeInTheDocument();
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
  it('merges a typing error keeping the right name and the right cédula', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<RegistryReview canWrite onChanged={onChanged} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /^Fusionar/ }));
    await screen.findByText('Cédula casi igual');
    const merge = screen.getByRole('button', { name: 'Fusionar' });

    expect(merge).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'JOSE RAMON OROZCO' }));
    expect(merge).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: '1.097.612' }));
    await user.click(merge);

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({
      type: 'fusionar', id: 7, action: 'merge', nameFrom: 10, ccFrom: 11,
    }));
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it('asks only for what differs between the two records', async () => {
    const user = userEvent.setup();
    // The same name with a distant cédula: only the cédula is asked.
    const onlyCc = Object.assign({}, queues.fusionar[0], {
      reason: 'MISMO_NOMBRE',
      b: { id: 11, name: 'JOSE RAMON OROZCO', cc: '91237337', projects: 14 },
      differs: { name: false, cc: true },
    });
    service.review.mockImplementation(({ type }) => Promise.resolve({
      data: { type, data: type === 'fusionar' ? [onlyCc] : queues[type], total: 1, page: 1, limit: 25 },
    }));
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /^Fusionar/ }));
    await screen.findByText('Mismo nombre con otra cédula');

    expect(screen.queryByRole('group', { name: 'Nombre correcto' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '1.098.612' }));
    await user.click(screen.getByRole('button', { name: 'Fusionar' }));

    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({
      type: 'fusionar', id: 7, action: 'merge', nameFrom: 10, ccFrom: 10,
    }));
  });

  it('dismisses a typing-error pair and resolves a shared matrícula keeping one person', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /^Fusionar/ }));
    await screen.findByText('Cédula casi igual');
    await user.click(screen.getByRole('button', { name: 'No son la misma persona' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({ type: 'fusionar', id: 7, action: 'dismiss' }));

    await user.click(screen.getByRole('button', { name: /Matrícula compartida/ }));
    await screen.findByText('JORGE RIOS');
    await user.click(screen.getByRole('button', { name: 'Conservar «CARLOS MORA»' }));
    await waitFor(() => expect(service.resolve).toHaveBeenCalledWith({
      type: 'compartida', id: 8, action: 'merge', keepId: 21,
    }));
  });

  it('shows only the queues the backend reports', async () => {
    service.reviewSummary.mockResolvedValue({ data: { duplicados: 1, nombres: 1, matricula: 1, experiencia: 1, roles: 1 } });
    render(<RegistryReview canWrite onChanged={() => {}} onOpen={() => {}} />);
    await screen.findByText('Mismo nombre con otra cédula');

    await waitFor(() => expect(screen.queryByRole('button', { name: /^Fusionar/ })).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Matrícula compartida/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Posibles duplicados/ })).toBeInTheDocument();
  });

  it('shows the typing-error pair without choices to a user who cannot write', async () => {
    const user = userEvent.setup();
    render(<RegistryReview canWrite={false} onChanged={() => {}} onOpen={() => {}} />);
    await user.click(await screen.findByRole('button', { name: /^Fusionar/ }));
    await screen.findByText('Cédula casi igual');

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Fusionar' })).not.toBeInTheDocument();
  });
});
