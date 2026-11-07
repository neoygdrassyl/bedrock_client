/**
 * FUN 5.2 "Actualizar Profesional", 5.2.9: with certified experience in BD PROFESIONALES for the row's role it is filled
 * from there and read only; otherwise it stays typed (transitional) and is still saved in fun_52s.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('@/shared/api/http-common', () => ({ default: http }));

vi.mock('@/features/expediente/api/fun.service', () => ({
  default: { create_fun52: vi.fn(), create_fun52_batch: vi.fn(), update_52: vi.fn(), delete_52: vi.fn() },
}));

vi.mock('@/features/professionals/api/profesionals.service', () => ({
  default: { getByName: vi.fn(() => Promise.resolve({ data: [] })), createOrFind: vi.fn(() => Promise.resolve({ data: {} })) },
}));

vi.mock('@/shared/utils/swalAdapter', async (importOriginal) => ({
  ...(await importOriginal()),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

// The list renders each row's cells, so the "Modificar Item" action can be clicked.
vi.mock('@/shared/components/data-table-bridge', () => ({
  default: ({ columns, data }) => React.createElement('div', { 'data-testid': 'datatable-stub' }, (data || []).map((row) => (
    React.createElement('div', { key: row.id }, columns.map((column, index) => (
      React.createElement('span', { key: index }, column.cell ? column.cell(row) : null)
    )))
  ))),
}));

vi.mock('@/shared/components/vizualizer.component', () => ({ default: () => null }));

import FUNN52 from './fun_n_52';
import FUNService from '@/features/expediente/api/fun.service';

const GEOTEC = 'INGENIERO CIVIL GEOTECNISTA';
const ROW = {
  id: 77, fun0Id: 1, name: 'ANA MARIA', surname: 'PEREZ', id_number: '1.098.765.432', number: '300', email: 'a@b.co',
  role: GEOTEC, registration: 'A123', registration_date: '2005-01-10', supervision: 'N/A', sanction: 0,
  expirience: 30, expirience_specific: true, docs: '', active: 1,
};
const roleEntry = (overrides) => ({
  roleCode: 'GEOTEC', label: GEOTEC, requiredYears: 5, specificMonths: 78, specificSource: 'certificados',
  specificExperience: { years: 6, months: 6, days: 15 }, certificateCount: 3, specificExceedsGeneral: false,
  status: 'CUMPLE', selectable: true, ...overrides,
});
const ARQ = { roleCode: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', requiredYears: null, specificMonths: null, specificSource: null, specificExperience: null, certificateCount: 0, specificExceedsGeneral: false, status: 'NO_EXIGE', selectable: true };

const swaMsg = {
  title_wait: 'Espere...', text_wait: 'Procesando...', generic_eror_title: 'Error', generic_error_text: 'Error genérico',
  publish_success_title: 'Éxito', publish_success_text: 'Operación exitosa', text_footer: 'Footer',
};
const requestUpdate = vi.fn();

let lookupItems;
let eligibility;

const years = () => document.getElementById('f_529_edit');
const months = () => document.getElementById('f_529m_edit');
const source = () => document.getElementById('f_529_source_edit');

async function openEdit(user, row = ROW) {
  render(<FUNN52 swaMsg={swaMsg} currentItem={{ id: 1, fun_6s: [], fun_52s: [row] }} requestUpdate={requestUpdate} />);
  await user.click(screen.getByTitle('Modificar Item').querySelector('[role="button"]'));
  await waitFor(() => expect(document.getElementById('form_fun_52_edit')).toBeInTheDocument());
}

async function save(user) {
  await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/ }));
  await waitFor(() => expect(FUNService.update_52).toHaveBeenCalledTimes(1));
  const [id, formData] = FUNService.update_52.mock.calls[0];
  return { id, expirience: formData.get('expirience'), specific: formData.get('expirience_specific') };
}

describe('fun_n_52 Actualizar Profesional, 5.2.9', () => {
  beforeEach(() => {
    lookupItems = [{ registryId: 9, cc: '1098765432' }];
    eligibility = () => Promise.resolve({ data: { registryId: 9, generalMonths: 240, roles: [roleEntry(), ARQ] } });
    http.get.mockImplementation((url) => {
      if (url.startsWith('/professional-registry/lookup')) return Promise.resolve({ data: { data: lookupItems } });
      if (url === '/professional-registry/9/role-eligibility') return eligibility();
      return Promise.resolve({ data: [] });
    });
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
  });

  afterEach(() => { vi.clearAllMocks(); });

  test('with certified experience for the role: filled from BD PROFESIONALES, read only, and still saved in fun_52s', async () => {
    const user = userEvent.setup();
    await openEdit(user);

    await waitFor(() => expect(years().value).toBe('6'));
    expect(months().value).toBe('6');
    expect(years()).toHaveAttribute('readonly');
    expect(months()).toHaveAttribute('readonly');
    expect(source()).toHaveTextContent('Tomada de BD Profesionales (3 certificaciones).');
    expect(http.get).toHaveBeenCalledWith('/professional-registry/lookup?q=1098765432', expect.any(Object));

    expect(await save(user)).toEqual({ id: 77, expirience: '78', specific: 'true' });
  });

  test('changing 5.2.5 to a role without certificates gives back the row value, typed', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    await waitFor(() => expect(years()).toHaveAttribute('readonly'));

    fireEvent.change(document.getElementById('f_525_edit'), { target: { value: 'ARQUITECTO PROYECTISTA' } });

    await waitFor(() => expect(years()).not.toHaveAttribute('readonly'));
    expect([years().value, months().value]).toEqual(['2', '6']);
    expect(source()).toHaveTextContent('solo se usa para continuar la radicación; no se registra en BD Profesionales');
  });

  test('without certificates for the role: 5.2.9 stays manual as before', async () => {
    eligibility = () => Promise.resolve({ data: { registryId: 9, generalMonths: 240, roles: [roleEntry({ specificMonths: null, specificSource: null, specificExperience: null, certificateCount: 0, status: 'SIN_REGISTRO' })] } });
    const user = userEvent.setup();
    await openEdit(user);
    await waitFor(() => expect(http.get).toHaveBeenCalledWith('/professional-registry/9/role-eligibility', expect.any(Object)));

    expect(years()).not.toHaveAttribute('readonly');
    expect([years().value, months().value]).toEqual(['2', '6']);
    expect(source()).toHaveTextContent('no se registra en BD Profesionales');
    await user.clear(years());
    await user.type(years(), '3');
    expect(await save(user)).toEqual({ id: 77, expirience: '42', specific: 'true' });
  });

  test('a person unknown to BD PROFESIONALES or an unreachable BD keeps 5.2.9 manual', async () => {
    lookupItems = [];
    const user = userEvent.setup();
    await openEdit(user);
    await waitFor(() => expect(http.get).toHaveBeenCalledWith(expect.stringMatching(/^\/professional-registry\/lookup/), expect.any(Object)));
    expect(years()).not.toHaveAttribute('readonly');
    expect(source()).toHaveTextContent('no se registra en BD Profesionales');
    expect(http.get).not.toHaveBeenCalledWith('/professional-registry/9/role-eligibility', expect.any(Object));
  });

  test('an eligibility failure (older backend) keeps 5.2.9 manual', async () => {
    eligibility = () => Promise.reject(Object.assign(new Error('404'), { response: { status: 404 } }));
    const user = userEvent.setup();
    await openEdit(user);
    await waitFor(() => expect(http.get).toHaveBeenCalledWith('/professional-registry/9/role-eligibility', expect.any(Object)));
    expect(years()).not.toHaveAttribute('readonly');
    expect([years().value, months().value]).toEqual(['2', '6']);
  });
});
