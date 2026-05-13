import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('React Router future flags', () => {
  it('opts into v7 flags to avoid migration warnings in development', () => {
    const source = readFileSync('src/app/App.js', 'utf8');

    expect(source).toContain('future={{');
    expect(source).toContain('v7_startTransition: true');
    expect(source).toContain('v7_relativeSplatPath: true');
  });
});
