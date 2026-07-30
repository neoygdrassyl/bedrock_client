import React, { StrictMode } from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { getMock, loadPQRSxFUNMock, getIdRelatedMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  loadPQRSxFUNMock: vi.fn(),
  getIdRelatedMock: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
}));

vi.mock('@/components/icon', () => ({
  default: ({ name }) => <span data-testid={`icon-${name}`} />,
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_confirmlegal', () => ({
  __esModule: true,
  default: () => <div data-testid="confirm-legal" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: () => <div data-testid="module-nav" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_versionNav', () => ({
  __esModule: true,
  default: () => <div data-testid="version-nav" />,
}));

vi.mock('../app/pages/user/fun_forms/components/FunChecklistWindowSwitcher', () => ({
  __esModule: true,
  default: () => <div data-testid="checklist-switcher" />,
}));

vi.mock('../app/pages/user/fun_forms/fun_g_checklist', () => ({
  __esModule: true,
  default: () => <div data-testid="legacy-checklist" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_pdf_check', () => ({
  __esModule: true,
  default: () => <div data-testid="pdf-check" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_confirminc', () => ({
  __esModule: true,
  default: () => <div data-testid="confirm-inc" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_c_clocks.component', () => ({
  __esModule: true,
  default: () => <div data-testid="clocks" />,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: getMock,
    loadPQRSxFUN: loadPQRSxFUNMock,
  },
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: {
    getIdRelated: getIdRelatedMock,
  },
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));

import FUNC from '../app/pages/user/fun_forms/fun_c';

describe('FUN_C initial fetch under StrictMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock.mockResolvedValue({
      data: {
        id: 1539,
        id_public: '68001-1-25-0233',
        version: 1,
        state: 1,
        fun_1s: [{}],
        fun_cs: [],
        fun_rs: [],
        fun_2s: [],
        fun_3s: [],
        fun_4s: [],
        fun_51s: [],
        fun_52s: [],
        fun_53s: [],
        fun_6s: [],
        fun_laws: [],
        fun_clocks: [],
      },
    });
    loadPQRSxFUNMock.mockResolvedValue({ data: [] });
    getIdRelatedMock.mockResolvedValue({ data: [] });
  });

  it('ejecuta la carga inicial una sola vez por currentId aunque StrictMode re-ejecute efectos', async () => {
    render(
      <StrictMode>
        <FUNC
          currentId={1539}
          requestUpdate={vi.fn()}
          swaMsg={{}}
          translation={{}}
          globals={{}}
          currentVersion={1}
          NAVIGATION={{}}
          NAVIGATION_VERSION={{}}
          requesRefresh={vi.fn()}
          closeModal={vi.fn()}
        />
      </StrictMode>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(1);
    });

    expect(loadPQRSxFUNMock).toHaveBeenCalledTimes(1);
    expect(getIdRelatedMock).toHaveBeenCalledTimes(1);
  });
});
