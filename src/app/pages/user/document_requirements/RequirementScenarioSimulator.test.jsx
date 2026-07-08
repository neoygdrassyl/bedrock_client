import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequirementScenarioSimulator from './RequirementScenarioSimulator.jsx';

const mockFields = [
  { conditionKey: 'tipoAny', shortLabel: 'Actuación', label: 'Tipo de actuación' },
  { conditionKey: 'mUrbAny', shortLabel: 'Mod. urbanística', label: 'Modalidad urbanística' },
];

const mockPreview = {
  requirements: [
    { documentCode: '501', common: 'true', conditional: 'false', 'non-determinable': 'false' },
    { documentCode: '601', common: 'false', conditional: 'true', 'non-determinable': 'false' },
  ],
};

function buildProps(overrides = {}) {
  return {
    fields: overrides.fields ?? mockFields,
    selection: overrides.selection ?? {},
    setSelection: overrides.setSelection ?? vi.fn(),
    preview: overrides.preview ?? null,
    previewLoading: overrides.previewLoading ?? false,
    simulate: overrides.simulate ?? vi.fn(),
    selectionIsEmpty: overrides.selectionIsEmpty ?? true,
    errorMessage: overrides.errorMessage ?? '',
    explorerLoading: overrides.explorerLoading ?? false,
  };
}

function renderSimulator(overrides = {}) {
  const props = buildProps(overrides);
  return {
    ...render(<RequirementScenarioSimulator {...props} />),
    props,
  };
}

describe('RequirementScenarioSimulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders simulator controls from controlled props', () => {
    renderSimulator();

    expect(screen.getByText('Define el escenario')).toBeDefined();
    expect(screen.getByText(/elige los datos de la radicación/i)).toBeDefined();
    expect(screen.getByText('Actuación')).toBeDefined();
    expect(screen.getByText('Mod. urbanística')).toBeDefined();
    expect(screen.getByText('Solo consulta')).toBeDefined();
  });

  it('updates the controlled selection through setSelection', async () => {
    const setSelection = vi.fn();

    renderSimulator({
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
      setSelection,
    });

    fireEvent.change(screen.getByLabelText('Mod. urbanística'), { target: { value: 'A' } });

    expect(setSelection).toHaveBeenCalledWith({
      tipoAny: 'licencia',
      mUrbAny: 'A',
    });
  });

  it('disables simulation when selection is empty', () => {
    renderSimulator({ selectionIsEmpty: true });

    expect(screen.getByTestId('simulator-run').disabled).toBe(true);
  });

  it('calls simulate with the controlled selection', async () => {
    const user = userEvent.setup();
    const simulate = vi.fn();
    const selection = { tipoAny: 'licencia', mUrbAny: 'desarrollo' };

    renderSimulator({ selection, selectionIsEmpty: false, simulate });

    await user.click(screen.getByTestId('simulator-run'));

    expect(simulate).toHaveBeenCalledWith(selection);
  });

  it('shows loading skeleton while explorer data is loading', () => {
    renderSimulator({ explorerLoading: true });

    expect(screen.getByText('Cargando…')).toBeDefined();
  });

  it('keeps the scenario panel focused on inputs instead of duplicating the summary counts', () => {
    renderSimulator({
      preview: mockPreview,
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
    });

    expect(screen.queryByTestId('simulator-results')).toBeNull();
    expect(screen.getByText('1 campo(s)')).toBeDefined();
  });

  it('shows simulation errors from parent state', () => {
    renderSimulator({
      errorMessage: 'No se pudo calcular la lista con estos datos.',
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
    });

    expect(screen.getByTestId('simulator-error')).toBeDefined();
  });
});
