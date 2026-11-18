import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageSizes, PDFDocument, PDFPage } from 'pdf-lib';

const { requestTemplateMock, swalErrorMock } = vi.hoisted(() => ({
  requestTemplateMock: vi.fn(),
  swalErrorMock: vi.fn(),
}));

vi.mock('@/shared/utils/protectedDocumentAction', () => ({
  requestProtectedArrayBufferWithFeedback: requestTemplateMock,
}));

vi.mock('@/shared/utils/swalAdapter', () => ({
  swalError: swalErrorMock,
}));

import { buildChecklistPdf } from './checklistPdf';

const PROPERTY_ADDRESS = 'KR 27 # 36-14';
const RESPONSIBLE_ADDRESS = 'CL 9 # 9-99 (correspondencia)';

const baseItem = () => ({
  model: '2022',
  id_public: 'FUN-1',
  version: 1,
  fun_1s: [{ id: 1, tipo: 'D', tramite: 'A', m_lic: 'A' }],
  fun_53s: [{ name: 'Ana', surname: 'Ruiz', address: RESPONSIBLE_ADDRESS, number: '300', email: 'a@b.co' }],
  fun_2: { id: 7, direccion: PROPERTY_ADDRESS },
  fun_cs: [],
  fun_clocks: [],
});

// Four letter pages, like the 1/7 to 4/7 pages of the official template.
const blankTemplate = async () => {
  const doc = await PDFDocument.create();
  for (let i = 0; i < 4; i++) doc.addPage(PageSizes.Letter);
  return doc.save();
};

let drawn;

const build = (currentItem) =>
  buildChecklistPdf({ currentItem, currentVersion: 1, review: {}, city: 'Bucaramanga', number: '1' });

const drawnAt = (x, y, pageIndex = 0) =>
  drawn.filter((call) => call.page === pageIndex && call.x === x && call.y === y).map((call) => call.text);

const drawnTexts = () => drawn.map((call) => call.text);

beforeEach(async () => {
  const data = await blankTemplate();
  requestTemplateMock.mockReset();
  requestTemplateMock.mockResolvedValue({ data });
  swalErrorMock.mockReset();
  drawn = [];
  const drawText = PDFPage.prototype.drawText;
  vi.spyOn(PDFPage.prototype, 'drawText').mockImplementation(function spyDrawText(text, options) {
    drawn.push({ text, x: this.getX(), y: this.getY(), page: this.doc.getPages().indexOf(this) });
    return drawText.call(this, text, options);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('buildChecklistPdf: Dirección de Inmueble', () => {
  it('prints the property address from fun_2, never the address of the 5.3 responsible', async () => {
    const bytes = await build(baseItem());

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(swalErrorMock).not.toHaveBeenCalled();
    expect(requestTemplateMock).toHaveBeenCalledWith(expect.stringMatching(/\/pdf\/funcheckflat2022$/));
    expect(drawnAt(370, 352)).toEqual([PROPERTY_ADDRESS]);
    expect(drawnTexts()).not.toContain(RESPONSIBLE_ADDRESS);
  });

  it('keeps the name, phone and email of the 5.3 responsible', async () => {
    await build(baseItem());

    expect(drawnAt(80, 352)).toEqual(['Ana Ruiz']);
    expect(drawnAt(100, 340)).toEqual(['300']);
    expect(drawnAt(350, 340)).toEqual(['a@b.co']);
  });

  it('accepts fun_2 as an array and skips entries without id', async () => {
    const item = { ...baseItem(), fun_2: [{ id: null, direccion: 'SIN ID' }, { id: 7, direccion: `  ${PROPERTY_ADDRESS}  ` }] };

    await build(item);

    expect(drawnAt(370, 352)).toEqual([PROPERTY_ADDRESS]);
    expect(drawnTexts()).not.toContain('SIN ID');
    expect(drawnTexts()).not.toContain(RESPONSIBLE_ADDRESS);
  });

  it('leaves the box blank without fun_2 instead of printing the responsible address', async () => {
    const { fun_2: _omitted, ...item } = baseItem();

    await build(item);

    expect(drawnAt(370, 352)).toEqual([' ']);
    expect(drawnTexts()).not.toContain(RESPONSIBLE_ADDRESS);
  });

  it('leaves the box blank when fun_2 has an empty address', async () => {
    await build({ ...baseItem(), fun_2: { id: 7, direccion: '   ' } });

    expect(drawnAt(370, 352)).toEqual([' ']);
    expect(drawnTexts()).not.toContain(RESPONSIBLE_ADDRESS);
  });

  it('prints the property address at (400, 415) on templates older than 2022', async () => {
    await build({ ...baseItem(), model: '2019' });

    expect(requestTemplateMock).toHaveBeenCalledWith(expect.stringMatching(/\/pdf\/funcheckflat$/));
    expect(drawnAt(400, 415)).toEqual([PROPERTY_ADDRESS]);
    expect(drawnAt(90, 415)).toEqual(['Ana Ruiz']);
    expect(drawnTexts()).not.toContain(RESPONSIBLE_ADDRESS);
  });
});
