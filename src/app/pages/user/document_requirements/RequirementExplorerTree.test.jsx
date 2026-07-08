import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RequirementExplorerTree from './RequirementExplorerTree.jsx';

const mockExplorer = {
  schemaVersion: 1,
  status: 'published',
  version: 5,
  readOnly: true,
  fields: [],
  groups: [
    { key: 'g1', label: 'Documentos comunes', order: 0 },
    { key: 'g2', label: 'Documentos de urbanización', order: 1 },
  ],
  documents: [
    { documentCode: '501', label: 'Formulario Único Nacional', groupKey: 'g1', groupLabel: 'Documentos comunes', active: true, order: 0, activatingRules: ['common-all'] },
    { documentCode: '502', label: 'Certificado de Tradición', groupKey: 'g1', groupLabel: 'Documentos comunes', active: true, order: 1, activatingRules: ['common-all'] },
    { documentCode: '601', label: 'Plano Topográfico', groupKey: 'g2', groupLabel: 'Documentos de urbanización', active: true, order: 0, activatingRules: ['urbanizacion-desarrollo', 'urbanizacion-saneamiento'] },
    { documentCode: '602', label: 'Estudio de Suelos', groupKey: 'g2', groupLabel: 'Documentos de urbanización', active: true, order: 1, activatingRules: [] },
  ],
  rules: [
    { ruleKey: 'common-all', groupKey: 'g1', documentCodes: ['501', '502'], required: true, allowNa: false, determinable: true, hasConditions: false, conditionSummary: 'Esta regla aplica a cualquier valor de los campos de la actuación.' },
    { ruleKey: 'urbanizacion-desarrollo', groupKey: 'g2', documentCodes: ['601'], required: true, allowNa: true, determinable: true, hasConditions: true, conditionSummary: 'Actuación incluye [Urbanización]; Urbanización incluye [Desarrollo].' },
    { ruleKey: 'urbanizacion-saneamiento', groupKey: 'g2', documentCodes: ['601'], required: true, allowNa: true, determinable: true, hasConditions: true, conditionSummary: 'Actuación incluye [Urbanización]; Urbanización incluye [Saneamiento].' },
  ],
  warnings: [],
};

describe('RequirementExplorerTree', () => {
  it('renders groups and documents', () => {
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={vi.fn()} />
    );

    expect(screen.getByText('Documentos comunes')).toBeDefined();
    expect(screen.getByText('Documentos de urbanización')).toBeDefined();
    expect(screen.getByText('Formulario Único Nacional')).toBeDefined();
    expect(screen.getByText('Certificado de Tradición')).toBeDefined();
  });

  it('shows badge for Siempre requerido on documents with unconditional rules', () => {
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={vi.fn()} />
    );

    expect(screen.getAllByText('Siempre requerido').length).toBeGreaterThan(0);
  });

  it('shows badge for Por condición on documents with conditional rules', () => {
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={vi.fn()} />
    );

    expect(screen.getAllByText('Por condición').length).toBeGreaterThan(0);
  });

  it('shows badge for Sin regla on documents with no rules', () => {
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={vi.fn()} />
    );

    expect(screen.getByText('Sin regla')).toBeDefined();
  });

  it('calls onSelectDocument when a document is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={handleSelect} />
    );

    fireEvent.click(screen.getByText('Formulario Único Nacional'));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ documentCode: '501' })
    );
  });

  it('toggles group collapse on group click', () => {
    render(
      <RequirementExplorerTree explorer={mockExplorer} onSelectDocument={vi.fn()} />
    );

    const groupToggle = screen.getByText('Documentos comunes');
    expect(screen.getByText('Certificado de Tradición')).toBeDefined();

    fireEvent.click(groupToggle);
    expect(screen.queryByText('Certificado de Tradición')).toBeNull();

    fireEvent.click(groupToggle);
    expect(screen.getByText('Certificado de Tradición')).toBeDefined();
  });

  it('shows empty state when no groups', () => {
    render(
      <RequirementExplorerTree
        explorer={{ ...mockExplorer, groups: [], documents: [] }}
        onSelectDocument={vi.fn()}
        emptyMessage="Configuración no disponible"
      />
    );

    expect(screen.getByTestId('explorer-tree-empty')).toBeDefined();
    expect(screen.getByText('Configuración no disponible')).toBeDefined();
  });

  it('renders rule key badges in tree', () => {
    const explorerWithWarn = {
      ...mockExplorer,
      rules: [
        { ruleKey: 'bad-rule', groupKey: 'g1', documentCodes: ['501'], required: true, allowNa: false, determinable: false, hasConditions: false, conditionSummary: '' },
      ],
      documents: [
        { documentCode: '501', label: 'Formulario Único Nacional', groupKey: 'g1', groupLabel: 'Documentos comunes', active: true, order: 0, activatingRules: ['bad-rule'] },
      ],
      groups: [{ key: 'g1', label: 'Documentos comunes', order: 0 }],
    };

    render(
      <RequirementExplorerTree explorer={explorerWithWarn} onSelectDocument={vi.fn()} />
    );

    expect(screen.getByText('Regla no determinable')).toBeDefined();
  });
});
