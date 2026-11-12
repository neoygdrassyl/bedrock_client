import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  __resetShellWorkspaceForTests,
  enterWorkspaceMode,
  registerHeaderActionsSlot,
  registerHeaderBreadcrumbSlot,
  registerWorkspaceSlot,
  useShellHeaderActionsSlot,
  useShellHeaderBreadcrumbSlot,
  useShellWorkspace,
  useShellWorkspaceActive,
  useShellWorkspaceSlot,
} from './shellWorkspace';

const renders = {};
function Probe({ name, useValue, describe: describeValue }) {
  renders[name] = (renders[name] || 0) + 1;
  const value = useValue();
  return <output data-testid={name}>{describeValue(value)}</output>;
}

const nodeId = (node) => node?.id || 'none';

function Probes() {
  return (
    <>
      <Probe name="active" useValue={useShellWorkspaceActive} describe={String} />
      <Probe name="slot" useValue={useShellWorkspaceSlot} describe={nodeId} />
      <Probe name="breadcrumb" useValue={useShellHeaderBreadcrumbSlot} describe={nodeId} />
      <Probe name="actions" useValue={useShellHeaderActionsSlot} describe={nodeId} />
      <Probe name="all" useValue={useShellWorkspace} describe={(state) => `${state.active}/${nodeId(state.slot)}`} />
    </>
  );
}

const makeNode = (id) => Object.assign(document.createElement('div'), { id });

describe('shellWorkspace store', () => {
  beforeEach(() => {
    __resetShellWorkspaceForTests();
    Object.keys(renders).forEach((key) => delete renders[key]);
  });

  afterEach(() => {
    __resetShellWorkspaceForTests();
  });

  it('starts empty: no slots and no active workspace', () => {
    render(<Probes />);

    expect(screen.getByTestId('active')).toHaveTextContent('false');
    expect(screen.getByTestId('slot')).toHaveTextContent('none');
    expect(screen.getByTestId('breadcrumb')).toHaveTextContent('none');
    expect(screen.getByTestId('actions')).toHaveTextContent('none');
  });

  it('publishes each slot to its own hook and clears it when the shell unregisters', () => {
    render(<Probes />);

    act(() => {
      registerWorkspaceSlot(makeNode('content'));
      registerHeaderBreadcrumbSlot(makeNode('crumbs'));
      registerHeaderActionsSlot(makeNode('actions-node'));
    });

    expect(screen.getByTestId('slot')).toHaveTextContent('content');
    expect(screen.getByTestId('breadcrumb')).toHaveTextContent('crumbs');
    expect(screen.getByTestId('actions')).toHaveTextContent('actions-node');

    act(() => registerWorkspaceSlot(null));

    expect(screen.getByTestId('slot')).toHaveTextContent('none');
    expect(screen.getByTestId('breadcrumb')).toHaveTextContent('crumbs');
  });

  it('re-renders only the subscribers of the field that changed', () => {
    render(<Probes />);
    const before = { ...renders };

    act(() => registerHeaderActionsSlot(makeNode('actions-node')));

    expect(renders.actions).toBe(before.actions + 1);
    expect(renders.active).toBe(before.active);
    expect(renders.slot).toBe(before.slot);
    expect(renders.breadcrumb).toBe(before.breadcrumb);
    // Without a selector the whole state is the value, so any change re-renders.
    expect(renders.all).toBe(before.all + 1);
  });

  it('does not notify when the same node is registered again', () => {
    const node = makeNode('content');
    act(() => registerWorkspaceSlot(node));
    render(<Probes />);
    const before = { ...renders };

    act(() => registerWorkspaceSlot(node));

    expect(renders).toEqual(before);
  });

  it('stays active until the last workspace leaves, and a release is idempotent', () => {
    render(<Probes />);
    let leaveFirst;
    let leaveSecond;

    act(() => { leaveFirst = enterWorkspaceMode(); });
    act(() => { leaveSecond = enterWorkspaceMode(); });
    expect(screen.getByTestId('active')).toHaveTextContent('true');

    act(() => { leaveFirst(); leaveFirst(); });
    expect(screen.getByTestId('active')).toHaveTextContent('true');

    act(() => leaveSecond());
    expect(screen.getByTestId('active')).toHaveTextContent('false');

    // A stale release after everyone left must not push the counter below zero.
    act(() => leaveSecond());
    act(() => { leaveFirst = enterWorkspaceMode(); });
    expect(screen.getByTestId('active')).toHaveTextContent('true');
    act(() => leaveFirst());
    expect(screen.getByTestId('active')).toHaveTextContent('false');
  });

  it('stops notifying a component once it unmounts', () => {
    const { unmount } = render(<Probes />);
    unmount();
    const before = { ...renders };

    act(() => registerWorkspaceSlot(makeNode('content')));

    expect(renders).toEqual(before);
  });
});
