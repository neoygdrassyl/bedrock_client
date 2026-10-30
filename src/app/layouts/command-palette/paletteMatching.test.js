import { describe, expect, it } from 'vitest';
import { normalizeText, scoreMatch, splitHighlight } from './paletteMatching';

describe('normalizeText', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeText('Radicación ÚNICA')).toBe('radicacion unica');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(42)).toBe('42');
  });
});

describe('scoreMatch', () => {
  it('matches everything on an empty query', () => {
    expect(scoreMatch('', 'Archivo')).toBe(1);
    expect(scoreMatch('   ', 'Archivo')).toBe(1);
  });

  it('ranks exact > prefix > word start > substring > keywords > subsequence', () => {
    expect(scoreMatch('archivo', 'Archivo')).toBe(100);
    expect(scoreMatch('arch', 'Archivo central')).toBe(90);
    expect(scoreMatch('cent', 'Archivo central')).toBe(80);
    expect(scoreMatch('chiv', 'Archivo')).toBe(70);
    expect(scoreMatch('festivos', 'Calendario laboral', ['dias habiles', 'festivos'])).toBe(55);
    expect(scoreMatch('clb', 'Calendario laboral')).toBe(20);
  });

  it('is accent-insensitive in both directions', () => {
    expect(scoreMatch('radicacion', 'Nueva radicación')).toBe(80);
    expect(scoreMatch('peticion', 'Nueva PQRS', ['Derecho de petición'])).toBe(55);
  });

  it('splits word starts on spaces, middots, slashes and dashes', () => {
    expect(scoreMatch('sub', 'Licencias › Gestion/Sub-modulo')).toBe(80);
    expect(scoreMatch('modulo', 'Licencias · modulo')).toBe(80);
  });

  it('requires every token for a keyword match', () => {
    expect(scoreMatch('dias festivos', 'Calendario laboral', ['dias habiles', 'festivos'])).toBe(55);
    expect(scoreMatch('dias navidad', 'Calendario laboral', ['dias habiles', 'festivos'])).toBe(0);
  });

  it('returns 0 when the letters are not in order', () => {
    expect(scoreMatch('zz', 'Archivo')).toBe(0);
    expect(scoreMatch('ovihcra', 'Archivo')).toBe(0);
  });
});

describe('splitHighlight', () => {
  it('highlights the first accent-insensitive occurrence keeping the original characters', () => {
    expect(splitHighlight('Nueva radicación', 'RADICACION')).toEqual([
      { text: 'Nueva ', match: false },
      { text: 'radicación', match: true },
    ]);
  });

  it('handles matches at the start and in the middle', () => {
    expect(splitHighlight('Archivo central', 'arch')).toEqual([
      { text: 'Arch', match: true },
      { text: 'ivo central', match: false },
    ]);
    expect(splitHighlight('Gestión de licencias', 'tion')).toEqual([
      { text: 'Ges', match: false },
      { text: 'tión', match: true },
      { text: ' de licencias', match: false },
    ]);
  });

  it('returns the whole text unmatched for empty queries, empty text or no match', () => {
    expect(splitHighlight('Archivo', '')).toEqual([{ text: 'Archivo', match: false }]);
    expect(splitHighlight('', 'a')).toEqual([{ text: '', match: false }]);
    expect(splitHighlight('Archivo', 'zz')).toEqual([{ text: 'Archivo', match: false }]);
  });
});
