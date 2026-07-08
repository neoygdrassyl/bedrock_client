import { describe, expect, it } from 'vitest';
import {
  getApplicableReportSections,
  getRulesWithSubdivisionNoStructural,
  isSubdivisionExpediente,
  shouldUseStructuralReport,
} from '../app/pages/user/fun_forms/utils/expedienteDomainRules.js';

describe('expedienteDomainRules', () => {
  describe('isSubdivisionExpediente', () => {
    it('detecta subdivisión desde el FUN 1 plano', () => {
      expect(isSubdivisionExpediente({ tipo: 'C' })).toBe(true);
      expect(isSubdivisionExpediente({ tipo: 'A,C' })).toBe(true);
      expect(isSubdivisionExpediente({ tipo: ['A', 'C'] })).toBe(true);
    });

    it('detecta subdivisión desde fun_1s y versión activa', () => {
      const expediente = {
        fun_1s: [
          { version: 1, tipo: 'D' },
          { version: 2, tipo: 'C', m_sub: 'B' },
        ],
      };

      expect(isSubdivisionExpediente(expediente, 1)).toBe(false);
      expect(isSubdivisionExpediente(expediente, 2)).toBe(true);
    });

    it('no confunde fun_0.type/categoría con fun_1.tipo/actuación', () => {
      expect(isSubdivisionExpediente({ type: 'C' })).toBe(false);
      expect(isSubdivisionExpediente({ type: 'iv', tipo: 'D' })).toBe(false);
    });
  });

  describe('shouldUseStructuralReport', () => {
    it('omite informe estructural para subdivisión aunque no exista rule manual', () => {
      expect(shouldUseStructuralReport({ tipo: 'C', rules: '0;0;0' })).toBe(false);
    });

    it('omite informe estructural cuando rules[1] está activo', () => {
      expect(shouldUseStructuralReport({ tipo: 'D', rules: '0;1;0' })).toBe(false);
    });

    it('permite informe estructural para construcción regular sin regla de exclusión', () => {
      expect(shouldUseStructuralReport({ tipo: 'D', rules: '0;0;0' })).toBe(true);
    });

    it('permite pasar exclusiones externas como propiedad horizontal', () => {
      expect(shouldUseStructuralReport({ tipo: 'D', rules: '0;0;0' }, undefined, { isPropertyHorizontal: true })).toBe(false);
    });
  });

  describe('getApplicableReportSections', () => {
    it('expone solo jurídico y arquitectónico para subdivisión', () => {
      expect(getApplicableReportSections({ tipo: 'C', rules: '0;0;0' })).toEqual(['juridico', 'arquitectonico']);
    });

    it('mantiene estructural para construcción regular', () => {
      expect(getApplicableReportSections({ tipo: 'D', rules: '0;0;0' })).toEqual(['juridico', 'arquitectonico', 'estructural']);
    });
  });

  describe('getRulesWithSubdivisionNoStructural', () => {
    it('activa rules[1] para subdivisión preservando otras reglas', () => {
      expect(getRulesWithSubdivisionNoStructural('1;0;0', { tipo: 'C' })).toBe('1;1;0');
    });

    it('crea el índice de informe estructural cuando rules está vacío', () => {
      expect(getRulesWithSubdivisionNoStructural('', { tipo: 'C' })).toBe('0;1');
    });

    it('no cambia reglas de actuaciones no subdivisión', () => {
      expect(getRulesWithSubdivisionNoStructural('0;0;0', { tipo: 'D' })).toBe('0;0;0');
    });
  });
});
