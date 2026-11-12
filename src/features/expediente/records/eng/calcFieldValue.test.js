import { afterEach, describe, expect, it } from 'vitest';
import { noNaN, setCalcValue } from './calcFieldValue';

const addInput = (id, type, value = '') => {
  const input = document.createElement('input');
  input.id = id;
  input.type = type;
  input.value = value;
  document.body.appendChild(input);
  return input;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('setCalcValue', () => {
  it.each([
    [12.5, '12.5'],
    ['3.40', '3.40'],
    [0, '0'],
    ['', ''],
  ])('writes the finite value %j to a number input', (value, expected) => {
    const input = addInput('calc', 'number', '99');
    setCalcValue('calc', value);
    expect(input.value).toBe(expected);
  });

  it.each([Number.NaN, 'NaN', Infinity, -Infinity, 'abc', undefined, 0 / 0])('clears a number input instead of writing %j', (value) => {
    const input = addInput('calc', 'number', '99');
    setCalcValue('calc', value);
    expect(input.value).toBe('');
    expect(input.value).not.toMatch(/NaN|Infinity/);
  });

  it('leaves text inputs as the caller wrote them (their stored value is the string)', () => {
    const input = addInput('calc-text', 'text');
    setCalcValue('calc-text', 'N/A');
    expect(input.value).toBe('N/A');
    setCalcValue('calc-text', '0.75');
    expect(input.value).toBe('0.75');
  });

  it('only touches the addressed input', () => {
    const saved = addInput('saved', 'number', '41.2');
    addInput('calc', 'number', '1');
    setCalcValue('calc', Number.NaN);
    expect(saved.value).toBe('41.2');
  });
});

describe('noNaN', () => {
  it.each([Number.NaN, 'NaN'])('hides %j', (value) => {
    expect(noNaN(value)).toBe('');
  });

  it.each([0, 12.5, '0', '12.50', '', 'texto', null, undefined])('returns the saved value %j untouched', (value) => {
    expect(noNaN(value)).toBe(value);
  });
});
