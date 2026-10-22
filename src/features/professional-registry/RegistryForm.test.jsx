import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryForm, { validateRegistryForm } from './RegistryForm';

const base = { name: 'Ana María Pérez', cc: '13.439.751', registration: '', email: '', phone: '' };

describe('validateRegistryForm', () => {
  it('accepts a complete create form', () => {
    expect(validateRegistryForm(base, 'create')).toEqual({});
  });

  it('requires a valid name and a cédula or matrícula when creating', () => {
    expect(validateRegistryForm({ ...base, name: 'Al' }, 'create').name).toMatch(/nombre/);
    expect(validateRegistryForm({ ...base, name: 'Ana 2' }, 'create').name).toMatch(/nombre/);
    expect(validateRegistryForm({ ...base, cc: '', registration: '' }, 'create').cc).toMatch(/cédula o/);
    expect(validateRegistryForm({ ...base, cc: '', registration: 'M-12345' }, 'create')).toEqual({});
    expect(validateRegistryForm({ ...base, cc: '', registration: 'A-1' }, 'create').registration).toMatch(/matrícula/);
  });

  it('rejects malformed cédula, email and phone', () => {
    expect(validateRegistryForm({ ...base, cc: '12345' }, 'create').cc).toMatch(/6 y 10/);
    expect(validateRegistryForm({ ...base, cc: 'A30592012-1098660047' }, 'create').cc).toMatch(/6 y 10/);
    expect(validateRegistryForm({ ...base, cc: '10988672028' }, 'create').cc).toMatch(/6 y 10/);
    expect(validateRegistryForm({ ...base, email: 'sin arroba' }, 'create').email).toMatch(/correo/);
    expect(validateRegistryForm({ ...base, phone: 'llamar' }, 'create').phone).toMatch(/teléfono/);
  });

  it('does not ask for a name or identity when editing', () => {
    expect(validateRegistryForm({ name: '', cc: '', registration: '', email: 'a@b.co', phone: '3001112233' }, 'edit')).toEqual({});
  });
});

describe('RegistryForm', () => {
  beforeEach(() => { service.create.mockReset(); service.update.mockReset(); });

  it('shows the errors and does not call the API when the form is invalid', async () => {
    const user = userEvent.setup();
    render(<RegistryForm open mode="create" onClose={() => {}} onSaved={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(service.create).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('creates a professional and reports the saved id', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    service.create.mockResolvedValue({ data: { id: 41, version: 0 } });
    render(<RegistryForm open mode="create" onClose={() => {}} onSaved={onSaved} />);

    await user.type(screen.getByLabelText('Nombre completo *'), 'Ana María Pérez');
    await user.type(screen.getByLabelText('Cédula'), '13.439.751');
    await user.type(screen.getByLabelText('Correo'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ id: 41, version: 0 }));
    expect(service.create).toHaveBeenCalledWith({ name: 'Ana María Pérez', cc: '13.439.751', registration: '', email: 'ana@example.com', phone: '' });
  });

  it('offers to open the existing professional when the cédula is taken', async () => {
    const user = userEvent.setup();
    const onOpenExisting = vi.fn();
    service.create.mockRejectedValue({ response: { status: 409, data: { code: 'CC_EXISTS', message: 'Ya existe un profesional con esa cédula.', id: 77 } } });
    render(<RegistryForm open mode="create" onClose={() => {}} onSaved={() => {}} onOpenExisting={onOpenExisting} />);

    await user.type(screen.getByLabelText('Nombre completo *'), 'Ana María Pérez');
    await user.type(screen.getByLabelText('Cédula'), '13439751');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Ya existe un profesional con esa cédula.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abrir el profesional existente' }));
    expect(onOpenExisting).toHaveBeenCalledWith(77);
  });

  it('edits with the expected version and sends the cédula only when it changed', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    service.update.mockResolvedValue({ data: { id: 7, version: 4 } });
    const registry = { id: 7, cc: '13439751', email: 'viejo@example.com', phone: '', version: 3 };
    const { rerender } = render(<RegistryForm open mode="edit" registry={registry} onClose={() => {}} onSaved={onSaved} />);

    expect(screen.getByLabelText('Cédula')).toHaveValue('13439751');
    await user.clear(screen.getByLabelText('Correo'));
    await user.type(screen.getByLabelText('Correo'), 'nuevo@example.com');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(service.update).toHaveBeenCalledWith(7, { expectedVersion: 3, email: 'nuevo@example.com', phone: '' });

    rerender(<RegistryForm open mode="edit" registry={{ ...registry, version: 4 }} onClose={() => {}} onSaved={onSaved} />);
    await user.clear(screen.getByLabelText('Cédula'));
    await user.type(screen.getByLabelText('Cédula'), '13.439.752');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(service.update).toHaveBeenCalledTimes(2));
    expect(service.update.mock.calls[1][1]).toMatchObject({ expectedVersion: 4, cc: '13.439.752' });
  });

  it('shows a version conflict and lets the user reload', async () => {
    const user = userEvent.setup();
    const onConflict = vi.fn();
    service.update.mockRejectedValue({ response: { status: 409, data: { code: 'VERSION_CONFLICT', message: 'Otra persona modificó este registro.' } } });
    render(<RegistryForm open mode="edit" registry={{ id: 7, cc: '13439751', email: '', phone: '', version: 3 }} onClose={() => {}} onSaved={() => {}} onConflict={onConflict} />);

    await user.type(screen.getByLabelText('Teléfono'), '3001112233');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Otra persona modificó este registro.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Recargar datos' }));
    expect(onConflict).toHaveBeenCalled();
  });
});
