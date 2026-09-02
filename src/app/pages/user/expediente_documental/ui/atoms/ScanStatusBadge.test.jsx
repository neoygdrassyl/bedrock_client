import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScanStatusBadge } from './ScanStatusBadge';

describe('ScanStatusBadge', () => {
    it('shows "No aplica" when scanning does not apply (digital-only document)', () => {
        render(<ScanStatusBadge applies={false} value={false} />);

        const badge = screen.getByTestId('scan-status-badge');
        expect(badge).toHaveTextContent('No aplica');
        expect(badge).toHaveAttribute('data-scan-status', 'not_applicable');
    });

    it('shows "Sí" when a physical document has been scanned', () => {
        render(<ScanStatusBadge applies value />);

        const badge = screen.getByTestId('scan-status-badge');
        expect(badge).toHaveTextContent('Sí');
        expect(badge).toHaveAttribute('data-scan-status', 'scanned');
    });

    it('shows "No" when a physical document is pending scan', () => {
        render(<ScanStatusBadge applies value={false} />);

        const badge = screen.getByTestId('scan-status-badge');
        expect(badge).toHaveTextContent('No');
        expect(badge).toHaveAttribute('data-scan-status', 'pending_scan');
    });
});
