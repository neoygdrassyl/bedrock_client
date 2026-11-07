import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  listValidityCertificates: vi.fn(), createValidityCertificate: vi.fn(),
  deleteValidityCertificate: vi.fn(), downloadValidityCertificateFile: vi.fn(),
}));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryValidityTab, { cleanCode, validateValidityCertificate } from './RegistryValidityTab';

// As the server answers: the most recent issue first.
const CERTIFICATES = [
  { id: 3, code: 'CVAD-2026-4717033', issueDate: '2026-10-01', validUntil: '2027-04-01', status: 'VIGENTE', fileName: 'vigencia-2026.pdf', fileSize: 10 },
  { id: 1, code: 'CVAD-2025-1000', issueDate: '2025-01-10', validUntil: '2025-07-10', status: 'VENCIDO', fileName: 'vigencia-2025.pdf', fileSize: 10 },
];
const DETAIL = { id: 5, version: 4, deleted: false };
const PDF = () => new File(['%PDF-1.4'], 'vigencia.pdf', { type: 'application/pdf' });

const open = (props) => render(
  <RegistryValidityTab detail={DETAIL} canWrite onChanged={vi.fn()} onConflict={vi.fn()} {...props} />,
);

async function fillForm(user, values) {
  const form = screen.getByRole('form', { name: 'Registrar certificado de vigencia' });
  if (values.code) await user.type(within(form).getByLabelText('Código del certificado *'), values.code);
  if (values.issueDate) await user.type(within(form).getByLabelText('Fecha de expedición *'), values.issueDate);
  if (values.file) await user.upload(within(form).getByLabelText('Documento del certificado (PDF) *'), values.file);
  return form;
}

