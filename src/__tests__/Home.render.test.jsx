import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { customServiceMock } = vi.hoisted(() => ({
  customServiceMock: {
    checkStatus_In: vi.fn(),
    checkStatus_Nr: vi.fn(),
    checkStatus_Lc: vi.fn(),
    checkStatus_vr: vi.fn(),
  },
}));

vi.mock('../app/components/map', () => ({
  __esModule: true,
  default: () => <div data-testid="map" />,
}));

vi.mock('../app/components/button.component', () => ({
  Button_navigation: () => <span data-testid="button-navigation" />,
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span>{name}</span>,
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    schedule: 'Lun a Vie',
    address: 'Calle 1 # 2-3',
    number1: '3000000000',
  },
}));

vi.mock('../app/components/jsons/_news', () => ({
  _news: [
    {
      id: 'news-1',
      title: 'Aviso importante',
      icon_folder: 'Folder',
      icon_date: 'Clock',
      category: 'Aviso',
      date: '2026-04-20',
      summary: 'Resumen de prueba',
      link: 'Ver mas',
      image: '/fake-news.png',
      url: '/home',
    },
  ],
}));

vi.mock('../app/services/custom.service', () => ({
  __esModule: true,
  default: customServiceMock,
}));

import Home from '../app/pages/home';

describe('Home render regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current CTA routes without React DOM warnings', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Home translation={{}} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Consulta Normatividad/i })).toHaveAttribute('href', '/normas');
    expect(screen.getByRole('link', { name: /Consulta publicaciones/i })).toHaveAttribute('href', '/publicaciones');
    expect(screen.getByRole('link', { name: /Consulta repositorio/i })).toHaveAttribute('href', '/archivo');
    expect(screen.getByRole('link', { name: /Calculadora liquidación expensa/i })).toHaveAttribute('href', '/calculadora');
    expect(screen.getByRole('link', { name: /Radicacion \(pqrs\)/i })).toHaveAttribute('href', '/peticiones');
    expect(screen.getByRole('link', { name: /Agendamiento de citas/i })).toHaveAttribute('href', '/calendario');
    expect(screen.getByRole('link', { name: /Certificacion en linea/i })).toHaveAttribute('href', '/certificados');
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('searches process status without crashing the page', async () => {
    customServiceMock.checkStatus_Lc.mockResolvedValue({
      data: [
        {
          id_public: '68001-1-aa-0000',
          state: 1,
          tramite: 'Licencia urbanistica',
          tipo: 'Obra nueva',
        },
      ],
    });

    render(
      <MemoryRouter>
        <Home translation={{}} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('ID del proceso'), {
      target: { value: '68001-1-aa-0000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'BUSCAR' }));

    await waitFor(() => {
      expect(customServiceMock.checkStatus_Lc).toHaveBeenCalledWith('68001-1-aa-0000');
    });

    expect(await screen.findByText(/Resultado de la consulta/i)).toBeInTheDocument();
    expect(screen.getByText(/68001-1-aa-0000/i)).toBeInTheDocument();
    expect(screen.getByText(/Licencia urbanistica/i)).toBeInTheDocument();
  });
});
