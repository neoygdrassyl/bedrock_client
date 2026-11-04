/**
 * FUN 5.2 "Añadir nuevo Profesional" with the multi-role picker: a BD PROFESIONALES pick shows every role with its
 * eligibility and adds the ticked ones in one batch request; any other case keeps the single-role form.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('@/shared/api/http-common', () => ({ default: http }));

vi.mock('@/features/expediente/api/fun.service', () => ({
  default: {
    create_fun52: vi.fn(),
    create_fun52_batch: vi.fn(),
    update_52: vi.fn(),
    delete_52: vi.fn(),
  },
}));

vi.mock('@/features/professionals/api/profesionals.service', () => ({
  default: {
    getByName: vi.fn(() => Promise.resolve({ data: [] })),
    createOrFind: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('@/shared/utils/swalAdapter', async (importOriginal) => ({
  ...(await importOriginal()),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

vi.mock('@/shared/components/data-table-bridge', () => ({
  default: () => React.createElement('div', { 'data-testid': 'datatable-stub' }),
}));

vi.mock('@/shared/components/vizualizer.component', () => ({ default: () => null }));

import FUNN52 from './fun_n_52';
import FUNService from '@/features/expediente/api/fun.service';
import profesionals from '@/features/professionals/api/profesionals.service';
import { swalError, swalSuccess } from '@/shared/utils/swalAdapter';

const REGISTRY_ITEM = {
  registryId: 9, givenNames: 'Ana María', surnames: 'Pérez', cc: '1098765432', email: 'ana@test.com',
  phone: '3001112233', registration: 'A123', registrationDate: '2010-05-04',
};
const PICK_LABEL = 'ANA MARIA PEREZ · CC 1098765432 · MAT. A123';
const ELIGIBILITY = {
  registryId: 9,
  generalMonths: 180,
  roles: [
    { roleCode: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA', requiredYears: 2, specificMonths: 40, specificSource: 'manual', specificExceedsGeneral: false, status: 'CUMPLE', selectable: true },
    { roleCode: 'DIR_CONSTR', label: 'DIRECTOR DE LA CONSTRUCCION', requiredYears: 3, specificMonths: 13, specificSource: 'expediente', specificExceedsGeneral: false, status: 'NO_CUMPLE', selectable: false },
    { roleCode: 'GEOTEC', label: 'INGENIERO CIVIL GEOTECNISTA', requiredYears: 2, specificMonths: null, specificSource: null, specificExceedsGeneral: false, status: 'SIN_REGISTRO', selectable: true },
  ],
};

const swaMsg = {
  title_wait: 'Espere...', text_wait: 'Procesando...', generic_eror_title: 'Error', generic_error_text: 'Error genérico',
  publish_success_title: 'Éxito', publish_success_text: 'Operación exitosa', text_footer: 'Footer',
};
const currentItem = { id: 1, fun_6s: [], fun_52s: [] };
const requestUpdate = vi.fn();

let eligibilityAnswer;
let registryItems;

const form = () => document.getElementById('form_fun_52_new');
// The "Añadir nuevo Profesional" checkbox; its label is not bound to it.
const newToggle = () => document.querySelector('#funn_52').parentElement.querySelector('input[type="checkbox"]');
const searchBox = () => form().querySelector('input[name="search_52"]');
const pickerButton = () => screen.queryByRole('button', { name: /AÑADIR ROLES SELECCIONADOS/ });
const classicButton = () => screen.queryByRole('button', { name: /AÑADIR ITEM/ });

async function openNewForm(user) {
  render(<FUNN52 swaMsg={swaMsg} currentItem={currentItem} requestUpdate={requestUpdate} />);
  await user.click(newToggle());
}

async function pick(label, query = 'ana') {
  fireEvent.change(searchBox(), { target: { value: query } });
  await waitFor(() => expect(form().querySelectorAll('datalist option')).toHaveLength(1));
  fireEvent.change(searchBox(), { target: { value: label } });
}

describe('fun_n_52 new professional with the multi-role picker', () => {
  beforeEach(() => {
    eligibilityAnswer = () => Promise.resolve({ data: ELIGIBILITY });
    registryItems = [REGISTRY_ITEM];
    http.get.mockImplementation((url) => {
      if (url.startsWith('/professional-registry/lookup')) return Promise.resolve({ data: { data: registryItems } });
      if (url === '/professional-registry/9/role-eligibility') return eligibilityAnswer();
      return Promise.resolve({ data: [] });
    });
    FUNService.create_fun52.mockResolvedValue({ data: 'OK' });
    FUNService.create_fun52_batch.mockResolvedValue({
      status: 201,
      data: { created: [{ id: 31, role: 'ARQUITECTO PROYECTISTA' }, { id: 32, role: 'INGENIERO CIVIL GEOTECNISTA' }] },
    });
  });

  afterEach(() => { vi.clearAllMocks(); });

  test('adds two roles in one batch request with the contract body and the usual success path', async () => {
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());

    expect(document.getElementById('f_525')).toBeNull();
    expect(document.getElementById('f_529')).toBeNull();
    expect(classicButton()).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'DIRECTOR DE LA CONSTRUCCION' })).toBeDisabled();

    // The general data comes from BD PROFESIONALES and the user may still correct it.
    await user.clear(document.getElementById('f_524'));
    await user.type(document.getElementById('f_524'), '3009998877');
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    await user.click(screen.getByRole('checkbox', { name: 'INGENIERO CIVIL GEOTECNISTA' }));
    await user.type(screen.getByRole('textbox', { name: 'Años de experiencia específica en INGENIERO CIVIL GEOTECNISTA' }), '2');
    await user.type(screen.getByRole('textbox', { name: 'Meses de experiencia específica en INGENIERO CIVIL GEOTECNISTA' }), '6');
    await user.click(pickerButton());

    await waitFor(() => expect(FUNService.create_fun52_batch).toHaveBeenCalledTimes(1));
    expect(FUNService.create_fun52_batch).toHaveBeenCalledWith({
      fun0Id: 1,
      professional: {
        name: 'ANA MARÍA', surname: 'PÉREZ', id_number: '1098765432', number: '3009998877', email: 'ana@test.com',
        registration: 'A123', registration_date: '2010-05-04', supervision: 'N/A', sanction: '0',
      },
      roles: [
        { role: 'ARQUITECTO PROYECTISTA', expirience: 40 },
        { role: 'INGENIERO CIVIL GEOTECNISTA', expirience: 30 },
      ],
    });
    expect(FUNService.create_fun52).not.toHaveBeenCalled();
    await waitFor(() => expect(swalSuccess).toHaveBeenCalledTimes(1));
    expect(requestUpdate).toHaveBeenCalledWith(1);
    expect(profesionals.createOrFind.mock.calls.map(([data]) => data.get('title'))).toEqual(['arq', 'eng']);
    // The new form and the picker are reset.
    await waitFor(() => expect(pickerButton()).toBeNull());
    expect(classicButton()).toBeInTheDocument();
    expect(document.getElementById('f_5211').value).toBe('');
  }, 60000);

  test('a 409 shows the server message listing the held roles and keeps the picker', async () => {
    const message = 'El profesional ya tiene en este expediente el rol: ARQUITECTO PROYECTISTA.';
    FUNService.create_fun52_batch.mockRejectedValueOnce({
      response: { status: 409, data: { message, code: 'FUN52_ROLE_ALREADY_HELD', roles: ['ARQUITECTO PROYECTISTA'] } },
    });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    await user.click(pickerButton());

    await waitFor(() => expect(swalError).toHaveBeenCalledWith(expect.objectContaining({ text: message })));
    expect(swalSuccess).not.toHaveBeenCalled();
    expect(pickerButton()).toBeEnabled();
  }, 60000);

  test('a bare 404 from the batch endpoint (older backend) falls back to the single-role form until the next pick', async () => {
    FUNService.create_fun52_batch.mockRejectedValueOnce({ response: { status: 404, data: '<pre>Cannot POST /api/fun/fun52/batch</pre>' } });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    await user.click(pickerButton());

    await waitFor(() => expect(swalError).toHaveBeenCalledWith(expect.objectContaining({ text: swaMsg.generic_error_text })));
    await waitFor(() => expect(classicButton()).toBeInTheDocument());
    expect(pickerButton()).toBeNull();
    expect(document.getElementById('f_525')).not.toBeNull();

    // Not sticky: a new BD PROFESIONALES pick tries the picker again.
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
  }, 60000);

  test('toggling "Añadir nuevo Profesional" also forgets that the batch endpoint was missing', async () => {
    FUNService.create_fun52_batch.mockRejectedValueOnce({ response: { status: 404 } });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    await user.click(pickerButton());
    await waitFor(() => expect(classicButton()).toBeInTheDocument());

    await user.click(newToggle());
    await user.click(newToggle());
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
  }, 60000);

  test('a 404 with a server message (the expediente is gone) is shown and keeps the picker', async () => {
    FUNService.create_fun52_batch.mockRejectedValueOnce({ response: { status: 404, data: { message: 'La solicitud no existe.' } } });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());
    await user.click(screen.getByRole('checkbox', { name: 'ARQUITECTO PROYECTISTA' }));
    await user.click(pickerButton());

    await waitFor(() => expect(swalError).toHaveBeenCalledWith(expect.objectContaining({ text: 'La solicitud no existe.' })));
    expect(pickerButton()).toBeInTheDocument();
    expect(classicButton()).toBeNull();
  }, 60000);

  test('an eligibility 404 keeps the classic form and create_fun52', async () => {
    eligibilityAnswer = () => Promise.reject({ response: { status: 404 } });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(http.get).toHaveBeenCalledWith('/professional-registry/9/role-eligibility', expect.anything()));

    expect(pickerButton()).toBeNull();
    expect(document.getElementById('f_525')).not.toBeNull();
    await user.type(document.getElementById('f_529'), '3');
    await user.click(classicButton());

    await waitFor(() => expect(FUNService.create_fun52).toHaveBeenCalledTimes(1));
    expect(FUNService.create_fun52_batch).not.toHaveBeenCalled();
    const payload = FUNService.create_fun52.mock.calls[0][0];
    expect([payload.get('role'), payload.get('expirience'), payload.get('name')]).toEqual(['URBANIZADOR/PARCELADOR', '36', 'ANA MARÍA']);
  }, 60000);

  test('an external pick keeps the classic form', async () => {
    registryItems = [];
    profesionals.getByName.mockResolvedValue({ data: [{ id: 4, name: 'Pedro', surname: 'Ruiz', id_number: '55' }] });
    const user = userEvent.setup();
    await openNewForm(user);
    await pick('PEDRO RUIZ · CC 55', 'pedro');

    expect(document.getElementById('f_5211').value).toBe('PEDRO');
    expect(http.get).not.toHaveBeenCalledWith(expect.stringContaining('role-eligibility'), expect.anything());
    expect(pickerButton()).toBeNull();
    expect(classicButton()).toBeInTheDocument();
  }, 60000);

  test('typing another name or cédula after the pick goes back to the classic form', async () => {
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());

    await user.type(document.getElementById('f_522'), '7');

    expect(pickerButton()).toBeNull();
    expect(classicButton()).toBeInTheDocument();
    expect(document.getElementById('f_525')).not.toBeNull();
    expect(document.getElementById('f_522').value).toBe('10987654327');
  }, 60000);

  test('unchecking "Añadir nuevo Profesional" clears the picker', async () => {
    const user = userEvent.setup();
    await openNewForm(user);
    await pick(PICK_LABEL);
    await waitFor(() => expect(pickerButton()).toBeInTheDocument());

    await user.click(newToggle());
    expect(form()).toBeNull();
    await user.click(newToggle());

    expect(pickerButton()).toBeNull();
    expect(within(form()).getByRole('button', { name: /AÑADIR ITEM/ })).toBeInTheDocument();
  }, 60000);
});
