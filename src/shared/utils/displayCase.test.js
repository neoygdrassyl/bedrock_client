import { describe, expect, it } from 'vitest';
import { toDisplayCase } from './displayCase';

describe('toDisplayCase', () => {
  it('capitalizes accented words without splitting them at the accented vowel', () => {
    expect(toDisplayCase('GESTIÓN DOCUMENTAL')).toBe('Gestión Documental');
    expect(toDisplayCase('ÁLVARO GÓMEZ')).toBe('Álvaro Gómez');
  });

  it('keeps known acronyms uppercase in all-caps text', () => {
    expect(toDisplayCase('RADICACIÓN LDF')).toBe('Radicación LDF');
    expect(toDisplayCase('LICENCIA VR CUB PH FUN PQRS MVCT')).toBe('Licencia VR CUB PH FUN PQRS MVCT');
  });

  it('does not treat short Spanish words of all-caps text as acronyms', () => {
    expect(toDisplayCase('LICENCIA DE CONSTRUCCIÓN EN LA OBRA')).toBe('Licencia De Construcción En La Obra');
  });

  it('keeps vowel-less abbreviations and acronyms written in mixed-case text', () => {
    expect(toDisplayCase('MZ 4 KR 27')).toBe('MZ 4 KR 27');
    expect(toDisplayCase('Reconocimiento ICBF de obra')).toBe('Reconocimiento ICBF De Obra');
  });

  it('handles empty values, digits and punctuation', () => {
    expect(toDisplayCase(null)).toBe('');
    expect(toDisplayCase('   ')).toBe('');
    expect(toDisplayCase('2DO PISO, D\'ALEMBERT')).toBe('2do Piso, D\'Alembert');
  });
});
