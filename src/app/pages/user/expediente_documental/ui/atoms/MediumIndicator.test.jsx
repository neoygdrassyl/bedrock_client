import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MediumIndicator } from './MediumIndicator';
import { DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';

describe('MediumIndicator', () => {
    it('renders the physical medium with its label and tooltip', async () => {
        const user = userEvent.setup();
        render(<MediumIndicator state={DOCUMENT_ORIGIN_STATE.PHYSICAL} />);

        const indicator = screen.getByTestId('medium-indicator');
        expect(indicator).toHaveAttribute('aria-label', 'Físico');
        expect(indicator).toHaveAttribute('data-active', 'true');

        await user.hover(indicator);
        expect(await screen.findByRole('tooltip')).toHaveTextContent(/Documento recibido físicamente en ventanilla/);
    });

    it('renders the digital medium', () => {
        render(<MediumIndicator state={DOCUMENT_ORIGIN_STATE.DIGITAL} />);

        expect(screen.getByTestId('medium-indicator')).toHaveAttribute('aria-label', 'Medio digital');
    });

    it('applies an inactive tone when the medium is not present', () => {
        render(<MediumIndicator state={DOCUMENT_ORIGIN_STATE.PHYSICAL} active={false} />);

        expect(screen.getByTestId('medium-indicator')).toHaveAttribute('data-active', 'false');
    });
});
