import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import FUNService from '@/app/services/fun.service';
import ProfessionalDataGrid from '../app/pages/user/records/law/ProfessionalDataGrid';

vi.mock('@/app/services/fun.service', () => ({
  default: { update_52: vi.fn() },
}));

const professional = {
  id: 52,
  name: 'JUAN',
  surname: 'PEREZ',
  role: 'DIRECTOR DE LA CONSTRUCCION',
  registration_certificate_status: null,
  active: true,
};

describe('ProfessionalDataGrid inline updates', () => {
  beforeEach(() => {
    FUNService.update_52.mockReset();
  });

  test('persists the selected certificate status and confirms it after refresh', async () => {
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
    let resolveRefresh;
    const requestUpdate = vi.fn(() => new Promise(resolve => { resolveRefresh = resolve; }));

    render(<ProfessionalDataGrid currentItem={{ id: 1, fun_52s: [professional], fun_6s: [] }} requestUpdate={requestUpdate} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Estado certificado — JUAN' }), { target: { value: 'HABILITADO' } });

    await waitFor(() => expect(requestUpdate).toHaveBeenCalledWith(1));
    expect(FUNService.update_52.mock.calls[0][1].get('registration_certificate_status')).toBe('HABILITADO');
    await act(async () => resolveRefresh({ fun_52s: [{ ...professional, registration_certificate_status: 'HABILITADO' }] }));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('persists INHABILITADO as a valid certificate status', async () => {
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
    const requestUpdate = vi.fn().mockResolvedValue({
      fun_52s: [{ ...professional, registration_certificate_status: 'INHABILITADO' }],
    });

    render(<ProfessionalDataGrid currentItem={{ id: 1, fun_52s: [professional], fun_6s: [] }} requestUpdate={requestUpdate} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Estado certificado — JUAN' }), { target: { value: 'INHABILITADO' } });

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalled());
    expect(FUNService.update_52.mock.calls[0][1].get('registration_certificate_status')).toBe('INHABILITADO');
  });

  test('keeps the selected certificate status when saving another inline field', async () => {
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
    const currentProfessional = { ...professional, registration_certificate_status: 'HABILITADO' };
    const requestUpdate = vi.fn().mockResolvedValue({
      fun_52s: [{ ...currentProfessional, signature_original_fun: true }],
    });

    render(<ProfessionalDataGrid currentItem={{ id: 1, fun_52s: [currentProfessional], fun_6s: [] }} requestUpdate={requestUpdate} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Firma original FUN — JUAN' }), { target: { value: '1' } });

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalled());
    expect(FUNService.update_52.mock.calls[0][1].get('registration_certificate_status')).toBe('HABILITADO');
  });

  test('persists the selected postgraduate applicability', async () => {
    FUNService.update_52.mockResolvedValue({ data: 'OK' });
    let resolveRefresh;
    const requestUpdate = vi.fn(() => new Promise(resolve => { resolveRefresh = resolve; }));

    const { rerender } = render(<ProfessionalDataGrid currentItem={{ id: 1, fun_52s: [professional], fun_6s: [] }} requestUpdate={requestUpdate} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Postgrado — JUAN' }), { target: { value: '1' } });

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalled());
    expect(FUNService.update_52.mock.calls[0][1].get('postgraduate_applicable')).toBe('1');
    await act(async () => resolveRefresh({ fun_52s: [{ ...professional, postgraduate_applicable: true }] }));
    rerender(<ProfessionalDataGrid currentItem={{ id: 1, fun_52s: [{ ...professional, postgraduate_applicable: true }], fun_6s: [] }} requestUpdate={requestUpdate} />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Firma original FUN — JUAN' }), { target: { value: '1' } });

    await waitFor(() => expect(FUNService.update_52).toHaveBeenCalledTimes(2));
    expect(FUNService.update_52.mock.calls[1][1].get('postgraduate_applicable')).toBe('1');
  });
});
