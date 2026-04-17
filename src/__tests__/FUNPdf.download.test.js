import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { fireMock, pdfLoadMock } = vi.hoisted(() => ({
  fireMock: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  pdfLoadMock: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  default: {},
}));

vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: fireMock,
    close: vi.fn(),
  }),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: pdfLoadMock,
  },
  StandardFonts: {
    Helvetica: 'Helvetica',
  },
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (value) => value ?? '',
  getJSONFull: () => ({}),
}));

vi.mock('../app/components/jsons/vars', async () => {
  const React = await import('react');

  return {
    states: [React.createElement('option', { key: 'state', value: 'Santander' }, 'Santander')],
    cities: [React.createElement('option', { key: 'city', value: 'Bucaramanga' }, 'Bucaramanga')],
    domains: [],
  };
});

import FUN_PDF from '../app/pages/user/fun_forms/components/fun_pdf';

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  text_btn: 'Continuar',
};

const baseCurrentItem = {
  id: 1,
  id_public: 'CUB1-2026-0001',
  model: null,
  version: 1,
  fun_1s: [],
  fun_2: null,
  fun_3s: [],
  fun_4s: [],
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_clocks: [{ state: 3, date_start: '2026-04-08' }],
};

function renderFunPdf(currentItemOverrides = {}) {
  render(
    <FUN_PDF
      currentItem={{ ...baseCurrentItem, ...currentItemOverrides }}
      currentVersion={1}
      swaMsg={swaMsg}
    />
  );

  return screen.getByRole('button', { name: /descargar formulario/i });
}

function getReactClickHandler(element) {
  const reactPropsKey = Object.keys(element).find((key) => key.startsWith('__reactProps$'));

  if (!reactPropsKey) {
    throw new Error('No se encontró el manejador React del botón.');
  }

  return element[reactPropsKey].onClick;
}

describe('FUN_PDF download flow', () => {
  beforeEach(() => {
    fireMock.mockClear();
    pdfLoadMock.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  test('shows the missing model alert instead of throwing a ReferenceError', async () => {
    const button = renderFunPdf();
    const clickHandler = getReactClickHandler(button);

    await clickHandler();

    expect(fireMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'SOLICITUD SIN MODELO',
        text: 'Para poder generar el PDF de esta solicitud, se debe de definir el modelo.',
        icon: 'error',
      })
    );
    expect(pdfLoadMock).not.toHaveBeenCalled();
  });

  test('uses 2026 template when project date is after March 15, 2026', async () => {
    const stopAfterContextSetup = new Error('stop-after-context-setup');

    fetch.mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    pdfLoadMock.mockResolvedValue({
      getPage: vi.fn(() => {
        throw stopAfterContextSetup;
      }),
    });

    const button = renderFunPdf({ model: 2024 });
    const clickHandler = getReactClickHandler(button);

    await expect(clickHandler()).rejects.toBe(stopAfterContextSetup);
    expect(fetch).toHaveBeenCalledWith(`${import.meta.env.VITE_API_URL}/pdf/funflat2026`);
    expect(pdfLoadMock).toHaveBeenCalledTimes(1);
  });
});
