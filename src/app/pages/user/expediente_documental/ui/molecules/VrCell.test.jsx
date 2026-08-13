import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VrCell } from './VrCell';

describe('VrCell', () => {
    it('shows "Sin VR" when the group has no VR value', () => {
        render(<VrCell latestVr="" vrValues={[]} />);

        expect(screen.getByTestId('vr-cell')).toHaveTextContent('Sin VR');
        expect(screen.queryByRole('button', { name: /VR adicionales/ })).not.toBeInTheDocument();
    });

    it('shows a single VR badge without an overflow trigger', () => {
        render(<VrCell latestVr="F-102" vrValues={['F-102']} />);

        expect(screen.getByText('F-102')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /VR adicionales/ })).not.toBeInTheDocument();
    });

    it('deduplicates VR values and exposes the rest via an overflow menu', async () => {
        const user = userEvent.setup();
        render(<VrCell latestVr="F-102" vrValues={['F-102', 'F-200', 'eng']} />);

        expect(screen.getByText('F-102')).toBeInTheDocument();
        const overflowTrigger = screen.getByRole('button', { name: 'Ver 2 VR adicionales' });
        expect(overflowTrigger).toHaveTextContent('+2');

        await user.click(overflowTrigger);

        expect(await screen.findByText('F-200')).toBeInTheDocument();
        expect(screen.getByText('INFORME')).toBeInTheDocument();
    });
});
