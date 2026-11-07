/**
 * FUN 5.2 row switch (active) and 5.2.11 documents: the switch shows the stored value whatever the server answers,
 * and the 5.2.11 selects are editable and sent as the six positions only when they changed.
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
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

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
import { swalError } from '@/shared/utils/swalAdapter';

const ROW = {
  id: 77, fun0Id: 1, name: 'ANA', surname: 'PEREZ', id_number: '1098765432', number: '300', email: 'a@b.co',
  role: 'ARQUITECTO PROYECTISTA', registration: 'A123', registration_date: '2005-01-10', supervision: 'N/A', sanction: 0,
  expirience: 30, expirience_specific: false, docs: '-1,-1,-1,-1,-1', active: '1',
};
const FUN_6S = [{ id: 15, description: 'CEDULA ANA', path: 'p', filename: 'f.pdf' }];
const swaMsg = {
  title_wait: 'Espere...', text_wait: 'Procesando...', generic_eror_title: 'Error', generic_error_text: 'Error genérico',
  publish_success_title: 'Éxito', publish_success_text: 'Operación exitosa', text_footer: 'Footer',
};
const requestUpdate = vi.fn();
const EDIT_IDS = ['f_52_111_edit', 'f_52_112_edit', 'f_52_113_edit', 'f_52_114_edit', 'f_52_115_edit', 'f_52_116_edit'];

const renderList = (row = ROW) => render(
  <FUNN52 swaMsg={swaMsg} currentItem={{ id: 1, fun_6s: FUN_6S, fun_52s: [row] }} requestUpdate={requestUpdate} />,
);
const activeSwitch = () => screen.getByRole('checkbox', { name: 'Profesional activo' });

async function openEdit(user, row) {
  renderList(row);
  await user.click(screen.getByTitle('Modificar Item').querySelector('[role="button"]'));
  await waitFor(() => expect(document.getElementById('form_fun_52_edit')).toBeInTheDocument());
}

async function saveEdit(user) {
  await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/ }));
  await waitFor(() => expect(FUNService.update_52).toHaveBeenCalledTimes(1));
  return FUNService.update_52.mock.calls[0][1];
}

describe('fun_n_52 active switch and 5.2.11 documents', () => {
  beforeEach(() => {
    http.get.mockImplementation((url) => {
      if (url.startsWith('/professional-registry/lookup')) return Promise.resolve({ data: { data: [] } });
      return Promise.resolve({ data: [] });
    });
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
    FUNService.create_fun52.mockResolvedValue({ data: 'OK' });
  });

  afterEach(() => { vi.clearAllMocks(); });

  test('a refused switch change keeps showing the stored value and the server message', async () => {
    FUNService.update_52.mockRejectedValue({ response: { status: 400, data: { message: 'El campo active debe ser 0 o 1.' } } });
    const user = userEvent.setup();
    renderList();
    expect(activeSwitch()).toBeChecked();

    await user.click(activeSwitch());

    await waitFor(() => expect(swalError).toHaveBeenCalledWith(expect.objectContaining({ text: 'El campo active debe ser 0 o 1.' })));
    expect(FUNService.update_52.mock.calls[0][1].get('active')).toBe('0');
    expect(activeSwitch()).toBeChecked();
    expect(requestUpdate).not.toHaveBeenCalled();
  });

  test('an empty active (NULL) shows as active and the switch deactivates it', async () => {
    const user = userEvent.setup();
    renderList({ ...ROW, active: null });
    expect(activeSwitch()).toBeChecked();

    await user.click(activeSwitch());

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalledTimes(1));
    expect(FUNService.update_52.mock.calls[0][1].get('active')).toBe('0');
  });

  test('only an explicit 0 shows as inactive', async () => {
    const user = userEvent.setup();
    renderList({ ...ROW, active: '0' });
    expect(activeSwitch()).not.toBeChecked();

    await user.click(activeSwitch());

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalledTimes(1));
    expect(FUNService.update_52.mock.calls[0][1].get('active')).toBe('1');
  });

  test('a server failure (5xx) shows the generic message and the stored value', async () => {
    FUNService.update_52.mockRejectedValue({ response: { status: 500, data: { message: 'internal detail' } } });
    const user = userEvent.setup();
    renderList({ ...ROW, active: '0' });
    expect(activeSwitch()).not.toBeChecked();

    await user.click(activeSwitch());

    await waitFor(() => expect(swalError).toHaveBeenCalledWith(expect.objectContaining({ text: 'Error genérico' })));
    expect(activeSwitch()).not.toBeChecked();
  });

  test('an accepted switch change refreshes the expediente', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(activeSwitch());
    await waitFor(() => expect(requestUpdate).toHaveBeenCalledWith(1));
  });

  test('the edit form 5.2.11 selects are editable and offer paper, none and the expediente documents', async () => {
    const user = userEvent.setup();
    await openEdit(user);

    EDIT_IDS.forEach((id) => expect(document.getElementById(id)).not.toBeDisabled());
    expect(screen.queryByText(/no se pueden modificar desde esta edición/)).toBeNull();
    const options = [...document.getElementById('f_52_111_edit').options].map(option => [option.value, option.textContent]);
    expect(options).toEqual([['-1', 'APORTADO FISICAMENTE'], ['0', 'SIN DOCUMENTO'], ['15', 'CEDULA ANA']]);
    expect(EDIT_IDS.map(id => document.getElementById(id).value)).toEqual(['-1', '-1', '-1', '-1', '-1', '']);
  });

  test('saving without touching 5.2.11 does not send docs', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    const formData = await saveEdit(user);
    expect(formData.has('docs')).toBe(false);
  });

  test('a stored document the selects cannot show is kept when another position changes', async () => {
    const user = userEvent.setup();
    await openEdit(user, { ...ROW, docs: '-1,999,-1,-1,-1' });
    fireEvent.change(document.getElementById('f_52_111_edit'), { target: { value: '15' } });

    const formData = await saveEdit(user);
    expect(formData.get('docs')).toBe('15,999,-1,-1,-1,');
  });

  test('a changed 5.2.11 select sends the six positions', async () => {
    const user = userEvent.setup();
    await openEdit(user);
    fireEvent.change(document.getElementById('f_52_111_edit'), { target: { value: '15' } });
    fireEvent.change(document.getElementById('f_52_116_edit'), { target: { value: '0' } });

    const formData = await saveEdit(user);
    expect(formData.get('docs')).toBe('15,-1,-1,-1,-1,0');
  });

  test('a new professional sends its 5.2.11 positions and retries without them on an older backend', async () => {
    const sentDocs = [];
    FUNService.create_fun52
      .mockImplementationOnce((formData) => {
        sentDocs.push(formData.get('docs'));
        return Promise.reject({ response: { status: 400, data: { message: 'El campo docs es de solo lectura.' } } });
      })
      .mockImplementationOnce((formData) => {
        sentDocs.push(formData.get('docs'));
        return Promise.resolve({ data: 'OK' });
      });
    const user = userEvent.setup();
    renderList();
    await user.click(document.querySelector('#funn_52').parentElement.querySelector('input[type="checkbox"]'));
    await waitFor(() => expect(document.getElementById('form_fun_52_new')).toBeInTheDocument());
    fireEvent.change(document.getElementById('f_52_111'), { target: { value: '15' } });
    fireEvent.submit(document.getElementById('form_fun_52_new'));

    await waitFor(() => expect(FUNService.create_fun52).toHaveBeenCalledTimes(2));
    expect(sentDocs).toEqual(['15,-1,-1,-1,-1,-1', null]);
    await waitFor(() => expect(requestUpdate).toHaveBeenCalledWith(1));
  });

  test('a new professional sends the 5.2.11 positions in stored order', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(document.querySelector('#funn_52').parentElement.querySelector('input[type="checkbox"]'));
    await waitFor(() => expect(document.getElementById('form_fun_52_new')).toBeInTheDocument());
    fireEvent.change(document.getElementById('f_52_111'), { target: { value: '15' } });
    fireEvent.change(document.getElementById('f_52_114'), { target: { value: '0' } });
    fireEvent.submit(document.getElementById('form_fun_52_new'));

    await waitFor(() => expect(FUNService.create_fun52).toHaveBeenCalledTimes(1));
    expect(FUNService.create_fun52.mock.calls[0][0].get('docs')).toBe('15,-1,-1,0,-1,-1');
  });
});
