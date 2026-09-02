import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/components/data-table-bridge', () => ({
  default: () => <div data-testid="data-table" />,
}));

vi.mock('../app/components/vizualizer.component', () => ({
  default: () => <div data-testid="visualizer" />,
}));

vi.mock('../app/services/checklist.service', () => ({
  default: { updateRequirementEvaluation: vi.fn() },
}));

const updateLegacyChecklist = vi.fn();
const createLegacyChecklist = vi.fn();

vi.mock('../app/services/fun.service', () => ({
  default: { update_r: updateLegacyChecklist, create_funr: createLegacyChecklist },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

describe('FUNG_CHECKLIST section 6.6', () => {
  test('usa el código canónico 660a para edificaciones de 2000m2 o más', async () => {
    const { default: FUNG_CHECKLIST } = await import('../app/pages/user/fun_forms/fun_g_checklist');

    const { container } = render(
      <FUNG_CHECKLIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{
          id: 1,
          id_public: '68001-1-26-0094',
          fun_1s: [{ tipo: 'D', tramite: '', m_urb: '', m_sub: '', m_lic: '' }],
          fun_rs: [],
          fun_6s: [],
        }}
        currentVersion={1}
        requestUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText(/Edificaciones que tengan o superen los 2000m/i)).toBeTruthy();
    expect(container.querySelectorAll('input[name="660a"]')).toHaveLength(3);
    expect(container.querySelectorAll('input[name="660b"]')).toHaveLength(3);
    expect(container.querySelectorAll('input[name="660c"]')).toHaveLength(3);
    expect(container.querySelectorAll('input[name="660d"]')).toHaveLength(3);
    expect(container.querySelectorAll('input[name="660e"]')).toHaveLength(3);
    expect(container.querySelector('input[name="6606"]')).toBeNull();
  });

  test('agrega un requisito vacío al registro legacy antes de guardarlo', async () => {
    updateLegacyChecklist.mockClear();
    updateLegacyChecklist.mockResolvedValue({ data: 'OK' });
    const user = userEvent.setup();
    const { default: FUNG_CHECKLIST } = await import('../app/pages/user/fun_forms/fun_g_checklist');

    const { container } = render(
      <FUNG_CHECKLIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{
          id: 1,
          id_public: '68001-1-26-0112',
          fun_1s: [{ tipo: 'D', tramite: '', m_urb: '', m_sub: '', m_lic: '' }],
          fun_rs: [{ id: 45, code: '511', checked: '1' }],
          fun_6s: [],
        }}
        currentVersion={1}
        requestUpdate={vi.fn()}
      />,
    );

    await user.click(container.querySelector('input[name="512"][value="1"]'));

    await waitFor(() => expect(updateLegacyChecklist).toHaveBeenCalledTimes(1));
    const [legacyId, formData] = updateLegacyChecklist.mock.calls[0];
    expect(legacyId).toBe(45);
    expect(formData.get('code')).toBe('511,512');
    expect(formData.get('checked')).toBe('1,1');
  });

  test('conserva selecciones consecutivas mientras refresca el expediente', async () => {
    updateLegacyChecklist.mockClear();
    updateLegacyChecklist.mockResolvedValue({ data: 'OK' });
    const user = userEvent.setup();
    const { default: FUNG_CHECKLIST } = await import('../app/pages/user/fun_forms/fun_g_checklist');

    const { container } = render(
      <FUNG_CHECKLIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{
          id: 1,
          id_public: '68001-1-26-0112',
          fun_1s: [{ tipo: 'D', tramite: '', m_urb: '', m_sub: '', m_lic: '' }],
          fun_rs: [{ id: 45, code: '511', checked: '1' }],
          fun_6s: [],
        }}
        currentVersion={1}
        requestUpdate={vi.fn()}
      />,
    );

    await user.click(container.querySelector('input[name="512"][value="1"]'));
    await waitFor(() => expect(updateLegacyChecklist).toHaveBeenCalledTimes(1));
    const secondRadio = container.querySelector('input[name="660a"][value="1"]');
    await waitFor(() => expect(secondRadio.disabled).toBe(false));
    await user.click(secondRadio);
    await waitFor(() => expect(updateLegacyChecklist).toHaveBeenCalledTimes(2));

    const [, secondFormData] = updateLegacyChecklist.mock.calls[1];
    expect(secondFormData.get('code')).toBe('511,512,660a');
    expect(secondFormData.get('checked')).toBe('1,1,1');
  });

  test('crea el registro legacy al seleccionar el primer requisito', async () => {
    createLegacyChecklist.mockClear();
    createLegacyChecklist.mockResolvedValue({ data: 'OK' });
    const user = userEvent.setup();
    const { default: FUNG_CHECKLIST } = await import('../app/pages/user/fun_forms/fun_g_checklist');

    const { container } = render(
      <FUNG_CHECKLIST
        translation={{}}
        swaMsg={{}}
        globals={{}}
        currentItem={{
          id: 1,
          id_public: '68001-1-26-0112',
          fun_1s: [{ tipo: 'D', tramite: '', m_urb: '', m_sub: '', m_lic: '' }],
          fun_rs: [],
          fun_6s: [],
        }}
        currentVersion={1}
        requestUpdate={vi.fn()}
      />,
    );

    await user.click(container.querySelector('input[name="512"][value="1"]'));

    await waitFor(() => expect(createLegacyChecklist).toHaveBeenCalledTimes(1));
    const [formData] = createLegacyChecklist.mock.calls[0];
    expect(formData.get('fun0Id')).toBe('1');
    expect(formData.get('version')).toBe('1');
    expect(formData.get('code')).toBe('512');
    expect(formData.get('checked')).toBe('1');
  });
});
