import { describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RegistryDocumentTable from './RegistryDocumentTable';
import { useRegistryDocuments } from './useRegistryDocuments';

const MESSAGES = { loadFailed: 'No cargó.', downloadFailed: 'No descargó.', created: 'Creado.', removed: 'Eliminado.' };
const CONFLICT = { response: { status: 409, data: { code: 'VERSION_CONFLICT', message: 'Otra persona modificó este registro.' } } };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

const listOf = (...items) => ({ data: { data: items, latest: items.length ? items[0].id : null } });

function options(overrides) {
  return {
    registryId: 5,
    version: 4,
    list: vi.fn().mockResolvedValue(listOf({ id: 1 })),
    create: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue({}),
    download: vi.fn().mockResolvedValue({}),
    messages: MESSAGES,
    onChanged: vi.fn(),
    onConflict: vi.fn(),
    ...overrides,
  };
}

describe('useRegistryDocuments', () => {
  it('loads the list and keeps the whole answer, ignoring an older answer that arrives last', async () => {
    const slow = deferred();
    const fast = deferred();
    const list = vi.fn((id) => (id === 5 ? slow.promise : fast.promise));
    const { result, rerender } = renderHook((props) => useRegistryDocuments(props), { initialProps: options({ list }) });
    expect(result.current.loading).toBe(true);

    rerender(options({ list, registryId: 6 }));
    await act(async () => { fast.resolve(listOf({ id: 60 }, { id: 61 })); });
    await act(async () => { slow.resolve(listOf({ id: 50 })); });

    expect(result.current.items.map((item) => item.id)).toEqual([60, 61]);
    expect(result.current.payload.latest).toBe(60);
    expect(result.current.loading).toBe(false);
    expect(list.mock.calls).toEqual([[5], [6]]);
  });

  it('ignores an older failure too, and shows the load message when the latest request fails', async () => {
    const slow = deferred();
    const list = vi.fn((id) => (id === 5 ? slow.promise : Promise.reject(new Error('down'))));
    const { result, rerender } = renderHook((props) => useRegistryDocuments(props), { initialProps: options({ list }) });
    rerender(options({ list, registryId: 6 }));
    await waitFor(() => expect(result.current.error).toBe('No cargó.'));
    await act(async () => { slow.resolve(listOf({ id: 50 })); });
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe('No cargó.');
  });

  it('is busy while a write runs, then reloads the list and the detail', async () => {
    const pending = deferred();
    const create = vi.fn(() => pending.promise);
    const props = options({ create });
    const { result } = renderHook(() => useRegistryDocuments(props));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const showError = vi.fn();
    let saved;
    act(() => { saved = result.current.add(() => 'FORM', showError); });
    expect(result.current.busy).toBe(true);
    await act(async () => { pending.resolve({}); await saved; });

    expect(await saved).toBe(true);
    expect(result.current.busy).toBe(false);
    expect(create).toHaveBeenCalledWith(5, 'FORM');
    expect(props.list).toHaveBeenCalledTimes(2);
    expect(props.onChanged).toHaveBeenCalledWith('Creado.');
    expect(props.onConflict).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
  });

  it('reloads the detail on a version conflict and shows the server message with the given setter', async () => {
    const props = options({ create: vi.fn().mockRejectedValue(CONFLICT) });
    const { result } = renderHook(() => useRegistryDocuments(props));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const showError = vi.fn();

    let saved;
    await act(async () => { saved = await result.current.add(() => 'FORM', showError); });

    expect(saved).toBe(false);
    expect(props.onConflict).toHaveBeenCalledTimes(1);
    expect(props.onChanged).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('Otra persona modificó este registro.');
    expect(props.list).toHaveBeenCalledTimes(2);
    expect(result.current.busy).toBe(false);
  });

  it('answers a form that cannot be built like a refused write', async () => {
    const props = options();
    const { result } = renderHook(() => useRegistryDocuments(props));
    const showError = vi.fn();
    let saved;
    await act(async () => { saved = await result.current.add(() => { throw new Error('bad form'); }, showError); });
    expect(saved).toBe(false);
    expect(props.create).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith('No fue posible completar la operación.');
  });

  it('shows the download message when the file cannot be saved', async () => {
    const props = options({ download: vi.fn().mockRejectedValue(new Error('offline')) });
    const { result } = renderHook(() => useRegistryDocuments(props));
    await act(async () => { await result.current.download({ id: 1, fileName: 'a.pdf' }); });
    expect(props.download).toHaveBeenCalledWith(5, { id: 1, fileName: 'a.pdf' });
    expect(result.current.error).toBe('No descargó.');
  });
});

// The hook and the shared table together, as a tab uses them.
function Harness({ props, writable = true }) {
  const documents = useRegistryDocuments(props);
  return (
    <RegistryDocumentTable
      title="Documentos"
      columns={[
        { header: 'Nombre', cell: (item) => item.name },
        { header: 'Archivo', file: { text: (item) => item.fileName, label: (item) => `Descargar ${item.fileName}`, className: 'p-0' } },
      ]}
      documents={documents}
      writable={writable}
      readOnly={<span>solo lectura</span>}
      emptyText="Sin documentos."
    />
  );
}

describe('RegistryDocumentTable', () => {
  const ITEMS = listOf({ id: 1, name: 'Uno', fileName: 'uno.pdf' }, { id: 2, name: 'Dos', fileName: 'dos.pdf' });

  it('asks for confirmation before deleting, can cancel, and deletes with the expected version', async () => {
    const user = userEvent.setup();
    const props = options({ list: vi.fn().mockResolvedValue(ITEMS) });
    render(<Harness props={props} />);
    const table = await screen.findByRole('table', { name: 'Documentos' });
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Nombre', 'Archivo', 'Acción']);
    const first = (await within(table).findAllByRole('row'))[1];

    await user.click(within(first).getByRole('button', { name: 'Eliminar' }));
    expect(within(first).getByText('¿Eliminar?')).toBeInTheDocument();
    await user.click(within(first).getByRole('button', { name: 'Cancelar' }));
    expect(within(first).queryByText('¿Eliminar?')).not.toBeInTheDocument();
    expect(props.remove).not.toHaveBeenCalled();

    await user.click(within(first).getByRole('button', { name: 'Eliminar' }));
    await user.click(within(first).getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(props.onChanged).toHaveBeenCalledWith('Eliminado.'));
    expect(props.remove).toHaveBeenCalledWith(5, 1, { expectedVersion: 4 });
    expect(within(first).queryByText('¿Eliminar?')).not.toBeInTheDocument();

    await user.click(within(first).getByRole('button', { name: 'Descargar uno.pdf' }));
    expect(props.download).toHaveBeenCalledWith(5, ITEMS.data.data[0]);
  });

  it('shows the read-only cell instead of the delete button, and the empty state', async () => {
    const props = options({ list: vi.fn().mockResolvedValue(ITEMS) });
    const { unmount } = render(<Harness props={props} writable={false} />);
    expect(await screen.findAllByText('solo lectura')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
    unmount();

    render(<Harness props={options({ list: vi.fn().mockResolvedValue(listOf()) })} />);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findByText('Sin documentos.')).toBeInTheDocument();
  });
});
