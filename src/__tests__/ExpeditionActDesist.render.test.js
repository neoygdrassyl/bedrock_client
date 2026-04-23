import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/expedition.service', () => ({
  __esModule: true,
  default: {
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: {
    getlascub: vi.fn(() => Promise.resolve({ data: [{ cub: 'CUB-2026-0001' }] })),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {},
}));

vi.mock('../app/pages/user/expeditions/exp_res_2.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-res-2-stub" />,
}));

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, className, ...props }) => (
    <button type="button" onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: vi.fn((value) => value || ''),
  regexChecker_isOA_2: vi.fn(() => false),
  _ADDRESS_SET_FULL: vi.fn(() => ''),
  _MANAGE_IDS: vi.fn((value) => value),
}));

vi.mock('../app/components/customClasses/funCustomArrays', () => ({
  _FUN_1_PARSER: vi.fn(() => 'LICENCIA'),
  _FUN_4_PARSER: vi.fn(() => ''),
  _FUN_6_PARSER: vi.fn(() => ''),
}));

vi.mock('../app/components/jsons/vars', () => ({
  cities: [],
  domains_number: [],
  zonesTable: {},
  infoCud: {
    city: 'Bucaramanga',
    pot: 'POT TEST',
    nomen: 'CU',
    res_extras: { art1p: '' },
  },
}));

import EXP_ACT_DESIST from '../app/pages/user/expeditions/exp_act_desist.component';

const clocks = [
  { state: 49, date_start: '2026-04-10' },
  { state: 30, date_start: '2026-04-01' },
  { state: -6, date_start: '2026-04-15' },
  { state: -5, date_start: '2026-04-12' },
  { state: -7, date_start: '2026-04-16' },
  { state: -8, date_start: '2026-04-18' },
  { state: 99, date_start: '2026-04-20' },
  { state: -30, date_start: '2026-04-20' },
  { state: 70, date_start: '2026-04-15' },
  { state: 3, date_start: '2026-03-20' },
];

const baseProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    text_btn: 'OK',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: {},
  currentVersion: 1,
  currentVersionR: 1,
  currentItem: {
    id: 1,
    id_public: 'CU-2026-0001',
    version: 1,
    fun_1s: [{ id: 1, tipo: 'D', tramite: 'LICENCIA', m_urb: '', m_sub: '', m_lic: 'A', usos: '', area: '', vivienda: '', cultural: '', regla_1: '', regla_2: '' }],
    fun_53s: [],
    fun_51s: [],
    fun_52s: [],
    fun_2: { id: 1, direccion: 'Calle 1', matricula: '123', catastral: '456', estrato: 4 },
    fun_clocks: clocks,
    record_arc_steps: [],
    record_eng_steps: [],
  },
  currentRecord: {
    id: 10,
    id_public: 'CU-RES-2026-0001',
    model_des: 'delete',
    reso: JSON.stringify(JSON.stringify({ state: 'DESISTIDA', header_text: 'Texto prueba' })),
  },
  recordArc: {},
  requestUpdate: vi.fn(),
  requestUpdateRecord: vi.fn(),
};

describe('EXP_ACT_DESIST', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, role_short: 'ARQ', name_full: 'Usuario Prueba' };
    // @ts-ignore
    import.meta.env.VITE_GLOBAL_ID = 'cb1';
  });

  it('renderiza los controles que consume la edicion PDF del acto de desistimiento', () => {
    const { container } = render(<EXP_ACT_DESIST {...baseProps} />);

    expect(container.querySelector('#expedition_doc_res_state')).toBeTruthy();
    expect(container.querySelector('#type_not')).toBeTruthy();
    expect(container.querySelector('#record_rew_simple')).toBeTruthy();
    expect(container.querySelector('#record_rew_signs')).toBeTruthy();
    expect(container.querySelector('#record_rew_pagesi')).toBeTruthy();
    expect(container.querySelector('#record_rew_pagesn')).toBeTruthy();
    expect(container.querySelector('#record_rew_pagesx')).toBeTruthy();
    expect(container.querySelector('#exp_pdf_reso_1')).toBeTruthy();
    expect(container.querySelector('#exp_pdf_reso_record_version')).toBeTruthy();
    expect(container.querySelector('#exp_pdf_reso_logo')).toBeTruthy();
    expect(container.querySelector('#expedition_doc_header_text')).toBeTruthy();
  });
});