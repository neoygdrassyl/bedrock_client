import { describe, expect, it } from 'vitest';
import { buildRequirementExplorerState } from './requirementExplorerState.js';

const explorer = {
  schemaVersion: 1,
  status: 'published',
  version: 5,
  readOnly: true,
  fields: [],
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
      documentCode: '601',
      label: 'Plano Topográfico',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['conditional-urban'],
    },
    {
      documentCode: '602',
      label: 'Estudio de Tránsito',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['conditional-traffic'],
    },
    {
      documentCode: '603',
      label: 'Concepto pendiente',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['broken-rule'],
    },
    {
      documentCode: '604',
      label: 'Documento multi-regla',
      groupKey: 'g2',
      groupLabel: 'Documentos especiales',
      activatingRules: ['conditional-urban', 'conditional-urban', 'always-common'],
    },
  ],
  rules: [
    {
      ruleKey: 'always-common',
      determinable: true,
      required: true,
      hasConditions: false,
    },
    {
      ruleKey: 'conditional-urban',
      determinable: true,
      required: true,
      hasConditions: true,
    },
    {
      ruleKey: 'conditional-traffic',
      determinable: true,
      required: true,
      hasConditions: true,
    },
    {
      ruleKey: 'broken-rule',
      determinable: false,
      required: true,
      hasConditions: true,
    },
  ],
  warnings: [
    {
      ruleKey: 'broken-rule',
      severity: 'warning',
      label: 'Regla no determinable',
    },
  ],
};

const preview = {
  requirements: [
    { documentCode: '501', matched: true, ruleKey: 'always-common' },
    { documentCode: '601', matched: true, ruleKey: 'conditional-urban' },
    { documentCode: '602', matched: false, ruleKey: 'conditional-traffic' },
    { documentCode: '603', matched: false, ruleKey: 'broken-rule' },
    { documentCode: '604', matched: true, ruleKey: 'conditional-urban' },
    { documentCode: '604', matched: true, ruleKey: 'conditional-urban' },
    { documentCode: '604', matched: true, ruleKey: 'always-common' },
  ],
};

function getDocument(state, documentCode) {
  return state.documents.find((document) => document.documentCode === documentCode);
}

describe('buildRequirementExplorerState', () => {
  it('keeps every configured document visible as pending simulation before preview exists', () => {
    const state = buildRequirementExplorerState({
      explorer,
      preview: null,
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '602',
    });

    expect(state.stepState).toEqual({
      hasScenario: true,
      hasPreview: false,
      hasSelectedDocument: true,
    });
    expect(state.selectedDocumentStillVisible).toBe(true);
    expect(state.selectedDocument).toEqual(
      expect.objectContaining({ documentCode: '602' }),
    );
    expect(state.documents).toHaveLength(5);
    expect(new Set(state.documents.map((document) => document.visualState))).toEqual(
      new Set(['not-simulated']),
    );
    expect(new Set(state.documents.map((document) => document.stateLabel))).toEqual(
      new Set(['Pendiente de simulación']),
    );
  });

  it('classifies all preview states and keeps excluded documents visible as not applicable', () => {
    const state = buildRequirementExplorerState({
      explorer,
      preview,
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '602',
    });

    expect(state.stepState).toEqual({
      hasScenario: true,
      hasPreview: true,
      hasSelectedDocument: true,
    });
    expect(state.selectedDocumentStillVisible).toBe(true);
    expect(getDocument(state, '501')).toEqual(
      expect.objectContaining({
        visualState: 'always-required',
        stateLabel: 'Siempre requerido',
      }),
    );
    expect(getDocument(state, '601')).toEqual(
      expect.objectContaining({
        visualState: 'conditional-required',
        stateLabel: 'Por condición',
      }),
    );
    expect(getDocument(state, '602')).toEqual(
      expect.objectContaining({
        visualState: 'not-applicable',
        stateLabel: 'No aplica con estos datos',
      }),
    );
    expect(getDocument(state, '603')).toEqual(
      expect.objectContaining({
        visualState: 'non-determinable',
        stateLabel: 'Regla no determinable',
      }),
    );
  });

  it('deduplicates activating and matched rules for multi-rule documents', () => {
    const state = buildRequirementExplorerState({
      explorer,
      preview,
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '604',
    });

    expect(getDocument(state, '604')).toEqual(
      expect.objectContaining({
        visualState: 'always-required',
        stateLabel: 'Siempre requerido',
        activatingRuleKeys: ['conditional-urban', 'always-common'],
        matchedRuleKeys: ['conditional-urban', 'always-common'],
      }),
    );
  });

  it('marks stale selected documents as no longer visible in the current state', () => {
    const state = buildRequirementExplorerState({
      explorer,
      preview,
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '999',
    });

    expect(state.stepState).toEqual({
      hasScenario: true,
      hasPreview: true,
      hasSelectedDocument: false,
    });
    expect(state.selectedDocument).toBeNull();
    expect(state.selectedDocumentStillVisible).toBe(false);
  });

  it('lets non-determinable warnings override not-applicable when preview excludes a document', () => {
    const state = buildRequirementExplorerState({
      explorer,
      preview,
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '603',
    });

    expect(getDocument(state, '603')).toEqual(
      expect.objectContaining({
        visualState: 'non-determinable',
        stateLabel: 'Regla no determinable',
        matchedRuleKeys: [],
        warningRuleKeys: ['broken-rule'],
      }),
    );
  });

  it('keeps configured documents visible on zero-result previews and derives non-determinable state from mixed rules', () => {
    const state = buildRequirementExplorerState({
      explorer: {
        ...explorer,
        documents: [
          ...explorer.documents,
          {
            documentCode: '605',
            label: 'Certificación técnica',
            groupKey: 'g2',
            groupLabel: 'Documentos especiales',
            activatingRules: ['broken-no-warning'],
          },
        ],
        rules: [
          ...explorer.rules,
          {
            ruleKey: 'broken-no-warning',
            determinable: false,
            required: true,
            hasConditions: true,
          },
        ],
      },
      preview: { requirements: [] },
      selection: { tipoAny: 'licencia' },
      selectedDocumentCode: '605',
    });

    expect(state.documents).toHaveLength(6);
    expect(state.selectedDocumentStillVisible).toBe(true);
    expect(getDocument(state, '501')).toEqual(
      expect.objectContaining({
        visualState: 'not-applicable',
        stateLabel: 'No aplica con estos datos',
      }),
    );
    expect(getDocument(state, '603')).toEqual(
      expect.objectContaining({
        visualState: 'non-determinable',
        stateLabel: 'Regla no determinable',
      }),
    );
    expect(getDocument(state, '605')).toEqual(
      expect.objectContaining({
        visualState: 'non-determinable',
        stateLabel: 'Regla no determinable',
      }),
    );
  });
});
