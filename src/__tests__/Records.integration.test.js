import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  swalFire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  funService: {
    get: vi.fn(() => Promise.resolve({
      data: {
        id: 1,
        id_public: 'FUN-001',
        rules: '0;0;0',
        fun_1s: [],
        fun_6s: [],
        fun_52s: [],
        fun_rs: [],
      },
    })),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  arcService: {
    getRecord: vi.fn(() => Promise.resolve({
      data: {
        record_arc: { id: 10, version: 1, subcategory: '0,0,0,0' },
        record_arc_steps: [],
        record_arc_33_areas: [],
        record_arc_34_ks: [],
        record_arc_34_gens: [],
        record_arc_35_parkings: [],
        record_arc_36_infos: [],
        record_arc_37s: [],
        record_arc_35_locations: [],
        record_arc_38s: [],
      },
    })),
    getSteps: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  lawService: {
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  engService: {
    findIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: hoisted.swalFire,
    close: vi.fn(),
    showValidationMessage: vi.fn(),
  },
}));

vi.mock('sweetalert2-react-content', () => ({
  default: (swal) => swal,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('../app/services/record_arc.service', () => ({
  __esModule: true,
  default: hoisted.arcService,
}));

vi.mock('../app/services/record_law.service', () => ({
  __esModule: true,
  default: hoisted.lawService,
}));

vi.mock('../app/services/record_eng.service', () => ({
  __esModule: true,
  default: hoisted.engService,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_versionNav', () => ({
  __esModule: true,
  default: () => <div data-testid='fun-version-nav' />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: () => <div data-testid='fun-module-nav' />,
}));

vi.mock('../app/pages/user/fun_forms/components/clocks_control.component', () => ({
  __esModule: true,
  default: () => <div data-testid='clocks-control' />,
}));

vi.mock('../app/pages/user/fun_forms/components/shot_info.component', () => ({
  __esModule: true,
  default: () => <div data-testid='short-info' />,
}));

vi.mock('../app/pages/user/records/records_binnacles.component', () => ({
  __esModule: true,
  default: () => <div data-testid='records-binnacles' />,
}));

vi.mock('../app/pages/user/submit/submit_view.component', () => ({
  __esModule: true,
  default: () => <div data-testid='submit-single-view' />,
}));

vi.mock('../app/pages/user/fun_forms/fun_6.view', () => ({
  __esModule: true,
  default: () => <div data-testid='fun-6-view' />,
}));

vi.mock('../app/pages/user/records/law/record_law_review', () => ({ __esModule: true, default: () => <div data-testid='law-review' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_32', () => ({ __esModule: true, default: () => <div data-testid='arc-32' /> }));
vi.mock('../app/pages/user/records/law/record_law_docs_check', () => ({ __esModule: true, default: () => <div data-testid='law-docs-check' /> }));
vi.mock('../app/pages/user/records/law/record_law_step1.cmponent', () => ({ __esModule: true, default: () => <div data-testid='law-step1' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_1.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun1' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_2.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun2' /> }));
vi.mock('../app/pages/user/records/law/record_law_gen2_11', () => ({ __esModule: true, default: () => <div data-testid='law-gen2-11' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_51.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun51' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_52.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun52' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_53.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun53' /> }));
vi.mock('../app/pages/user/records/law/record_law_fun_law.component', () => ({ __esModule: true, default: () => <div data-testid='law-fun-law' /> }));

vi.mock('../app/pages/user/records/eng/record_eng_profesionals.component', () => ({ __esModule: true, default: () => <div data-testid='eng-professionals' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_desc.component', () => ({ __esModule: true, default: () => <div data-testid='eng-desc' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_s_431.component', () => ({ __esModule: true, default: () => <div data-testid='eng-431' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_s_432.component', () => ({ __esModule: true, default: () => <div data-testid='eng-432' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_4323.component', () => ({ __esModule: true, default: () => <div data-testid='eng-4323' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_sismic.component', () => ({ __esModule: true, default: () => <div data-testid='eng-sismic' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_review.component', () => ({ __esModule: true, default: () => <div data-testid='eng-review' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_433.component', () => ({ __esModule: true, default: () => <div data-testid='eng-433' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_44.component', () => ({ __esModule: true, default: () => <div data-testid='eng-44' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_4333p.componen', () => ({ __esModule: true, default: () => <div data-testid='eng-433p' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_docs_check.component', () => ({ __esModule: true, default: () => <div data-testid='eng-docs-check' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_43.component', () => ({ __esModule: true, default: () => <div data-testid='eng-43' /> }));
vi.mock('../app/pages/user/fun_forms/components/fun_g_reports.component', () => ({ __esModule: true, default: () => <div data-testid='fun-g-reports' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_docsDetail.component', () => ({ __esModule: true, default: () => <div data-testid='eng-docs-detail' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_430.component', () => ({ __esModule: true, default: () => <div data-testid='eng-430' /> }));
vi.mock('../app/pages/user/records/eng/recprd_eng_mamporteria', () => ({ __esModule: true, ENG_MANPOSTERIA: () => <div data-testid='eng-mamposteria' /> }));
vi.mock('../app/pages/user/records/eng/record_eng_fuego.component', () => ({ __esModule: true, ENG_FUEGO: () => <div data-testid='eng-fuego' /> }));

vi.mock('../app/pages/user/records/arc/record_arc_31', () => ({ __esModule: true, default: () => <div data-testid='arc-31' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_33', () => ({ __esModule: true, default: () => <div data-testid='arc-33' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_34', () => ({ __esModule: true, default: () => <div data-testid='arc-34' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_35', () => ({ __esModule: true, default: () => <div data-testid='arc-35' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_36', () => ({ __esModule: true, default: () => <div data-testid='arc-36' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_38', () => ({ __esModule: true, default: () => <div data-testid='arc-38' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_extra_1', () => ({ __esModule: true, default: () => <div data-testid='arc-extra-1' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_extra_2', () => ({ __esModule: true, default: () => <div data-testid='arc-extra-2' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_37', () => ({ __esModule: true, default: () => <div data-testid='arc-37' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_gen_review.component', () => ({ __esModule: true, default: () => <div data-testid='arc-gen-review' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_areas.component', () => ({ __esModule: true, default: () => <div data-testid='arc-areas' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_desc', () => ({ __esModule: true, default: () => <div data-testid='arc-desc' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_control.component', () => ({ __esModule: true, default: () => <div data-testid='arc-control' /> }));
vi.mock('../app/pages/user/records/arc/record_arc_gem2_review.component', () => ({ __esModule: true, default: () => <div data-testid='arc-gen2-review' /> }));

import RECORD_LAW from '../app/pages/user/records/record_law';
import RECORD_ARC from '../app/pages/user/records/record_arc';
import RECORD_ENG from '../app/pages/user/records/record_eng';

const baseProps = {
  translation: {},
  swaMsg: {
    text_btn: 'OK',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: { id: '1' },
  currentVersion: 1,
  currentId: 1,
  NAVIGATION: vi.fn(),
};

const renderInRouter = (Component, props = {}) =>
  render(
    <MemoryRouter>
      <Component {...baseProps} {...props} />
    </MemoryRouter>
  );

const loadedFunItem = {
  id: 1,
  id_public: 'FUN-001',
  rules: '0;0;0',
  fun_1s: [{ tipo: 'F', tramite: 'Licencia' }],
  fun_6s: [],
  fun_52s: [],
  fun_rs: [],
};

describe('RECORDS — Integración inicial LAW/ARC/ENG', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  it('LAW: carga mínima sin crash', async () => {
    // Arrange

    // Act
    const { container } = renderInRouter(RECORD_LAW);

    // Assert
    await waitFor(() => {
      expect(hoisted.lawService.getRecord).toHaveBeenCalledWith(1);
      expect(hoisted.funService.get).toHaveBeenCalledWith(1);
    });
    expect(container.querySelector('.record_arc')).toBeInTheDocument();
  });

  it('LAW: error de carga muestra feedback y no crashea', async () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hoisted.funService.get.mockRejectedValueOnce(new Error('law get failed'));

    // Act
    const { container } = renderInRouter(RECORD_LAW);

    // Assert
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalled();
    });
    expect(container.querySelector('.record_arc')).toBeInTheDocument();
    logSpy.mockRestore();
  });

  it('LAW: sin informe existente permite generar informe en blanco', async () => {
    // Arrange
    hoisted.lawService.getRecord.mockResolvedValue({ data: [] });
    hoisted.funService.get.mockResolvedValue({ data: loadedFunItem });

    // Act
    renderInRouter(RECORD_LAW);

    // Assert precondición
    const createBtn = await screen.findByRole('button', { name: /GENERAR INFORME EN BLANCO/i });
    expect(createBtn).toBeInTheDocument();

    // Act
    fireEvent.click(createBtn);

    // Assert
    await waitFor(() => {
      expect(hoisted.lawService.create).toHaveBeenCalledTimes(1);
    });
    const formDataArg = hoisted.lawService.create.mock.calls[0][0];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.get('fun0Id')).toBe('1');
    expect(formDataArg.get('version')).toBe('1');
  });

  it('LAW: cambiar regla de publicidad persiste rules en FUN', async () => {
    // Arrange
    hoisted.lawService.getRecord.mockResolvedValue({
      data: [{ id: 99, version: 1 }],
    });
    hoisted.funService.get.mockResolvedValue({ data: loadedFunItem });

    // Act
    renderInRouter(RECORD_LAW);

    // Assert precondición
    const noPublicidad = await screen.findByRole('checkbox');
    expect(noPublicidad).not.toBeChecked();

    // Act
    fireEvent.click(noPublicidad);

    // Assert
    await waitFor(() => {
      expect(hoisted.funService.update).toHaveBeenCalledTimes(1);
    });
    const formDataArg = hoisted.funService.update.mock.calls[0][1];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.get('rules')).toBe('1;0;0');
  });

  it('ARC: carga mínima sin crash', async () => {
    // Arrange

    // Act
    const { container } = renderInRouter(RECORD_ARC);

    // Assert
    await waitFor(() => {
      expect(hoisted.arcService.getRecord).toHaveBeenCalledWith(1);
      expect(hoisted.funService.get).toHaveBeenCalledWith(1);
    });
    expect(container.querySelector('.record_arc')).toBeInTheDocument();
  });

  it('ARC: error de carga muestra feedback y no crashea', async () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hoisted.funService.get.mockRejectedValueOnce(new Error('arc get failed'));

    // Act
    const { container } = renderInRouter(RECORD_ARC);

    // Assert
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalled();
    });
    expect(container.querySelector('.record_arc')).toBeInTheDocument();
    logSpy.mockRestore();
  });

  it('ARC: sin informe existente permite generar informe en blanco', async () => {
    // Arrange
    hoisted.arcService.getRecord.mockResolvedValue({
      data: {
        record_arc: null,
        record_arc_steps: [],
        record_arc_33_areas: [],
        record_arc_34_ks: [],
        record_arc_34_gens: [],
        record_arc_35_parkings: [],
        record_arc_36_infos: [],
        record_arc_37s: [],
        record_arc_35_locations: [],
        record_arc_38s: [],
      },
    });
    hoisted.funService.get.mockResolvedValue({ data: loadedFunItem });

    // Act
    renderInRouter(RECORD_ARC);

    // Assert precondición
    const createBtn = await screen.findByRole('button', { name: /GENERAR INFORME EN BLANCO/i });
    expect(createBtn).toBeInTheDocument();

    // Act
    fireEvent.click(createBtn);

    // Assert
    await waitFor(() => {
      expect(hoisted.arcService.create).toHaveBeenCalledTimes(1);
    });
    const formDataArg = hoisted.arcService.create.mock.calls[0][0];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.get('fun0Id')).toBe('1');
    expect(formDataArg.get('version')).toBe('1');
  });

  it('ENG: carga mínima sin crash', async () => {
    // Arrange

    // Act
    const { container } = renderInRouter(RECORD_ENG);

    // Assert
    await waitFor(() => {
      expect(hoisted.engService.findIdRelated).toHaveBeenCalledWith(1);
      expect(hoisted.funService.get).toHaveBeenCalledWith(1);
      expect(hoisted.arcService.getSteps).toHaveBeenCalledWith(1);
    });
    expect(container.querySelector('.record_eng')).toBeInTheDocument();
  });

  it('ENG: error de carga muestra feedback y no crashea', async () => {
    // Arrange
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hoisted.funService.get.mockRejectedValueOnce(new Error('eng get failed'));

    // Act
    const { container } = renderInRouter(RECORD_ENG);

    // Assert
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalled();
    });
    expect(container.querySelector('.record_eng')).toBeInTheDocument();
    logSpy.mockRestore();
  });

  it('ENG: sin informe existente permite generar informe en blanco', async () => {
    // Arrange
    hoisted.engService.findIdRelated.mockResolvedValue({ data: [] });
    hoisted.funService.get.mockResolvedValue({ data: loadedFunItem });

    // Act
    renderInRouter(RECORD_ENG);

    // Assert precondición
    const createBtn = await screen.findByRole('button', { name: /GENERAR INFORME EN BLANCO/i });
    expect(createBtn).toBeInTheDocument();

    // Act
    fireEvent.click(createBtn);

    // Assert
    await waitFor(() => {
      expect(hoisted.engService.create).toHaveBeenCalledTimes(1);
    });
    const formDataArg = hoisted.engService.create.mock.calls[0][0];
    expect(formDataArg).toBeInstanceOf(FormData);
    expect(formDataArg.get('fun0Id')).toBe('1');
    expect(formDataArg.get('version')).toBe('1');
  });

  it('ENG: cambiar categoría dispara update del informe y rules del FUN', async () => {
    // Arrange
    hoisted.engService.findIdRelated.mockResolvedValue({
      data: [{ id: 77, version: 1, category: 1, subcategory: '1;1;1' }],
    });
    hoisted.funService.get.mockResolvedValue({ data: loadedFunItem });

    // Act
    renderInRouter(RECORD_ENG);

    // Assert precondición
    const categorySelect = await screen.findByRole('combobox');
    expect(categorySelect).toBeInTheDocument();

    // Act
    fireEvent.change(categorySelect, { target: { value: '2' } });

    // Assert
    await waitFor(() => {
      expect(hoisted.funService.update).toHaveBeenCalledTimes(1);
      expect(hoisted.engService.update).toHaveBeenCalledTimes(1);
    });

    const funFormDataArg = hoisted.funService.update.mock.calls[0][1];
    const engFormDataArg = hoisted.engService.update.mock.calls[0][1];
    expect(funFormDataArg).toBeInstanceOf(FormData);
    expect(funFormDataArg.get('rules')).toBe('0;0;0');
    expect(engFormDataArg).toBeInstanceOf(FormData);
    expect(engFormDataArg.get('category')).toBe('2');
  });
});
