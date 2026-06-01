import { describe, it, expect } from 'vitest';
import * as simulatorDocumentEngine from '@/app/pages/user/simulador/documentos/simulatorDocumentEngine';
import {
  getInitialSimulatorSelection,
  normalizeSimulatorSelection,
  buildSimulatedFunItem,
  getVuGroupIdForCode,
  evaluateDocumentRequirements,
} from '@/app/pages/user/simulador/documentos/simulatorDocumentEngine';

describe('simulatorDocumentEngine', () => {
  describe('getInitialSimulatorSelection', () => {
    it('returns an object with all required keys and empty defaults', () => {
      const selection = getInitialSimulatorSelection();
      expect(selection).toEqual({
        tipo: [],
        tramite: '',
        m_urb: '',
        m_sub: '',
        m_lic: [],
        area: '',
        cultural: '',
        usos: [],
        vivienda: '',
      });
    });
  });

  describe('normalizeSimulatorSelection', () => {
    it('returns default selection when input is empty', () => {
      const result = normalizeSimulatorSelection({});
      expect(result.tipo).toEqual([]);
      expect(result.tramite).toBe('');
      expect(result.m_lic).toEqual([]);
      expect(result.usos).toEqual([]);
    });

    it('converts string tipo to array', () => {
      const result = normalizeSimulatorSelection({ tipo: 'D' });
      expect(result.tipo).toEqual(['D']);
    });

    it('passes through array tipo unchanged', () => {
      const result = normalizeSimulatorSelection({ tipo: ['D', 'E'] });
      expect(result.tipo).toEqual(['D', 'E']);
    });

    it('filters falsy values from tipo array', () => {
      const result = normalizeSimulatorSelection({ tipo: ['D', '', null, 'E'] });
      expect(result.tipo).toEqual(['D', 'E']);
    });

    it('converts string m_lic to array', () => {
      const result = normalizeSimulatorSelection({ m_lic: 'A' });
      expect(result.m_lic).toEqual(['A']);
    });

    it('converts string usos to array', () => {
      const result = normalizeSimulatorSelection({ usos: 'residential' });
      expect(result.usos).toEqual(['residential']);
    });
  });

  describe('buildSimulatedFunItem', () => {
    it('returns fun_1s array with normalized selection', () => {
      const selection = {
        tipo: 'D',
        tramite: 'A',
        m_lic: ['A'],
        area: 'B',
        cultural: 'B',
      };
      const item = buildSimulatedFunItem(selection);
      expect(item).toHaveProperty('fun_1s');
      expect(item.fun_1s).toHaveLength(1);
      expect(item.fun_1s[0].tipo).toEqual(['D']);
      expect(item.fun_1s[0].tramite).toBe('A');
      expect(item.fun_1s[0].m_lic).toEqual(['A']);
      expect(item.fun_1s[0].area).toBe('B');
      expect(item.fun_1s[0].cultural).toBe('B');
    });

    it('handles empty selection gracefully', () => {
      const item = buildSimulatedFunItem({});
      expect(item.fun_1s[0].tipo).toEqual([]);
      expect(item.fun_1s[0].tramite).toBe('');
    });
  });

  describe('getVuGroupIdForCode', () => {
    it('returns list_66 for code 6601 (direct membership)', () => {
      expect(getVuGroupIdForCode('6601')).toBe('list_66');
    });

    it('returns list_66 for code 660a (variant code via regex)', () => {
      expect(getVuGroupIdForCode('660a')).toBe('list_66');
    });

    it('returns list_66 for code 660f (variant code via regex)', () => {
      expect(getVuGroupIdForCode('660f')).toBe('list_66');
    });

    // V.U. grouping corrections: 601a/b/c and 602a/b/c belong to list_62 (urbanismo), not list_66
    it('returns list_62 for code 601a (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('601a')).toBe('list_62');
    });

    it('returns list_62 for code 601b (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('601b')).toBe('list_62');
    });

    it('returns list_62 for code 601c (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('601c')).toBe('list_62');
    });

    it('returns list_62 for code 602a (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('602a')).toBe('list_62');
    });

    it('returns list_62 for code 602b (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('602b')).toBe('list_62');
    });

    it('returns list_62 for code 602c (V.U. urbanismo variant)', () => {
      expect(getVuGroupIdForCode('602c')).toBe('list_62');
    });

    // 6862 is a piscina/otras actuaciones variant -> list_68
    it('returns list_68 for code 6862 (piscina/otras actuaciones variant)', () => {
      expect(getVuGroupIdForCode('6862')).toBe('list_68');
    });

    // 6891/6892/6893 are direct membership in list_68
    it('returns list_68 for code 6891 (direct membership)', () => {
      expect(getVuGroupIdForCode('6891')).toBe('list_68');
    });

    it('returns list_68 for code 6892 (direct membership)', () => {
      expect(getVuGroupIdForCode('6892')).toBe('list_68');
    });

    it('returns list_68 for code 6893 (direct membership)', () => {
      expect(getVuGroupIdForCode('6893')).toBe('list_68');
    });

    it('returns list_62 for code 621 (direct membership)', () => {
      expect(getVuGroupIdForCode('621')).toBe('list_62');
    });

    it('returns list_61 for code 511 (direct membership)', () => {
      expect(getVuGroupIdForCode('511')).toBe('list_61');
    });

    it('returns null for unknown codes', () => {
      expect(getVuGroupIdForCode('999')).toBeNull();
    });
  });

  describe('evaluateDocumentRequirements', () => {
    it('evaluates construction selection and returns applicable documents', () => {
      const selection = {
        tipo: ['D'],
        tramite: 'A',
        m_lic: ['A'],
        area: 'B',
        cultural: 'B',
      };

      const result = evaluateDocumentRequirements(selection);

      expect(result).toHaveProperty('checklistItems');
      expect(result).toHaveProperty('applicableCodes');
      expect(result).toHaveProperty('groupedDocuments');
      expect(result).toHaveProperty('selectionSummary');
      expect(result).toHaveProperty('warnings');

      // Should contain 511 (always applicable)
      expect(result.applicableCodes).toContain('511');

      // Should contain 6601 (tipo D applies)
      expect(result.applicableCodes).toContain('6601');

      // Should have list_66 group for construction documents
      expect(result.groupedDocuments).toHaveProperty('list_66');
      expect(result.groupedDocuments.list_66).toContain('6601');

      // No warnings for fully defined selection
      expect(result.warnings).toEqual([]);
    });

    it('returns no warnings when all labels are found', () => {
      const selection = { tipo: ['D'], tramite: 'A', m_lic: ['A'], area: 'B', cultural: 'B' };
      const result = evaluateDocumentRequirements(selection);
      expect(result.warnings).toEqual([]);
    });


    it('adds trace metadata for a construction base document tied to tipo D Construcción', () => {
      const selection = { tipo: ['D'], tramite: 'A', m_lic: ['A'], area: 'A', cultural: 'B' };

      expect(simulatorDocumentEngine.getRuleTraceForCode).toBeTypeOf('function');
      const trace = simulatorDocumentEngine.getRuleTraceForCode('6601', selection);
      const result = evaluateDocumentRequirements(selection);
      const checklistItem = result.checklistItems.find((item) => item.code === '6601');

      expect(trace).toEqual(expect.arrayContaining([
        expect.objectContaining({
          field: 'tipo',
          value: 'D',
          label: 'D Construcción',
          reason: expect.stringContaining('D Construcción'),
        }),
      ]));
      expect(checklistItem?.traces).toEqual(trace);
    });

    it('adds trace metadata for area-triggered 660a tied to area B >= 2000m²', () => {
      const selection = { tipo: ['D'], tramite: 'A', m_lic: ['A'], area: 'B', cultural: 'B' };

      expect(simulatorDocumentEngine.getRuleTraceForCode).toBeTypeOf('function');
      const trace = simulatorDocumentEngine.getRuleTraceForCode('660a', selection);
      const result = evaluateDocumentRequirements(selection);
      const checklistItem = result.checklistItems.find((item) => item.code === '660a');

      expect(trace).toEqual(expect.arrayContaining([
        expect.objectContaining({
          field: 'area',
          value: 'B',
          label: 'B >= 2000m²',
          reason: expect.stringContaining('Área: B >= 2000m²'),
        }),
      ]));
      expect(checklistItem?.traces).toEqual(trace);
    });

    it('adds an honest common trace for common item 511', () => {
      const selection = { tipo: ['D'], tramite: 'A', m_lic: ['A'], area: 'B', cultural: 'B' };

      expect(simulatorDocumentEngine.getRuleTraceForCode).toBeTypeOf('function');
      const trace = simulatorDocumentEngine.getRuleTraceForCode('511', selection);
      const result = evaluateDocumentRequirements(selection);
      const checklistItem = result.checklistItems.find((item) => item.code === '511');

      expect(trace).toEqual([
        expect.objectContaining({
          kind: 'common',
          reason: 'Común a toda solicitud',
        }),
      ]);
      expect(checklistItem?.traces).toEqual(trace);
    });


    it('labels trámite-driven fallback as current rule when trámite is empty', () => {
      const trace = simulatorDocumentEngine.getRuleTraceForCode('6862', {});
      const result = evaluateDocumentRequirements({});
      const checklistItem = result.checklistItems.find((item) => item.code === '6862');

      expect(result.applicableCodes).toContain('6862');
      expect(trace).toEqual([
        expect.objectContaining({
          kind: 'current-rule',
          field: 'tramite',
          value: '',
          reason: expect.stringContaining('trámite está sin definir'),
          source: expect.stringContaining('sin trámite'),
        }),
      ]);
      expect(trace[0].reason).not.toContain('debe contener');
      expect(checklistItem?.traces).toEqual(trace);
    });

    it('gives every applicable row at least one trace in a representative construction simulation', () => {
      const result = evaluateDocumentRequirements({
        tipo: ['D'],
        tramite: 'A',
        m_lic: ['A'],
        area: 'B',
        cultural: 'B',
        usos: ['A'],
        vivienda: 'B',
      });

      expect(result.checklistItems.length).toBeGreaterThan(0);
      expect(result.checklistItems.every((item) => Array.isArray(item.traces) && item.traces.length > 0)).toBe(true);
      expect(result.ruleTracesByCode).toBeDefined();
      expect(result.ruleTracesByCode['6601']).toEqual(result.checklistItems.find((item) => item.code === '6601')?.traces);
    });

    it('keeps V.U. grouping for applicable variant and direct membership codes', () => {
      const result = evaluateDocumentRequirements({
        tipo: ['A', 'D'],
        tramite: 'piscina',
        m_urb: 'A',
        m_lic: ['A'],
        area: 'B',
        cultural: 'B',
      });

      expect(result.groupedDocuments.list_62).toEqual(expect.arrayContaining(['601a', '602a']));
      expect(result.groupedDocuments.list_66).toEqual(expect.arrayContaining(['660a']));
      expect(result.groupedDocuments.list_68).toEqual(expect.arrayContaining(['6862', '6891']));
    });
  });
});
