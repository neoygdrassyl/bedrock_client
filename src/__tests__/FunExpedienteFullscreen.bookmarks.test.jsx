import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { setScopeMock, getFunByPublicMock, getFunMock, getSummaryByIdPublicMock } = vi.hoisted(() => ({
  setScopeMock: vi.fn(),
  getFunByPublicMock: vi.fn(),
  getFunMock: vi.fn(),
  getSummaryByIdPublicMock: vi.fn(),
}));

vi.mock('../app/pages/user/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [{ fun0Id: 123, scope: 'personal' }],
    error: null,
    setScope: setScopeMock,
  }),
}));

vi.mock('../app/pages/user/fun_forms/hooks/useAlarms', () => ({
  useAlarms: () => ({ alarms: [] }),
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: getFunByPublicMock,
    get: getFunMock,
    getSummaryByIdPublic: getSummaryByIdPublicMock,
  },
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuCheckboxItem: ({ checked, onCheckedChange, children, ...props }) => (
    <button type="button" aria-pressed={checked} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return <button type="button" {...props}>{children}</button>;
  },
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../app/pages/user/fun_forms/fun_g', () => ({ __esModule: true, default: () => <div data-testid="module-detalles" /> }));
vi.mock('../app/pages/user/fun_forms/fun_c', () => ({ __esModule: true, default: () => <div data-testid="module-chequeo" /> }));
vi.mock('../app/pages/user/fun_forms/fun_n', () => ({ __esModule: true, default: () => <div data-testid="module-actualizar" /> }));
vi.mock('../app/pages/user/fun_forms/components/fun_docs', () => ({ __esModule: true, default: () => <div data-testid="module-documentos" /> }));
vi.mock('../app/pages/user/fun_forms/fun_alertn', () => ({ __esModule: true, default: () => <div data-testid="module-publicidad" /> }));
vi.mock('../app/pages/user/fun_forms/fun_clock', () => ({ __esModule: true, default: () => <div data-testid="module-tiempos" /> }));
vi.mock('../app/pages/user/records/record_arc', () => ({ __esModule: true, default: () => <div data-testid="module-arc" /> }));
vi.mock('../app/pages/user/records/record_law', () => ({ __esModule: true, default: () => <div data-testid="module-law" /> }));
vi.mock('../app/pages/user/records/record_eng', () => ({ __esModule: true, default: () => <div data-testid="module-eng" /> }));
vi.mock('../app/pages/user/records/record_review', () => ({ __esModule: true, default: () => <div data-testid="module-review" /> }));
vi.mock('../app/pages/user/records/record_ph', () => ({ __esModule: true, default: () => <div data-testid="module-ph" /> }));
vi.mock('../app/pages/user/expeditions/expedition.page', () => ({ __esModule: true, default: () => <div data-testid="module-expedition" /> }));

import { FunExpedienteFullscreen } from '../app/pages/user/fun_forms/components/FunExpedienteFullscreen';
import { buildExpedienteWorkspaceUrl, parseExpedienteWorkspaceSearch } from '../app/pages/user/fun_forms/utils/expedienteWorkspaceRoute';

const expediente = {
  id: 123,
  id_public: '2026-00123',
  version: 1,
  state: 10,
  rules: '0;0',
  fun_1s: [{ tipo: 'D', tramite: 'A', m_lic: '', m_urb: '', m_sub: '' }],
  fase_label: 'Estudio y Observaciones',
  status: 'EN_TERMINO',
  porcentaje_avance: 35,
  dias_habiles_usados: 7,
  dias_habiles_limite: 20,
  fecha_radicacion: '2026-04-01',
  fecha_limite: '2026-05-01',
};

const phExpediente = {
  ...expediente,
  fun_1s: [{ tipo: 'G', tramite: 'A', item_2: 'Propiedad Horizontal', description: 'Propiedad Horizontal' }],
};

describe('FunExpedienteFullscreen bookmarks', () => {
  beforeEach(() => {
    getSummaryByIdPublicMock.mockResolvedValue({ data: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.className = '';
    document.body.style.overflow = '';
  });

  it('permite marcar el expediente desde el header fijo del detalle completo', async () => {
    const user = userEvent.setup();
    setScopeMock.mockResolvedValue(undefined);
    getFunByPublicMock.mockResolvedValue({ data: expediente });

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByTestId('fullscreen-bookmark-menu-trigger-123')).toHaveAttribute('title', 'Destacado solo para mí');

    await user.click(screen.getByTestId('fullscreen-bookmark-menu-team-123'));

    expect(setScopeMock).toHaveBeenCalledWith(123, 'team', true);
    expect(getFunByPublicMock).toHaveBeenCalledWith('2026-00123');
  });

  it('restaura Actualizar y Publicidad en expedientes elegibles y permite navegar entre ambos', async () => {
    const user = userEvent.setup();

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
      />
    );

    const actualizarButton = screen.getByRole('button', { name: /actualizar/i });
    const publicidadButton = screen.getByRole('button', { name: /publicidad/i });

    expect(actualizarButton).toBeInTheDocument();
    expect(publicidadButton).toBeInTheDocument();

    await user.click(actualizarButton);
    expect(await screen.findByTestId('module-actualizar')).toBeInTheDocument();

    await user.click(publicidadButton);
    expect(await screen.findByTestId('module-publicidad')).toBeInTheDocument();
  });

  it('oculta Publicidad cuando la regla legacy No usar Publicidad está activa', () => {
    render(
      <FunExpedienteFullscreen
        expediente={{
          ...expediente,
          rules: '1;0',
        }}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /publicidad/i })).not.toBeInTheDocument();
  });

  it('mantiene compatibilidad con el target legacy record_ph del workspace', () => {
    expect(buildExpedienteWorkspaceUrl(expediente, { module: 'record_ph' })).toBe(
      '/funmanage/expediente/2026-00123?section=informes&report=ph'
    );

    expect(parseExpedienteWorkspaceSearch('?section=informes&report=ph')).toMatchObject({
      section: 'informes',
      report: 'ph',
      rightPanel: false,
    });
  });

  it('muestra solo Informe P.H. como módulo directo y renderiza RECORD_PH para expedientes de propiedad horizontal', async () => {
    render(
      <FunExpedienteFullscreen
        expediente={phExpediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="informes"
        initialReport="ph"
      />
    );

    const workspaceNav = screen.getByRole('navigation', { name: /m[oó]dulos del expediente/i });
    const navGroups = within(workspaceNav).getAllByRole('group');

    expect(navGroups).toHaveLength(3);
    expect(screen.queryByRole('navigation', { name: /subnavegaci[oó]n de informes/i })).not.toBeInTheDocument();
    expect(within(navGroups[1]).getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Tiempos',
      'Informe P.H.',
    ]);
    expect(screen.getByRole('button', { name: /expedici[oó]n p\.h\./i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^expedici[oó]n$/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /informe p\.h\./i })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', { name: /jurídico/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /arquitectónico/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /estructural/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /acta/i })).not.toBeInTheDocument();
    expect(await screen.findByTestId('module-ph')).toBeInTheDocument();
  });

  it('normaliza report=ph como jurídico para expedientes normales aunque description mencione propiedad horizontal', async () => {
    render(
      <FunExpedienteFullscreen
        expediente={{
          ...expediente,
          id_public: '68001-1-25-0263',
          tipo_licencia: 'D',
          categoria: 'III',
          fun_1s: [{
            tipo: 'D',
            tramite: '',
            m_lic: 'D',
            m_urb: '',
            m_sub: '',
            description: 'MODIFICACION Y REFORZAMIENTO ESTRUCTURAL PARA UNA EDIFICACION SOMETIDA AL REGIMEN DE PROPIEDAD HORIZONTAL',
          }],
        }}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="informes"
        initialReport="ph"
      />
    );

    expect(screen.getByRole('button', { name: /informe jurídico/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', { name: /informe p\.h\./i })).not.toBeInTheDocument();
    expect(await screen.findByTestId('module-law')).toBeInTheDocument();
  });

  it('renderiza tres grupos directos de ancho completo, elimina la subnavegación de informes y conserva el cambio de reporte activo', async () => {
    const user = userEvent.setup();

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="informes"
        initialReport="arquitectonico"
      />
    );

    const workspaceNav = screen.getByRole('navigation', { name: /m[oó]dulos del expediente/i });
    const navScroller = workspaceNav.firstElementChild;
    const navGroups = within(workspaceNav).getAllByRole('group');

    expect(screen.queryByRole('navigation', { name: /subnavegaci[oó]n de informes/i })).not.toBeInTheDocument();
    expect(navScroller).toHaveClass('flex');
    expect(navGroups).toHaveLength(3);
    navGroups.forEach((group) => {
      expect(group).toHaveClass('grid-flow-col', 'auto-cols-max');
    });
    expect(within(navGroups[0]).getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Detalles',
      'Documentos',
      'Actualizar',
      'Chequeo',
      'Publicidad',
    ]);
    expect(within(navGroups[1]).getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Tiempos',
      'Inf. Jur',
      'Inf. Arq',
      'Inf. Estr',
    ]);
    expect(within(navGroups[2]).getAllByRole('button').map((button) => button.textContent?.trim())).toEqual([
      'Acta',
      'Expedición',
    ]);

    expect(screen.getByRole('button', { name: /informe arquitectónico/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-arc')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /informe estructural/i }));
    expect(screen.getByRole('button', { name: /informe estructural/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-eng')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /informe jurídico/i }));
    expect(screen.getByRole('button', { name: /informe jurídico/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-law')).toBeInTheDocument();
  });

  it('usa una variante activa más visible y mantiene contraste fuerte en botones inactivos del workspace', () => {
    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /detalles/i })).toHaveClass('border-sky-400', 'bg-sky-200/95', 'text-sky-950');
    expect(screen.getByRole('button', { name: /detalles/i })).not.toHaveClass('bg-sky-700', 'text-white');
    expect(screen.getByRole('button', { name: /documentos/i })).toHaveClass('text-slate-900', 'bg-white/80');
  });

  it('renderiza la aprobación PH legacy al abrir Expedición P.H.', async () => {
    render(
      <FunExpedienteFullscreen
        expediente={phExpediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="expedicion"
      />
    );

    expect(screen.getByRole('button', { name: /expedici[oó]n p\.h\./i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^expedici[oó]n$/i })).not.toBeInTheDocument();
    expect(await screen.findByTestId('module-ph')).toBeInTheDocument();
    expect(screen.queryByTestId('module-expedition')).not.toBeInTheDocument();
  });

  it('no conserva opciones PH al refrescar hacia un expediente no PH', async () => {
    const user = userEvent.setup();
    const phWithTopLevelFlag = {
      ...phExpediente,
      id: 321,
      id_public: '2026-PH',
      tipo_licencia: 'Propiedad Horizontal',
    };
    const nonPhAfterRefresh = {
      ...expediente,
      id: 456,
      id_public: '2026-NOPH',
    };

    setScopeMock.mockResolvedValue(undefined);
    getFunByPublicMock.mockResolvedValueOnce({ data: nonPhAfterRefresh });

    render(
      <FunExpedienteFullscreen
        expediente={phWithTopLevelFlag}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="expedicion"
      />
    );

    expect(screen.getByRole('button', { name: /expedici[oó]n p\.h\./i })).toBeInTheDocument();

    await user.click(screen.getByTestId('fullscreen-bookmark-menu-team-321'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^expedici[oó]n$/i })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /expedici[oó]n p\.h\./i })).not.toBeInTheDocument();
    expect(await screen.findByTestId('module-expedition')).toBeInTheDocument();
    expect(screen.queryByTestId('module-ph')).not.toBeInTheDocument();
  });
});
