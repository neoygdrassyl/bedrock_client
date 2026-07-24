import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RequirementExplanationPanel from './RequirementExplanationPanel.jsx';

const mockExplorer = {
  groups: [
    { key: 'g1', label: 'Documentos comunes', order: 0 },
    { key: 'g2', label: 'Documentos de urbanización', order: 1 },
  ],
  rules: [
    { ruleKey: 'common-all', groupKey: 'g1', documentCodes: ['501'], required: true, allowNa: false, determinable: true, hasConditions: false, conditionSummary: 'Esta regla aplica a cualquier valor de los campos de la actuación.' },
    { ruleKey: 'urbanizacion-desarrollo', groupKey: 'g2', documentCodes: ['601'], required: true, allowNa: true, determinable: true, hasConditions: true, conditionSummary: 'Actuación incluye [Urbanización]; Urbanización incluye [Desarrollo].' },
    { ruleKey: 'urbanizacion-saneamiento', groupKey: 'g2', documentCodes: ['601'], required: true, allowNa: true, determinable: true, hasConditions: true, conditionSummary: 'Actuación incluye [Urbanización]; Urbanización incluye [Saneamiento].' },
    { ruleKey: 'bad-rule', groupKey: 'g1', documentCodes: ['502'], required: true, allowNa: false, determinable: false, hasConditions: false, conditionSummary: 'Documento "x999" no está declarado.' },
  ],
  warnings: [],
};

describe('RequirementExplanationPanel', () => {
  it('shows empty prompt when no document selected', () => {
    render(<RequirementExplanationPanel selectedDocument={null} explorer={mockExplorer} />);

    expect(screen.getByTestId('explorer-explanation-empty')).toBeDefined();
    expect(screen.getByText(/selecciona un documento/i)).toBeDefined();
  });

  it('shows document name, group, and state when selected', () => {
    const doc = { documentCode: '501', label: 'Formulario Único Nacional', groupKey: 'g1', activatingRules: ['common-all'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getAllByText('Formulario Único Nacional').length).toBeGreaterThan(0);
    expect(screen.getByText('Documentos comunes')).toBeDefined();
    expect(screen.getAllByText('Siempre requerido').length).toBeGreaterThan(0);
  });

  it('shows concept labels, inferred default scope, and disclaimer for visual understanding', () => {
    const doc = {
      documentCode: '501',
      label: 'Formulario Único Nacional',
      groupKey: 'g1',
      groupLabel: 'Documentos comunes',
      activatingRules: ['common-all'],
      stateLabel: 'Siempre requerido',
      visualState: 'always-required',
    };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getByText('Documento tipo')).toBeDefined();
    expect(screen.getByText('Requisito de esta solicitud')).toBeDefined();
    expect(screen.getByText('Archivo aportado')).toBeDefined();
    expect(screen.getByText('Alcance estimado')).toBeDefined();
    expect(screen.getAllByText('Formulario Único Nacional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Siempre requerido').length).toBeGreaterThan(0);
    expect(screen.getByText('Por solicitud')).toBeDefined();
    expect(screen.getByText('Alcance visual para comprensión; no calcula cantidades por instancia.')).toBeDefined();
  });

  it('shows por confirmar when scope code is unknown', () => {
    const doc = {
      documentCode: '601',
      label: 'Plano Topográfico',
      groupKey: 'g2',
      groupLabel: 'Documentos de urbanización',
      activatingRules: ['urbanizacion-desarrollo'],
      stateLabel: 'Por condición',
      visualState: 'conditional-required',
      scopeCode: 'instancia-extraña',
    };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getByText('Por confirmar')).toBeDefined();
  });

  it('shows multiple activating rules notice when doc has 2+ rules', () => {
    const doc = { documentCode: '601', label: 'Plano Topográfico', groupKey: 'g2', activatingRules: ['urbanizacion-desarrollo', 'urbanizacion-saneamiento'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getByTestId('explorer-multi-rule-notice')).toBeDefined();
    expect(screen.getByText(/también aplica por 2 reglas/i)).toBeDefined();
  });

  it('shows rule conditionSummary for conditional rules', () => {
    const doc = { documentCode: '601', label: 'Plano Topográfico', groupKey: 'g2', activatingRules: ['urbanizacion-desarrollo'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    const matches = screen.getAllByText(/Desarrollo/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('shows non-determinable warning for broken rules', () => {
    const doc = { documentCode: '502', label: 'Certificado', groupKey: 'g1', activatingRules: ['bad-rule'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getAllByText('Regla no determinable').length).toBeGreaterThan(0);
    expect(screen.getByText(/no puede evaluarse automáticamente/i)).toBeDefined();
  });

  it('shows "Requerido" or "Opcional" per rule', () => {
    const doc = { documentCode: '501', label: 'Formulario Único Nacional', groupKey: 'g1', activatingRules: ['common-all'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    expect(screen.getByText('Requerido')).toBeDefined();
  });

  it('shows activating rules in footer', () => {
    const doc = { documentCode: '601', label: 'Plano Topográfico', groupKey: 'g2', activatingRules: ['urbanizacion-desarrollo', 'urbanizacion-saneamiento'] };

    render(<RequirementExplanationPanel selectedDocument={doc} explorer={mockExplorer} />);

    const devMatches = screen.getAllByText('urbanizacion-desarrollo');
    const sanMatches = screen.getAllByText('urbanizacion-saneamiento');
    expect(devMatches.length).toBeGreaterThan(0);
    expect(sanMatches.length).toBeGreaterThan(0);
  });
});
