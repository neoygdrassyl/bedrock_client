import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

const { useDocumentRequirementExplorerMock } = vi.hoisted(() => ({
  useDocumentRequirementExplorerMock: vi.fn(),
}));

vi.mock('./useDocumentRequirementExplorer.js', () => ({
  useDocumentRequirementExplorer: (...args) => useDocumentRequirementExplorerMock(...args),
}));

import DocumentRequirementsExplorerPage, {
  NoSelectionState,
  NoDocumentsState,
  ForbiddenError,
  LegacyWarning,
  MissingFieldWarning,
  EditorExpectedMessage,
  TechnicalDetails,
} from './DocumentRequirementsExplorerPage.jsx';

const mockExplorerPublished = {
  schemaVersion: 1,
  status: 'published',
  version: 5,
  readOnly: true,
  fields: [
    { conditionKey: 'tipoAny', shortLabel: 'Actuación', label: 'Tipo de actuación' },
  ],
  groups: [
    { key: 'g1', label: 'Documentos comunes', order: 0 },
    { key: 'g2', label: 'Documentos especiales', order: 1 },
  ],
  documents: [
    {
      documentCode: '501',
      label: 'Formulario Único Nacional',
      groupKey: 'g1',
      groupLabel: 'Documentos comunes',
      activatingRules: ['always-common'],
    },
    {
      documentCode: '602',
      label: 'Estudio de Tránsito',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['conditional-traffic'],
    },
  ],
  rules: [
    {
      ruleKey: 'always-common',
      groupKey: 'g1',
      documentCodes: ['501'],
      required: true,
      allowNa: false,
      determinable: true,
      hasConditions: false,
      conditionSummary: 'Esta regla aplica a cualquier valor de los campos de la actuación.',
    },
    {
      ruleKey: 'conditional-traffic',
      groupKey: 'g2',
      documentCodes: ['602'],
      required: true,
      allowNa: true,
      determinable: true,
      hasConditions: true,
      conditionSummary: 'Aplica cuando la actuación requiere estudio de tránsito.',
    },
  ],
  warnings: [],
};

const mockExplorerWithDuplicateLabels = {
  ...mockExplorerPublished,
  documents: [
    {
      documentCode: '701',
      label: 'Documento duplicado',
      groupKey: 'g1',
      groupLabel: 'Documentos comunes',
      activatingRules: ['always-common'],
    },
    {
      documentCode: '702',
      label: 'Documento duplicado',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['conditional-traffic'],
    },
  ],
  rules: [
    {
      ruleKey: 'always-common',
      groupKey: 'g1',
      documentCodes: ['701'],
      required: true,
      allowNa: false,
      determinable: true,
      hasConditions: false,
      conditionSummary: 'Esta regla aplica a cualquier valor de los campos de la actuación.',
    },
    {
      ruleKey: 'conditional-traffic',
      groupKey: 'g2',
      documentCodes: ['702'],
      required: true,
      allowNa: true,
      determinable: true,
      hasConditions: true,
      conditionSummary: 'Aplica cuando la actuación requiere estudio de tránsito.',
    },
  ],
};

function buildHookState(overrides = {}) {
  return {
    explorer: overrides.explorer ?? mockExplorerPublished,
    loading: overrides.loading ?? false,
    errorMessage: overrides.errorMessage ?? '',
    selection: overrides.selection ?? {},
    setSelection: overrides.setSelection ?? vi.fn(),
    preview: overrides.preview ?? null,
    previewLoading: overrides.previewLoading ?? false,
    refresh: overrides.refresh ?? vi.fn(),
    simulate: overrides.simulate ?? vi.fn(),
    selectionIsEmpty: overrides.selectionIsEmpty ?? true,
    status: overrides.status ?? 'published',
  };
}

