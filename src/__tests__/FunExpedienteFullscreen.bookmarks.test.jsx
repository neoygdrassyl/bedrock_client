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
const documentaryMode = vi.hoisted(() => ({ canonical: false }));

vi.mock('../features/expediente/fun/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [{ fun0Id: 123, scope: 'personal' }],
    error: null,
    setScope: setScopeMock,
  }),
}));

vi.mock('../features/expediente/fun/fun_forms/hooks/useAlarms', () => ({
  useAlarms: () => ({ alarms: [] }),
}));

vi.mock('../features/expediente/api/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: getFunByPublicMock,
    get: getFunMock,
    getSummaryByIdPublic: getSummaryByIdPublicMock,
  },
}));

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  // Menus are rendered open so their items can be reached without driving the popover.
  DropdownMenuItem: ({ onSelect, disabled, children }) => (
    <button type="button" role="menuitem" disabled={disabled} onClick={() => onSelect?.()}>
      {children}
    </button>
  ),
  DropdownMenuCheckboxItem: ({ checked, onCheckedChange, disabled, children, className: _className, ...props }) => (
    <button type="button" role="menuitemcheckbox" aria-checked={Boolean(checked)} disabled={disabled} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return <button type="button" {...props}>{children}</button>;
  },
}));

vi.mock('@/shared/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

vi.mock('@/shared/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../features/expediente/fun/fun_forms/fun_g', () => ({ __esModule: true, default: () => <div data-testid="module-detalles" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_c', () => ({ __esModule: true, default: () => <div data-testid="module-chequeo" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_n', () => ({ __esModule: true, default: () => <div data-testid="module-actualizar" /> }));
vi.mock('../features/expediente/fun/fun_forms/components/fun_docs', () => ({ __esModule: true, default: () => <div data-testid="module-documentos" /> }));
vi.mock('../features/expediente/documental/FunDocumentalNew.jsx', () => ({ __esModule: true, default: () => documentaryMode.canonical ? <div data-testid="canonical-entry" /> : <div data-testid="module-documentos-new" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_alertn', () => ({ __esModule: true, default: () => <div data-testid="module-publicidad" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_clock', () => ({ __esModule: true, default: () => <div data-testid="module-tiempos" /> }));
vi.mock('../features/expediente/records/record_arc', () => ({ __esModule: true, default: () => <div data-testid="module-arc" /> }));
vi.mock('../features/expediente/records/record_law', () => ({ __esModule: true, default: () => <div data-testid="module-law" /> }));
vi.mock('../features/expediente/records/record_eng', () => ({ __esModule: true, default: () => <div data-testid="module-eng" /> }));
vi.mock('../features/expediente/records/record_review', () => ({ __esModule: true, default: () => <div data-testid="module-review" /> }));
vi.mock('../features/expediente/records/record_ph', () => ({ __esModule: true, default: () => <div data-testid="module-ph" /> }));
vi.mock('../features/expediente/expeditions/expedition.page', () => ({ __esModule: true, default: () => <div data-testid="module-expedition" /> }));
vi.mock('../features/expediente/records/RecordsBinnacleStack', () => ({ __esModule: true, default: () => <div data-testid="records-binnacle-stack" /> }));

import { FunExpedienteFullscreen } from '../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen';
import { buildExpedienteWorkspaceUrl, parseExpedienteWorkspaceSearch } from '../features/expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';

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
    documentaryMode.canonical = false;
    getSummaryByIdPublicMock.mockResolvedValue({ data: null });
  });

  it('resolves canonical origin inside documentos-new without mounting the legacy module', async () => {
    documentaryMode.canonical = true;
    render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} initialSection="documentos-new" />);
    expect(await screen.findByTestId('canonical-entry')).toBeInTheDocument();
    expect(screen.queryByTestId('module-documentos')).not.toBeInTheDocument();
  });

  it('keeps documentos as the pure legacy module even for canonical origins', async () => {
    documentaryMode.canonical = true;
    render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} initialSection="documentos" />);
    expect(await screen.findByTestId('module-documentos')).toBeInTheDocument();
    expect(screen.queryByTestId('canonical-entry')).not.toBeInTheDocument();
    expect(screen.queryByTestId('module-documentos-new')).not.toBeInTheDocument();
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

    expect(buildExpedienteWorkspaceUrl(expediente, { module: 'record_ph', rightPanel: true })).toBe(
      '/funmanage/expediente/2026-00123?section=informes&report=ph&panel=open'
    );

    expect(parseExpedienteWorkspaceSearch('?section=informes&report=ph&panel=open')).toMatchObject({
      section: 'informes',
      report: 'ph',
      rightPanel: true,
    });

    expect(buildExpedienteWorkspaceUrl(expediente, { module: 'record_ph', rightPanel: false })).toBe(
      '/funmanage/expediente/2026-00123?section=informes&report=ph'
    );

    expect(parseExpedienteWorkspaceSearch('?section=informes&report=ph&panel=closed')).toMatchObject({
      section: 'informes',
      report: 'ph',
      rightPanel: false,
    });
  });

  it('abre por defecto el panel solo en informes juridico, arquitectonico y estructural', () => {
    expect(parseExpedienteWorkspaceSearch('?section=informes')).toMatchObject({
      section: 'informes',
      report: 'juridico',
      rightPanel: true,
    });

    expect(parseExpedienteWorkspaceSearch('?section=informes&report=arquitectonico')).toMatchObject({
      section: 'informes',
      report: 'arquitectonico',
      rightPanel: true,
    });

    expect(parseExpedienteWorkspaceSearch('?section=informes&report=estructural')).toMatchObject({
      section: 'informes',
      report: 'estructural',
      rightPanel: true,
    });

    expect(parseExpedienteWorkspaceSearch('?section=tiempos')).toMatchObject({
      section: 'tiempos',
      rightPanel: false,
    });

    expect(parseExpedienteWorkspaceSearch('?section=tiempos&panel=open')).toMatchObject({
      section: 'tiempos',
      rightPanel: true,
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

    expect(navGroups).toHaveLength(4);
    expect(screen.queryByRole('navigation', { name: /subnavegaci[oó]n de informes/i })).not.toBeInTheDocument();
    const namesOf = (group) => within(group).getAllByRole('button').map((button) => button.getAttribute('aria-label'));
    expect(navGroups[2]).toHaveAccessibleName('Evaluación');
    expect(namesOf(navGroups[2])).toEqual(['Informe P.H.']);
    expect(navGroups[3]).toHaveAccessibleName('Expedición');
    expect(namesOf(navGroups[3])).toEqual(['Expedición P.H.']);
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

  it('agrupa los módulos en Consulta, Documentos, Evaluación y Expedición y conserva el cambio de reporte activo', async () => {
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
    const navGroups = within(workspaceNav).getAllByRole('group');
    // Accessible names: the visible text of a report may be its short form ("Jurídico").
    const labelsOf = (group) => within(group).getAllByRole('button').map((button) => button.getAttribute('aria-label'));

    expect(screen.queryByRole('navigation', { name: /subnavegaci[oó]n de informes/i })).not.toBeInTheDocument();
    expect(navGroups).toHaveLength(4);
    ['Consulta', 'Documentos', 'Evaluación', 'Expedición'].forEach((label, index) => {
      expect(navGroups[index]).toHaveAccessibleName(label);
    });
    expect(labelsOf(navGroups[0])).toEqual(['Detalles', 'Tiempos']);
    expect(labelsOf(navGroups[1])).toEqual(['Documentos (nuevo)', 'Documentos', 'Actualizar', 'Chequeo', 'Publicidad']);
    expect(labelsOf(navGroups[2])).toEqual(['Informe jurídico', 'Informe arquitectónico', 'Informe estructural']);
    expect(labelsOf(navGroups[3])).toEqual(['Acta', 'Expedición']);

    expect(screen.getByRole('button', { name: /informe arquitectónico/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-arc')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /informe estructural/i }));
    expect(screen.getByRole('button', { name: /informe estructural/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-eng')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /informe jurídico/i }));
    expect(screen.getByRole('button', { name: /informe jurídico/i })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-law')).toBeInTheDocument();
  });

  it('conserva Documentos new como módulo separado y permite volver al original', async () => {
    const user = userEvent.setup();
    render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} initialSection="documentos-new" />);
    expect(screen.getByRole('button', { name: 'Documentos (nuevo)' })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-documentos-new')).toBeInTheDocument();
    expect(screen.queryByTestId('module-documentos')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Documentos' }));
    expect(screen.getByRole('button', { name: 'Documentos' })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByTestId('module-documentos')).toBeInTheDocument();
  });

  it('marca solo el módulo activo con aria-current y nombra la región del módulo', () => {
    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
      />
    );

    const workspaceNav = screen.getByRole('navigation', { name: /m[oó]dulos del expediente/i });
    const current = within(workspaceNav).getAllByRole('button').filter((button) => button.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Detalles');
    expect(screen.getByRole('button', { name: 'Documentos' })).not.toHaveAttribute('aria-current');
    // No page heading repeats the module: the module area is the landmark that carries its name.
    expect(screen.queryByRole('heading', { level: 1, name: 'Detalles' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Detalles' })).toBeInTheDocument();
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
