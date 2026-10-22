import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  legalForm: null,
  inventory: null,
  saveReview: vi.fn(),
  saveSheet: vi.fn(),
  reload: vi.fn(),
  swalSuccess: vi.fn(),
  swalError: vi.fn(),
}));
vi.mock('../../expediente_documental/hooks/useLegalForm', () => ({ useLegalForm: (fun0Id) => (fun0Id ? { status: 'ready', data: mocks.legalForm, error: '', reload: mocks.reload } : null) }));
vi.mock('../../expediente_documental/hooks/useDocumentaryInventory', () => ({ useDocumentaryInventory: () => mocks.inventory }));
vi.mock('@/app/services/documentaryLegalForm.service', async (importOriginal) => ({ ...(await importOriginal()), saveLegalFormReview: mocks.saveReview, saveLegalFormSheet: mocks.saveSheet }));
vi.mock('@/shared/utils/swalAdapter', () => ({ swalClose: vi.fn(), swalLoading: vi.fn(), swalSuccess: mocks.swalSuccess, swalError: mocks.swalError }));
vi.mock('../../../../services/fun.service', () => ({ default: { update_r: vi.fn(), create_funr: vi.fn() } }));

const { saveControlSheetReviews } = await import('./fun_d_control.component');
const { default: FUN_D_CONTROL_2 } = await import('./fun_d_control.component_2');

const instance = (extra) => ({ documentKey: 'k', instanceLabel: null, review: null, reviewRevision: 0, verdict: 'pending', source: 'review', ...extra });
const requirement = (code, extra) => ({ documentCode: code, delivered: true, allowsMultipleInstances: false, instances: [instance()], ...extra });
const readyInventory = { status: 'ready', inventory: { folios: { byCode: new Map([['916', 3]]) }, statusByCode: new Map() }, error: '' };
const CANONICAL_ITEM = { id: 5, id_public: 'FUN-5', centralReleaseId: 'rel-1', fun_1s: [{ tipo: 'D', m_urb: '', m_sub: '', m_lic: 'A' }], fun_rs: [], fun_51s: [], fun_52s: [], fun_clocks: [] };
const swaMsg = { title_wait: 'w', text_wait: 'w', publish_success_title: 'ok', publish_success_text: 'ok', generic_eror_title: 'e', generic_error_text: 'e' };

beforeEach(() => { vi.clearAllMocks(); mocks.inventory = readyInventory; });

describe('control sheets in canonical expedientes', () => {
  it('saves the hoja de control documental as one review per changed delivered code', async () => {
    mocks.saveReview.mockResolvedValue({ unchanged: false });
    const legalForm = { requirements: [requirement('511'), requirement('600', { instances: [instance({ source: 'controls' })] }), requirement('700', { delivered: false, instances: [] })] };
    const result = await saveControlSheetReviews(5, legalForm, [{ code: '511', check: '0', pages: '' }, { code: '511 ', check: '1', pages: '1-3' }, { code: '600', check: '1', pages: '' }, { code: '700', check: '1', pages: '' }]);
    expect(mocks.saveReview).toHaveBeenCalledTimes(1);
    expect(mocks.saveReview).toHaveBeenCalledWith(5, '511', expect.objectContaining({ verdict: 'complies', folioRange: '1-3', reason: 'Hoja de control documental' }));
    expect(result).toEqual({ saved: 1, skipped: [{ code: '511', reason: 'observation' }, { code: '600', reason: 'controls' }] });
  });

  it('reads the inventory sheet from legal y debida forma and saves it with its revision', async () => {
    mocks.legalForm = { requirements: [], actions: { sheet: true }, sheet: { sheetRevision: 2, sheet: { user_archive: 'Ana', date_create: '2026-10-01', items: [{ name: 'CD', date: '', n: '4', label: 'CD(s)' }] } } };
    mocks.saveSheet.mockResolvedValue({ unchanged: false });
    render(<FUN_D_CONTROL_2 currentItem={CANONICAL_ITEM} swaMsg={swaMsg} requestUpdate={vi.fn()} />);
    expect(document.getElementById('user_archive').value).toBe('Ana');
    expect(document.getElementById('folio_998_12').value).toBe('4');
    expect(document.getElementById('folio_916_3').value).toBe('3');
    fireEvent.change(document.getElementById('user_retrieve'), { target: { value: 'Luis' } });
    fireEvent.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/ }));
    await waitFor(() => expect(mocks.saveSheet).toHaveBeenCalledTimes(1));
    const [fun0Id, command] = mocks.saveSheet.mock.calls[0];
    expect(fun0Id).toBe(5);
    expect(command).toMatchObject({ expectedSheetRevision: 2, reason: 'Hoja de control de inventario', sheet: { user_archive: 'Ana', user_retrieve: 'Luis', date_create: '2026-10-01' } });
    expect(command.sheet.items.find((item) => item.name === 'CD')).toEqual({ name: 'CD', date: '', n: '4', label: 'CD(s)' });
    expect(mocks.swalSuccess).toHaveBeenCalled();
    expect(mocks.reload).toHaveBeenCalled();
  });

  it('refuses to save the inventory sheet when the user cannot write it', async () => {
    mocks.legalForm = { requirements: [], actions: { sheet: false }, sheet: null };
    render(<FUN_D_CONTROL_2 currentItem={CANONICAL_ITEM} swaMsg={swaMsg} requestUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/ }));
    expect(mocks.saveSheet).not.toHaveBeenCalled();
    expect(mocks.swalError).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringMatching(/no puede guardar/) }));
  });
});
