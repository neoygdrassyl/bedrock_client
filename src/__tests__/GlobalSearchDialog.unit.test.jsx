import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GlobalSearchDialog } from '@/app/layouts/GlobalSearchDialog';

const getSearchMock = vi.fn();
const getFunByPublicMock = vi.fn();
const getSummaryByIdPublicMock = vi.fn();

vi.mock('@/app/services/fun.service', () => ({
  default: {
    getSearch: (...args) => getSearchMock(...args),
    get_fun_IdPublic: (...args) => getFunByPublicMock(...args),
    getSummaryByIdPublic: (...args) => getSummaryByIdPublicMock(...args),
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  DialogDescription: ({ children, ...props }) => <p {...props}>{children}</p>,
}));

const expediente = {
  id: 1,
  id_public: '68001-1-26-0001',
  tramite: 'A',
  tipo: 'D',
  m_lic: 'A',
  state: 50,
};

const summary = {
  id: 1,
  id_public: '68001-1-26-0001',
  tipo: 'D',
  tramite: 'A',
  m_lic: 'A',
  fase_label: 'Estudio y Observaciones',
  responsable: 'Curaduría',
  dias_habiles_usados: 12,
  dias_habiles_limite: 35,
  fecha_limite: '2026-05-20',
  status: 'PRONTO_A_VENCER',
  solicitante: 'MANUEL ANDRES LOBO ROJAS',
  direccion: 'CARRERA 4 OCC # 45-77',
};

describe('GlobalSearchDialog', () => {
  beforeEach(() => {
    getSearchMock.mockReset();
    getFunByPublicMock.mockReset();
    getSummaryByIdPublicMock.mockReset();
    getSearchMock.mockResolvedValue({ data: [expediente] });
    getFunByPublicMock.mockResolvedValue({ data: expediente });
    getSummaryByIdPublicMock.mockResolvedValue({ data: { data: summary } });
  });

  it('consulta expedientes en FUN y muestra fase, término y solicitante relevantes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GlobalSearchDialog open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/criterio de búsqueda de expedientes/i), '68001-1-26-0001');
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(getSearchMock).toHaveBeenCalledWith('1', '68001-1-26-0001');
    expect(getFunByPublicMock).toHaveBeenCalledWith('68001-1-26-0001', { skipDovelaErrorCapture: true });
    expect(getSummaryByIdPublicMock).toHaveBeenCalledWith('68001-1-26-0001', { skipDovelaErrorCapture: true });

    const radicado = await screen.findByText('68001-1-26-0001');
    expect(radicado.closest('a')).toHaveAttribute('href', '/funmanage/expediente/68001-1-26-0001');
    expect(screen.getByText(/Licencia De Construccion · Inicial · Obra Nueva/i)).toBeInTheDocument();
    expect(screen.getByText(/Estudio Y Observaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/Curaduría: 12\/35 días hábiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Manuel Andres Lobo Rojas/i)).toBeInTheDocument();
  });

  it('permite cambiar el criterio y sigue buscando solo expedientes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GlobalSearchDialog open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    await user.selectOptions(screen.getByLabelText(/campo de búsqueda de expediente/i), '5');
    await user.type(screen.getByLabelText(/criterio de búsqueda de expedientes/i), '123456789');
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(getSearchMock).toHaveBeenCalledWith('5', '123456789');
    expect(getFunByPublicMock).not.toHaveBeenCalled();
  });

  it('no convierte una búsqueda parcial por radicado en un lookup exacto fallido', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <GlobalSearchDialog open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/criterio de búsqueda de expedientes/i), '0003');
    await user.click(screen.getByRole('button', { name: /^buscar$/i }));

    expect(getSearchMock).toHaveBeenCalledWith('1', '0003');
    expect(getFunByPublicMock).not.toHaveBeenCalled();
    expect(await screen.findByText('68001-1-26-0001')).toBeInTheDocument();
  });
});
