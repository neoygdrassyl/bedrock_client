import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const mocks = vi.hoisted(() => ({ inventory: null, gen: vi.fn(), download: vi.fn() }));
vi.mock('../../expediente_documental/hooks/useLegalForm', () => ({ useLegalForm: (fun0Id) => (fun0Id ? { status: 'ready', data: { requirements: [], actions: { review: true } }, error: '', reload: vi.fn() } : null) }));
vi.mock('../../expediente_documental/hooks/useDocumentaryInventory', () => ({ useDocumentaryInventory: () => mocks.inventory }));
vi.mock('@/app/utils/swalAdapter', () => ({ swalClose: vi.fn(), swalLoading: vi.fn(), swalSuccess: vi.fn(), swalError: vi.fn() }));
vi.mock('@/app/utils/pdfDownload', () => ({ downloadProtectedPdf: mocks.download }));
vi.mock('../../../../services/fun.service', () => ({ default: { update_r: vi.fn(), create_funr: vi.fn(), gen_doc_checkcontrol: mocks.gen } }));

const { default: FUN_D_CONTROL } = await import('./fun_d_control.component');
const { adaptDocumentaryInventory } = await import('../../expediente_documental/documentaryInventoryModel');

const item = (id, extra) => ({ id, documentKey: `k-${id}`, documentClass: 'requirement', documentCode: '511', title: 'Formulario', listKey: 'list_61', isCurrent: true, vrLabel: 'VR-10', registeredAt: '2026-10-01T15:00:00.000Z', pagesPhysical: 3, pagesDigital: null, ...extra });
const raw = {
  items: [item(1), item(2, { documentClass: 'annex', documentCode: null, title: 'Carta', listKey: null, pagesPhysical: 1 }), item(3, { documentCode: '701', title: 'Licencia', listKey: 'list_Z', pagesPhysical: null, pagesDigital: 5 })],
  requirements: [{ documentCode: '511', title: 'Formulario único', status: 'present', satisfiedBy: null }],
  evaluation: { state: 'current' },
};
const CANONICAL_ITEM = { id: 5, id_public: 'FUN-5', fun_1s: [{ tipo: 'D', m_urb: '', m_sub: '', m_lic: 'A' }], fun_rs: [], fun_51s: [], fun_52s: [], fun_clocks: [] };
const swaMsg = { title_wait: 'w', text_wait: 'w', publish_success_title: 'ok', publish_success_text: 'ok', generic_eror_title: 'e', generic_error_text: 'e' };
const names = () => Array.from(document.getElementsByName('name_doc')).map((node) => node.textContent);

// jsdom has no innerText; the generator reads it from the DOM to build the PDF request.
Object.defineProperty(HTMLElement.prototype, 'innerText', { configurable: true, get() { return this.textContent; } });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.inventory = { status: 'ready', inventory: adaptDocumentaryInventory(raw), error: '' };
  mocks.gen.mockResolvedValue({ data: 'OK' });
});

describe('hoja de control documental of canonical expedientes', () => {
  it('lists every inventory document and filters by category', () => {
    render(<FUN_D_CONTROL currentItem={CANONICAL_ITEM} currentVersion={1} swaMsg={swaMsg} requestUpdate={vi.fn()} />);
    expect(names()).toEqual(['Formulario único', 'Carta', 'Licencia']);
    const filter = screen.getByRole('group', { name: 'Filtrar documentos por categoría' });
    expect(within(filter).getByRole('button', { name: 'Todos (3)' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(filter).getByRole('button', { name: 'Anexos (1)' }));
    expect(names()).toEqual(['Carta']);
    fireEvent.click(within(filter).getByRole('button', { name: 'Expedidos (1)' }));
    expect(names()).toEqual(['Licencia']);
    fireEvent.click(within(filter).getByRole('button', { name: 'Requisitos (1)' }));
    expect(names()).toEqual(['Formulario único']);
  });

  it('keeps typed folios when the filter changes and prints only the filtered selection', async () => {
    render(<FUN_D_CONTROL currentItem={CANONICAL_ITEM} currentVersion={1} swaMsg={swaMsg} requestUpdate={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Folios de Carta'), { target: { value: '1-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Expedidos (1)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Anexos (1)' }));
    expect(screen.getByLabelText('Folios de Carta')).toHaveValue('1-2');
    fireEvent.click(screen.getByRole('button', { name: 'Expedidos (1)' }));
    fireEvent.click(screen.getByRole('button', { name: /GENERAR PDF/ }));
    await waitFor(() => expect(mocks.gen).toHaveBeenCalledTimes(1));
    const form = mocks.gen.mock.calls[0][0];
    expect(form.get('name_doc')).toBe('Licencia');
    expect(form.get('code_doc')).toBe('701');
    expect(form.get('title_doc')).toBe('DOCUMENTOS EXPEDIDOS');
    expect(form.get('pages_doc')).toBe('5');
  });
});