describe('RegistryValidityTab', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.listValidityCertificates.mockResolvedValue({ data: { data: CERTIFICATES, latest: 3 } });
    service.createValidityCertificate.mockResolvedValue({ data: { id: 5, version: 5 } });
    service.deleteValidityCertificate.mockResolvedValue({ data: { id: 5, version: 5 } });
    service.downloadValidityCertificateFile.mockResolvedValue({});
  });

  it('shows the form with native date input and the history in server order, with status and latest badges', async () => {
    open();

    const form = screen.getByRole('form', { name: 'Registrar certificado de vigencia' });
    expect(within(form).getByLabelText('Código del certificado *')).toHaveAttribute('placeholder', 'Ej: CVAD-2026-4717033');
    expect(within(form).getByLabelText('Fecha de expedición *')).toHaveAttribute('type', 'date');
    expect(within(form).getByLabelText('Documento del certificado (PDF) *')).toHaveAttribute('accept', 'application/pdf,.pdf');
    expect(within(form).getByRole('button', { name: 'Registrar certificado' })).toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Historial de certificados de vigencia' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(
      ['Código', 'Fecha de expedición', 'Vigente hasta', 'Estado', 'Documento', 'Acción'],
    );
    await within(table).findByText('CVAD-2025-1000');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getAllByRole('cell').map((cell) => cell.textContent).slice(0, 5)).toEqual(
      ['CVAD-2026-4717033Más reciente', '2026-10-01', '2027-04-01', 'Vigente', 'vigencia-2026.pdf'],
    );
    expect(within(rows[2]).getAllByRole('cell').map((cell) => cell.textContent).slice(0, 5)).toEqual(
      ['CVAD-2025-1000', '2025-01-10', '2025-07-10', 'Vencido', 'vigencia-2025.pdf'],
    );
    expect(rows[1]).toHaveAttribute('aria-current', 'true');
    expect(rows[2]).not.toHaveAttribute('aria-current');
    expect(screen.getAllByText('Más reciente')).toHaveLength(1);
    expect(service.listValidityCertificates).toHaveBeenCalledWith(5);
  });

  it('shows the empty state', async () => {
    service.listValidityCertificates.mockResolvedValue({ data: { data: [], latest: null } });
    open();
    expect(await screen.findByText('Aún no hay certificados de vigencia registrados.')).toBeInTheDocument();
    expect(screen.queryByText('Más reciente')).not.toBeInTheDocument();
  });

  it('downloads the document with its name', async () => {
    open();
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Descargar certificado vigencia-2026.pdf' }));
    expect(service.downloadValidityCertificateFile).toHaveBeenCalledWith(5, 3, 'vigencia-2026.pdf');
  });

  it('validates code, issue date and the PDF like the server', () => {
    const today = '2026-11-06';
    const values = { code: 'CVAD-2026-4717033', issueDate: '2026-10-01' };
    expect(validateValidityCertificate(values, PDF(), today)).toBe('');
    expect(validateValidityCertificate({ ...values, code: '  ' }, PDF(), today)).toBe('El código del certificado es obligatorio.');
    expect(validateValidityCertificate({ ...values, code: 'AB' }, PDF(), today)).toBe('El código del certificado debe tener entre 3 y 64 caracteres.');
    expect(validateValidityCertificate({ ...values, code: 'A'.repeat(65) }, PDF(), today)).toMatch(/entre 3 y 64/);
    expect(validateValidityCertificate({ ...values, code: 'CVAD_2026' }, PDF(), today)).toMatch(/letras, números, guiones, barras y puntos/);
    expect(validateValidityCertificate({ ...values, issueDate: '' }, PDF(), today)).toBe('Indique la fecha de expedición del certificado.');
    expect(validateValidityCertificate({ ...values, issueDate: '1899-12-31' }, PDF(), today)).toBe('La fecha de expedición no puede ser anterior a 1900.');
    expect(validateValidityCertificate({ ...values, issueDate: '2026-11-07' }, PDF(), today)).toBe('La fecha de expedición no puede ser posterior a hoy.');
    expect(validateValidityCertificate(values, null, today)).toBe('Adjunte el documento del certificado (PDF).');
    expect(validateValidityCertificate(values, new File(['x'], 'a.png', { type: 'image/png' }), today)).toBe('El documento del certificado debe ser un archivo PDF.');
    expect(cleanCode('  cvad-2026   4717033 ')).toBe('CVAD-2026 4717033');
  });

  it('shows the first problem and does not send an incomplete form', async () => {
    const user = userEvent.setup();
    open();
    const form = screen.getByRole('form', { name: 'Registrar certificado de vigencia' });
    await user.click(within(form).getByRole('button', { name: 'Registrar certificado' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('El código del certificado es obligatorio.');

    await fillForm(user, { code: 'CVAD-1', issueDate: '2026-10-01' });
    await user.click(within(form).getByRole('button', { name: 'Registrar certificado' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Adjunte el documento del certificado (PDF).');
    expect(service.createValidityCertificate).not.toHaveBeenCalled();
  });

  it('sends the exact form fields with the expected version, then reloads and clears the form', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    open({ onChanged });
    const form = await fillForm(user, { code: ' cvad-2026-4717033 ', issueDate: '2026-10-01', file: PDF() });
    await user.click(within(form).getByRole('button', { name: 'Registrar certificado' }));

    await waitFor(() => expect(service.createValidityCertificate).toHaveBeenCalledTimes(1));
    const [id, body] = service.createValidityCertificate.mock.calls[0];
    expect(id).toBe(5);
    expect([...body.keys()]).toEqual(['code', 'issueDate', 'expectedVersion', 'file']);
    expect(Object.fromEntries([...body.entries()].filter(([key]) => key !== 'file'))).toEqual({
      code: 'CVAD-2026-4717033', issueDate: '2026-10-01', expectedVersion: '4',
    });
    expect(body.get('file').name).toBe('vigencia.pdf');
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Certificado de vigencia registrado.'));
    expect(service.listValidityCertificates).toHaveBeenCalledTimes(2);
    expect(within(form).getByLabelText('Código del certificado *')).toHaveValue('');
    expect(within(form).getByLabelText('Fecha de expedición *')).toHaveValue('');
  });

  it('shows the server message for a repeated code and reloads the detail on a version conflict', async () => {
    const user = userEvent.setup();
    const onConflict = vi.fn();
    service.createValidityCertificate.mockRejectedValueOnce({ response: { status: 409, data: { code: 'CERTIFICATE_EXISTS', message: 'Ese certificado ya está registrado para este profesional.' } } });
    open({ onConflict });
    const form = await fillForm(user, { code: 'CVAD-2026-4717033', issueDate: '2026-10-01', file: PDF() });
    await user.click(within(form).getByRole('button', { name: 'Registrar certificado' }));
    expect(await within(form).findByRole('alert')).toHaveTextContent('Ese certificado ya está registrado para este profesional.');
    expect(onConflict).not.toHaveBeenCalled();
    expect(within(form).getByLabelText('Código del certificado *')).toHaveValue('CVAD-2026-4717033');

    service.createValidityCertificate.mockRejectedValueOnce({ response: { status: 409, data: { code: 'VERSION_CONFLICT', message: 'Otra persona modificó este registro.' } } });
    await user.click(within(form).getByRole('button', { name: 'Registrar certificado' }));
    expect(await within(form).findByText('Otra persona modificó este registro.')).toBeInTheDocument();
    expect(onConflict).toHaveBeenCalled();
  });

  it('deletes after confirmation, with the expected version', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    open({ onChanged });
    const table = await screen.findByRole('table', { name: 'Historial de certificados de vigencia' });
    const [first] = await within(table).findAllByRole('button', { name: 'Eliminar' });
    await user.click(first);
    expect(service.deleteValidityCertificate).not.toHaveBeenCalled();
    await user.click(within(table).getByRole('button', { name: 'Cancelar' }));
    expect(within(table).queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();

    await user.click(within(table).getAllByRole('button', { name: 'Eliminar' })[0]);
    await user.click(within(table).getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(service.deleteValidityCertificate).toHaveBeenCalledWith(5, 3, { expectedVersion: 4 }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Certificado de vigencia eliminado.'));
  });

  it('is read only for a person who cannot write and for a deleted professional', async () => {
    const { unmount } = open({ canWrite: false });
    await screen.findByText('CVAD-2026-4717033');
    expect(screen.queryByRole('form', { name: 'Registrar certificado de vigencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar certificado vigencia-2026.pdf' })).toBeInTheDocument();
    unmount();

    open({ detail: { ...DETAIL, deleted: true } });
    await screen.findByText('CVAD-2026-4717033');
    expect(screen.queryByRole('form', { name: 'Registrar certificado de vigencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});
