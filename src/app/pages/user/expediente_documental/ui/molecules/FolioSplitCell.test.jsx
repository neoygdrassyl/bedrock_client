import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FolioSplitCell } from './FolioSplitCell';

describe('FolioSplitCell', () => {
    it('renders digital and physical folio counts', () => {
        render(<FolioSplitCell digital={4} physical={2} />);

        const cell = screen.getByTestId('folio-split-cell');
        expect(cell).toHaveTextContent('Digitales');
        expect(cell).toHaveTextContent('4');
        expect(cell).toHaveTextContent('Físicos');
        expect(cell).toHaveTextContent('2');
    });

    it('defaults both counts to 0', () => {
        render(<FolioSplitCell />);

        const cell = screen.getByTestId('folio-split-cell');
        const counts = cell.querySelectorAll('[data-testid="folio-count"]');
        expect(counts).toHaveLength(2);
        counts.forEach((count) => expect(count).toHaveTextContent('0'));
    });

    it('exposes the combined label via tooltip', async () => {
        const user = userEvent.setup();
        render(<FolioSplitCell digital={1} physical={0} />);

        await user.hover(screen.getByTestId('folio-split-cell'));
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Folios digitales / folios físicos');
    });
});
