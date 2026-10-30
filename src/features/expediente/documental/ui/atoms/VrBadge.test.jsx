import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VrBadge } from './VrBadge';

describe('VrBadge', () => {
    it('shows "Sin VR" when no value is present', () => {
        render(<VrBadge value="" />);

        expect(screen.getByTestId('vr-badge')).toHaveTextContent('Sin VR');
    });

    it('shows the raw VR value for a regular VR', () => {
        render(<VrBadge value="F-102" />);

        expect(screen.getByTestId('vr-badge')).toHaveTextContent('F-102');
    });

    it('labels internal-report VR values as "INFORME" and reveals the original code via tooltip', async () => {
        const user = userEvent.setup();
        render(<VrBadge value="eng" />);

        const badge = screen.getByTestId('vr-badge');
        expect(badge).toHaveTextContent('INFORME');

        await user.hover(badge);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('VR original: eng');
    });

    it('treats internal-report VR values case-insensitively', () => {
        render(<VrBadge value="LAW" />);

        expect(screen.getByTestId('vr-badge')).toHaveTextContent('INFORME');
    });
});
