import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  submitService: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
  recordArcService: {
    update_arc_38: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_arc_38: vi.fn(() => Promise.resolve({ data: 'OK' })),
    pdfgen: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {
    update_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: hoisted.submitService,
}));

vi.mock('../app/services/record_arc.service', () => ({
  __esModule: true,
  default: hoisted.recordArcService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('../../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduria Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
  nomens: 'CUB1',
  cities: [<option key="bga" value="Bucaramanga">Bucaramanga</option>],
  domains_number: [<option key="cur1" value="Curaduria 1">Curaduria 1</option>],
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/icon', () => ({
  default: () => <span data-testid="icon" />,
  Icon: () => <span data-testid="icon" />,
}));

vi.mock('../app/pages/user/records/record_docVersion.component', () => ({
  __esModule: true,
  default: () => <div data-testid="record-doc-version" />,
}));

vi.mock('@/components/rich-text-editor', () => ({
  __esModule: true,
  default: ({ hiddenId, value = '' }) => <textarea id={hiddenId} defaultValue={value} />, 
}));

vi.mock('../app/utils/richTextBlockNote', () => ({
  richTextToPlainText: (value) => (typeof value === 'string' ? value : ''),
}));

vi.mock('../app/pages/user/records/arc/recordArcRichTextUpload', () => ({
  uploadRecordArcRichTextImage: vi.fn(),
}));

vi.mock('../app/components/customClasses/pdfCheckHandler', () => ({
  handleArchCheck: vi.fn(),
}));

vi.mock('../app/components/jsons/arcReviewDocs', () => ({
  REVIEW_DOCS: [],
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  GEM_CODE_LIST: vi.fn(() => ['DOC']),
  VR_DOCUMENTS_OF_INTEREST: { arc: ['DOC'] },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalConfirm: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: { load: vi.fn() },
  StandardFonts: { Helvetica: 'Helvetica' },
}));

import RECORD_ARC_38 from '../app/pages/user/records/arc/record_arc_38';

const baseCurrentItem = {
  id: 1,
  id_public: 'FUN-001',
  version: 1,
  fun_1s: [],
  fun_rs: [],
  fun_clocks: [
    { state: 13, version: 100, date_start: '', resolver_context: '' },
    { state: 13, version: 200, date_start: '', resolver_context: '' },
    { state: 3, version: 1, date_start: '' },
  ],
  record_review: {},
};

const baseCurrentRecord = {
  id: 10,
  date_asign: '',
  worker_name: 'Arquitecto Test',
  record_arc_steps: [],
  record_arc_38s: [],
  record_arc_extras: [],
};

const baseProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: { id: '1' },
  currentItem: baseCurrentItem,
  currentVersion: 1,
  currentRecord: baseCurrentRecord,
  currentVersionR: 1,
  requestUpdateRecord: vi.fn(),
  requestUpdate: vi.fn(),
};

const renderComponent = (props = {}) =>
  render(
    <MemoryRouter>
      <RECORD_ARC_38 {...baseProps} {...props} />
    </MemoryRouter>
  );

describe('RECORD_ARC_38 regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  it('reloads VR docs when currentItem.id_public becomes available after mount', async () => {
    const initialItem = {
      ...baseCurrentItem,
      id_public: undefined,
    };

    const { rerender } = render(
      <MemoryRouter>
        <RECORD_ARC_38 {...baseProps} currentItem={initialItem} />
      </MemoryRouter>
    );

    expect(hoisted.submitService.getIdRelated).not.toHaveBeenCalled();

    rerender(
      <MemoryRouter>
        <RECORD_ARC_38 {...baseProps} currentItem={baseCurrentItem} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.submitService.getIdRelated).toHaveBeenCalledWith('FUN-001');
    });
  });

  it('renders when review payload fields are already arrays', async () => {
    const currentItem = {
      ...baseCurrentItem,
      fun_rs: [
        {
          checked: ['1'],
          review: ['DOC&1'],
          code: ['DOC'],
        },
      ],
    };

    expect(() => renderComponent({ currentItem })).not.toThrow();

    await waitFor(() => {
      expect(hoisted.submitService.getIdRelated).toHaveBeenCalledWith('FUN-001');
    });
  });
});
