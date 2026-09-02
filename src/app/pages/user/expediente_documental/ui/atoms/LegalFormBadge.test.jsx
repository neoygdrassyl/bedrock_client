import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LegalFormBadge } from './LegalFormBadge';
import { LEGAL_FORM_FILTER } from '../../../shared/expediente-documental.utils';

describe('LegalFormBadge', () => {
    it('renders the missing tone', () => {
        render(<LegalFormBadge status={LEGAL_FORM_FILTER.MISSING}>Faltante</LegalFormBadge>);

        const badge = screen.getByTestId('legal-form-badge');
        expect(badge).toHaveTextContent('Faltante');
        expect(badge).toHaveAttribute('data-legal-form-status', LEGAL_FORM_FILTER.MISSING);
        expect(badge.className).toMatch(/destructive/);
    });

    it('renders the pending-scan tone', () => {
        render(<LegalFormBadge status={LEGAL_FORM_FILTER.PENDING_SCAN}>Pendiente escaneo</LegalFormBadge>);

        expect(screen.getByTestId('legal-form-badge').className).toMatch(/warning/);
    });

    it('renders the present tone', () => {
        render(<LegalFormBadge status={LEGAL_FORM_FILTER.PRESENT}>Presente</LegalFormBadge>);

        expect(screen.getByTestId('legal-form-badge').className).toMatch(/accent/);
    });

    it('falls back to a neutral tone for an unknown status', () => {
        render(<LegalFormBadge status="">Fila sintética</LegalFormBadge>);

        expect(screen.getByTestId('legal-form-badge')).toHaveAttribute('data-legal-form-status', 'none');
    });
});
