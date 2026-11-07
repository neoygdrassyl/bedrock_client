import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const service = vi.hoisted(() => ({
  catalog: vi.fn(), listExperienceCertificates: vi.fn(), createExperienceCertificate: vi.fn(),
  deleteExperienceCertificate: vi.fn(), downloadExperienceCertificateFile: vi.fn(),
}));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import RegistryExperienceTab from './RegistryExperienceTab';
import { validateExperience } from './RegistryExperienceDialog';

const CATALOG = [
  { code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', requiredYears: null },
  { code: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', requiredYears: 5 },
];
const CERTIFICATES = [
  { id: 1, roleCode: 'GEOTEC', roleLabel: 'INGENIERO CIVIL GEOTECNISTA', company: 'Suelos SAS', nit: '900123', duties: 'Estudios de suelos',
    startDate: '2020-01-01', endDate: '2020-12-31', duration: { years: 1, months: 0, days: 0 }, hasFile: true, fileName: 'cert.pdf' },
  { id: 2, roleCode: 'GEOTEC', roleLabel: 'INGENIERO CIVIL GEOTECNISTA', company: 'Taludes Ltda', nit: null, duties: null,
    startDate: '2021-03-01', endDate: '2021-03-31', duration: { years: 0, months: 1, days: 0 }, hasFile: false, fileName: null },
];
const DETAIL = { id: 5, version: 4, deleted: false, roles: [{ code: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA' }] };

const open = (props) => render(
  <RegistryExperienceTab detail={DETAIL} canWrite onChanged={vi.fn()} onConflict={vi.fn()} {...props} />,
);

async function fillDialog(user, values) {
  const dialog = screen.getByRole('dialog', { name: 'Nueva experiencia certificada' });
  const type = async (label, value) => { if (value) await user.type(within(dialog).getByLabelText(label), value); };
  await type('Nombre de la empresa *', values.company);
  await type('NIT de la empresa', values.nit);
  await type('Labores realizadas', values.duties);
  await type('Fecha inicio *', values.startDate);
  await type('Fecha fin *', values.endDate);
  return dialog;
}

describe('RegistryExperienceTab', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.catalog.mockResolvedValue({ data: { data: CATALOG } });
    service.listExperienceCertificates.mockResolvedValue({ data: { data: CERTIFICATES, rolesWithExperience: 1 } });
    service.createExperienceCertificate.mockResolvedValue({ data: { id: 5, version: 5 } });
    service.deleteExperienceCertificate.mockResolvedValue({ data: { id: 5, version: 5 } });
    service.downloadExperienceCertificateFile.mockResolvedValue({});
  });

  it('shows the role select, the active role, the badge and the certificates table', async () => {
    open();

    const select = await screen.findByLabelText('Rol');
    await waitFor(() => expect(select).toHaveValue('GEOTEC'));
    expect(within(select).getAllByRole('option').map((option) => option.textContent)).toEqual(CATALOG.map((role) => role.label));
    expect(screen.getByText(/Rol activo para agregar experiencia:/)).toHaveTextContent('Rol activo para agregar experiencia: INGENIERO CIVIL GEOTECNISTA');
    expect(screen.getByText('1 rol con experiencia')).toBeInTheDocument();

    const table = screen.getByRole('table', { name: 'Experiencias certificadas registradas' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(
      ['Rol', 'Empresa', 'NIT', 'Labores', 'Fecha inicio', 'Fecha fin', 'Años', 'Meses', 'Días', 'Soporte', 'Acción'],
    );
    const rows = await within(table).findAllByRole('row');
    expect(within(rows[1]).getAllByRole('cell').map((cell) => cell.textContent).slice(0, 10)).toEqual(
      ['INGENIERO CIVIL GEOTECNISTA', 'Suelos SAS', '900123', 'Estudios de suelos', '2020-01-01', '2020-12-31', '1', '0', '0', 'cert.pdf'],
    );
    expect(within(rows[2]).getByText('Sin archivo')).toBeInTheDocument();

    await userEvent.setup().selectOptions(select, 'ARQ_PROY');
    expect(screen.getByText(/Rol activo para agregar experiencia:/)).toHaveTextContent('ARQUITECTO PROYECTISTA');
    expect(service.listExperienceCertificates).toHaveBeenCalledWith(5);
  });

  it('shows the empty state', async () => {
    service.listExperienceCertificates.mockResolvedValue({ data: { data: [] } });
    open();
    expect(await screen.findByText('Aún no hay experiencias registradas.')).toBeInTheDocument();
    expect(screen.getByText('0 roles con experiencia')).toBeInTheDocument();
  });

  it('downloads the support with its name', async () => {
    open();
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Descargar soporte cert.pdf' }));
    expect(service.downloadExperienceCertificateFile).toHaveBeenCalledWith(5, 1, 'cert.pdf');
  });

  it('validates the dialog: company and dates required, end not before start', async () => {
    const user = userEvent.setup();
    open();
    await user.click(await screen.findByRole('button', { name: '+ Añadir experiencia' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva experiencia certificada' });
    expect(within(dialog).getByText('Rol: INGENIERO CIVIL GEOTECNISTA')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Guardar experiencia' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('El nombre de la empresa es obligatorio.');

    await fillDialog(user, { company: 'Suelos SAS' });
    await user.click(within(dialog).getByRole('button', { name: 'Guardar experiencia' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Indique la fecha de inicio y la fecha de fin.');

    await fillDialog(user, { startDate: '2021-03-02', endDate: '2021-03-01' });
    await user.click(within(dialog).getByRole('button', { name: 'Guardar experiencia' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('La fecha de fin no puede ser anterior a la fecha de inicio.');
    expect(service.createExperienceCertificate).not.toHaveBeenCalled();
  });

  it('validates future dates, dates before 1900 and the file type', () => {
    const values = { company: 'X', nit: '', duties: '', startDate: '2020-01-01', endDate: '2020-12-31' };
    expect(validateExperience(values, null, '2026-11-06')).toBe('');
    expect(validateExperience({ ...values, endDate: '2026-11-07' }, null, '2026-11-06')).toBe('La fecha de fin no puede ser posterior a hoy.');
    expect(validateExperience({ ...values, startDate: '1899-12-31' }, null, '2026-11-06')).toBe('La fecha de inicio no puede ser anterior a 1900.');
    expect(validateExperience(values, new File(['x'], 'a.txt', { type: 'text/plain' }), '2026-11-06')).toBe('El soporte debe ser un archivo PDF.');
  });

  it.each([
    ['2020-01-01', '2020-12-31', '1 año 0 meses 0 días'],
    ['2021-03-01', '2021-03-31', '0 años 1 mes 0 días'],
    ['2021-03-01', '2021-03-01', '0 años 0 meses 1 día'],
  ])('previews the inclusive duration from %s to %s', async (startDate, endDate, text) => {
    const user = userEvent.setup();
    open();
    await user.click(await screen.findByRole('button', { name: '+ Añadir experiencia' }));
    const dialog = await fillDialog(user, { startDate, endDate });
    expect(within(dialog).getByRole('status', { name: 'Duración calculada' })).toHaveTextContent(text);
  });

  it('sends the exact form fields with the expected version, then reloads the list and the detail', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    open({ onChanged });
    await user.click(await screen.findByRole('button', { name: '+ Añadir experiencia' }));
    const dialog = await fillDialog(user, { company: ' Suelos SAS ', nit: '900123', duties: 'Estudios', startDate: '2020-01-01', endDate: '2020-12-31' });
    const file = new File(['%PDF-1.4'], 'cert.pdf', { type: 'application/pdf' });
    await user.upload(within(dialog).getByLabelText('Documento de certificación / Soporte (PDF)'), file);
    await user.click(within(dialog).getByRole('button', { name: 'Guardar experiencia' }));

    await waitFor(() => expect(service.createExperienceCertificate).toHaveBeenCalledTimes(1));
    const [id, form] = service.createExperienceCertificate.mock.calls[0];
    expect(id).toBe(5);
    expect([...form.keys()]).toEqual(['roleCode', 'company', 'nit', 'duties', 'startDate', 'endDate', 'expectedVersion', 'file']);
    expect(Object.fromEntries([...form.entries()].filter(([key]) => key !== 'file'))).toEqual({
      roleCode: 'GEOTEC', company: 'Suelos SAS', nit: '900123', duties: 'Estudios', startDate: '2020-01-01', endDate: '2020-12-31', expectedVersion: '4',
    });
    expect(form.get('file').name).toBe('cert.pdf');
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Experiencia registrada.'));
    expect(service.listExperienceCertificates).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog', { name: 'Nueva experiencia certificada' })).not.toBeInTheDocument();
  });

  it('keeps the dialog open with the server message, and reloads the detail on a version conflict', async () => {
    const user = userEvent.setup();
    const onConflict = vi.fn();
    service.createExperienceCertificate.mockRejectedValue({ response: { status: 409, data: { code: 'VERSION_CONFLICT', message: 'Otra persona modificó este registro.' } } });
    open({ onConflict });
    await user.click(await screen.findByRole('button', { name: '+ Añadir experiencia' }));
    const dialog = await fillDialog(user, { company: 'Suelos', startDate: '2020-01-01', endDate: '2020-12-31' });
    await user.click(within(dialog).getByRole('button', { name: 'Guardar experiencia' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Otra persona modificó este registro.');
    expect(onConflict).toHaveBeenCalled();
  });

  it('deletes after confirmation, with the expected version', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    open({ onChanged });
    const table = await screen.findByRole('table', { name: 'Experiencias certificadas registradas' });
    const [first] = await within(table).findAllByRole('button', { name: 'Eliminar' });
    await user.click(first);
    expect(service.deleteExperienceCertificate).not.toHaveBeenCalled();
    await user.click(within(table).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(service.deleteExperienceCertificate).toHaveBeenCalledWith(5, 1, { expectedVersion: 4 }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Experiencia eliminada.'));
  });

  it('is read only for a person who cannot write and for a deleted professional', async () => {
    const { unmount } = open({ canWrite: false });
    await screen.findByText('Suelos SAS');
    expect(screen.queryByRole('button', { name: '+ Añadir experiencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descargar soporte cert.pdf' })).toBeInTheDocument();
    unmount();

    open({ detail: { ...DETAIL, deleted: true } });
    await screen.findByText('Suelos SAS');
    expect(screen.queryByRole('button', { name: '+ Añadir experiencia' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });
});
