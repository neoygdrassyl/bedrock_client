import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  recordArcService: {
    update_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_arc_33_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_arc_33_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_33_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {},
}));

vi.mock('../app/services/record_arc.service', () => ({
  __esModule: true,
  default: hoisted.recordArcService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/icon', () => ({
  Icon: () => <span data-testid="icon" />,
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table" />,
}));

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => <div data-testid="vizualizer" />,
}));

vi.mock('../app/pages/user/records/exp_areas_record.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-areas-record" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas.component', () => ({
  __esModule: true,
  default: () => <div data-testid="record-arc-areas" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas_2.component.js', () => ({
  __esModule: true,
  default: () => <div data-testid="record-arc-areas-2" />,
}));

vi.mock('../app/components/jsons/jsonReplacer', () => ({
  __esModule: true,
  default: () => ({}),
}));

vi.mock('@/components/rich-text-editor', () => ({
  __esModule: true,
  default: ({ hiddenName, value = '' }) => <textarea name={hiddenName} defaultValue={value} />,
}));

vi.mock('../app/pages/user/records/arc/recordArcRichTextUpload', () => ({
  uploadRecordArcRichTextImage: vi.fn(),
}));

vi.mock('../app/utils/richTextBlockNote', () => ({
  sanitizeRichTextForLegacyJoin: (value) => value,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (value) => value || '',
  dateParser_finalDate: () => '',
  getJSONFull: () => [],
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalConfirm: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import RECORD_ARC_31 from '../app/pages/user/records/arc/record_arc_31';
import RECORD_ARC_33 from '../app/pages/user/records/arc/record_arc_33';
import RECORD_ARC_DESC from '../app/pages/user/records/arc/record_arc_desc';

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
  currentItem: {
    id: 1,
    id_public: 'FUN-001',
    date: '2026-01-10',
    fun_1s: [{ id: 99, description: 'Descripción base' }],
    fun_6s: [],
    fun_52s: [],
    fun_clocks: [
      { state: 3, version: 1, date_start: '2026-01-10' },
      { state: 11, version: 1, date_start: '2026-01-15' },
    ],
  },
  currentVersion: 1,
  currentRecord: {
    id: 10,
    record_arc_steps: [],
    record_arc_33_areas: [],
    record_arc_35_parkings: [],
  },
  currentVersionR: 1,
  _FUN_R: null,
  requestUpdateRecord: vi.fn(),
  requestUpdate: vi.fn(),
};

describe('ARC step parsing regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders RECORD_ARC_DESC when step values already come as arrays', () => {
    const currentRecord = {
      ...baseProps.currentRecord,
      record_arc_steps: [{ id: 1, version: 1, id_public: 's33', value: ['Antecedente', 'Descripción'] }],
    };

    expect(() => render(<RECORD_ARC_DESC {...baseProps} currentRecord={currentRecord} />)).not.toThrow();
    expect(screen.getByText('Antecedentes del proyecto')).toBeInTheDocument();
  });

  it('renders RECORD_ARC_33 when checklist step data already comes as arrays', () => {
    const currentRecord = {
      ...baseProps.currentRecord,
      record_arc_steps: [{ id: 2, version: 1, id_public: 's33_2', check: ['0', '1', '2', '0'] }],
    };

    expect(() => render(<RECORD_ARC_33 {...baseProps} currentRecord={currentRecord} />)).not.toThrow();
    expect(screen.getByText('3.3.1 Antecedentes y Descripción del Proyecto a licencias')).toBeInTheDocument();
  });

  it('renders RECORD_ARC_31 when professional step values already come as arrays', () => {
    const currentRecord = {
      ...baseProps.currentRecord,
      record_arc_steps: [{ id: 3, version: 1, id_public: 's31', value: ['1', 'Ana Test', 'MP-1', '3001234567', 'ana@test.com', 'Calle 1'] }],
    };

    expect(() => render(<RECORD_ARC_31 {...baseProps} currentRecord={currentRecord} />)).not.toThrow();
    expect(screen.getByText('3.1.1 Arquitecto Responsable')).toBeInTheDocument();
  });
});
