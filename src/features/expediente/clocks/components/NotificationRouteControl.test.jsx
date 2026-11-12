import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationRouteControl, describeNotificationRoute, describeRouteSaved } from './NotificationRouteControl';

const PERSONAL = { notificationType: 'notificar', byAviso: false };
const PERSONAL_AVISO = { notificationType: 'notificar', byAviso: true };
const COMUNICACION = { notificationType: 'comunicar', byAviso: false };

const noChange = { hiddenDated: [], relabeledDated: [], appearingDated: [] };

const personal = () => screen.getByRole('radio', { name: 'Notificación personal' });
const comunicacion = () => screen.getByRole('radio', { name: 'Comunicación' });
const aviso = () => screen.getByRole('switch', { name: 'Por aviso' });
const status = () => screen.getByRole('status');

function renderControl(props = {}) {
  const onChange = vi.fn();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <NotificationRouteControl
      actLabel="Acta de observaciones"
      options={PERSONAL}
      onChange={onChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { ...view, onChange, onConfirm, onCancel, user: userEvent.setup() };
}

/**
 * The parent's side of the contract (`handleRouteChange` / `commitRouteChange` in
 * `centralClocks.component.jsx`): a change is committed at once unless it takes registered
 * dates out of sight, in which case it waits for the answer.
 */
function Harness({ initial = PERSONAL, diff = () => noChange, commit }) {
  const [options, setOptions] = useState(initial);
  const [confirm, setConfirm] = useState(null);

  const apply = (next) => {
    commit(next);
    setOptions(next);
    setConfirm(null);
  };

  return (
    <NotificationRouteControl
      actLabel="Acta de observaciones"
      options={options}
      confirm={confirm}
      onChange={(patch) => {
        const next = { ...options, ...patch };
        const change = diff(next);
        if (change.hiddenDated.length || change.relabeledDated.length) setConfirm({ next, ...change });
        else apply(next);
      }}
      onConfirm={() => apply(confirm.next)}
      onCancel={() => setConfirm(null)}
    />
  );
}

function renderHarness(props = {}) {
  const commit = vi.fn();
  const diff = vi.fn(props.diff || (() => noChange));
  render(<Harness {...props} diff={diff} commit={commit} />);
  return { commit, diff, user: userEvent.setup() };
}

describe('NotificationRouteControl', () => {
  it('renders both routes and the "Por aviso" switch with their checked state', () => {
    const { rerender, onChange, onConfirm, onCancel } = renderControl({ options: PERSONAL_AVISO });

    expect(screen.getByRole('group', { name: /Vía de notificación · Acta de observaciones/ })).toHaveAttribute('aria-busy', 'false');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(personal()).toHaveAttribute('aria-checked', 'true');
    expect(personal()).toHaveAttribute('tabindex', '0');
    expect(comunicacion()).toHaveAttribute('aria-checked', 'false');
    expect(comunicacion()).toHaveAttribute('tabindex', '-1');
    expect(aviso()).toHaveAttribute('aria-checked', 'true');
    expect(aviso()).toBeEnabled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    rerender(
      <NotificationRouteControl actLabel="Acta de observaciones" options={PERSONAL} onChange={onChange} onConfirm={onConfirm} onCancel={onCancel} />,
    );
    expect(aviso()).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/Por aviso agrega la notificación por aviso/)).toBeInTheDocument();
  });

  it('treats missing options as personal notification without aviso', () => {
    renderControl({ options: undefined });

    expect(personal()).toHaveAttribute('aria-checked', 'true');
    expect(aviso()).toHaveAttribute('aria-checked', 'false');
  });

  it('moves focus with the arrow keys without selecting', async () => {
    const { user, onChange } = renderControl();

    await user.tab();
    expect(personal()).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(comunicacion()).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(personal()).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(comunicacion()).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(personal()).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(comunicacion()).toHaveFocus();

    expect(onChange).not.toHaveBeenCalled();
    expect(personal()).toHaveAttribute('aria-checked', 'true');
  });

  it.each([['Enter', '{Enter}'], ['Space', ' ']])('selects the focused route with %s and reports the change once', async (_name, key) => {
    const { user, onChange } = renderControl();

    await user.tab();
    await user.keyboard('{ArrowRight}');
    await user.keyboard(key);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ notificationType: 'comunicar' });
  });

  it('ignores the route that is already chosen', async () => {
    const { user, onChange } = renderControl();

    await user.click(personal());
    expect(personal()).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the switch as a byAviso change', async () => {
    const { user, onChange } = renderControl({ options: PERSONAL });

    await user.click(aviso());

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ byAviso: true });
  });

  it('disables the switch under "Comunicación" and explains why', async () => {
    const { user, onChange } = renderControl({ options: { notificationType: 'comunicar', byAviso: true } });

    expect(comunicacion()).toHaveAttribute('aria-checked', 'true');
    expect(aviso()).toBeDisabled();
    // A stored byAviso does not apply to a communication.
    expect(aviso()).toHaveAttribute('aria-checked', 'false');

    const help = screen.getByText('Por aviso solo aplica con notificación personal. El cambio se guarda al instante.');
    expect(aviso()).toHaveAttribute('aria-describedby', help.id);

    await user.click(aviso());
    await user.click(screen.getByText('Por aviso'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('locks both controls and says "Guardando…" while a change is being saved', async () => {
    const { user, onChange } = renderControl({ options: PERSONAL_AVISO, busy: true, feedback: { tone: 'ok', text: 'Guardado: Comunicación.' } });

    expect(screen.getByRole('group', { name: /Vía de notificación/ })).toHaveAttribute('aria-busy', 'true');
    expect(status()).toHaveTextContent('Guardando…');
    expect(status()).not.toHaveTextContent('Guardado:');
    expect(personal()).toHaveAttribute('aria-disabled', 'true');
    expect(comunicacion()).toHaveAttribute('aria-disabled', 'true');
    expect(aviso()).toHaveAttribute('aria-disabled', 'true');

    // They stay focusable, but accept no other change.
    await user.click(comunicacion());
    await user.click(aviso());
    comunicacion().focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows what was saved', () => {
    renderControl({ feedback: { tone: 'ok', text: 'Guardado: Comunicación.' } });

    expect(status()).toHaveTextContent('Guardado: Comunicación.');
    expect(status()).not.toHaveClass('is-error');
    expect(personal()).not.toHaveAttribute('aria-disabled');
    expect(aviso()).not.toHaveAttribute('aria-disabled');
  });

  it('shows the inline error when the save failed', () => {
    renderControl({ feedback: { tone: 'error', text: 'No se pudo guardar. Se restauró la vía anterior; inténtalo de nuevo.' } });

    expect(status()).toHaveTextContent('No se pudo guardar. Se restauró la vía anterior; inténtalo de nuevo.');
    expect(status()).toHaveClass('is-error');
    expect(status()).toHaveAttribute('aria-live', 'polite');
  });
});

describe('NotificationRouteControl: confirmation', () => {
  const hidesAviso = (next) => (next.byAviso === false || next.notificationType === 'comunicar'
    ? { ...noChange, hiddenDated: [{ name: 'Notificación por aviso', date: '2026-03-05' }] }
    : noChange);

  it('commits at once when no registered date goes out of sight', async () => {
    const { user, commit, diff } = renderHarness({ initial: PERSONAL });

    await user.click(comunicacion());

    expect(diff).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(COMUNICACION);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(comunicacion()).toHaveAttribute('aria-checked', 'true');
  });

  it('asks first when dated rows would stop being shown, and waits', async () => {
    const { user, commit, diff } = renderHarness({ initial: PERSONAL_AVISO, diff: hidesAviso });

    await user.click(aviso());

    const dialog = screen.getByRole('alertdialog', { name: '¿Cambiar a Notificación personal?' });
    expect(within(dialog).getByText(/Deja de mostrarse un evento con fecha registrada/)).toBeInTheDocument();
    expect(within(dialog).getByRole('listitem')).toHaveTextContent('Notificación por aviso 05/03/2026');
    expect(within(dialog).getByText('Las fechas no se borran; vuelven a verse al regresar a la vía anterior.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    expect(commit).not.toHaveBeenCalled();
    expect(aviso()).toHaveAttribute('aria-checked', 'true');

    // While it waits, the controls take no other change.
    expect(comunicacion()).toHaveAttribute('aria-disabled', 'true');
    expect(aviso()).toHaveAttribute('aria-disabled', 'true');
    await user.click(comunicacion());
    await user.click(aviso());
    expect(diff).toHaveBeenCalledTimes(1);
    expect(commit).not.toHaveBeenCalled();
  });

  it('Cancel changes nothing and returns focus to the switch that asked', async () => {
    const { user, commit } = renderHarness({ initial: PERSONAL_AVISO, diff: hidesAviso });

    await user.click(aviso());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(commit).not.toHaveBeenCalled();
    expect(aviso()).toHaveAttribute('aria-checked', 'true');
    expect(aviso()).not.toHaveAttribute('aria-disabled');
    expect(aviso()).toHaveFocus();
  });

  it('Cancel on a route change returns focus to the route group, on the route still chosen', async () => {
    const { user, commit } = renderHarness({ initial: PERSONAL_AVISO, diff: hidesAviso });

    await user.click(comunicacion());
    expect(screen.getByRole('alertdialog', { name: '¿Cambiar a Comunicación?' })).toBeInTheDocument();
    await user.keyboard('{Enter}'); // focus is on Cancelar

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(commit).not.toHaveBeenCalled();
    expect(personal()).toHaveAttribute('aria-checked', 'true');
    // The route that asked is not the chosen one, so it is not tabbable: the chosen one takes focus.
    expect(personal()).toHaveFocus();
  });

  it('Confirm proceeds once and returns focus to the route that asked', async () => {
    const { user, commit } = renderHarness({ initial: PERSONAL_AVISO, diff: hidesAviso });

    await user.click(comunicacion());
    await user.click(screen.getByRole('button', { name: 'Cambiar la vía' }));

    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith({ notificationType: 'comunicar', byAviso: true });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(comunicacion()).toHaveAttribute('aria-checked', 'true');
    expect(comunicacion()).toHaveFocus();
  });

  it('counts several hidden rows and explains a relabelled date', () => {
    renderControl({
      options: PERSONAL_AVISO,
      confirm: {
        next: COMUNICACION,
        hiddenDated: [
          { name: 'Citación (Observaciones)', date: '2026-03-01' },
          { name: 'Notificación (Observaciones)', date: '2026-03-04' },
        ],
        relabeledDated: [{ name: 'Notificación por aviso', nextName: 'Comunicación', date: '2026-03-05' }],
      },
    });

    const dialog = screen.getByRole('alertdialog', { name: '¿Cambiar a Comunicación?' });
    expect(within(dialog).getByText(/Dejan de mostrarse 2 eventos con fecha registrada/)).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Citación (Observaciones) 01/03/2026',
      'Notificación (Observaciones) 04/03/2026',
    ]);
    expect(dialog).toHaveTextContent('La fecha 05/03/2026 de «Notificación por aviso» pasa a leerse como «Comunicación»: ambos eventos comparten el mismo registro.');
  });

  it('names the rows that appear with a date already registered', () => {
    renderControl({
      options: COMUNICACION,
      confirm: {
        next: PERSONAL_AVISO,
        hiddenDated: [],
        relabeledDated: [{ name: 'Comunicación', nextName: 'Notificación por aviso', date: '2026-03-05' }],
        appearingDated: [
          { name: 'Citación (Observaciones)', date: '2026-03-01' },
          { name: 'Notificación (Observaciones)', date: '2026-03-04' },
        ],
      },
    });

    const dialog = screen.getByRole('alertdialog', { name: '¿Cambiar a Notificación personal, con aviso?' });
    expect(within(dialog).queryByRole('list')).not.toBeInTheDocument();
    expect(dialog).toHaveTextContent('«Citación (Observaciones)» aparece con la fecha 01/03/2026, que ya estaba registrada, y cuenta para los términos.');
    expect(dialog).toHaveTextContent('«Notificación (Observaciones)» aparece con la fecha 04/03/2026, que ya estaba registrada, y cuenta para los términos.');
  });
});

describe('route descriptions', () => {
  it('describes each route', () => {
    expect(describeNotificationRoute(PERSONAL)).toBe('Notificación personal');
    expect(describeNotificationRoute(PERSONAL_AVISO)).toBe('Notificación personal, con aviso');
    expect(describeNotificationRoute({ notificationType: 'comunicar', byAviso: true })).toBe('Comunicación');
  });

  it('says what the table gained and lost, naming the rows that keep a registered date', () => {
    expect(describeRouteSaved(COMUNICACION, { added: [], removed: [] })).toBe('Guardado: Comunicación.');

    expect(describeRouteSaved(PERSONAL_AVISO, {
      added: [{ name: 'Citación' }, { name: 'Notificación por aviso' }],
      removed: [{ name: 'Comunicación' }],
      relabeledDated: [{ name: 'Comunicación', nextName: 'Notificación por aviso', date: '2026-03-05' }],
      appearingDated: [{ name: 'Citación', date: '2026-03-01' }],
    })).toBe(
      'Guardado: Notificación personal, con aviso. Se agregaron «Citación», «Notificación por aviso». Ya no se muestra «Comunicación». '
      + '«Notificación por aviso» muestra la fecha 05/03/2026 registrada como «Comunicación». «Citación» conserva la fecha 01/03/2026 ya registrada.',
    );
  });
});
