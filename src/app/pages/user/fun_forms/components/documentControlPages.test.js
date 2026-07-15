import { describe, expect, it } from 'vitest';

import { normalizeDocumentControlPages } from './documentControlPages';

describe('normalizeDocumentControlPages', () => {
    it('preserves a page range as text', () => {
        expect(normalizeDocumentControlPages(' 1-10 ')).toBe('1-10');
    });

    it('preserves historical numeric values as text', () => {
        expect(normalizeDocumentControlPages(15)).toBe('15');
    });

    it('returns an empty string for missing values', () => {
        expect(normalizeDocumentControlPages(null)).toBe('');
        expect(normalizeDocumentControlPages(undefined)).toBe('');
    });
});
