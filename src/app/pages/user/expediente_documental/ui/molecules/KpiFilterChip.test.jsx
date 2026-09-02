import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { KpiFilterChip } from './KpiFilterChip';

describe('KpiFilterChip', () => {
    it('renders the label and count', () => {
        render(<KpiFilterChip label="Físicos:" count={7} />);

        const chip = screen.getByRole('button');
        expect(chip).toHaveTextContent('Físicos:');
        expect(chip).toHaveTextContent('7');
    });

    it('exposes aria-pressed for its active state', () => {
        const { rerender } = render(<KpiFilterChip label="Escaneados:" count={2} active={false} />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

        rerender(<KpiFilterChip label="Escaneados:" count={2} active />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onClick when pressed (toggle-off is the caller\'s responsibility)', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<KpiFilterChip label="Digitales:" count={5} onClick={onClick} />);

        await user.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
