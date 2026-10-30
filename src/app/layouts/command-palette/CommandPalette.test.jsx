import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { searchMock, legacySearchMock } = vi.hoisted(() => ({
  searchMock: vi.fn(),
  legacySearchMock: vi.fn(),
}));

vi.mock('@/shared/api/search.service', () => ({ default: { search: searchMock } }));
vi.mock('../../../features/expediente/api/fun.service', () => ({ default: { getSearch: legacySearchMock } }));
vi.mock('../../router/auth', () => ({ useAuth: () => ({ user: { id: 1, role_short: 'ADM' } }) }));
vi.mock('@/shared/components/theme-provider', () => ({
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}));
vi.mock('@/shared/components/icon', () => ({ Icon: () => <span aria-hidden="true" /> }));

function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

function serverGroups(title) {
  return {
    data: {
      groups: [{
        type: 'expedientes',
        items: [{ id: 1, title, subtitle: 'Calle 10 # 20-30', href: `/licencias/expediente/${title}` }],
      }],
    },
  };
}

// Matches are wrapped in <mark>, which splits the accessible name; match on text content.
function findOption(text) {
  return waitFor(() => {
    const option = screen.getAllByRole('option').find((node) => node.textContent.includes(text));
    if (!option) throw new Error(`No option with "${text}"`);
    return option;
  });
}

function queryOption(text) {
  return screen.queryAllByRole('option').find((node) => node.textContent.includes(text)) || null;
}

// The palette keeps a module-level "unified search available" flag; load a
// fresh copy per test so a 404 in one test does not leak into the next.
async function renderPalette() {
  vi.resetModules();
  const { CommandPalette } = await import('./CommandPalette');
  render(
    <MemoryRouter>
      <CommandPalette open onOpenChange={vi.fn()} />
    </MemoryRouter>,
  );
  return screen.getByRole('combobox');
}

describe('CommandPalette server search', () => {
  beforeEach(() => {
    searchMock.mockReset();
    legacySearchMock.mockReset();
    localStorage.clear();
  });

  it('shows local modules and actions without querying the server for short input', async () => {
    const input = await renderPalette();

    await userEvent.type(input, 'a');

    expect(screen.getByRole('listbox', { name: 'Resultados' })).toBeInTheDocument();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('renders the unified search groups', async () => {
    searchMock.mockResolvedValue(serverGroups('68001-1-26-0148'));
    const input = await renderPalette();

    await userEvent.type(input, '0148');

    const option = await findOption('68001-1-26-0148');
    expect(within(option).getByText(/Calle 10 # 20-30/)).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledWith('0148', expect.objectContaining({ limit: 8, signal: expect.any(AbortSignal) }));
    expect(legacySearchMock).not.toHaveBeenCalled();
  });

  it('falls back to the legacy radicado search when /search answers 404, and stops asking for it', async () => {
    searchMock.mockRejectedValue({ response: { status: 404 } });
    legacySearchMock.mockResolvedValue({ data: [{ id: 9, id_public: '68001-1-26-0009' }, { id: 10 }] });
    const input = await renderPalette();

    await userEvent.type(input, '0009');

    expect(await findOption('68001-1-26-0009')).toBeInTheDocument();
    expect(legacySearchMock).toHaveBeenCalledWith('1', '0009');
    expect(searchMock).toHaveBeenCalledTimes(1);

    await userEvent.type(input, '1');
    await waitFor(() => expect(legacySearchMock).toHaveBeenCalledWith('1', '00091'));
    expect(searchMock).toHaveBeenCalledTimes(1);
  });

  it('does not run the legacy search for queries that do not look like a radicado', async () => {
    searchMock.mockRejectedValue({ response: { status: 404 } });
    const input = await renderPalette();

    await userEvent.type(input, 'calle');

    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText('Buscando…')).not.toBeInTheDocument());
    expect(legacySearchMock).not.toHaveBeenCalled();
  });

  it('keeps local results and shows a calm message when the server fails', async () => {
    searchMock.mockRejectedValue({ response: { status: 500 } });
    const input = await renderPalette();

    await userEvent.type(input, 'archivo');

    expect(await screen.findByText(/No fue posible consultar el servidor en este momento/)).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    expect(legacySearchMock).not.toHaveBeenCalled();
  });

  it('aborts the stale request and ignores its late answer', async () => {
    const first = deferred();
    searchMock
      .mockImplementationOnce(() => first.promise)
      .mockResolvedValueOnce(serverGroups('NUEVO-0002'));
    const input = await renderPalette();

    await userEvent.type(input, '00');
    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1));
    const firstSignal = searchMock.mock.calls[0][1].signal;

    await userEvent.type(input, '2');
    expect(firstSignal.aborted).toBe(true);
    expect(await findOption('NUEVO-0002')).toBeInTheDocument();

    await act(async () => first.resolve(serverGroups('VIEJO-0001')));
    expect(queryOption('VIEJO-0001')).toBeNull();
    expect(searchMock).toHaveBeenCalledTimes(2);
  });
});
