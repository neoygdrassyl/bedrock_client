import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolioCount } from './FolioCount';

describe('FolioCount', () => {
    it('renders the label and value', () => {
        render(<FolioCount label="Digitales" value={5} tone="digital" />);

        const badge = screen.getByTestId('folio-count');
        expect(badge).toHaveTextContent('Digitales');
        expect(badge).toHaveTextContent('5');
    });

    it('defaults the count to 0 when no value is provided', () => {
        render(<FolioCount label="Físicos" tone="physical" />);

        expect(screen.getByTestId('folio-count')).toHaveTextContent('0');
    });
});
