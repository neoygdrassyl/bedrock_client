import { describe, expect, it } from 'vitest';
import { REVISION_FACT_FIELDS, funFactLabel } from './funFactLabels';

describe('funFactLabel', () => {
  it('maps single codes to the FUN 1 option names without the letter prefix', () => {
    expect(funFactLabel('tipo', 'A')).toBe('Licencia de Urbanización');
    expect(funFactLabel('tramite', 'C')).toBe('Modificación de Licencia Vigente');
    expect(funFactLabel('cultural', 'B')).toBe('NO');
    expect(funFactLabel('vivienda', 'C')).toBe('NO VIS');
  });

  it('joins multi-value fields with a comma, from letters or comma lists', () => {
    expect(funFactLabel('usos', 'AB')).toBe('Vivienda, Comercio y/o Servicios');
    expect(funFactLabel('m_lic', 'A,B')).toBe('Obra Nueva, Ampliación');
    expect(funFactLabel('tipo', ['A', 'D'])).toBe('Licencia de Urbanización, Licencia de Construcción');
  });

  it('keeps the G.1 / G.2 demolition codes of m_lic apart', () => {
    expect(funFactLabel('m_lic', 'G')).toBe('Demolición: Total');
    expect(funFactLabel('m_lic', 'g')).toBe('Demolición Parcial');
  });

  it('names the answers of the Formato de Revisión facts as Sí / No', () => {
    expect(REVISION_FACT_FIELDS).toEqual(['propiedad_horizontal', 'titulo_e', 'supervision_tecnica', 'reforzamiento_riesgo', 'cesion_anticipada', 'autoridad_distinta']);
    REVISION_FACT_FIELDS.forEach((field) => {
      expect(funFactLabel(field, 'A')).toBe('Sí');
      expect(funFactLabel(field, 'B')).toBe('No');
      expect(funFactLabel(field, null)).toBeNull();
    });
    // A value that is neither A nor B is shown as stored, never guessed.
    expect(funFactLabel('titulo_e', 'C')).toBe('C');
  });

  it('returns null for empty values and the stored text for unknown codes or fields', () => {
    expect(funFactLabel('tipo', null)).toBeNull();
    expect(funFactLabel('tipo', '')).toBeNull();
    expect(funFactLabel('tipo', 'Z')).toBe('Z');
    expect(funFactLabel('desconocido', 'Q')).toBe('Q');
  });
});