describe('State components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDocumentRequirementExplorerMock.mockReturnValue(buildHookState());
  });

  describe('NoSelectionState', () => {
    it('renders selection prompt', () => {
      render(<NoSelectionState />);
      expect(screen.getByText(/selecciona una actuación/i)).toBeDefined();
    });
  });

  describe('NoDocumentsState', () => {
    it('renders no documents message', () => {
      render(<NoDocumentsState />);
      expect(screen.getByText(/sin documentos configurados/i)).toBeDefined();
      expect(screen.getByText(/no tiene requisitos documentales configurados/i)).toBeDefined();
    });
  });

  describe('ForbiddenError', () => {
    it('renders permission error', () => {
      render(<ForbiddenError />);
      expect(screen.getByTestId('explorer-403')).toHaveAttribute('data-dovela-ui', 'inline-alert');
      expect(screen.getByTestId('explorer-403')).toHaveAttribute('data-tone', 'danger');
      const items = screen.getAllByText(/no tienes permisos/i);
      expect(items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('LegacyWarning', () => {
    it('renders legacy warning', () => {
      render(<LegacyWarning />);
      expect(screen.getByTestId('explorer-legacy-warning')).toHaveAttribute('data-dovela-ui', 'inline-alert');
      expect(screen.getByTestId('explorer-legacy-warning')).toHaveAttribute('data-tone', 'warning');
      expect(screen.getByText(/se detectó una regla heredada/i)).toBeDefined();
      expect(screen.getByText(/aún no editarse desde esta vista/i)).toBeDefined();
    });
  });

  describe('MissingFieldWarning', () => {
    it('renders missing field warning', () => {
      render(<MissingFieldWarning />);
      expect(screen.getByTestId('explorer-missing-field')).toHaveAttribute('data-dovela-ui', 'inline-alert');
      expect(screen.getByTestId('explorer-missing-field')).toHaveAttribute('data-tone', 'warning');
      expect(screen.getByText(/falta nombrar el dato de radicación/i)).toBeDefined();
    });
  });

  describe('EditorExpectedMessage', () => {
    it('renders read-only banner', () => {
      render(<EditorExpectedMessage />);
      expect(screen.getByTestId('explorer-readonly-banner')).toHaveAttribute('data-dovela-ui', 'inline-alert');
      expect(screen.getByTestId('explorer-readonly-banner')).toHaveAttribute('data-tone', 'info');
      expect(screen.getByText(/solo de consulta/i)).toBeDefined();
      expect(screen.getByText(/fase posterior/i)).toBeDefined();
    });

    it('contains no mutation controls', () => {
      render(<EditorExpectedMessage />);
      expect(screen.queryByText('Guardar')).toBeNull();
      expect(screen.queryByText('Publicar')).toBeNull();
      expect(screen.queryByText('Editar')).toBeNull();
    });
  });

  describe('TechnicalDetails', () => {
    it('renders collapsed by default', () => {
      render(<TechnicalDetails explorer={mockExplorerPublished} />);
      expect(screen.getByText(/ver detalles técnicos/i)).toBeDefined();
      expect(screen.queryByTestId('explorer-tech-content')).toBeNull();
    });

    it('expands on click', () => {
      render(<TechnicalDetails explorer={mockExplorerPublished} />);
      fireEvent.click(screen.getByText(/ver detalles técnicos/i));
      expect(screen.getByTestId('explorer-tech-content')).toBeDefined();
    });

    it('renders nothing when no explorer', () => {
      const { container } = render(<TechnicalDetails explorer={null} />);
      expect(container.children.length).toBe(0);
    });
  });
});

describe('DocumentRequirementsExplorerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the guided flow labels, scenario-first layout and summary counts in the expected order', () => {
    useDocumentRequirementExplorerMock.mockReturnValue(
      buildHookState({
        explorer: {
          ...mockExplorerPublished,
          warnings: [
            { severity: 'warning', label: 'Se detectó una regla heredada', detail: 'legacy compat' },
            { severity: 'warning', label: 'Regla no determinable', detail: 'falta campo obligatorio' },
          ],
        },
        selection: { tipoAny: 'licencia' },
        selectionIsEmpty: false,
        preview: {
          requirements: [
            { documentCode: '501', matched: true, common: 'true', conditional: 'false', 'non-determinable': 'false' },
            { documentCode: '602', matched: true, common: 'false', conditional: 'true', 'non-determinable': 'false' },
          ],
        },
      }),
    );

    render(<DocumentRequirementsExplorerPage />);

    fireEvent.click(screen.getByTestId('explorer-tree-doc-501'));

    expect(screen.getAllByText('Define el escenario').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Revisa documentos').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Entiende el requisito').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Valida advertencias').length).toBeGreaterThanOrEqual(2);

    const simulatorPanel = screen.getByTestId('simulator-panel');
    expect(within(simulatorPanel).getByText('Define el escenario')).toBeDefined();

    const summaryBar = screen.getByTestId('explorer-summary-bar');
    expect(within(summaryBar).getByText('Total requisitos')).toBeDefined();
    expect(within(summaryBar).getByText('Fijos')).toBeDefined();
    expect(within(summaryBar).getByText('Condicionales')).toBeDefined();
    expect(within(summaryBar).getByText('No determinables')).toBeDefined();

    const orderedSections = [
      screen.getByTestId('explorer-stepper'),
      simulatorPanel,
      summaryBar,
      screen.getByTestId('explorer-tree-panel'),
      screen.getByTestId('explorer-explanation-panel'),
      screen.getByTestId('explorer-warning-area'),
      screen.getByTestId('explorer-tech-details'),
    ];

    orderedSections.reduce((previous, current) => {
      if (previous) {
        expect(previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
      return current;
    }, null);
  });

  it('renders simulator and pending tree states before the first simulation', () => {
    useDocumentRequirementExplorerMock.mockReturnValue(
      buildHookState({
        selection: {},
        selectionIsEmpty: true,
        preview: null,
      }),
    );

    render(<DocumentRequirementsExplorerPage />);

    expect(screen.getByTestId('simulator-panel')).toBeDefined();
    expect(screen.getByTestId('explorer-tree')).toBeDefined();
    expect(screen.queryByTestId('explorer-no-selection')).toBeNull();
    expect(screen.getAllByText('Pendiente de simulación').length).toBe(2);
    expect(screen.getByText('Actuación')).toBeDefined();
  });

  it('uses the same parent simulation state for tree and explanation panel', () => {
    useDocumentRequirementExplorerMock.mockReturnValue(
      buildHookState({
        selection: { tipoAny: 'licencia' },
        selectionIsEmpty: false,
        preview: {
          requirements: [
            { documentCode: '501', matched: true, ruleKey: 'always-common' },
            { documentCode: '602', matched: false, ruleKey: 'conditional-traffic' },
          ],
        },
      }),
    );

    render(<DocumentRequirementsExplorerPage />);

    fireEvent.click(screen.getByTestId('explorer-tree-doc-602'));

    expect(screen.getAllByText('No aplica con estos datos').length).toBeGreaterThan(0);
    expect(
      within(screen.getByTestId('explorer-explanation-panel')).getByText('Este documento no aplica con los datos actuales.'),
    ).toBeDefined();
  });

  it('shows a safe explanation when the selected document stops applying after a new preview', () => {
    let hookState = buildHookState({
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
      preview: {
        requirements: [
          { documentCode: '501', matched: true, ruleKey: 'always-common' },
          { documentCode: '602', matched: true, ruleKey: 'conditional-traffic' },
        ],
      },
    });

    useDocumentRequirementExplorerMock.mockImplementation(() => hookState);

    const { rerender } = render(<DocumentRequirementsExplorerPage />);

    fireEvent.click(screen.getByTestId('explorer-tree-doc-602'));

    hookState = buildHookState({
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
      preview: {
        requirements: [
          { documentCode: '501', matched: true, ruleKey: 'always-common' },
          { documentCode: '602', matched: false, ruleKey: 'conditional-traffic' },
        ],
      },
    });

    rerender(<DocumentRequirementsExplorerPage />);

    expect(
      within(screen.getByTestId('explorer-explanation-panel')).getByText('Este documento no aplica con los datos actuales.'),
    ).toBeDefined();
  });

  it('keeps the last valid preview visible after a preview failure and labels it clearly', () => {
    let hookState = buildHookState({
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
      preview: {
        requirements: [
          { documentCode: '501', matched: true, common: 'true', conditional: 'false', 'non-determinable': 'false' },
        ],
      },
    });

    useDocumentRequirementExplorerMock.mockImplementation(() => hookState);

    const { rerender } = render(<DocumentRequirementsExplorerPage />);

    expect(within(screen.getByTestId('explorer-summary-bar')).getAllByText('1').length).toBeGreaterThan(0);

    hookState = buildHookState({
      selection: { tipoAny: 'licencia' },
      selectionIsEmpty: false,
      preview: null,
      errorMessage: '500 internal server error',
    });

    rerender(<DocumentRequirementsExplorerPage />);

    expect(screen.getByText('Último resultado válido')).toBeDefined();
    expect(screen.getByTestId('simulator-error')).toBeDefined();
    expect(within(screen.getByTestId('explorer-summary-bar')).getAllByText('1').length).toBeGreaterThan(0);
  });

  it('adds a document code hint when multiple documents share the same label', () => {
    useDocumentRequirementExplorerMock.mockReturnValue(
      buildHookState({
        explorer: mockExplorerWithDuplicateLabels,
        selection: { tipoAny: 'licencia' },
        selectionIsEmpty: false,
        preview: {
          requirements: [
            { documentCode: '701', matched: true, ruleKey: 'always-common' },
            { documentCode: '702', matched: true, ruleKey: 'conditional-traffic' },
          ],
        },
      }),
    );

    render(<DocumentRequirementsExplorerPage />);

    expect(screen.getByText('Documento duplicado · Cód. 701')).toBeDefined();
    expect(screen.getByText('Documento duplicado · Cód. 702')).toBeDefined();

    fireEvent.click(screen.getByTestId('explorer-tree-doc-702'));

    expect(
      within(screen.getByTestId('explorer-explanation')).getAllByText('Documento duplicado · Cód. 702').length,
    ).toBeGreaterThan(0);
  });
});
